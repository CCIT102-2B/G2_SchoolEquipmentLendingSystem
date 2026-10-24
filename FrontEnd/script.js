// Sample Mock Accounts
const accounts = {
    students: [
        { studentId: "2024-0001", password: "student123", name: "Juan Dela Cruz" },
        { studentId: "2024-0002", password: "student123", name: "Maria Clara" }
    ],
    admin: { username: "admin", password: "admin123", name: "System Administrator" }
};

let currentUser = null;
let currentRole = 'student';

// Initial Mock Data for Equipment with Quantity/Stock
let equipmentList = [
    { id: 1, name: "Dell Latitude Laptop", category: "Computers", totalStock: 5, borrowed: 1 },
    { id: 2, name: "Canon DSLR Camera", category: "Media", totalStock: 3, borrowed: 0 },
    { id: 3, name: "Epson Multimedia Projector", category: "Classroom", totalStock: 2, borrowed: 1 },
    { id: 4, name: "Lab Quest Physics Sensor", category: "Science", totalStock: 4, borrowed: 0 },
    { id: 5, name: "Basketball (Official Size)", category: "Sports", totalStock: 10, borrowed: 2 }
];

let requestList = [
    { id: 101, equipmentId: 3, studentId: "2024-0001", studentName: "Juan Dela Cruz", status: "Approved" }
];

// DOM Elements
const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const loginIdInput = document.getElementById('login-id');
const loginPasswordInput = document.getElementById('login-password');
const loginError = document.getElementById('login-error');
const usernameLabel = document.getElementById('username-label');

const btnLogout = document.getElementById('btn-logout');
const displayUserName = document.getElementById('display-user-name');
const displayUserRole = document.getElementById('display-user-role');

const navLinks = document.querySelectorAll('.nav-links li');
const contentSections = document.querySelectorAll('.content-section');
const catalogGrid = document.getElementById('catalog-grid');
const recentEquipmentList = document.getElementById('recent-equipment-list');
const myLoansTbody = document.getElementById('my-loans-tbody');
const adminApprovalTbody = document.getElementById('admin-approval-tbody');

const totalEquipmentEl = document.getElementById('total-equipment');
const availableEquipmentEl = document.getElementById('available-equipment');
const borrowedEquipmentEl = document.getElementById('borrowed-equipment');

const borrowModal = document.getElementById('borrow-modal');
const addEquipmentModal = document.getElementById('add-equipment-modal');
const borrowForm = document.getElementById('borrow-form');
const addEquipmentForm = document.getElementById('add-equipment-form');
const modalEquipmentId = document.getElementById('modal-equipment-id');
const modalEquipmentName = document.getElementById('modal-equipment-name');

// --- LOGIN FUNCTIONALITY ---
function switchLoginTab(role) {
    currentRole = role;
    document.getElementById('tab-student').classList.toggle('active', role === 'student');
    document.getElementById('tab-admin').classList.toggle('active', role === 'admin');
    usernameLabel.textContent = role === 'student' ? 'Student ID' : 'Admin Username';
    loginIdInput.placeholder = role === 'student' ? 'Enter Student ID (e.g. 2024-0001)' : 'Enter Admin Username';
    loginError.textContent = '';
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const idVal = loginIdInput.value.trim();
    const passVal = loginPasswordInput.value.trim();

    if (currentRole === 'student') {
        const student = accounts.students.find(s => s.studentId === idVal && s.password === passVal);
        if (student) {
            currentUser = { role: 'student', ...student };
            initApp();
        } else {
            loginError.textContent = 'Invalid Student ID or Password!';
        }
    } else {
        if (idVal === accounts.admin.username && passVal === accounts.admin.password) {
            currentUser = { role: 'admin', ...accounts.admin };
            initApp();
        } else {
            loginError.textContent = 'Invalid Admin Credentials!';
        }
    }
});

btnLogout.addEventListener('click', () => {
    currentUser = null;
    appContainer.style.display = 'none';
    loginContainer.style.display = 'flex';
    loginForm.reset();
});

// --- INIT APP ---
function initApp() {
    loginContainer.style.display = 'none';
    appContainer.style.display = 'flex';

    displayUserName.textContent = currentUser.name;
    displayUserRole.textContent = currentUser.role.toUpperCase();

    const adminElements = document.querySelectorAll('.admin-only');
    const myLoansNav = document.getElementById('nav-my-loans');

    if (currentUser.role === 'admin') {
        adminElements.forEach(el => el.style.display = 'block');
        myLoansNav.style.display = 'none';
    } else {
        adminElements.forEach(el => el.style.display = 'none');
        myLoansNav.style.display = 'flex';
    }

    switchSection('dashboard');
    renderApp();
}

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        const target = link.getAttribute('data-target');
        switchSection(target);
    });
});

function switchSection(targetId) {
    navLinks.forEach(l => l.classList.remove('active'));
    contentSections.forEach(s => s.classList.remove('active'));

    const activeLink = document.querySelector(`.nav-links li[data-target="${targetId}"]`);
    const activeSection = document.getElementById(targetId);

    if (activeLink) activeLink.classList.add('active');
    if (activeSection) activeSection.classList.add('active');
}

// --- RENDER APP & CATALOG ---
function renderApp(filter = 'all', searchQuery = '') {
    let totalItems = 0;
    let availableItems = 0;
    let totalBorrowed = 0;

    equipmentList.forEach(e => {
        totalItems += e.totalStock;
        totalBorrowed += e.borrowed;
        availableItems += (e.totalStock - e.borrowed);
    });

    totalEquipmentEl.textContent = totalItems;
    availableEquipmentEl.textContent = availableItems;
    borrowedEquipmentEl.textContent = totalBorrowed;

    let filtered = equipmentList.filter(item => {
        const availableQty = item.totalStock - item.borrowed;
        const matchesFilter = filter === 'all' || 
                             (filter === 'Available' && availableQty > 0) || 
                             (filter === 'Borrowed' && item.borrowed > 0);
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    catalogGrid.innerHTML = '';
    filtered.forEach(item => catalogGrid.appendChild(createEquipmentCard(item)));

    recentEquipmentList.innerHTML = '';
    equipmentList.slice(-3).reverse().forEach(item => recentEquipmentList.appendChild(createEquipmentCard(item)));

    if (currentUser && currentUser.role === 'student') {
        renderStudentLoans();
    }

    if (currentUser && currentUser.role === 'admin') {
        renderAdminApprovals();
    }
}

function createEquipmentCard(item) {
    const card = document.createElement('div');
    card.className = 'equipment-card';
    
    const availableQty = item.totalStock - item.borrowed;
    const isAvailable = availableQty > 0;
    
    let actionButtons = '';
    if (currentUser && currentUser.role === 'student') {
        actionButtons = `
            <button class="btn-borrow" ${!isAvailable ? 'disabled' : ''} onclick="openBorrowModal(${item.id})">
                ${isAvailable ? 'Request Borrow' : 'Out of Stock'}
            </button>
        `;
    } else if (currentUser && currentUser.role === 'admin') {
        actionButtons = `
            <div class="card-actions">
                <div class="admin-stock-controls">
                    <button class="btn-stock-add" onclick="adjustStock(${item.id}, 1)"><i class="fa-solid fa-plus"></i> Add Stock</button>
                    <button class="btn-stock-minus" onclick="adjustStock(${item.id}, -1)"><i class="fa-solid fa-minus"></i> Reduce</button>
                </div>
                <button class="btn-remove-stock" onclick="removeEquipment(${item.id})"><i class="fa-solid fa-trash"></i> Delete Equipment</button>
            </div>
        `;
    }

    card.innerHTML = `
        <div>
            <h3>${item.name}</h3>
            <p>Category: ${item.category}</p>
            <p class="stock-info">Available: <strong>${availableQty}</strong> / Total Stock: <strong>${item.totalStock}</strong></p>
            <span class="badge ${isAvailable ? 'available' : 'borrowed'}">${isAvailable ? 'In Stock' : 'Out of Stock'}</span>
        </div>
        ${actionButtons}
    `;
    return card;
}

// --- ADMIN STOCK ADD & REMOVE ---
function openAddEquipmentModal() {
    addEquipmentModal.style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

addEquipmentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('new-equipment-name').value.trim();
    const category = document.getElementById('new-equipment-category').value.trim();
    const stock = parseInt(document.getElementById('new-equipment-stock').value);

    const newEquip = {
        id: Date.now(),
        name: name,
        category: category,
        totalStock: stock,
        borrowed: 0
    };

    equipmentList.push(newEquip);
    addEquipmentForm.reset();
    closeModal('add-equipment-modal');
    alert('Bagong kagamitan ay matagumpay na naidagdag sa stock!');
    renderApp();
});

function adjustStock(id, amount) {
    const item = equipmentList.find(e => e.id === id);
    if (!item) return;

    if (amount < 0 && (item.totalStock + amount) < item.borrowed) {
        alert('Hindi maaring bawasan ang stock dahil mas marami pa ang kasalukuyang hiniram kaysa sa natitirang bilang!');
        return;
    }

    item.totalStock += amount;
    if (item.totalStock < 0) item.totalStock = 0;
    renderApp();
}

function removeEquipment(id) {
    const item = equipmentList.find(e => e.id === id);
    if (!item) return;

    if (item.borrowed > 0) {
        alert('Hindi maaring tanggalin ang kagamitang ito habang may nakahiram pa.');
        return;
    }

    if (confirm(`Sigurado ka bang nais mong tanggalin ang "${item.name}" sa inventory?`)) {
        equipmentList = equipmentList.filter(e => e.id !== id);
        renderApp();
    }
}

// --- STUDENT LOANS & REQUESTS ---
function renderStudentLoans() {
    myLoansTbody.innerHTML = '';
    const myRequests = requestList.filter(r => r.studentId === currentUser.studentId);

    if (myRequests.length === 0) {
        myLoansTbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--text-muted);">No requests or active loans.</td></tr>`;
        return;
    }

    myRequests.forEach(req => {
        const equip = equipmentList.find(e => e.id === req.equipmentId);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${equip ? equip.name : 'Unknown'}</strong></td>
            <td>${equip ? equip.category : '-'}</td>
            <td><span class="badge ${req.status === 'Approved' ? 'available' : req.status === 'Pending' ? 'pending' : 'borrowed'}">${req.status}</span></td>
            <td>
                ${req.status === 'Approved' ? `<button class="btn-return" onclick="returnItem(${req.id})">Return</button>` : '-'}
            </td>
        `;
        myLoansTbody.appendChild(tr);
    });
}

function renderAdminApprovals() {
    adminApprovalTbody.innerHTML = '';
    const pendingRequests = requestList.filter(r => r.status === 'Pending');

    if (pendingRequests.length === 0) {
        adminApprovalTbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--text-muted);">No pending requests.</td></tr>`;
        return;
    }

    pendingRequests.forEach(req => {
        const equip = equipmentList.find(e => e.id === req.equipmentId);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${req.studentId}</td>
            <td><strong>${req.studentName}</strong></td>
            <td>${equip ? equip.name : 'Unknown'}</td>
            <td>
                <button class="btn-approve" onclick="approveRequest(${req.id})">Approve</button>
                <button class="btn-reject" onclick="rejectRequest(${req.id})">Reject</button>
            </td>
        `;
        adminApprovalTbody.appendChild(tr);
    });
}

function openBorrowModal(id) {
    const item = equipmentList.find(e => e.id === id);
    if (!item) return;
    modalEquipmentId.value = item.id;
    modalEquipmentName.value = item.name;
    borrowModal.style.display = 'flex';
}

borrowForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const equipId = parseInt(modalEquipmentId.value);

    requestList.push({
        id: Date.now(),
        equipmentId: equipId,
        studentId: currentUser.studentId,
        studentName: currentUser.name,
        status: 'Pending'
    });

    borrowModal.style.display = 'none';
    borrowForm.reset();
    alert('Request submitted! Pending Admin Approval.');
    renderApp();
});

function approveRequest(requestId) {
    const req = requestList.find(r => r.id === requestId);
    if (req) {
        const equip = equipmentList.find(e => e.id === req.equipmentId);
        if (equip && (equip.totalStock - equip.borrowed) > 0) {
            req.status = 'Approved';
            equip.borrowed += 1;
        } else {
            alert('Hindi ma-approve dahil wala nang available na stock!');
        }
    }
    renderApp();
}

function rejectRequest(requestId) {
    const req = requestList.find(r => r.id === requestId);
    if (req) {
        req.status = 'Rejected';
    }
    renderApp();
}

function returnItem(requestId) {
    const req = requestList.find(r => r.id === requestId);
    if (req) {
        const equip = equipmentList.find(e => e.id === req.equipmentId);
        if (equip && equip.borrowed > 0) {
            equip.borrowed -= 1;
        }
        requestList = requestList.filter(r => r.id !== requestId);
    }
    renderApp();
}

renderApp();