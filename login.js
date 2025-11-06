document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("container");
  const btnLoginToggle = document.getElementById("login");
  const btnRegisterToggle = document.getElementById("register");

  

  //Cambiar entre Iniciar sesión / Registrarse
  btnLoginToggle?.addEventListener("click", () => {
    container?.classList.remove("active");
  });

  btnRegisterToggle?.addEventListener("click", () => {
    container?.classList.add("active");
  });

 //REGISTRO: guarda usuario pendiente y muestra modal
  const formRegistro = document.getElementById("formRegistro");
  const modalRegistro = document.getElementById("modalRegistroPendiente");
  const btnModalAceptar = document.getElementById("btnModalAceptar");

  formRegistro?.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = document.getElementById("regNombre").value.trim();
    const correo = document.getElementById("regCorreo").value.trim();
    const curp = document.getElementById("regCurp").value.trim();
    const password = document.getElementById("regPassword").value.trim();

    if (!correo || !password) {
      alert("Por favor, completa al menos correo y contraseña.");
      return;
    }

    const nuevoUsuario = {
      id: Date.now(),
      nombre,
      correo,
      curp,
      password,
      validado: false, // luego la activo como admin
    };

    const pendientes = JSON.parse(
      localStorage.getItem("usuariosPendientes") || "[]"
    );
    pendientes.push(nuevoUsuario);
    localStorage.setItem("usuariosPendientes", JSON.stringify(pendientes));

    // Mostrar modal
    modalRegistro?.classList.add("open");
  });

  btnModalAceptar?.addEventListener("click", () => {
    modalRegistro?.classList.remove("open");
    // Volver iniciar sesión
    container?.classList.remove("active");
  });

  // Login simple
  const loginForm = document.getElementById("loginForm");

  loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const correo = document.getElementById("loginCorreo").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    const activos = JSON.parse(
      localStorage.getItem("usuariosActivos") || "[]"
    );
    const pendientes = JSON.parse(
      localStorage.getItem("usuariosPendientes") || "[]"
    );

    const usuarioActivo = activos.find(
      (u) => u.correo === correo && u.password === password
    );
    const usuarioPendiente = pendientes.find(
      (u) => u.correo === correo && u.password === password
    );

    if (usuarioActivo) {
      localStorage.setItem(
        "userName",
        usuarioActivo.nombre || "Usuario"
      );
      window.location.href = "dashboard.html";
    } else if (usuarioPendiente) {
      alert(
        "Tu registro está pendiente de activación.\n" +
          "Acude al Centro de Salud para que validen tu cuenta."
      );
    } else {
      // Modo demo: si no existe, entra como invitado
      /*alert(
        "Credenciales incorrectas. Entrarás como Usuario invitado (modo demo)."
      );*/
      localStorage.setItem("userName", "Equipo 1");
      window.location.href = "dashboard.html";
    }
  });
  
  const hash = window.location.hash;
  if (hash === "#signup") {
    container?.classList.add("active"); // muestra el panel de registro
  } else {
    container?.classList.remove("active"); // por defecto: login
  }
  
});
