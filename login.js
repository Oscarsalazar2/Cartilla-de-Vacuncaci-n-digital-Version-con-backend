document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("container");
  const btnLoginToggle = document.getElementById("login");
  const btnRegisterToggle = document.getElementById("register");

  // Cambiar entre Iniciar sesión / Registrarse
  btnLoginToggle?.addEventListener("click", () => {
    container?.classList.remove("active");
  });

  btnRegisterToggle?.addEventListener("click", () => {
    container?.classList.add("active");
  });

  // Mostrar panel según hash (#signup)
  const hash = window.location.hash;
  if (hash === "#signup") {
    container?.classList.add("active");
  } else {
    container?.classList.remove("active");
  }

  // ==========================
  // REGISTRO con fetch + modales
  // ==========================
  const formRegistro = document.getElementById("formRegistro");
  const modalRegistroPendiente = document.getElementById("modalRegistroPendiente");
  const btnModalAceptar = document.getElementById("btnModalAceptar");

  const modalRegistroError = document.getElementById("modalRegistroError");
  const btnModalErrorAceptar = document.getElementById("btnModalErrorAceptar");

  formRegistro?.addEventListener("submit", async (e) => {
    e.preventDefault(); // <- esto evita que el navegador vaya a registrar_usuario.php

    const formData = new FormData(formRegistro);

    try {
      const resp = await fetch("php/registrar_usuario.php", {
        method: "POST",
        body: formData,
      });

      const data = await resp.json();

      console.log("Respuesta registro:", data);

      if (data.ok) {
        // Registro exitoso -> mostrar modal de "Registro pendiente"
        modalRegistroPendiente?.classList.add("open");
        formRegistro.reset();
      } else if (data.code === "duplicate") {
        // Correo/CURP ya existen -> mostrar modal de error
        modalRegistroError?.classList.add("open");
      } else {
        alert(data.message || "Ocurrió un error al registrar.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión con el servidor.");
    }
  });

  // Botón Aceptar del modal de registro pendiente
  btnModalAceptar?.addEventListener("click", () => {
    modalRegistroPendiente?.classList.remove("open");
    // Volver al panel de login
    container?.classList.remove("active");
  });

  // Botón Aceptar del modal de error
  btnModalErrorAceptar?.addEventListener("click", () => {
    modalRegistroError?.classList.remove("open");
  });

  // Cerrar modales haciendo clic en el fondo
  document
    .querySelectorAll(
      "#modalRegistroPendiente .login-modal__backdrop, #modalRegistroError .login-modal__backdrop"
    )
    .forEach((bk) => {
      bk.addEventListener("click", () => {
        modalRegistroPendiente?.classList.remove("open");
        modalRegistroError?.classList.remove("open");
      });
    });

      // ==========================
  // LOGIN con fetch + modal
  // ==========================
  const loginForm = document.getElementById("loginForm");
  const modalLoginError = document.getElementById("modalLoginError");
  const btnLoginErrorAceptar = document.getElementById("btnLoginErrorAceptar");
  const loginErrorMsg = document.getElementById("loginErrorMsg");

  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(loginForm);

    try {
      const resp = await fetch("php/login_usuario.php", {
        method: "POST",
        body: formData,
      });
      const data = await resp.json();

      console.log("Respuesta login:", data);

      if (data.ok) {
        // Redirigir al dashboard
        window.location.href = "dashboard.php";
      } else {
        // Mensaje según el tipo de error
        let msg = "Error al iniciar sesión.";
        if (data.code === "bad_password") msg = "Contraseña incorrecta.";
        if (data.code === "not_found") msg = "Usuario no encontrado.";
        if (data.code === "pending") msg = "Tu cuenta aún no ha sido activada.";
        if (data.code === "validation") msg = "Por favor llena todos los campos.";

        loginErrorMsg.textContent = msg;
        modalLoginError?.classList.add("open");
      }
    } catch (err) {
      console.error(err);
      loginErrorMsg.textContent = "Error de conexión con el servidor.";
      modalLoginError?.classList.add("open");
    }
  });

  btnLoginErrorAceptar?.addEventListener("click", () => {
    modalLoginError?.classList.remove("open");
  });

  document
    .querySelectorAll("#modalLoginError .login-modal__backdrop")
    .forEach((bk) => {
      bk.addEventListener("click", () => {
        modalLoginError?.classList.remove("open");
      });
    });



    function getBirthdateFromCurp(curp) {
  if (!curp) return null;

  curp = curp.toUpperCase().trim();

  // Validación básica de formato
  const regexCurp = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;
  if (!regexCurp.test(curp)) {
    return null;
  }

  const yy = parseInt(curp.substr(4, 2), 10); // posiciones 5-6
  const mm = parseInt(curp.substr(6, 2), 10); // posiciones 7-8
  const dd = parseInt(curp.substr(8, 2), 10); // posiciones 9-10

  const currentYY = new Date().getFullYear() % 100;
  const century = yy <= currentYY ? 2000 : 1900;
  const fullYear = century + yy;

  // Construimos la fecha en formato YYYY-MM-DD
  const fechaStr =
    fullYear.toString().padStart(4, "0") +
    "-" +
    String(mm).padStart(2, "0") +
    "-" +
    String(dd).padStart(2, "0");

  // Validar que sea una fecha real
  const d = new Date(fechaStr);
  if (isNaN(d.getTime())) return null;

  return fechaStr; // "YYYY-MM-DD"
}
const curpInput = document.getElementById("regCurp");
const fechaNacInput = document.getElementById("regFechaNacimiento");

// Cuando el usuario termina de escribir la CURP (blur) o al cambiar
curpInput?.addEventListener("blur", () => {
  const fecha = getBirthdateFromCurp(curpInput.value);

  if (fecha) {
    fechaNacInput.value = fecha;
    console.log("Fecha de nacimiento desde CURP:", fecha);
  } else {
    fechaNacInput.value = "";
    console.warn("CURP no válida o no se pudo obtener fecha");
  }
});

});
