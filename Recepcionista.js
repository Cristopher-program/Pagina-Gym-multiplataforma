function formatearFecha(fechaISO) {
  let f = new Date(fechaISO);

  let dia = String(f.getDate()).padStart(2, '0');
  let mes = String(f.getMonth() + 1).padStart(2, '0');
  let año = f.getFullYear();

  let horas = String(f.getHours()).padStart(2, '0');
  let minutos = String(f.getMinutes()).padStart(2, '0');

  return `${dia}/${mes}/${año} ${horas}:${minutos}`;
}
/* ===== CLIENTES BASE (PRECARGA SEGURA) ===== */
(function precargarClientes() {
  let clientes = localStorage.getItem('clientes');

  if (clientes !== null) return; // si existe la clave, NO tocar

  const clientesBase = [
     { dni: "70000001", nombre: "Juan Perez", telefono: "999111111", correo: "juan@mail.com", edad: 25, genero: "M" },
  { dni: "70000002", nombre: "Maria Lopez", telefono: "999222222", correo: "maria@mail.com", edad: 28, genero: "F" },
  { dni: "70000003", nombre: "Carlos Diaz", telefono: "999333333", correo: "carlos@mail.com", edad: 30, genero: "M" },
  { dni: "70000004", nombre: "Ana Torres", telefono: "999444444", correo: "ana@mail.com", edad: 22, genero: "F" },
  { dni: "70000005", nombre: "Luis Rojas", telefono: "999555555", correo: "luis@mail.com", edad: 35, genero: "M" },
  { dni: "70000006", nombre: "Paola Ruiz", telefono: "999666666", correo: "paola@mail.com", edad: 27, genero: "F" },
  { dni: "70000007", nombre: "Miguel Soto", telefono: "999777777", correo: "miguel@mail.com", edad: 31, genero: "M" },
  { dni: "70000008", nombre: "Lucia Vega", telefono: "999888888", correo: "lucia@mail.com", edad: 24, genero: "F" },
  { dni: "70000009", nombre: "Jose Ramos", telefono: "999999999", correo: "jose@mail.com", edad: 29, genero: "M" },
  { dni: "70000010", nombre: "Valeria Cruz", telefono: "988111111", correo: "valeria@mail.com", edad: 26, genero: "F" },
  { dni: "70000011", nombre: "Diego Navarro", telefono: "988222222", correo: "diego@mail.com", edad: 33, genero: "M" },
  { dni: "70000012", nombre: "Camila Flores", telefono: "988333333", correo: "camila@mail.com", edad: 21, genero: "F" }

  ].map(c => ({
    ...c,
    fecha: new Date().toISOString()
  }));

  localStorage.setItem('clientes', JSON.stringify(clientesBase));
  console.log("Clientes base creados");
})();
/* ===== MEMBRESIAS BASE (PRECARGA ) ===== */
(function precargarMembresias() {
  let membresias = localStorage.getItem('membresias');
  if (membresias !== null) return; // ya existen

  let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
  if (clientes.length === 0) return; // seguridad

  const hoy = new Date();

  function crearFechaFin(tipo, inicio) {
    let f = new Date(inicio);
    if (tipo === "Mensual") f.setMonth(f.getMonth() + 1);
    if (tipo === "Trimestral") f.setMonth(f.getMonth() + 3);
    if (tipo === "Anual") f.setFullYear(f.getFullYear() + 1);
    return f.toISOString();
  }

  function fechaDesdeHoy(dias) {
  let f = new Date();
  f.setDate(f.getDate() + dias);
  return f;
}



 const membresiasBase = [
  { dni: "70000001", tipo: "Mensual", monto: 120, finOffset: -10 }, // vencida
  { dni: "70000002", tipo: "Trimestral", monto: 320, finOffset: -50 }, // vencida
  { dni: "70000003", tipo: "Mensual", monto: 120, finOffset: 2 }, // por vencer
  { dni: "70000004", tipo: "Anual", monto: 900, finOffset: 1 }, // por vencer
  { dni: "70000005", tipo: "Mensual", monto: 120, finOffset: 20 }, // activa
  { dni: "70000006", tipo: "Trimestral", monto: 320, finOffset: 40 },
  { dni: "70000007", tipo: "Mensual", monto: 120, finOffset: 10 },
  { dni: "70000008", tipo: "Anual", monto: 900, finOffset: 200 },
  { dni: "70000009", tipo: "Mensual", monto: 120, finOffset: 0 }, // por vencer
  { dni: "70000010", tipo: "Trimestral", monto: 320, finOffset: 90 },
  { dni: "70000011", tipo: "Mensual", monto: 120, finOffset: -1 }, // vencida
  { dni: "70000012", tipo: "Anual", monto: 900, finOffset: 300 }
].map(m => {
  let cliente = clientes.find(c => c.dni === m.dni);

  let fin = new Date();
  fin.setDate(fin.getDate() + m.finOffset);

  // inicio = fin - duración
  let inicio = new Date(fin);
  if (m.tipo === "Mensual") inicio.setMonth(inicio.getMonth() - 1);
  if (m.tipo === "Trimestral") inicio.setMonth(inicio.getMonth() - 3);
  if (m.tipo === "Anual") inicio.setFullYear(inicio.getFullYear() - 1);

  return {
    dni: m.dni,
    nombre: cliente ? cliente.nombre : "",
    tipo: m.tipo,
    monto: m.monto,
    fechaInicio: inicio.toISOString(),
    fechaFin: fin.toISOString(),
    cancelado: false
  };
});


  localStorage.setItem('membresias', JSON.stringify(membresiasBase));
  console.log("Membresías base creadas");
})();

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
    fecha: new Date().toISOString()
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

  if (new Date(memb.fechaFin) < new Date())
 return alert('Membresía vencida');

  let asist = getData('asistencias');
  asist.push({ dni, fecha: new Date().toISOString() });
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
    fechaInicio: fechaInicio.toISOString(),
    fechaFin: fechaFin.toISOString()   
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
    fechaInicio: fechaInicio.toISOString(),
    fechaFin: fechaFin.toISOString(),
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
        <td>${formatearFecha(m.fechaInicio)}</td>
        <td>${formatearFecha(m.fechaFin)}</td>
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



