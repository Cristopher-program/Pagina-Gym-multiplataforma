// USUARIOS LOCALES — FUNCIONAN IGUAL QUE TU PRIMER LOGIN
const usuarios = [
  { usuario: "recepcionista", pass: "123456gp", rol: "recepcionista" },
  { usuario: "cliente",  pass: "123456gp", rol: "cliente" },
  { usuario: "entrenador", pass: "123456gp", rol: "entrenador" }
];

function login() {
  const user = document.getElementById("user").value.trim();
  const pass = document.getElementById("pass").value.trim();
  const error = document.getElementById("error");

  const encontrado = usuarios.find(u => u.usuario === user && u.pass === pass);

  if (!encontrado) {
    error.innerText = "🔥 Usuario o contraseña incorrectos";
    return;
  }

  // REDIRECCIÓN POR ROL
  if (encontrado.rol === "recepcionista") {
    window.location.href = "Recepcionista.html";
  } else if (encontrado.rol === "cliente") {
    window.location.href = "Cliente.html";
  } else if (encontrado.rol === "entrenador") {
    window.location.href = "Entrenador.html";
  }
}