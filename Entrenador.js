// Simple trainer scheduler single-file app (localStorage)
const STORAGE_KEY = 'trainer_sessions_v1';
let viewMode = 'week'; // or 'day'
let cursorDate = new Date();
let sessions = load();
let editingId = null;
let currentSearch = '';

function load(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')}
  catch(e){return []}
}
function save(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  document.getElementById('lastUpdate').innerText = new Date().toLocaleString();
}

function uid(){return Math.random().toString(36).slice(2,9)}

function startOfWeek(d){let dt=new Date(d);const day=dt.getDay();const diff=dt.getDate()-day+(day===0?-6:1);dt.setDate(diff);dt.setHours(0,0,0,0);return dt}

function render(){
  document.getElementById('rangeLabel').innerText = viewMode === 'week' ? formatWeekRange(cursorDate) : cursorDate.toLocaleDateString();
  if(viewMode==='week') renderWeek(); else renderDay();
}

function formatWeekRange(d){const s = startOfWeek(d); const e = new Date(s); e.setDate(s.getDate()+6); return `${s.toLocaleDateString()} — ${e.toLocaleDateString()}`}

function renderWeek(){
  document.getElementById('weekView').classList.remove('hidden');
  document.getElementById('dayView').classList.add('hidden');
  const grid = document.getElementById('gridWeek'); grid.innerHTML='';
  const s = startOfWeek(cursorDate);
  for(let i=0;i<7;i++){
    const day = new Date(s); day.setDate(s.getDate()+i);
    const dayISO = day.toISOString().split('T')[0];
    const box = document.createElement('div'); box.className='day card';
    box.innerHTML = `<h3>${day.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'short'})}</h3>`;
    const daySessions = sessions.filter(x => x.date===dayISO && matchesSearch(x));
    daySessions.sort((a,b)=> a.time.localeCompare(b.time));
    daySessions.forEach(sess=>{
      const el = document.createElement('div'); el.className='session';
      el.innerHTML = `<strong>${sess.client}</strong><small>${sess.time} · ${sess.duration}min</small>`;
      el.onclick = ()=> openEdit(sess.id);
      box.appendChild(el);
    });
    const addBtn = document.createElement('div'); addBtn.className='session'; addBtn.style.opacity='0.8'; addBtn.style.borderLeft='4px solid rgba(255,255,255,0.05)'; addBtn.innerText = '+ Nuevo';
    addBtn.onclick = ()=> openAddModal(dayISO);
    box.appendChild(addBtn);
    grid.appendChild(box);
  }
}

function renderDay(){
  document.getElementById('weekView').classList.add('hidden');
  document.getElementById('dayView').classList.remove('hidden');
  const list = document.getElementById('listDay'); list.innerHTML='';
  const dayISO = cursorDate.toISOString().split('T')[0];
  const daySessions = sessions.filter(x=>x.date===dayISO && matchesSearch(x)).sort((a,b)=>a.time.localeCompare(b.time));
  if(daySessions.length===0) list.innerHTML='<p class="notice">No hay sesiones programadas</p>';
  daySessions.forEach(s=>{
    const card = document.createElement('div'); card.className='card'; card.style.marginTop='8px';
    card.innerHTML = `<strong>${s.client}</strong><div style="color:var(--muted);font-size:13px">${s.time} · ${s.duration} min</div><div style="margin-top:6px">${s.notes || ''}</div><div style="display:flex;gap:8px;margin-top:8px;justify-content:flex-end"><button class='btn' onclick="openEdit('${s.id}')">Editar</button><button class='btn' onclick="removeSession('${s.id}')">Eliminar</button></div>`;
    list.appendChild(card);
  });
}

function matchesSearch(s){ if(!currentSearch) return true; return (s.client||'').toLowerCase().includes(currentSearch.toLowerCase()); }

function prev(){ if(viewMode==='week') cursorDate.setDate(cursorDate.getDate()-7); else cursorDate.setDate(cursorDate.getDate()-1); render(); }
function next(){ if(viewMode==='week') cursorDate.setDate(cursorDate.getDate()+7); else cursorDate.setDate(cursorDate.getDate()+1); render(); }
function today(){ cursorDate = new Date(); render(); }

function openAddModal(dateISO){ editingId = null; document.getElementById('modalTitle').innerText='Planificar sesión'; document.getElementById('mCliente').value=''; document.getElementById('mFecha').value = dateISO||cursorDate.toISOString().split('T')[0]; document.getElementById('mHora').value=''; document.getElementById('mDuracion').value=60; document.getElementById('mNotas').value=''; document.getElementById('modal').classList.remove('hidden'); }
function closeModal(){ document.getElementById('modal').classList.add('hidden'); }

function saveModal(){ const client = document.getElementById('mCliente').value.trim(); const date = document.getElementById('mFecha').value; const time = document.getElementById('mHora').value; const duration = parseInt(document.getElementById('mDuracion').value||0); const notes = document.getElementById('mNotas').value.trim(); if(!client||!date||!time) return alert('Completa cliente, fecha y hora');
  if(editingId){ const idx = sessions.findIndex(s=>s.id===editingId); if(idx>-1){ sessions[idx] = {...sessions[idx], client,date,time,duration,notes,updated: new Date().toISOString()}; save(); closeModal(); render(); return; } }
  const s = { id: uid(), client, date, time, duration, notes, created: new Date().toISOString() };
  sessions.push(s); save(); closeModal(); render(); }

function openEdit(id){ const s = sessions.find(x=>x.id===id); if(!s) return; editingId = id; document.getElementById('modalTitle').innerText='Editar sesión'; document.getElementById('mCliente').value=s.client; document.getElementById('mFecha').value=s.date; document.getElementById('mHora').value=s.time; document.getElementById('mDuracion').value=s.duration; document.getElementById('mNotas').value=s.notes||''; document.getElementById('modal').classList.remove('hidden'); }

function removeSession(id){ if(!confirm('Eliminar sesión?')) return; sessions = sessions.filter(s=>s.id!==id); save(); render(); }

function applySearch(){ currentSearch = document.getElementById('searchClient').value.trim(); render(); }
function clearSearch(){ document.getElementById('searchClient').value=''; currentSearch=''; render(); }


// initial render
render();
