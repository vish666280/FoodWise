const defaultData = {
  saved: 2.4,
  waste: 0,
  shared: 1,
  meals: [
    {day:"Monday",type:"Dinner",meal:"Dal + rice + salad"},
    {day:"Tuesday",type:"Lunch",meal:"Vegetable pulao"},
    {day:"Wednesday",type:"Dinner",meal:"Roti + mixed veg"},
    {day:"Thursday",type:"Lunch",meal:"Rajma + rice"},
    {day:"Friday",type:"Dinner",meal:"Khichdi + curd"},
    {day:"Saturday",type:"Dinner",meal:"Vegetable noodles"},
    {day:"Sunday",type:"Lunch",meal:"Home-style thali"}
  ],
  items: [
    {id:1,name:"Tomatoes",category:"Vegetables",qty:"500 g",expiry:addDays(2)},
    {id:2,name:"Milk",category:"Dairy",qty:"1 litre",expiry:addDays(1)},
    {id:3,name:"Bananas",category:"Fruit",qty:"6 pcs",expiry:addDays(4)},
    {id:4,name:"Cooked dal",category:"Cooked food",qty:"2 portions",expiry:addDays(2)}
  ],
  shares: [
    {name:"Fresh rotis",qty:"8 pieces",area:"Community centre",icon:"🫓"},
    {name:"Cooked rice",qty:"4 portions",area:"Near housing society",icon:"🍚"},
    {name:"Seasonal fruits",qty:"1 kg",area:"Local pickup",icon:"🍎"}
  ]
};

function addDays(n){const d=new Date();d.setDate(d.getDate()+n);return d.toISOString().split("T")[0]}
function loadData(){try{return JSON.parse(localStorage.getItem("foodwiseData"))||structuredClone(defaultData)}catch{return structuredClone(defaultData)}}
let data=loadData();
function saveData(){localStorage.setItem("foodwiseData",JSON.stringify(data));renderAll()}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function showToast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove("show"),2600)}
function openModal(id){document.getElementById(id).classList.add("open")}
function closeModal(id){document.getElementById(id).classList.remove("open")}
function scrollToSection(id){document.getElementById(id).scrollIntoView({behavior:"smooth"})}

function daysLeft(date){
  const today=new Date();today.setHours(0,0,0,0);
  const target=new Date(date+"T00:00:00");
  return Math.ceil((target-today)/86400000);
}
function iconFor(cat){return {Vegetables:"🥦",Fruit:"🍎",Dairy:"🥛","Cooked food":"🍲",Grains:"🌾",Other:"🍱"}[cat]||"🍱"}

function renderStats(){
  document.getElementById("statSaved").textContent=data.saved.toFixed(1);
  document.getElementById("statMeals").textContent=data.meals.length;
  document.getElementById("statShared").textContent=data.shared;
  document.getElementById("statWaste").textContent=data.waste.toFixed(1);
  document.getElementById("dashSaved").textContent=data.saved.toFixed(1);
  document.getElementById("heroSaved").textContent=data.saved.toFixed(1);
  const pct=Math.min(100,Math.round(data.saved/10*100));
  document.getElementById("goalPct").textContent=pct+"%";
  document.getElementById("goalBar").style.width=pct+"%";
  const score=Math.max(40,Math.min(100,Math.round(82 + data.saved*1.5 - data.waste*4 + data.shared*2)));
  document.getElementById("score").textContent=score;
  document.getElementById("heroScore").textContent=score;
}
function renderPlanner(){
  const days=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  document.getElementById("plannerGrid").innerHTML=days.map(day=>{
    const meals=data.meals.filter(m=>m.day===day);
    return `<div class="day-card"><div class="day-head"><span>${day.slice(0,3)}</span><b>${day}</b></div>${meals.length?meals.map(m=>`<div class="meal"><small>${esc(m.type)}</small><b>${esc(m.meal)}</b></div>`).join(""):`<div class="empty-meal">No meal planned<br>yet</div>`}</div>`
  }).join("");
}
function renderExpiry(){
  const list=document.getElementById("expiryList");
  if(!data.items.length){list.innerHTML='<div class="impact-card">No food items tracked yet. Add one to get started.</div>';return}
  list.innerHTML=data.items.slice().sort((a,b)=>daysLeft(a.expiry)-daysLeft(b.expiry)).map(item=>{
    const d=daysLeft(item.expiry); const urgent=d<=2; const text=d<0?`Expired ${Math.abs(d)} day(s) ago`:d===0?"Expires today":`${d} day(s) left`;
    return `<div class="expiry-item"><div class="food-avatar">${iconFor(item.category)}</div><div><h4>${esc(item.name)}</h4><p>${esc(item.qty)} • ${esc(item.category)}</p></div><div><span class="expiry-badge ${urgent?'urgent':''}">${text}</span><button class="remove-btn" title="Remove" onclick="removeItem(${item.id})">×</button></div></div>`
  }).join("");
}
function renderShares(){
  document.getElementById("shareList").innerHTML=data.shares.length?data.shares.slice(-5).reverse().map(s=>`<div class="share-row"><div class="share-icon">${s.icon||"🍱"}</div><div><b>${esc(s.name)}</b><small>${esc(s.qty)} • ${esc(s.area)}</small></div><button class="claim" onclick="showToast('Demo action: connect with the listed person or verified organisation.')">View</button></div>`).join(""):'<div class="share-row"><div></div><div><b>No surplus listed yet</b><small>Add an item to begin.</small></div></div>';
}
function renderAll(){renderStats();renderPlanner();renderExpiry();renderShares()}

function removeItem(id){data.items=data.items.filter(i=>i.id!==id);saveData();showToast("Food item removed from tracker.")}

document.getElementById("itemForm").addEventListener("submit",e=>{
  e.preventDefault();const f=new FormData(e.target);
  data.items.push({id:Date.now(),name:f.get("name"),category:f.get("category"),qty:f.get("qty"),expiry:f.get("expiry")});
  closeModal("itemModal");e.target.reset();saveData();showToast("Food item added to your expiry tracker.");
});
document.getElementById("mealForm").addEventListener("submit",e=>{
  e.preventDefault();const f=new FormData(e.target);
  data.meals.push({day:f.get("day"),type:f.get("type"),meal:f.get("meal")});
  closeModal("mealModal");e.target.reset();saveData();showToast("Meal added to your weekly plan.");
});
document.getElementById("wasteForm").addEventListener("submit",e=>{
  e.preventDefault();const f=new FormData(e.target);const amount=Number(f.get("amount"));
  data.waste+=amount; data.saved=Math.max(0,data.saved-amount*0.2);
  closeModal("wasteModal");e.target.reset();saveData();showToast(`${amount.toFixed(2)} kg of food waste logged.`);
});
document.getElementById("shareForm").addEventListener("submit",e=>{
  e.preventDefault();const f=new FormData(e.target);
  data.shares.push({name:f.get("name"),qty:f.get("qty"),area:f.get("area"),icon:iconFor("Other")});
  data.shared+=1;closeModal("shareModal");e.target.reset();saveData();showToast("Surplus food added to the demo community board.");
});
document.querySelectorAll(".modal-backdrop").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)m.classList.remove("open")}));

document.getElementById("themeToggle").addEventListener("click",()=>{
  document.documentElement.classList.toggle("dark");
  localStorage.setItem("foodwiseTheme",document.documentElement.classList.contains("dark")?"dark":"light");
  document.getElementById("themeToggle").textContent=document.documentElement.classList.contains("dark")?"☀":"☾";
});
if(localStorage.getItem("foodwiseTheme")==="dark"){document.documentElement.classList.add("dark");document.getElementById("themeToggle").textContent="☀"}

document.getElementById("menuBtn").addEventListener("click",()=>{
  const links=document.getElementById("navLinks");
  const open=links.style.display==="flex";
  links.style.display=open?"none":"flex";
  if(!open){links.style.position="absolute";links.style.top="66px";links.style.left="0";links.style.right="0";links.style.padding="20px";links.style.background="var(--white)";links.style.flexDirection="column";links.style.borderBottom="1px solid var(--line)"}
});
function resetData(){if(confirm("Reset all FoodWise demo data?")){localStorage.removeItem("foodwiseData");data=loadData();renderAll();showToast("Demo data restored.")}}
renderAll();
