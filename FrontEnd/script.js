const API_BASE_URL = 'http://localhost:5174/api/System';
let currentRole = 'student';
let currentUser = { id: '2024-0001', name: 'Juan Dela Cruz' };
let allEquipment = [];

// 1. SWITCH LOGIN TABS
function switchLoginTab(role) {
    currentRole = role;
    const studentBtn = document.getElementById('tab-student');
    const adminBtn = document.getElementById('tab-admin');
    const label = document.getElementById('username-label');
    const loginIdInput = document.getElementById('login-id');

    if (role === 'student') {
        studentBtn?.classList.add('active');
        adminBtn?.classList.remove('active');
        if (label) label.innerText = 'Student ID';
        if (loginIdInput) loginIdInput.placeholder = 'Enter Student ID (e.g. 2024-0001)';
    } else {
        adminBtn?.classList.add('active');
        studentBtn?.classList.remove('active');
        if (label) label.innerText = 'Admin Username';
        if (loginIdInput) loginIdInput.placeholder = 'Enter admin username';
    }
}

// 2. NAVIGATION SWITCHER
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-links li');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            if (!targetId) return;

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            sections.forEach(section => {
                if (section.id === targetId) {
                    section.classList.add('active');
                    section.style.display = 'block';
                } else {
                    section.classList.remove('active');
                    section.style.display = 'none';
                }
            });
        });
    });
}

// 3. ROLE PERMISSIONS
function applyRolePermissions(role) {
    const adminElements = document.querySelectorAll('.admin-only');
    const studentNav = document.getElementById('nav-my-loans');
    const addBtn = document.getElementById('btn-open-add-equipment');

    if (role === 'admin') {
        adminElements.forEach(el => el.style.display = 'block');
        if (studentNav) studentNav.style.display = 'none';
        if (addBtn) addBtn.style.display = 'inline-block';
    } else {
        adminElements.forEach(el => el.style.display = 'none');
        if (studentNav) studentNav.style.display = 'block';
        if (addBtn) addBtn.style.display = 'none';
    }
}

// 4. FETCH DATA FROM API
async function refreshAllData() {
    await loadEquipmentData();
    await loadRequestsData();
}

async function loadEquipmentData() {
    try {
        const response = await fetch(`${API_BASE_URL}/equipment`);
        if (!response.ok) return;

        allEquipment = await response.json();

        // Calculate Totals based on C# Model (totalStock, borrowed)
        let totalItems = 0;
        let totalBorrowed = 0;

        allEquipment.forEach(item => {
            totalItems += item.totalStock || 0;
            totalBorrowed += item.borrowed || 0;
        });

        const totalAvail = totalItems - totalBorrowed;

        document.getElementById('total-equipment').innerText = totalItems;
        document.getElementById('available-equipment').innerText = totalAvail >= 0 ? totalAvail : 0;
        document.getElementById('borrowed-equipment').innerText = totalBorrowed;

        renderEquipmentGrid('recent-equipment-list', allEquipment.slice(0, 4));
        renderEquipmentGrid('catalog-grid', allEquipment);

    } catch (error) {
        console.error('Error fetching equipment:', error);
    }
}

async function loadRequestsData() {
    try {
        const response = await fetch(`${API_BASE_URL}/requests`);
        if (!response.ok) return;

        const requests = await response.json();
        renderStudentLoansTable(requests);
        renderAdminApprovalsTable(requests);
    } catch (error) {
        console.error('Error fetching requests:', error);
    }
}

// 5. RENDER EQUIPMENT CARDS
function renderEquipmentGrid(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!items || items.length === 0) {
        container.innerHTML = '<p>No equipment items found.</p>';
        return;
    }

    container.innerHTML = items.map(item => {
        const available = (item.totalStock || 0) - (item.borrowed || 0);
        const isAvailable = available > 0;

        return `
            <div class="equipment-card">
                <div>
                    <h3>${item.name}</h3>
                    <p><strong>Category:</strong> ${item.category || 'General'}</p>
                    <p class="stock-info">Available: ${available} / ${item.totalStock}</p>
                    <span class="badge ${isAvailable ? 'available' : 'borrowed'}">
                        ${isAvailable ? 'Available' : 'Out of Stock'}
                    </span>
                </div>
                <div class="card-actions">
                    ${currentRole === 'student' ? `
                        <button class="btn-borrow" ${!isAvailable ? 'disabled' : ''} onclick="openBorrowModal(${item.id}, '${item.name}')">
                            ${isAvailable ? 'Request Borrow' : 'Unavailable'}
                        </button>
                    ` : `
                        <div class="admin-stock-controls">
                            <button class="btn-stock-add" onclick="adjustStock(${item.id}, 1)">+ Stock</button>
                            <button class="btn-stock-minus" onclick="adjustStock(${item.id}, -1)">- Stock</button>
                        </div>
                        <button class="btn-remove-stock" onclick="deleteEquipment(${item.id})" style="margin-top:6px;">Delete</button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

// 6. RENDER TABLES
function renderStudentLoansTable(requests) {
    const tbody = document.getElementById('my-loans-tbody');
    if (!tbody) return;

    const myRequests = requests.filter(r => r.studentId === currentUser.id);

    if (myRequests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No requests found.</td></tr>';
        return;
    }

    tbody.innerHTML = myRequests.map(req => {
        const equip = allEquipment.find(e => e.id === req.equipmentId);
        return `
            <tr>
                <td>${equip ? equip.name : 'Equipment #' + req.equipmentId}</td>
                <td>${equip ? equip.category : '-'}</td>
                <td><span class="badge ${req.status?.toLowerCase()}">${req.status}</span></td>
                <td>
                    ${req.status === 'Approved' ? `<button class="btn-return" onclick="returnEquipment(${req.id})">Return Item</button>` : '-'}
                </td>
            </tr>
        `;
    }).join('');
}

function renderAdminApprovalsTable(requests) {
    const tbody = document.getElementById('admin-approval-tbody');
    if (!tbody) return;

    const pending = requests.filter(r => r.status === 'Pending');

    if (pending.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No pending requests.</td></tr>';
        return;
    }

    tbody.innerHTML = pending.map(req => {
        const equip = allEquipment.find(e => e.id === req.equipmentId);
        return `
            <tr>
                <td>${req.studentId}</td>
                <td>${req.studentName || 'Student'}</td>
                <td>${equip ? equip.name : 'Equipment #' + req.equipmentId}</td>
                <td>
                    <button class="btn-approve" onclick="approveRequest(${req.id})">Approve</button>
                    <button class="btn-reject" onclick="rejectRequest(${req.id})">Reject</button>
                </td>
            </tr>
        `;
    }).join('');
}

// 7. MODALS AND ACTIONS
function openBorrowModal(id, name) {
    document.getElementById('modal-equipment-id').value = id;
    document.getElementById('modal-equipment-name').value = name;
    document.getElementById('borrow-modal').style.display = 'flex';
}

function openAddEquipmentModal() {
    document.getElementById('add-equipment-modal').style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

async function adjustStock(id, amount) {
    try {
        const res = await fetch(`${API_BASE_URL}/equipment/${id}/stock`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount })
        });
        if (res.ok) refreshAllData();
        else {
            const err = await res.json();
            alert(err.message || 'Failed to adjust stock');
        }
    } catch (e) { console.error(e); }
}

async function deleteEquipment(id) {
    if (!confirm('Are you sure you want to delete this equipment?')) return;
    try {
        const res = await fetch(`${API_BASE_URL}/equipment/${id}`, { method: 'DELETE' });
        if (res.ok) refreshAllData();
        else {
            const err = await res.json();
            alert(err.message || 'Cannot delete item');
        }
    } catch (e) { console.error(e); }
}

async function approveRequest(id) {
    try {
        const res = await fetch(`${API_BASE_URL}/requests/${id}/approve`, { method: 'PUT' });
        if (res.ok) refreshAllData();
        else {
            const err = await res.json();
            alert(err.message || 'Approval failed');
        }
    } catch (e) { console.error(e); }
}

async function rejectRequest(id) {
    try {
        const res = await fetch(`${API_BASE_URL}/requests/${id}/reject`, { method: 'PUT' });
        if (res.ok) refreshAllData();
    } catch (e) { console.error(e); }
}

async function returnEquipment(id) {
    try {
        const res = await fetch(`${API_BASE_URL}/requests/${id}/return`, { method: 'PUT' });
        if (res.ok) refreshAllData();
    } catch (e) { console.error(e); }
}

// 8. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();

    // Login Form Submit
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const idInput = document.getElementById('login-id')?.value.trim();
            const passInput = document.getElementById('login-password')?.value.trim();
            const errorMsg = document.getElementById('login-error');

            const isValidStudent = (currentRole === 'student' && idInput === '2024-0001' && passInput === 'student123');
            const isValidAdmin = (currentRole === 'admin' && idInput === 'admin' && passInput === 'admin123');

            if (isValidStudent || isValidAdmin) {
                if (errorMsg) errorMsg.innerText = '';
                currentUser = {
                    id: idInput,
                    name: currentRole === 'student' ? 'Juan Dela Cruz' : 'Administrator'
                };

                document.getElementById('login-container').style.display = 'none';
                document.getElementById('app-container').style.display = 'flex';

                document.getElementById('display-user-name').innerText = currentUser.name;
                document.getElementById('display-user-role').innerText = currentRole.toUpperCase();

                applyRolePermissions(currentRole);
                refreshAllData();
            } else {
                if (errorMsg) errorMsg.innerText = 'Invalid credentials! Check demo hints below.';
            }
        });
    }

    // Submit Borrow Request Form
    const borrowForm = document.getElementById('borrow-form');
    if (borrowForm) {
        borrowForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const equipId = parseInt(document.getElementById('modal-equipment-id').value);

            try {
                const res = await fetch(`${API_BASE_URL}/requests`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        equipmentId: equipId,
                        studentId: currentUser.id,
                        studentName: currentUser.name
                    })
                });

                if (res.ok) {
                    closeModal('borrow-modal');
                    alert('Request submitted successfully!');
                    refreshAllData();
                }
            } catch (err) { console.error(err); }
        });
    }

    // Submit Add Equipment Form (Admin)
    const addEquipForm = document.getElementById('add-equipment-form');
    if (addEquipForm) {
        addEquipForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('new-equipment-name').value;
            const category = document.getElementById('new-equipment-category').value;
            const totalStock = parseInt(document.getElementById('new-equipment-stock').value);

            try {
                const res = await fetch(`${API_BASE_URL}/equipment`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, category, totalStock })
                });

                if (res.ok) {
                    closeModal('add-equipment-modal');
                    addEquipForm.reset();
                    alert('New equipment added!');
                    refreshAllData();
                }
            } catch (err) { console.error(err); }
        });
    }

    // Logout
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            document.getElementById('app-container').style.display = 'none';
            document.getElementById('login-container').style.display = 'flex';
            document.getElementById('login-form')?.reset();
        });
    }
});