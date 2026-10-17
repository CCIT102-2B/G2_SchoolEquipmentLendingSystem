const seedItems=[
{id:1,name:"Scientific Calculator",category:"Calculators",emoji:"🧮",desc:"For math, science and exams",total:10,available:7},
{id:2,name:"Basic Calculator",category:"Calculators",emoji:"🔢",desc:"Everyday calculations",total:12,available:9},
{id:3,name:"Mathematics Textbook",category:"Books",emoji:"📘",desc:"Mathematics learning resource",total:15,available:12},
{id:4,name:"English Dictionary",category:"Books",emoji:"📖",desc:"Definitions and vocabulary",total:8,available:5},
{id:5,name:"Scientific Notebook",category:"Stationery",emoji:"📓",desc:"Notes, lessons and practice",total:20,available:17},
{id:6,name:"Geometry Set",category:"Stationery",emoji:"📐",desc:"Ruler, compass and protractor",total:10,available:8},
{id:7,name:"Laptop",category:"Technology",emoji:"💻",desc:"For schoolwork and research",total:5,available:2},
{id:8,name:"USB Flash Drive",category:"Technology",emoji:"💾",desc:"For transferring class files",total:8,available:6}
];
const defaultRequests=[
{id:101,itemId:3,itemName:"Mathematics Textbook",emoji:"📘",student:"Jamie Cruz",studentId:"2026-00108",requested:"2026-10-14",due:"2026-10-20",status:"Approved"},
{id:102,itemId:1,itemName:"Scientific Calculator",emoji:"🧮",student:"Morgan Lee",studentId:"2026-00112",requested:"2026-10-15",due:"2026-10-18",status:"Pending"}
];
let items,requests,selectedItem=null,role="student";
try{items=JSON.parse(localStorage.getItem("cb_items"))||structuredClone(seedItems);requests=JSON.parse(localStorage.getItem("cb_requests"))||structuredClone(defaultRequests)}catch(e){items=structuredClone(seedItems);requests=structuredClone(defaultRequests)}
const $=id=>document.getElementById(id);
const today=new Date();today.setHours(0,0,0,0);
const dateStr=d=>{const x=new Date(d+"T12:00:00");return x.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})};
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
$("today").textContent=today.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"});
$("borrowDate").value=iso(today);$("borrowDate").min=iso(today);
let minDue=new Date(today);minDue.setDate(minDue.getDate()+1);$("dueDate").value=iso(minDue);$("dueDate").min=iso(minDue);
function save(){localStorage.setItem("cb_items",JSON.stringify(items));localStorage.setItem("cb_requests",JSON.stringify(requests))}
function toast(msg){$("toast").textContent=msg;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2600)}
function renderStats(){$("totalStat").textContent=items.reduce((s,i)=>s+i.total,0);$("availableStat").textContent=items.reduce((s,i)=>s+i.available,0);$("borrowedStat").textContent=items.reduce((s,i)=>s+i.total-i.available,0);$("requestsStat").textContent=role==="admin"?requests.filter(r=>r.status==="Pending").length:requests.filter(r=>r.studentId==="MY-DEMO-ID").length}
function renderItems(){
 const q=$("searchInput").value.toLowerCase(),cat=$("categoryFilter").value;
 const shown=items.filter(i=>(cat==="all"||i.category===cat)&&(i.name.toLowerCase().includes(q)||i.category.toLowerCase().includes(q)||i.desc.toLowerCase().includes(q)));
 $("itemsGrid").innerHTML=shown.map(i=>`<article class="item-card"><div class="item-visual"><span>${i.emoji}</span><span class="available ${i.available===0?"unavailable":""}">${i.available===0?"Unavailable":"Available"}</span></div><div class="category">${i.category}</div><h3>${i.name}</h3><div class="item-desc">${i.desc}</div><div class="item-bottom"><span class="stock">${i.available} of ${i.total} available</span>${role==="admin"?`<button class="btn btn-small btn-outline" onclick="openItemEditor(${i.id})">Edit item</button>`:`<button class="btn btn-small" ${i.available===0?"disabled":""} onclick="openBorrow(${i.id})">Borrow item ↗</button>`}</div></article>`).join("")||'<div class="empty" style="grid-column:1/-1">No items match your search.</div>';
}
window.openItemEditor=id=>{
 if(role!=="admin"){toast("Switch to Admin view to manage inventory.");return}
 const item=items.find(i=>i.id===id);
 $("itemEditorForm").reset();
 $("editItemId").value=item?item.id:"";
 $("itemEditorTitle").textContent=item?"Edit inventory item":"Add inventory item";
 $("itemName").value=item?item.name:"";
 $("itemCategory").value=item?item.category:"Books";
 $("itemEmoji").value=item?item.emoji:"📦";
 $("itemDesc").value=item?item.desc:"";
 $("itemTotal").value=item?item.total:1;
 $("stockEditNote").textContent=item?`Currently ${item.total-item.available} unit(s) borrowed. You cannot set total stock below the number already borrowed.`:"New items will start with all units available.";
 $("itemEditorModal").classList.add("show");
};
window.closeItemEditor=()=>$("itemEditorModal").classList.remove("show");
$("itemEditorModal").addEventListener("click",e=>{if(e.target===$("itemEditorModal"))closeItemEditor()});
$("itemEditorForm").addEventListener("submit",e=>{
 e.preventDefault();
 if(role!=="admin"){toast("Only the admin view can manage inventory.");return}
 const name=$("itemName").value.trim(),category=$("itemCategory").value,emoji=$("itemEmoji").value.trim(),desc=$("itemDesc").value.trim(),total=Number($("itemTotal").value),editId=Number($("editItemId").value);
 if(!name||!emoji||!desc||!Number.isInteger(total)||total<1){toast("Enter valid item details and stock quantity.");return}
 const existing=items.find(i=>i.id===editId);
 if(existing){
   const borrowed=existing.total-existing.available;
   if(total<borrowed){toast(`Total stock cannot be below ${borrowed} borrowed unit(s).`);return}
   Object.assign(existing,{name,category,emoji,desc,total,available:total-borrowed});
   requests.forEach(r=>{if(r.itemId===existing.id){r.itemName=name;r.emoji=emoji}});
   toast("Inventory item updated.");
 }else{
   if(items.some(i=>i.name.toLowerCase()===name.toLowerCase())){toast("An item with that name already exists.");return}
   items.push({id:Date.now(),name,category,emoji,desc,total,available:total});
   toast("New inventory item added.");
 }
 save();closeItemEditor();render();
});
function renderRequests(){const shown=role==="admin"?requests:requests.filter(r=>r.studentId==="MY-DEMO-ID");$("requestsBody").innerHTML=shown.map(r=>`<tr><td><span style="margin-right:5px">${r.emoji||"📦"}</span>${r.itemName}<br><small style="color:var(--muted)">${role==="admin"?r.student:"Request #"+r.id}</small></td><td>${dateStr(r.requested)}</td><td>${dateStr(r.due)}</td><td><span class="pill ${r.status.toLowerCase()}">${r.status}</span></td>${role==="admin"?`<td>${r.status==="Pending"?`<button class="btn btn-small" onclick="approve(${r.id})">Approve</button> <button class="btn btn-small btn-outline" onclick="reject(${r.id})">Reject</button>`:r.status==="Approved"?`<button class="btn btn-small btn-outline" onclick="returnItem(${r.id})">Mark returned</button>`:"—"}</td>`:""}</tr>`).join("");$("requestsEmpty").style.display=shown.length?"none":"block";$("requestsEmpty").textContent=role==="admin"?"No requests to display.":"No borrowing requests yet. Submit a request and it will appear here.";renderStats()}
function render(){ $("app").classList.toggle("is-admin",role==="admin");$("avatar").textContent=role==="admin"?"A":"S";$("greeting").textContent=role==="admin"?"Inventory at a glance.":"Borrow what you need."; $("subGreeting").textContent=role==="admin"?"Manage requests, inventory, and item returns.":"Find learning materials and keep your studies moving.";$("itemsHeading").textContent=role==="admin"?"Manage the collection":"Explore the collection";$("requestsHeading").textContent=role==="admin"?"All borrowing requests":"My borrowing requests";$("requestsSub").textContent=role==="admin"?"Review requests and record returned items.":"Keep track of your requests and return dates.";renderStats();renderItems();renderRequests()}
window.openBorrow=id=>{if(role==="admin"){toast("Switch to Student view to submit a borrowing request.");return}selectedItem=items.find(i=>i.id===id);if(!selectedItem||selectedItem.available<1)return;$("modalEmoji").textContent=selectedItem.emoji;$("modalItemName").textContent=selectedItem.name;$("modalStock").textContent=`${selectedItem.available} available`; $("borrowModal").classList.add("show")};
function closeModal(){$("borrowModal").classList.remove("show")}
$("closeModal").onclick=closeModal;$("cancelModal").onclick=closeModal;$("borrowModal").addEventListener("click",e=>{if(e.target===$("borrowModal"))closeModal()});
$("borrowDate").addEventListener("change",()=>{const d=new Date($("borrowDate").value+"T12:00:00");d.setDate(d.getDate()+1);$("dueDate").min=iso(d);if($("dueDate").value<iso(d))$("dueDate").value=iso(d)});
$("borrowForm").addEventListener("submit",e=>{e.preventDefault();if(!selectedItem||selectedItem.available<1)return;const due=$("dueDate").value,borrow=$("borrowDate").value;if(due<=borrow){toast("Return date must be after the borrow date.");return}const id=Date.now();requests.unshift({id,itemId:selectedItem.id,itemName:selectedItem.name,emoji:selectedItem.emoji,student:$("studentName").value.trim(),studentId:$("studentId").value.trim(),requested:borrow,due,status:"Pending"});closeModal();save();renderRequests();renderStats();toast("Request submitted! Awaiting administrator approval.");$("borrowForm").reset();$("borrowDate").value=iso(today);$("dueDate").value=iso(minDue)});
window.approve=id=>{const r=requests.find(x=>x.id===id);if(!r||r.status!=="Pending")return;const i=items.find(x=>x.id===r.itemId);if(!i||i.available<1){toast("No stock is currently available.");return}i.available--;r.status="Approved";save();render();toast("Request approved and inventory updated.")};
window.reject=id=>{const r=requests.find(x=>x.id===id);if(r&&r.status==="Pending"){r.status="Rejected";save();render();toast("Request rejected.")}};
window.returnItem=id=>{const r=requests.find(x=>x.id===id);if(r&&r.status==="Approved"){r.status="Returned";const i=items.find(x=>x.id===r.itemId);if(i)i.available=Math.min(i.total,i.available+1);save();render();toast("Return recorded. Item is available again.")}};
$("roleSwitch").addEventListener("change",e=>{role=e.target.value;render()});$("searchInput").addEventListener("input",renderItems);$("categoryFilter").addEventListener("change",renderItems);
render();
