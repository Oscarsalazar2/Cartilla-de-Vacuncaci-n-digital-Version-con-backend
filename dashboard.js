// =======================
//  ROL DEL USUARIO (TEMPORAL PARA PRUEBAS)
// =======================
const userRole = localStorage.getItem("userRole") || "ciudadano"; // cambia a "medico" o "ciudadano" para probar

// =======================
//  AVATAR GLOBAL
// =======================

// Inicializar avatar del usuario
let userName = localStorage.getItem("userName") || "";
let userImage = localStorage.getItem("userImage") || "";

// Función para iniciales (US, E1, etc.)
function getInitials(name) {
  if (!name || !name.trim()) return "US";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const userNameEl = document.getElementById("userName");
const railAvatar = document.getElementById("railAvatar");
const userAvatarMini = document.getElementById("userAvatarMini");

// Actualiza nombre en el topbar
if (userNameEl) {
  userNameEl.textContent = userName || "Usuario invitado";
}

// Mostrar imagen o iniciales en los avatares globales
function setAvatar(el, size = 52) {
  if (!el) return;

  if (userImage) {
    el.innerHTML = `<img src="${userImage}" alt="Avatar">`;
  } else {
    const initials = getInitials(userName);
    el.innerHTML = `<span style="
        display:grid;place-items:center;
        height:${size}px;width:${size}px;
        border-radius:999px;
        background:linear-gradient(135deg,var(--verde),var(--azul));
        color:#fff;font-weight:700;
        font-size:${size > 40 ? "1.1rem" : "0.9rem"};
        letter-spacing:1px;
      ">${initials}</span>`;
  }
}

// Aplica en los dos lugares (rail izquierdo y topbar)
setAvatar(railAvatar, 52);
setAvatar(userAvatarMini, 26);

// =======================
//  NAVEGACIÓN RAIL LATERAL
// =======================
const railItems = document.querySelectorAll(".rail-item");
const sections = document.querySelectorAll(".content-section");
const topbarTitle = document.getElementById("topbarTitle");

const titulos = {
  resumen: "Resumen general",
  "mis-vacunas": "Historial de vacunas",
  usuarios: "Usuarios del sistema",
  citas: "Citas de vacunación",
  ajustes: "Ajustes del sistema",
  qr: "QR",
  perfil: "Mi perfil",
  admin: "Administrar usuarios",
};

railItems.forEach((btn) => {
  btn.addEventListener("click", () => {
    const section = btn.getAttribute("data-section");
    if (!section) return;

    // Icono activo
    railItems.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    // Sección visible
    sections.forEach((sec) => sec.classList.remove("active"));
    document
      .querySelector(`[data-section-panel="${section}"]`)
      ?.classList.add("active");

    // Título topbar
    if (topbarTitle) {
      topbarTitle.textContent = titulos[section] || "Panel";
    }
  });
});

// =======================
//  DROPDOWN USUARIO
// =======================
const userBtn = document.getElementById("userMenuBtn");
const userDropdown = document.getElementById("userDropdown");

userBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  userDropdown?.classList.toggle("open");
});

document.addEventListener("click", () => {
  userDropdown?.classList.remove("open");
});

// =======================
//  DETALLE VACUNA EN MODAL (DEMO)
// =======================

// Datos de ejemplo (después conectar a la BD)
const detalleVacunas = {
  covid19: [
    { dosis: 1, fecha: "10/01/2024", marca: "Pfizer", lote: "PFZ-001" },
    { dosis: 2, fecha: "10/03/2024", marca: "Pfizer", lote: "PFZ-019" },
    { dosis: 3, fecha: "12/03/2025", marca: "Pfizer", lote: "PFZ-077" },
  ],
  hepB: [
    { dosis: 1, fecha: "09/11/2024", marca: "Sanofi", lote: "SNF-221" },
    { dosis: 2, fecha: "09/01/2025", marca: "Sanofi", lote: "SNF-310" },
  ],
  influenza: [{ dosis: 1, fecha: "—", marca: "Por aplicar", lote: "—" }],
};

const filasVacuna = document.querySelectorAll(".vacuna-row");
const modalVacuna = document.getElementById("modalVacuna");
const modalBackdrop = document.getElementById("modalVacunaBackdrop");
const modalCerrar = document.getElementById("modalVacunaCerrar");
const modalTitulo = document.getElementById("modalVacunaTitulo");
const modalTablaBody = document.getElementById("modalVacunaTablaBody");

filasVacuna.forEach((fila) => {
  fila.addEventListener("click", () => {
    const id = fila.dataset.vacuna;
    const nombre = fila.dataset.vacunaNombre || "Vacuna";
    const detalles = detalleVacunas[id];
    if (!detalles) return;

    // Título
    modalTitulo.textContent = `Detalle de ${nombre}`;

    // Limpiar tabla
    modalTablaBody.innerHTML = "";

    // Agregar filas
    detalles.forEach((d) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>Dosis ${d.dosis}</td>
        <td>${d.fecha}</td>
        <td>${d.marca}</td>
        <td>${d.lote}</td>
        <td>—</td>
      `;
      modalTablaBody.appendChild(tr);
    });

    // Mostrar modal
    modalVacuna.classList.add("open");
  });
});

function cerrarModalVacuna() {
  modalVacuna.classList.remove("open");
}

modalCerrar?.addEventListener("click", cerrarModalVacuna);
modalBackdrop?.addEventListener("click", cerrarModalVacuna);

// =======================
//  ADMIN USUARIOS (DEMO) – PENDIENTES
// =======================

// Activar usuario (cambia badge)
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-activar-usuario]");
  if (!btn) return;

  const row = btn.closest("tr");
  if (!row) return;

  // Cambiar badge a "Activo"
  const badge = row.querySelector(".badge");
  if (badge) {
    badge.textContent = "Activo";
    badge.classList.remove("badge-pendiente");
    badge.classList.add("badge-activo");
  }

  // Deshabilitar botón Activar
  btn.disabled = true;
  btn.textContent = "Activado";
});

// =======================
//  FILTROS DE USUARIOS
// =======================
const filtroBtns = document.querySelectorAll("[data-usuarios-filter]");
const tablaUsuariosBody = document.getElementById("tablaUsuariosBody");

filtroBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tipo = btn.getAttribute("data-usuarios-filter");

    // marcar botón activo
    filtroBtns.forEach((b) => b.classList.remove("usuarios-pill-activo"));
    btn.classList.add("usuarios-pill-activo");

    // mostrar / ocultar filas según data-tipo
    tablaUsuariosBody?.querySelectorAll("tr").forEach((tr) => {
      const tipoFila = tr.getAttribute("data-tipo") || "todos";
      if (tipo === "todos" || tipo === tipoFila) {
        tr.style.display = "";
      } else {
        tr.style.display = "none";
      }
    });
  });
});

// =======================
//  CARTILLAS DEMO POR USUARIO
// =======================
const cartillasUsuarios = {
  "juan@example.com": [
    {
      vacuna: "BCG",
      fecha: "2024-01-15",
      dosis: "Única",
      estado: "Aplicada",
      lote: "BCG-001",
      obs: "Sin reacciones",
    },
    {
      vacuna: "Hepatitis B",
      fecha: "2024-02-20",
      dosis: "1 / 3",
      estado: "Aplicada",
      lote: "HEP-010",
      obs: "",
    },
    {
      vacuna: "Pentavalente",
      fecha: "2024-03-10",
      dosis: "2 / 4",
      estado: "Aplicada",
      lote: "PEN-200",
      obs: "",
    },
    {
      vacuna: "Influenza",
      fecha: "2024-11-10",
      dosis: "1 / 1",
      estado: "Pendiente",
      lote: "",
      obs: "",
    },
  ],
  "ana.medico@example.com": [
    {
      vacuna: "COVID-19",
      fecha: "2024-02-05",
      dosis: "3 / 3",
      estado: "Completa",
      lote: "COV-333",
      obs: "Esquema completo",
    },
    {
      vacuna: "Influenza",
      fecha: "2024-11-12",
      dosis: "1 / 1",
      estado: "Aplicada",
      lote: "INF-555",
      obs: "",
    },
  ],
};

const tablaUsuarios = document.getElementById("tablaUsuariosBody");
const modalCartillaUsuario = document.getElementById("modalCartillaUsuario");
const cartillaNombreUsuario = document.getElementById("cartillaNombreUsuario");
const cartillaEmailUsuario = document.getElementById("cartillaEmailUsuario");
const cartillaTablaBody = document.getElementById("cartillaTablaBody");
const btnDescargarCartilla = document.getElementById("btnDescargarCartilla");

let emailCartillaActual = null;

// Función para renderizar tabla de cartilla de un usuario
function renderCartillaTabla(correo) {
  if (!cartillaTablaBody) return;
  cartillaTablaBody.innerHTML = "";

  const cartilla = cartillasUsuarios[correo] || [];

  if (cartilla.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="4">No hay vacunas registradas todavía.</td>`;
    cartillaTablaBody.appendChild(tr);
    return;
  }

  cartilla.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.vacuna}</td>
      <td>${item.fecha}</td>
      <td>${item.dosis}</td>
      <td>${item.estado}</td>
    `;
    cartillaTablaBody.appendChild(tr);
  });
}

// Abrir modal de cartilla al hacer click en el icono
tablaUsuarios?.addEventListener("click", (e) => {
  const btn = e.target.closest(".ver-cartilla-usuario");
  if (!btn) return;

  const fila = btn.closest("tr");
  if (!fila) return;

  const nombre = fila.dataset.userNombre || fila.cells[0].textContent.trim();
  const correo = fila.dataset.userEmail || fila.cells[3].textContent.trim();

  emailCartillaActual = correo;

  cartillaNombreUsuario.textContent = nombre;
  cartillaEmailUsuario.textContent = correo;

  renderCartillaTabla(correo);

  modalCartillaUsuario?.classList.add("open");
});

// Cerrar modal cartilla
document.querySelectorAll("[data-close-pac-modal]").forEach((btn) => {
  btn.addEventListener("click", () => {
    modalCartillaUsuario?.classList.remove("open");
  });
});

document
  .querySelectorAll("#modalCartillaUsuario .pac-modal-backdrop")
  .forEach((bk) => {
    bk.addEventListener("click", () => {
      modalCartillaUsuario?.classList.remove("open");
    });
  });

// Descargar cartilla = abrir la ventana de impresión (usuario puede Guardar como PDF)
btnDescargarCartilla?.addEventListener("click", () => {
  window.print();
});

// =======================
//  PERFIL: DATOS BÁSICOS
// =======================
const perfilNombreEl = document.getElementById("perfilNombre");
const perfilAvatarInicialesEl = document.getElementById(
  "perfilAvatarIniciales"
);
const perfilCorreoEl = document.getElementById("perfilCorreo");

const storedName = localStorage.getItem("userName") || "Usuario invitado";
const storedEmail = localStorage.getItem("userEmail") || "correo@example.com";

if (perfilNombreEl) perfilNombreEl.textContent = storedName;
if (perfilCorreoEl) perfilCorreoEl.textContent = storedEmail;

// Iniciales del avatar de perfil
if (perfilAvatarInicialesEl) {
  perfilAvatarInicialesEl.textContent = getInitials(storedName);
}

// =======================
//  ACORDEÓN MI PERFIL
// =======================
const accHeads = document.querySelectorAll(".perfil-acc-head");

accHeads.forEach((head) => {
  head.addEventListener("click", () => {
    const item = head.closest(".perfil-acc-item");
    if (!item) return;
    item.classList.toggle("perfil-acc-open");
  });
});

// =======================
//  BUSCADOR USUARIOS
// =======================
const usuariosSearchInput = document.getElementById("usuariosSearchInput");

if (usuariosSearchInput) {
  usuariosSearchInput.addEventListener("input", () => {
    const term = usuariosSearchInput.value.trim().toLowerCase();

    tablaUsuariosBody?.querySelectorAll("tr").forEach((tr) => {
      const nombre = (tr.getAttribute("data-user-nombre") || "").toLowerCase();
      const email = (tr.getAttribute("data-user-email") || "").toLowerCase();
      const curp = (tr.getAttribute("data-user-curp") || "").toLowerCase();

      const matches =
        !term ||
        nombre.includes(term) ||
        email.includes(term) ||
        curp.includes(term);

      // respetar filtro actual (ciudadano / medico / todos)
      const btnActivo = document.querySelector(".usuarios-pill-activo");
      const filtro = btnActivo?.getAttribute("data-usuarios-filter") || "todos";
      const tipoFila = tr.getAttribute("data-tipo") || "todos";

      const pasaFiltro = filtro === "todos" || filtro === tipoFila;

      tr.style.display = matches && pasaFiltro ? "" : "none";
    });
  });
}

// =======================
//  AUTOGUARDADO PERFIL (LOCALSTORAGE DEMO)
// =======================
const autoFields = [
  "perfilCorreoInput",
  "perfilCelularInput",
  "perfilTelefonoInput",
  "perfilCalleInput",
  "perfilNumExtInput",
  "perfilNumIntInput",
  "perfilEstadoInput",
  "perfilCiudadInput",
  "perfilColoniaInput",
  "perfilCpInput",
  "perfilEntreCallesInput",
];

autoFields.forEach((id) => {
  const el = document.getElementById(id);
  if (!el) return;
  const saved = localStorage.getItem(id);
  if (saved) el.value = saved;

  el.addEventListener("change", () => {
    localStorage.setItem(id, el.value);
    console.log("Guardado automático de", id);
  });
});

// =======================
//  CAMBIAR CONTRASEÑA (DEMO)
// =======================
const btnPassGuardar = document.getElementById("btnPerfilPassGuardar");
const btnPassCancelar = document.getElementById("btnPerfilPassCancelar");
const inputPassActual = document.getElementById("perfilPassActual");
const inputPassNueva = document.getElementById("perfilPassNueva");
const inputPassConfirmar = document.getElementById("perfilPassConfirmar");

btnPassCancelar?.addEventListener("click", () => {
  inputPassActual.value = "";
  inputPassNueva.value = "";
  inputPassConfirmar.value = "";
});

btnPassGuardar?.addEventListener("click", () => {
  const nueva = inputPassNueva.value.trim();
  const conf = inputPassConfirmar.value.trim();

  if (!nueva || !conf) {
    alert("Completa la nueva contraseña y su confirmación.");
    return;
  }
  if (nueva !== conf) {
    alert("Las contraseñas no coinciden.");
    return;
  }
  if (nueva.length < 8) {
    alert("La nueva contraseña debe tener al menos 8 caracteres.");
    return;
  }

  alert("Contraseña actualizada (demo).");
  inputPassActual.value = "";
  inputPassNueva.value = "";
  inputPassConfirmar.value = "";
});

// =======================
//  REGISTRAR VACUNA (MODAL)
// =======================
const btnsAgregarVacuna = document.querySelectorAll(".agregar-vacuna-usuario");
const btnRegistrarDesdeCartilla = document.getElementById(
  "btnRegistrarDesdeCartilla"
);

const modalRegistrarVacuna = document.getElementById("modalRegistrarVacuna");
const rvPaciente = document.getElementById("rvPaciente");
const rvVacuna = document.getElementById("rvVacuna");
const rvDosis = document.getElementById("rvDosis");
const rvLote = document.getElementById("rvLote");
const rvFecha = document.getElementById("rvFecha");
const rvObs = document.getElementById("rvObs");
const rvCancelar = document.getElementById("rvCancelar");
const formRegistrarVacuna = document.getElementById("formRegistrarVacuna");

function abrirModalRegistrar(nombrePaciente) {
  if (!modalRegistrarVacuna) return;
  rvPaciente.value = nombrePaciente || "";
  modalRegistrarVacuna.classList.add("open");
}

function cerrarModalRegistrar() {
  if (!modalRegistrarVacuna) return;
  modalRegistrarVacuna.classList.remove("open");
  formRegistrarVacuna?.reset();
}

rvCancelar?.addEventListener("click", cerrarModalRegistrar);

document
  .querySelectorAll(
    "#modalRegistrarVacuna .pac-modal-backdrop, #modalRegistrarVacuna .pac-modal-close"
  )
  .forEach((el) => {
    el.addEventListener("click", cerrarModalRegistrar);
  });

// Abrir modal Registrar vacuna desde la cartilla
btnRegistrarDesdeCartilla?.addEventListener("click", () => {
  const nombre = cartillaNombreUsuario?.textContent?.trim() || "";
  abrirModalRegistrar(nombre);
});

// Abrir modal Registrar vacuna desde botón en tabla
btnsAgregarVacuna.forEach((btn) => {
  btn.addEventListener("click", () => {
    const nombre =
      btn.dataset.userNombre || btn.closest("tr")?.dataset.userNombre || "";
    abrirModalRegistrar(nombre);
  });
});

// Guardar vacuna (demo local)
formRegistrarVacuna?.addEventListener("submit", (e) => {
  e.preventDefault();

  const nombrePaciente = rvPaciente.value.trim();
  const vacuna = rvVacuna.value.trim();
  const dosis = rvDosis.value.trim();
  const lote = rvLote.value.trim();
  const fecha = rvFecha.value;
  const obs = rvObs.value.trim();

  if (!nombrePaciente || !vacuna || !dosis || !lote || !fecha) {
    alert("Por favor llena todos los campos obligatorios.");
    return;
  }

  const correo = emailCartillaActual || "";

  if (correo) {
    if (!cartillasUsuarios[correo]) cartillasUsuarios[correo] = [];
    cartillasUsuarios[correo].push({
      vacuna,
      fecha,
      dosis,
      estado: "Aplicada",
      lote,
      obs,
    });

    if (modalCartillaUsuario?.classList.contains("open")) {
      renderCartillaTabla(correo);
    }
  }

  alert("Vacuna registrada (demo, falta conectar a la BD).");
  cerrarModalRegistrar();
});

// =======================
//  VISIBILIDAD DE BOTONES SEGÚN ROL
// =======================
const btnsEditarUsuario = document.querySelectorAll(".editar-usuario");
const btnsEliminarUsuario = document.querySelectorAll(".eliminar-usuario");

if (userRole === "admin") {
  btnsEditarUsuario.forEach((b) => (b.style.display = "inline-flex"));
  btnsEliminarUsuario.forEach((b) => (b.style.display = "inline-flex"));
  btnsAgregarVacuna.forEach((b) => (b.style.display = "inline-flex"));
} else if (userRole === "medico") {
  btnsEditarUsuario.forEach((b) => (b.style.display = "inline-flex"));
  btnsEliminarUsuario.forEach((b) => (b.style.display = "none"));
  btnsAgregarVacuna.forEach((b) => (b.style.display = "inline-flex"));
} else {
  // ciudadano
  btnsEditarUsuario.forEach((b) => (b.style.display = "none"));
  btnsEliminarUsuario.forEach((b) => (b.style.display = "none"));
  btnsAgregarVacuna.forEach((b) => (b.style.display = "none"));
}

// =======================
//  CAMBIAR FOTO DE PERFIL
// =======================
const btnCambiarFoto = document.getElementById("btnCambiarFoto");
const inputFoto = document.getElementById("inputFotoPerfil");
const imgPerfil = document.getElementById("perfilFoto");
const spanIniciales = document.getElementById("perfilAvatarIniciales");

if (btnCambiarFoto && inputFoto) {
  btnCambiarFoto.addEventListener("click", () => {
    inputFoto.click();
  });

  inputFoto.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const dataUrl = e.target.result;

      if (imgPerfil) {
        imgPerfil.src = dataUrl;
        imgPerfil.style.display = "block";
      }

      if (spanIniciales) {
        spanIniciales.style.display = "none";
      }

      localStorage.setItem("userImage", dataUrl);
      userImage = dataUrl;

      setAvatar(railAvatar, 52);
      setAvatar(userAvatarMini, 26);
    };

    reader.readAsDataURL(file);
  });
}

// ===============================
// MODAL EDICIÓN AVANZADA (Admin / Médico)
// ===============================
const modalEdicionAvanzada = document.getElementById("modalEdicionAvanzada");
const btnGuardarEdicion = document.getElementById("btnGuardarEdicion");
const formEditarUsuario = document.getElementById("formEditarUsuario");
const formEditarDosis = document.getElementById("formEditarDosis");

// Elementos usuario
const edUserNombre = document.getElementById("edUserNombre");
const edUserCorreo = document.getElementById("edUserCorreo");
const edUserCurp = document.getElementById("edUserCurp");
const edUserTipo = document.getElementById("edUserTipo");
const edUserEstado = document.getElementById("edUserEstado");

// Elementos vacuna
const edFecha = document.getElementById("edFecha");
const edLote = document.getElementById("edLote");
const edObs = document.getElementById("edObs");

let filaUsuarioActual = null;

// Abrir modal cuando se da clic en editar
tablaUsuarios?.addEventListener("click", (e) => {
  const btnEditar = e.target.closest(".editar-usuario");
  if (!btnEditar) return;

  filaUsuarioActual = btnEditar.closest("tr");
  if (!filaUsuarioActual) return;

  // Rellenar datos de usuario
  const nombre =
    filaUsuarioActual.dataset.userNombre ||
    filaUsuarioActual.cells[0].textContent.trim();
  const correo =
    filaUsuarioActual.dataset.userEmail ||
    filaUsuarioActual.cells[3].textContent.trim();
  const curp =
    filaUsuarioActual.dataset.userCurp ||
    filaUsuarioActual.cells[2].textContent.trim();
  const tipo = filaUsuarioActual.dataset.tipo || "ciudadano";

  if (formEditarUsuario) {
    edUserNombre.value = nombre;
    edUserCorreo.value = correo;
    edUserCurp.value = curp;
    edUserTipo.value = tipo;

    const badge = filaUsuarioActual.querySelector(".badge");
    edUserEstado.value =
      badge && badge.classList.contains("badge-activo")
        ? "activo"
        : "suspendido";
  }

  // MOSTRAR SECCIONES SEGÚN ROL
  if (userRole === "admin") {
    formEditarUsuario.style.display = "block";
    formEditarDosis.style.display = "block";
  } else if (userRole === "medico") {
    formEditarUsuario.style.display = "none";
    formEditarDosis.style.display = "block";
  } else {
    formEditarUsuario.style.display = "none";
    formEditarDosis.style.display = "none";
  }

  // Rellenar última dosis (si existe) para este usuario
  if (formEditarDosis && correo && cartillasUsuarios[correo]?.length) {
    const cartilla = cartillasUsuarios[correo];
    const ultima = cartilla[cartilla.length - 1];

    edFecha.value = ultima.fecha || "";
    edLote.value = ultima.lote || "";
    edObs.value = ultima.obs || "";
  } else {
    edFecha.value = "";
    edLote.value = "";
    edObs.value = "";
  }

  modalEdicionAvanzada.classList.add("open");
});

// Cerrar modal
document.querySelectorAll("[data-close-edicion-avanzada]").forEach((btn) =>
  btn.addEventListener("click", () => {
    modalEdicionAvanzada.classList.remove("open");
    filaUsuarioActual = null;
  })
);

// Guardar cambios (demo sin BD real)
btnGuardarEdicion?.addEventListener("click", () => {
  if (!filaUsuarioActual) return;

  const correoActual =
    filaUsuarioActual.dataset.userEmail ||
    filaUsuarioActual.cells[3].textContent.trim();

  // === ADMIN: actualizar datos del usuario ===
  if (userRole === "admin" && formEditarUsuario) {
    const nuevoNombre = edUserNombre.value.trim();
    const nuevoCorreo = edUserCorreo.value.trim();
    const nuevoCurp = edUserCurp.value.trim();
    const nuevoTipo = edUserTipo.value;
    const nuevoEstado = edUserEstado.value;

    filaUsuarioActual.setAttribute("data-user-nombre", nuevoNombre);
    filaUsuarioActual.setAttribute("data-user-email", nuevoCorreo);
    filaUsuarioActual.setAttribute("data-user-curp", nuevoCurp);
    filaUsuarioActual.setAttribute("data-tipo", nuevoTipo);

    filaUsuarioActual.cells[0].textContent = nuevoNombre;
    filaUsuarioActual.cells[1].textContent =
      nuevoTipo === "medico" ? "Personal médico" : "Ciudadano";
    filaUsuarioActual.cells[2].textContent = nuevoCurp;
    filaUsuarioActual.cells[3].textContent = nuevoCorreo;

    const badge = filaUsuarioActual.querySelector(".badge");
    if (badge) {
      if (nuevoEstado === "activo") {
        badge.textContent = "Activo";
        badge.classList.add("badge-activo");
        badge.classList.remove("badge-pendiente");
      } else {
        badge.textContent = "Suspendido";
        badge.classList.add("badge-pendiente");
        badge.classList.remove("badge-activo");
      }
    }
  }

  // === ADMIN / MÉDICO: actualizar última dosis ===
  if ((userRole === "admin" || userRole === "medico") && correoActual) {
    const cartilla = cartillasUsuarios[correoActual];
    if (cartilla && cartilla.length) {
      const ultima = cartilla[cartilla.length - 1];
      ultima.fecha = edFecha.value || ultima.fecha;
      ultima.lote = edLote.value || ultima.lote;
      ultima.obs = edObs.value || ultima.obs;

      // Si la cartilla de este usuario está abierta, refrescamos la tabla
      if (
        modalCartillaUsuario?.classList.contains("open") &&
        emailCartillaActual === correoActual
      ) {
        renderCartillaTabla(correoActual);
      }
    }
  }

  modalEdicionAvanzada.classList.remove("open");
  filaUsuarioActual = null;
});

// =======================
//  ELIMINAR USUARIO (SOLO FRONT)
// =======================
tablaUsuarios?.addEventListener("click", (e) => {
  const btnEliminar = e.target.closest(".eliminar-usuario");
  if (!btnEliminar) return;

  const fila = btnEliminar.closest("tr");
  if (!fila) return;

  const nombre =
    fila.getAttribute("data-user-nombre") || fila.cells[0].textContent.trim();

  if (
    confirm(`¿Seguro que quieres eliminar a ${nombre}? (demo, solo frontend)`)
  ) {
    fila.remove();
  }
});
