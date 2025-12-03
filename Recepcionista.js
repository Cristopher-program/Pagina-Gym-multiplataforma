

/* ===== CAMBIO DE SECCIONES ===== */
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

/* ===== LOCALSTORAGE ===== */
function getData(key) {
  return JSON.parse(localStorage.getItem(key) || '[]');
}
function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

/* ===== REGISTRAR CLIENTE ===== */
function registrarCliente() {
  let dni = document.getElementById('dni').value;
  let nombre = document.getElementById('nombre').value;
  if (dni.length < 8) return alert('DNI debe tener mínimo 8 dígitos');
  if (nombre == "") return alert('Se requiere nombre');


  let clientes = getData('clientes');
  if (clientes.some(c => c.dni === dni)) return alert('Cliente ya registrado');

  clientes.push({
    dni,
    nombre: document.getElementById('nombre').value,
    telefono: document.getElementById('telefono').value,
    correo: document.getElementById('correo').value,
    edad: document.getElementById('edad').value,
    genero: document.getElementById('genero').value,
    fecha: new Date().toLocaleString()
  });

  saveData('clientes', clientes);
  alert('Cliente registrado');
}

/* ===== ASISTENCIA ===== */
function registrarAsistencia() {
  let dni = document.getElementById('dniAsistencia').value;
  let clientes = getData('clientes');
  let c = clientes.find(x => x.dni === dni);
  if (!c) return alert('Cliente no existe');

  let memb = getData('membresias').find(m => m.dni === dni && !m.cancelado);
  if (!memb) return alert('Sin membresía activa');

  if (new Date(memb.vencimiento) < new Date()) return alert('Membresía vencida');

  let asist = getData('asistencias');
  asist.push({ dni, fecha: new Date().toLocaleString() });
  saveData('asistencias', asist);
  alert('Asistencia registrada');
}
/* ===== SERVICIO OCASIONAL ===== */
function registrarServicioOcasional() {
  let dni = document.getElementById('dniSO').value.trim();
  let monto = document.getElementById('montoSO').value;

  if (!dni || !monto) return alert('Faltan datos');

  // Obtener clientes registrados
  let clientes = getData('clientes');

  // Verificar si el DNI existe en clientes
  let clienteExiste = clientes.some(c => c.dni === dni);
  if (!clienteExiste) {
    return alert('El cliente no está registrado.');
  }

  let fechaInicio = new Date();
  let fechaFin = new Date();
  fechaFin.setDate(fechaFin.getDate() + 1);  

  let so = getData('servicios');

  so.push({
    dni,
    monto,
    fechaInicio: fechaInicio.toLocaleString(),
    fechaFin: fechaFin.toLocaleString()   
  });

  saveData('servicios', so);
  alert('Registrado');
}

/* ===== MEMBRESIAS ===== */
function registrarMembresia() {
  let dni = document.getElementById('dniMemb').value.trim();

  // Obtener clientes registrados
  let clientes = getData('clientes');

  // Verificar si el DNI existe en clientes
  let clienteExiste = clientes.some(c => c.dni === dni);
  if (!clienteExiste) {
    return alert('El cliente no está registrado.');
  }
  let nombre = clientes.find(c => c.dni === dni).nombre;
  let tipo = document.getElementById('tipoMemb').value;
  let memb = getData('membresias');

  let fechaInicio = new Date();
  let fechaFin = new Date();
  if (tipo === 'Mensual') {
    fechaFin.setMonth(fechaFin.getMonth() + 1);
  } else if (tipo === 'Trimestral') {
    fechaFin.setMonth(fechaFin.getMonth() + 3);
  } else if (tipo === 'Anual') {
    fechaFin.setFullYear(fechaFin.getFullYear() + 1);
  }

  memb.push({
    nombre,
    dni,
    tipo,
    monto: document.getElementById('montoMemb').value,
    fechaInicio: fechaInicio.toLocaleString(),
    fechaFin: fechaFin.toLocaleString(),
    cancelado: false
  });

  saveData('membresias', memb);
  alert('Registrado / Renovado');
}

function cancelarMembresia() {
  let dni = document.getElementById('dniMemb').value;
  let motivo = document.getElementById('motivoCancel').value;
  let memb = getData('membresias');

  let m = memb.find(x => x.dni === dni && !x.cancelado);
  if (!m) return alert('No hay membresía activa');

  m.cancelado = true;
  m.motivo = motivo;

  saveData('membresias', memb);
  alert('Membresía cancelada');
}
//Consultas
function renderTabla(memb) {
  let tabla = document.getElementById('tablaConsultas');

  tabla.innerHTML = `
    <tr>
      <th>DNI</th>
      <th>Nombre</th>
      <th>Tipo</th>
      <th>Fecha Inicio</th>
      <th>Fecha Fin</th>
      <th>Estado</th>
    </tr>
  `;

  memb.forEach(m => {
    tabla.innerHTML += `
      <tr>
        <td>${m.dni}</td>
        <td>${m.nombre}</td>
        <td>${m.tipo}</td>
        <td>${m.fechaInicio}</td>
        <td>${m.fechaFin}</td>
        <td>${m.estado}</td>
      </tr>
    `;
  });
}
function calcularEstado(m) {
  let hoy = new Date();
  let fin = new Date(m.fechaFin);

  if (m.cancelado) return "Cancelada";
  if (fin < hoy) return "Vencida";
  if (fin - hoy < 3 * 24 * 60 * 60 * 1000) return "Por vencer";
  return "Activa";
}
function filtrarPorEstado() {
  let filtro = document.getElementById('filtroEstado').value;
  let memb = getData('membresias');

  let filtrados = memb.map(m => ({
    ...m,
    estado: calcularEstado(m)
  })).filter(m => filtro === "Todos" || m.estado === filtro);

  renderTabla(filtrados);
}
function buscarPorDNI() {
  let text = document.getElementById('buscarDNI').value.trim();
  let memb = getData('membresias');

  if (text === "") {
    alert("Ingrese un DNI para buscar");
    return;
  }

  let encontrados = memb
    .map(m => ({ ...m, estado: calcularEstado(m) }))
    .filter(m => m.dni.includes(text));

  renderTabla(encontrados);
}



