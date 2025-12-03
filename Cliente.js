

const LS_KEY = 'Usuario19152201';
const uid = () => Math.random().toString(36).slice(2,10);
const nowISO = () => new Date().toISOString();
const fmt = iso => new Date(iso).toLocaleString();

// lightweight storage wrapper
const Storage = {
  load(){ try{ return JSON.parse(localStorage.getItem(LS_KEY)) || { routines:[], history:[] }; }catch(e){ return { routines:[], history:[] }; } },
  save(data){ localStorage.setItem(LS_KEY, JSON.stringify(data)); }
};

let store = Storage.load();
let currentWorkout = null; // { idRoutine?, title, startedAt, exercises: [] }

// DOM refs
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const routinesList = $('#routinesList');
const newRoutineTitle = $('#newRoutineTitle');
const btnCreateRoutine = $('#btnCreateRoutine');
const quickFullBody = $('#quickFullBody');
const quickStrength = $('#quickStrength');
const quickFunctional = $('#quickFunctional');
const openRoutineArea = $('#openRoutineArea');
const historyList = $('#historyList');
const workoutTitle = $('#workoutTitle');
const workoutInfo = $('#workoutInfo');
const exerciseContainer = $('#exerciseContainer');
const btnAddExercise = $('#btnAddExercise');
const btnSaveWorkout = $('#btnSaveWorkout');
const btnCancelWorkout = $('#btnCancelWorkout');
const volumeWeekEl = $('#volumeWeek');
const chartCtx = $('#chartVolume').getContext('2d');
const btnExport = $('#btnExport');
const btnImport = $('#btnImport');
const fileImport = $('#fileImport');
const btnClearAll = $('#btnClearAll');

// Chart
let volumeChart = new Chart(chartCtx, {
  type:'bar',
  data:{ labels:[], datasets:[{ label:'Volumen (kg)', data:[] }] },
  options:{ responsive:true, maintainAspectRatio:false, scales:{ y:{ beginAtZero:true } } }
});

// Templates
const TEMPLATES = {
  FULL_BODY: [
    { name: "Sentadilla", sets:[{reps:8,weight:0},{reps:8,weight:0}] },
    { name: "Press banca", sets:[{reps:8,weight:0},{reps:8,weight:0}] },
    { name: "Peso muerto rumano", sets:[{reps:10,weight:0}] },
    { name: "Remo con barra", sets:[{reps:10,weight:0}] }
  ],
  STRENGTH: [
    { name: "Sentadilla pesada", sets:[{reps:5,weight:0},{reps:5,weight:0},{reps:5,weight:0}] },
    { name: "Peso muerto", sets:[{reps:5,weight:0},{reps:3,weight:0}] },
    { name: "Press militar", sets:[{reps:5,weight:0}] }
  ],
  FUNCTIONAL: [
    { name: "Burpees", sets:[{reps:15,weight:0}] },
    { name: "Kettlebell swing", sets:[{reps:20,weight:0}] },
    { name: "Flexiones", sets:[{reps:20,weight:0}] },
    { name: "Saltos al cajón", sets:[{reps:12,weight:0}] }
  ],
  DEFECTO: [
        {}

  ]
};

// ---------- RENDER ----------
function renderRoutines(){
  routinesList.innerHTML = '';
  if(!store.routines.length){ routinesList.innerHTML = '<div class="empty">No hay rutinas (crea una abajo)</div>'; return; }
  store.routines.forEach(r=>{
    const el = document.createElement('div');
    el.className = 'routine-item';
    el.innerHTML = `
      <div>
        <strong>${escapeHtml(r.title)}</strong>
        <div class="muted-xs">${(r.exercises||[]).length} ejercicios</div>
      </div>
      <div class="row">
        <button class="tiny btn-ghost" data-open="${r.id}">Abrir</button>
        <button class="tiny btn-ghost" data-run="${r.id}">Usar</button>
        <button class="tiny btn-ghost" data-del="${r.id}">Eliminar</button>
      </div>
    `;
    routinesList.appendChild(el);
  });
}

function renderOpenRoutineArea(){
  openRoutineArea.innerHTML = '';
  const sel = document.createElement('select');
  sel.innerHTML = '<option value="">Sin seleccion</option>' + store.routines.map(r=>`<option value="${r.id}">${escapeHtml(r.title)}</option>`).join('');
  sel.onchange = () => { if(sel.value) openRoutineEditor(sel.value); }
  openRoutineArea.appendChild(sel);
}

function renderHistory(){
  historyList.innerHTML = '';
  if(!store.history.length){ historyList.innerHTML = '<div class="muted">Sin historial</div>'; return; }
  store.history.slice().reverse().forEach(h=>{
    const div = document.createElement('div');
    div.className = 'routine-item';
    div.innerHTML = `<div><strong>${escapeHtml(h.title)}</strong><div class="muted-xs">${fmt(h.startedAt)}</div></div><div class="row"><button class="tiny btn-ghost" data-view="${h.id}">Ver</button></div>`;
    historyList.appendChild(div);
  });
}

function renderCurrentWorkout(){
  exerciseContainer.innerHTML = '';
  if(!currentWorkout){ workoutTitle.textContent = 'Entrenamiento'; workoutInfo.textContent = 'No estás en un entrenamiento'; return; }
  workoutTitle.textContent = currentWorkout.title || 'Entrenamiento';
  workoutInfo.textContent = `Iniciado: ${fmt(currentWorkout.startedAt)}`;

  currentWorkout.exercises.forEach((ex, exIdx)=>{
    const box = document.createElement('div');
    box.className = 'exercise';
    box.innerHTML = `
      <div class="flex-between">
        <div><strong>${escapeHtml(ex.name)}</strong><div class="muted-xs">${(ex.sets||[]).length} sets</div></div>
        <div class="center">
          <button class="tiny btn-ghost" data-addset="${exIdx}">+ Set</button>
          <button class="tiny btn-ghost" data-remex="${exIdx}">Eliminar</button>
        </div>
      </div>
      <div class="sets-area" id="sets-${exIdx}" style="margin-top:8px"></div>
      <div style="margin-top:8px" class="muted-xs">Agregar set o editar los existentes</div>
    `;
    exerciseContainer.appendChild(box);

    const setsArea = box.querySelector(`#sets-${exIdx}`);
    (ex.sets||[]).forEach((s,sIdx)=>{
      const sr = document.createElement('div');
      sr.className = 'set-row';
      sr.innerHTML = `
        <input type="number" min="0" class="input-peso" placeholder="Peso (kg)" value="${s.weight||0}" />
        <input type="number" min="0" class="input-reps" placeholder="Reps" value="${s.reps||0}" />
        <button class="tiny btn-ghost" data-remset="${sIdx}">Eliminar</button>
      `;
      setsArea.appendChild(sr);

      sr.querySelector('[data-remset]').onclick = () => { ex.sets.splice(sIdx,1); renderCurrentWorkout(); };
      sr.querySelector('.input-peso').onchange = e => { s.weight = Number(e.target.value) || 0; saveTemp(); computeWeeklyVolume(); };
      sr.querySelector('.input-reps').onchange = e => { s.reps = Number(e.target.value) || 0; saveTemp(); computeWeeklyVolume(); };
    });

    box.querySelector(`[data-addset="${exIdx}"]`).onclick = () => { ex.sets.push({ reps:5, weight:50 }); renderCurrentWorkout(); };
    box.querySelector(`[data-remex="${exIdx}"]`).onclick = () => { if(!confirm('Eliminar ejercicio?')) return; currentWorkout.exercises.splice(exIdx,1); renderCurrentWorkout(); };
  });
}

function saveTemp(){ /* currentWorkout kept in memory; optionally autosave temp state if needed */ }

// ---------- ACTIONS ----------
btnCreateRoutine.onclick = () => {
  const title = newRoutineTitle.value.trim();
  if(!title){ alert('Pon un título'); return; }
  store.routines.push({ id: uid(), title, exercises: [] });
  Storage.save(store); newRoutineTitle.value = '';
  rerenderAll();
};


function createAutoRoutine(title, template){
  const copy = JSON.parse(JSON.stringify(template));
  store.routines.push({ id: uid(), title, exercises: copy });
  Storage.save(store); rerenderAll(); alert(`Rutina "${title}" creada ✔`);
}

quickFullBody.onclick = () => createAutoRoutine('Full Body', TEMPLATES.FULL_BODY);
quickStrength.onclick = () => createAutoRoutine('Fuerza', TEMPLATES.STRENGTH);
quickFunctional.onclick = () => createAutoRoutine('Funcional', TEMPLATES.FUNCTIONAL);


function openRoutineEditor(rid){
  const r = store.routines.find(x=>x.id===rid);
  if(!r){ alert('Rutina no encontrada'); return; }
  currentWorkout = { idRoutine: r.id, title: r.title, startedAt: nowISO(), exercises: JSON.parse(JSON.stringify(r.exercises || [])) };
  renderCurrentWorkout();
}

function startWorkoutFromRoutine(rid){
  const r = store.routines.find(x=>x.id===rid); if(!r) return;
  currentWorkout = { idRoutine: r.id, title: r.title, startedAt: nowISO(), exercises: JSON.parse(JSON.stringify(r.exercises || [])) };
  renderCurrentWorkout();
}

btnAddExercise.onclick = () => {
  if(!currentWorkout){ currentWorkout = { title:'Sesión rápida', startedAt: nowISO(), exercises:[] }; }
  const name = prompt('Nombre del ejercicio (ej: Remo):','Remo'); if(!name) return;
  currentWorkout.exercises.push({ name, sets:[] }); renderCurrentWorkout();
};

btnSaveWorkout.onclick = () => {
  if(!currentWorkout){ alert('Nada que guardar'); return; }
  const title = currentWorkout.title || ('Sesión ' + new Date().toLocaleString());
  const entry = { id: uid(), title, exercises: currentWorkout.exercises, startedAt: currentWorkout.startedAt };
  store.history.push(entry); Storage.save(store); currentWorkout = null; rerenderAll(); alert('Sesión guardada localmente ✅');
};

btnCancelWorkout.onclick = () => { if(confirm('Cancelar sesión actual?')){ currentWorkout = null; renderCurrentWorkout(); } };

// Delegated handlers for routine list (open/run/delete)
routinesList.addEventListener('click', e => {
  const b = e.target.closest('button'); if(!b) return;
  if(b.dataset.open) openRoutineEditor(b.dataset.open);
  if(b.dataset.run) startWorkoutFromRoutine(b.dataset.run);
  if(b.dataset.del){ if(!confirm('Eliminar rutina?')) return; store.routines = store.routines.filter(x=>x.id!==b.dataset.del); Storage.save(store); rerenderAll(); }
});

historyList.addEventListener('click', e => {
  const b = e.target.closest('button'); if(!b) return;
  if(b.dataset.view){ const h = store.history.find(x=>x.id===b.dataset.view); alert(JSON.stringify(h,null,2)); }
});

// ---------- Analytics: weekly volume (optimized) ----------
function computeWeeklyVolume(){
  // Calculate last 7 days labels (old->new) and totals
  const days = []; const vals = [];
  const today = new Date();
  for(let i=6;i>=0;i--){ const d = new Date(); d.setDate(today.getDate()-i); days.push(d.toLocaleDateString()); vals.push(0); }

  const cutoff = new Date(); cutoff.setDate(cutoff.getDate()-6); cutoff.setHours(0,0,0,0);

  store.history.forEach(h=>{
    const d = new Date(h.startedAt); d.setHours(0,0,0,0);
    if(d >= cutoff){
      const idx = Math.floor((d - cutoff)/(24*3600*1000));
      let vol = 0; (h.exercises||[]).forEach(ex=> (ex.sets||[]).forEach(s=> vol += (Number(s.reps)||0)*(Number(s.weight)||0)) );
      if(idx >=0 && idx < 7) vals[idx] += vol;
    }
  });

  volumeWeekEl.textContent = vals.reduce((a,b)=>a+b,0) + ' kg';
  volumeChart.data.labels = days; volumeChart.data.datasets[0].data = vals; volumeChart.update();
}

// ---------- Export / Import ----------
btnExport.onclick = () => {
  const blob = new Blob([JSON.stringify(store, null, 2)], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'dyna_backup_' + new Date().toISOString().slice(0,19).replace(/[:T]/g,'-') + '.json'; a.click(); URL.revokeObjectURL(url);
};

btnImport.onclick = () => fileImport.click();
fileImport.onchange = e => {
  const f = e.target.files[0]; if(!f) return; const reader = new FileReader();
  reader.onload = ev => {
    try{ const json = JSON.parse(ev.target.result); if(json.routines && json.history){ store = json; Storage.save(store); rerenderAll(); alert('Importado ✅'); } else alert('JSON no válido'); }
    catch(err){ alert('Error leyendo archivo: ' + err.message); }
  };
  reader.readAsText(f);
};

btnClearAll.onclick = () => { if(confirm('Borrar TODO (rutinas + historial)?')){ store = { routines:[], history:[] }; Storage.save(store); rerenderAll(); } };

// ---------- UTILS ----------
function rerenderAll(){ renderRoutines(); renderOpenRoutineArea(); renderHistory(); computeWeeklyVolume(); }
function escapeHtml(s){ return String(s).replace(/[&"'<>]/g, c=>({ '&':'&amp;','"':'&quot;',"'":'&#39;','<':'&lt;','>':'&gt;' }[c])); }

// ---------- INIT ----------
rerenderAll();

// expose for debugging
window.__DYNA_STORE = store;
