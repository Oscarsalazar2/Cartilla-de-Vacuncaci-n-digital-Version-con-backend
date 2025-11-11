// =======================
//  AVATAR GLOBAL
// =======================
const userNameEl = document.getElementById("userName");
const railAvatar = document.getElementById("railAvatar");
const userAvatarMini = document.getElementById("userAvatarMini");

function getInitials(name) {
  if (!name || !name.trim()) return "US";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const displayedName = userNameEl?.textContent?.trim() || "Usuario";

function paintInitialAvatar(el, size, name) {
  if (!el) return;
  const initials = getInitials(name);
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

// Avatares iniciales (rail + topbar)
paintInitialAvatar(railAvatar, 52, displayedName);
paintInitialAvatar(userAvatarMini, 26, displayedName);

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
  perfil: "Mi perfil",
  qr: "QR",
  admin: "Administrar usuarios",
};

railItems.forEach((btn) => {
  btn.addEventListener("click", () => {
    const section = btn.getAttribute("data-section");
    if (!section) return;

    railItems.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    sections.forEach((sec) => sec.classList.remove("active"));
    document
      .querySelector(`[data-section-panel="${section}"]`)
      ?.classList.add("active");

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
//  HISTORIAL DE VACUNAS (BD REAL)
// =======================

// Referencias al modal
const modalVacuna = document.getElementById("modalVacuna");
const modalVacunaBackdrop = document.getElementById("modalVacunaBackdrop");
const modalVacunaCerrar = document.getElementById("modalVacunaCerrar");
const modalVacunaTitulo = document.getElementById("modalVacunaTitulo");
const modalVacunaTablaBody = document.getElementById("modalVacunaTablaBody");
const modalVacunaDescripcion = document.getElementById(
  "modalVacunaDescripcion"
);

// Cargar vacunas del usuario logueado y llenar la tabla de "Historial de vacunas"
async function cargarHistorialVacunas() {
  const tbody = document.getElementById("histVacunasBody");
  const msg = document.getElementById("histVacunasMsg");
  if (!tbody) return;

  tbody.innerHTML = "";
  if (msg) {
    msg.textContent = "Cargando historial...";
    msg.style.color = "#64748b";
  }

  try {
    //  USAMOS LA ACCIÓN = resumen
    const resp = await fetch("php/api_vacunas.php?action=resumen");
    const data = await resp.json();

    if (!data.ok) {
      throw new Error(data.error || "Error en la API");
    }

    const matriz = data.matriz || [];

    if (matriz.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="4">No hay vacunas registradas todavía.</td>`;
      tbody.appendChild(tr);

      if (msg) {
        msg.textContent =
          "Aún no se ha registrado ninguna vacuna en tu cartilla.";
      }
      return;
    }

    if (msg) msg.textContent = "";

    // Cada fila = una vacuna del esquema
    matriz.forEach((v) => {
      const tr = document.createElement("tr");
      tr.classList.add("vacuna-row-hist");
      tr.dataset.idVacuna = v.id_vacuna;
      tr.dataset.vacunaNombre = v.vacuna;

      tr.innerHTML = `
        <td>${v.vacuna}</td>
        <td>${v.ultima_fecha || "—"}</td>
        <td>${v.dosis_aplicadas} / ${v.total_dosis || 0}</td>
        <td>${v.estado || "—"}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error cargando historial:", err);
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="4">No se pudo cargar el historial.</td>`;
    tbody.appendChild(tr);

    if (msg) {
      msg.textContent = "No se pudo cargar el historial.";
      msg.style.color = "#ef4444";
    }
  }
}

// Abrir modal con el detalle de una vacuna (pide a la API solo esta vacuna)
function abrirModalVacuna(idVacuna, nombreVacuna) {
  if (!modalVacuna || !modalVacunaTablaBody) return;

  modalVacunaTitulo.textContent = `Detalle de ${nombreVacuna}`;
  modalVacunaTablaBody.innerHTML = "";
  if (modalVacunaDescripcion) {
    modalVacunaDescripcion.textContent = "Cargando detalle...";
  }

  fetch(
    `php/api_vacunas.php?action=detalle_vacuna&id_vacuna=${encodeURIComponent(
      idVacuna
    )}`
  )
    .then((r) => r.json())
    .then((data) => {
      if (!data.ok) throw new Error(data.error || "Error en API");
      const lista = data.data || [];

      if (lista.length === 0) {
        modalVacunaTablaBody.innerHTML = `<tr><td colspan="4">No hay dosis registradas para esta vacuna.</td></tr>`;
        if (modalVacunaDescripcion) {
          modalVacunaDescripcion.textContent =
            "No hay dosis registradas para esta vacuna.";
        }
        return;
      }

      if (modalVacunaDescripcion) {
        modalVacunaDescripcion.textContent = `Se han registrado ${lista.length} dosis para esta vacuna.`;
      }

      lista.forEach((d, idx) => {
        const etiquetaDosis = d.dosis_numero
          ? `${d.dosis_numero}ª de ${d.total_dosis || ""}`.trim()
          : `Dosis ${idx + 1}`;

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${etiquetaDosis}</td>
          <td>${
            d.fecha_aplicacion ? d.fecha_aplicacion.substring(0, 10) : "—"
          }</td>
          <td>${d.lote || "N/D"}</td>
          <td>${d.estado || "Aplicada"}</td>
        `;
        modalVacunaTablaBody.appendChild(tr);
      });
    })
    .catch((err) => {
      console.error("Error detalle vacuna:", err);
      modalVacunaTablaBody.innerHTML = `<tr><td colspan="4">No se pudo cargar el detalle.</td></tr>`;
      if (modalVacunaDescripcion) {
        modalVacunaDescripcion.textContent =
          "No se pudo cargar el detalle de la vacuna.";
      }
    });

  modalVacuna.classList.add("open");
}

// Cerrar modal
function cerrarModalVacunaReal() {
  modalVacuna?.classList.remove("open");
}

modalVacunaCerrar?.addEventListener("click", cerrarModalVacunaReal);
modalVacunaBackdrop?.addEventListener("click", cerrarModalVacunaReal);

// Click en las filas de "Vacunas registradas"
document.addEventListener("click", (e) => {
  const fila = e.target.closest(".vacuna-row-hist");
  if (!fila) return;

  const idVacuna = fila.dataset.idVacuna;
  const nombre = fila.dataset.vacunaNombre || fila.cells[0].textContent.trim();

  if (!idVacuna) return;

  abrirModalVacuna(idVacuna, nombre);
});

// =======================
//  ADMIN USUARIOS (BD REAL)
// =======================
document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-activar-usuario]");
  if (!btn) return;

  const idUsuario = btn.getAttribute("data-activar-usuario");
  if (!idUsuario) return;

  if (!confirm("¿Activar esta cuenta?")) return;

  try {
    const form = new FormData();
    form.append("action", "activar");
    form.append("id_usuario", idUsuario);

    const resp = await fetch("php/api_usuarios.php", {
      method: "POST",
      body: form,
    });
    const data = await resp.json();

    if (!data.ok) {
      throw new Error(data.error || "Error al activar usuario");
    }

    await cargarUsuariosDesdeAPI();
    alert("Usuario activado correctamente.");
  } catch (err) {
    console.error(err);
    alert("Error al activar usuario.");
  }
});

// =======================
//  FILTROS DE USUARIOS
// =======================
const filtroBtns = document.querySelectorAll("[data-usuarios-filter]");
const tablaUsuariosBody = document.getElementById("tablaUsuariosBody");

filtroBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tipo = btn.getAttribute("data-usuarios-filter");

    filtroBtns.forEach((b) => b.classList.remove("usuarios-pill-activo"));
    btn.classList.add("usuarios-pill-activo");

    tablaUsuariosBody?.querySelectorAll("tr").forEach((tr) => {
      const tipoFila = tr.getAttribute("data-tipo") || "todos";
      tr.style.display = tipo === "todos" || tipo === tipoFila ? "" : "none";
    });
  });
});

// =======================
//  ROL DEL USUARIO (desde PHP en el <body data-user-role="...">)
// =======================
const bodyEl = document.body;
const userRole = bodyEl?.dataset.userRole || "usuario";

// =======================
//  CARGAR USUARIOS DESDE API
// =======================
async function cargarUsuariosDesdeAPI() {
  const tablaBody = document.getElementById("tablaUsuariosBody");
  const adminPendientesBody = document.getElementById("adminPendientesBody");
  const countPend = document.getElementById("adminCountPendientes");
  const countAct = document.getElementById("adminCountActivos");

  if (!tablaBody) return;

  tablaBody.innerHTML = "";
  if (adminPendientesBody) adminPendientesBody.innerHTML = "";

  let pendientes = 0;
  let activos = 0;

  try {
    const resp = await fetch("php/api_usuarios.php?action=list");
    const data = await resp.json();

    if (!data.ok) {
      console.error(data.error || "Error en API de usuarios");
      return;
    }

    data.data.forEach((u) => {
      const nombreCompleto = [u.nombre, u.apellido_paterno, u.apellido_materno]
        .filter(Boolean)
        .join(" ");

      const estatus = (u.estatus || "").toUpperCase();
      if (estatus === "PENDIENTE") pendientes++;
      if (estatus === "ACTIVO") activos++;

      const tipo =
        u.rol_nombre === "Administrador"
          ? "admin"
          : u.rol_nombre === "Médico"
          ? "medico"
          : "usuario";

      const tr = document.createElement("tr");
      tr.dataset.userId = u.id_usuario;
      tr.dataset.userNombre = nombreCompleto;
      tr.dataset.userEmail = u.correo || "";
      tr.dataset.userCurp = u.curp || "";
      tr.dataset.tipo = tipo;

      tr.innerHTML = `
        <td>${nombreCompleto}</td>
        <td>${u.rol_nombre}</td>
        <td>${u.curp || "N/D"}</td>
        <td>${u.correo || "N/D"}</td>
        <td>
          <div class="usuarios-estado-acciones">
            <span class="badge ${
              estatus === "ACTIVO"
                ? "badge-activo"
                : estatus === "SUSPENDIDO"
                ? "badge-suspendido"
                : "badge-pendiente"
            }">
              ${
                estatus === "PENDIENTE"
                  ? "Pendiente"
                  : estatus === "ACTIVO"
                  ? "Activo"
                  : estatus || "Desconocido"
              }
            </span>
            <div class="usuarios-actions">
              <button
                class="btn-usr-icon ver-cartilla-usuario"
                type="button"
                title="Ver cartilla"
              >
                <i class="fa-solid fa-syringe"></i>
              </button>
              <button
                class="btn-usr-icon agregar-vacuna-usuario"
                type="button"
                title="Registrar vacuna"
                data-user-nombre="${nombreCompleto}"
                data-user-email="${u.correo || ""}"
              >
                <i class="fa-solid fa-plus"></i>
              </button>
              <button
                class="btn-usr-icon editar-usuario"
                type="button"
                title="Editar"
              >
                <i class="fa-solid fa-pen"></i>
              </button>
              <button
                class="btn-usr-icon eliminar-usuario"
                type="button"
                title="Eliminar"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        </td>
      `;

      //tablaBody.appendChild(tr);

      if (estatus !== "PENDIENTE") {
  // Pa cumplirle el gusto a mi mujer 
  //bueno es obvio que dice que si es difente que PENDIENTE pues enseña la tabla
  tablaBody.appendChild(tr);
}

      if (estatus === "PENDIENTE" && adminPendientesBody) {
        const trPend = document.createElement("tr");
        trPend.innerHTML = `
          <td>${nombreCompleto}</td>
          <td>${u.correo || "N/D"}</td>
          <td>${u.curp || "N/D"}</td>
          <td>
            <span class="badge badge-pendiente">Pendiente</span>
          </td>
          <td>
            <button
              class="btn-table btn-table-primary"
              data-activar-usuario="${u.id_usuario}"
            >
              Activar
            </button>
            <button class="btn-table btn-table-ghost">Ver</button>
          </td>
        `;
        adminPendientesBody.appendChild(trPend);
      }
    });

    if (countPend) countPend.textContent = pendientes;
    if (countAct) countAct.textContent = activos;

    // aplicar permisos a los botones recien creados
    aplicarPermisosPorRol();
  } catch (err) {
    console.error(err);
  }
}

async function cargarVacunasEnSelect() {
  const select = document.getElementById("rvVacuna");
  if (!select) return;

  // Mientras carga
  select.innerHTML = `<option value="">Cargando...</option>`;

  try {
    const resp = await fetch("php/api_vacunas.php?action=catalogo_vacunas");
    const data = await resp.json();

    if (!data.ok) {
      throw new Error(data.error || "Error en API catalogo_vacunas");
    }

    const vacunas = Array.isArray(data.data) ? data.data : [];

    // Limpiar y poner opción por defecto
    select.innerHTML = `<option value="">Seleccionar...</option>`;

    // Agregar una opción por cada vacuna
    vacunas.forEach((v) => {
      const opt = document.createElement("option");
      // Como tu API de registrar busca por NOMBRE, dejamos el value = nombre
      opt.value = v.nombre;
      opt.textContent = v.nombre;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("Error cargando catálogo de vacunas:", err);
    select.innerHTML = `<option value="">Error al cargar vacunas</option>`;
  }
}

// =======================
//  CARTILLAS POR USUARIO (solo para mostrar modal)
// =======================

const tablaUsuarios = document.getElementById("tablaUsuariosBody");
const modalCartillaUsuario = document.getElementById("modalCartillaUsuario");
const cartillaNombreUsuario = document.getElementById("cartillaNombreUsuario");
const cartillaEmailUsuario = document.getElementById("cartillaEmailUsuario");
const cartillaTablaBody = document.getElementById("cartillaTablaBody");
const btnDescargarCartilla = document.getElementById("btnDescargarCartilla");

// usuario seleccionado para cartilla / vacuna
let emailCartillaActual = null;
let idCartillaActual = null;

// =======================
//  PERFIL: DATOS BÁSICOS
// =======================
const perfilNombreEl = document.getElementById("perfilNombre");
const perfilAvatarInicialesEl = document.getElementById(
  "perfilAvatarIniciales"
);
const perfilCorreoEl = document.getElementById("perfilCorreo");

// Iniciales en el avatar grande del perfil
if (perfilAvatarInicialesEl && perfilNombreEl) {
  const nombreActual = perfilNombreEl.textContent || "Usuario";
  perfilAvatarInicialesEl.textContent = getInitials(nombreActual);
}

// email actual del usuario logueado (para validar "no me vacuno a mí mismo")
const currentEmail = perfilCorreoEl?.textContent?.trim() || "";

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

      const btnActivo = document.querySelector(".usuarios-pill-activo");
      const filtro = btnActivo?.getAttribute("data-usuarios-filter") || "todos";
      const tipoFila = tr.getAttribute("data-tipo") || "todos";

      const pasaFiltro = filtro === "todos" || filtro === tipoFila;

      tr.style.display = matches && pasaFiltro ? "" : "none";
    });
  });
}

// =======================
//  PERFIL: AUTOGUARDADO EN BD
// =======================
async function guardarPerfilAuto(action, datos) {
  try {
    const form = new FormData();
    form.append("action", action);
    for (const [clave, valor] of Object.entries(datos)) {
      form.append(clave, valor);
    }

    const resp = await fetch("php/api_perfil.php", {
      method: "POST",
      body: form,
    });
    const data = await resp.json();

    if (!data.ok) {
      console.warn("Error al guardar:", data.error);
      return false;
    }

    console.log("Guardado automático correcto:", action, datos);
    return true;
  } catch (err) {
    console.error("Error al guardar automáticamente:", err);
    return false;
  }
}

// CONTACTO
const camposContacto = [
  "perfilCorreoInput",
  "perfilCelularInput",
  "perfilTelefonoInput",
];

camposContacto.forEach((id) => {
  const el = document.getElementById(id);
  if (!el) return;

  el.addEventListener("change", async () => {
    const correo =
      document.getElementById("perfilCorreoInput")?.value.trim() || "";
    const celular =
      document.getElementById("perfilCelularInput")?.value.trim() || "";
    const telefono =
      document.getElementById("perfilTelefonoInput")?.value.trim() || "";

    const ok = await guardarPerfilAuto("contacto", {
      correo,
      celular,
      telefono,
    });
    if (ok && perfilCorreoEl) perfilCorreoEl.textContent = correo;
  });
});

// DOMICILIO
const camposDomicilio = [
  "perfilCalleInput",
  "perfilNumExtInput",
  "perfilNumIntInput",
  "perfilEstadoInput",
  "perfilCiudadInput",
  "perfilColoniaInput",
  "perfilCpInput",
  "perfilEntreCallesInput",
];

camposDomicilio.forEach((id) => {
  const el = document.getElementById(id);
  if (!el) return;

  el.addEventListener("change", async () => {
    const datos = {
      calle: document.getElementById("perfilCalleInput")?.value.trim() || "",
      num_exterior:
        document.getElementById("perfilNumExtInput")?.value.trim() || "",
      num_interior:
        document.getElementById("perfilNumIntInput")?.value.trim() || "",
      estado: document.getElementById("perfilEstadoInput")?.value.trim() || "",
      ciudad: document.getElementById("perfilCiudadInput")?.value.trim() || "",
      colonia:
        document.getElementById("perfilColoniaInput")?.value.trim() || "",
      cp: document.getElementById("perfilCpInput")?.value.trim() || "",
      entre_calles:
        document.getElementById("perfilEntreCallesInput")?.value.trim() || "",
    };

    await guardarPerfilAuto("domicilio", datos);
  });
});

// =======================
//  CAMBIAR CONTRASEÑA
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

  alert("Contraseña actualizada.");
  inputPassActual.value = "";
  inputPassNueva.value = "";
  inputPassConfirmar.value = "";
});

// =======================
//  VISIBILIDAD MENÚ POR ROL
// =======================
const btnAdminMenu = document.querySelector('.rail-item[data-section="admin"]');
const btnUsuariosMenu = document.querySelector(
  '.rail-item[data-section="usuarios"]'
);

function aplicarPermisosPorRol() {
  const btnsEditarUsuario = document.querySelectorAll(".editar-usuario");
  const btnsEliminarUsuario = document.querySelectorAll(".eliminar-usuario");
  const btnsAgregarVacuna = document.querySelectorAll(
    ".agregar-vacuna-usuario"
  );

  if (userRole === "admin") {
    if (btnAdminMenu) btnAdminMenu.style.display = "inline-flex";
    if (btnUsuariosMenu) btnUsuariosMenu.style.display = "inline-flex";

    btnsEditarUsuario.forEach((b) => (b.style.display = "inline-flex"));
    btnsEliminarUsuario.forEach((b) => (b.style.display = "inline-flex"));
    btnsAgregarVacuna.forEach((b) => (b.style.display = "inline-flex"));
  } else if (userRole === "medico") {
    if (btnAdminMenu) btnAdminMenu.style.display = "none";
    if (btnUsuariosMenu) btnUsuariosMenu.style.display = "inline-flex";

    btnsEditarUsuario.forEach((b) => (b.style.display = "inline-flex"));
    btnsEliminarUsuario.forEach((b) => (b.style.display = "none"));
    btnsAgregarVacuna.forEach((b) => (b.style.display = "inline-flex"));
  } else {
    if (btnAdminMenu) btnAdminMenu.style.display = "none";
    if (btnUsuariosMenu) btnUsuariosMenu.style.display = "none";

    btnsEditarUsuario.forEach((b) => (b.style.display = "none"));
    btnsEliminarUsuario.forEach((b) => (b.style.display = "none"));
    btnsAgregarVacuna.forEach((b) => (b.style.display = "none"));
  }
}

// =======================
//  MODAL REGISTRAR VACUNA
// =======================
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

// Registrar vacuna desde cartilla (botón dentro del modal de cartilla)
btnRegistrarDesdeCartilla?.addEventListener("click", () => {
  const nombre = cartillaNombreUsuario?.textContent?.trim() || "";
  const correo = cartillaEmailUsuario?.textContent?.trim() || "";

  if (
    (userRole === "admin" || userRole === "medico") &&
    correo === currentEmail
  ) {
    alert(
      "Por seguridad no puedes registrar vacunas para tu propia cuenta. Pide a otro médico o administrador que lo haga."
    );
    return;
  }

  emailCartillaActual = correo;
  abrirModalRegistrar(nombre);
});

// Registrar vacuna desde el botón "+" en la tabla de usuarios
tablaUsuarios?.addEventListener("click", (e) => {
  const btnAgregar = e.target.closest(".agregar-vacuna-usuario");
  if (!btnAgregar) return;

  const fila = btnAgregar.closest("tr");
  if (!fila) return;

  const nombre = fila.dataset.userNombre || fila.cells[0].textContent.trim();
  const correo = fila.dataset.userEmail || fila.cells[3].textContent.trim();
  const idUsuario = fila.dataset.userId || "";

  if (!idUsuario) {
    alert("No se encontró el ID del usuario.");
    return;
  }

  // No permitir que admin/medico se registren vacunas a sí mismos
  if (
    (userRole === "admin" || userRole === "medico") &&
    correo === currentEmail
  ) {
    alert(
      "No puedes registrarte vacunas a ti mismo. Pide a otro médico o administrador que lo haga."
    );
    return;
  }

  emailCartillaActual = correo;
  idCartillaActual = idUsuario;

  abrirModalRegistrar(nombre);
});

// Guardar vacuna (YA CON BD)
formRegistrarVacuna?.addEventListener("submit", async (e) => {
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

  if (!idCartillaActual) {
    alert("No se encontró el usuario para registrar la vacuna.");
    return;
  }

  try {
    const form = new FormData();
    form.append("action", "registrar");
    form.append("id_usuario", idCartillaActual);
    form.append("vacuna", vacuna);
    form.append("dosis", dosis);
    form.append("lote", lote);
    form.append("fecha", fecha);
    form.append("observaciones", obs);

    const resp = await fetch("php/api_vacunas.php", {
      method: "POST",
      body: form,
    });

    const data = await resp.json();

    if (!data.ok) {
      throw new Error(data.error || "Error al registrar vacuna");
    }

    alert("Vacuna registrada correctamente.");
    cerrarModalRegistrar();
  } catch (err) {
    console.error(err);
    alert("Error: " + err.message);
  }
});



//  VER CARTILLA POR USUARIO (Ya lo hice )

tablaUsuarios?.addEventListener("click", async (e) => {
  const btn = e.target.closest(".ver-cartilla-usuario");
  if (!btn) return;

  const fila = btn.closest("tr");
  if (!fila) return;

  const nombre = fila.dataset.userNombre || fila.cells[0].textContent.trim();
  const correo = fila.dataset.userEmail || fila.cells[3].textContent.trim();
  const idUsuario = fila.dataset.userId || "";

  emailCartillaActual = correo;
  idCartillaActual = idUsuario;

  if (cartillaNombreUsuario) cartillaNombreUsuario.textContent = nombre;
  if (cartillaEmailUsuario) cartillaEmailUsuario.textContent = correo;

  // Mensaje de "cargando" mientras llega la info
  if (cartillaTablaBody) {
    cartillaTablaBody.innerHTML = `
      <tr>
        <td colspan="4">Cargando vacunas...</td>
      </tr>
    `;
  }

  // Abrimos el modal de una vez
  modalCartillaUsuario?.classList.add("open");

  try {
    const resp = await fetch(
      `php/api_vacunas.php?action=mis_vacunas_usuario&id_usuario=${encodeURIComponent(
        idUsuario
      )}`
    );
    const data = await resp.json();

    if (!data.ok) {
      throw new Error(data.error || "Error en API mis_vacunas_usuario");
    }

    const vacunas = Array.isArray(data.data) ? data.data : [];

    cartillaTablaBody.innerHTML = "";

    if (vacunas.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="4">No hay vacunas registradas todavía.</td>`;
      cartillaTablaBody.appendChild(tr);
      return;
    }

    vacunas.forEach((v, idx) => {
      const tr = document.createElement("tr");

      // Texto de dosis: si viene 'dosis' lo usamos, si no armamos "1 / 3" etc
      let textoDosis = "—";
      if (v.dosis) {
        textoDosis = v.dosis;
      } else if (v.dosis_numero && v.total_dosis) {
        textoDosis = `${v.dosis_numero} / ${v.total_dosis}`;
      }

      tr.innerHTML = `
        <td>${v.vacuna || "Vacuna"}</td>
        <td>${(v.fecha || "").substring(0, 10) || "—"}</td>
        <td>${textoDosis}</td>
        <td>${v.estado || "Aplicada"}</td>
      `;

      cartillaTablaBody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error cargando cartilla usuario:", err);
    cartillaTablaBody.innerHTML = `
      <tr>
        <td colspan="4">Error al cargar la cartilla.</td>
      </tr>
    `;
  }
});

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

btnDescargarCartilla?.addEventListener("click", () => {
  window.print();
});

//  CAMBIAR FOTO DE PERFIL (solo jala en el front)
document.addEventListener("DOMContentLoaded", () => {
  const btnCambiarFoto = document.getElementById("btnCambiarFoto");
  const inputFoto = document.getElementById("inputFotoPerfil");
  const imgPerfil = document.getElementById("perfilFoto");
  const spanIniciales = document.getElementById("perfilAvatarIniciales");

  if (!btnCambiarFoto || !inputFoto) return;

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

      if (railAvatar) {
        railAvatar.innerHTML = `<img src="${dataUrl}" alt="Avatar">`;
      }
      if (userAvatarMini) {
        userAvatarMini.innerHTML = `<img src="${dataUrl}" alt="Avatar">`;
      }
    };

    reader.readAsDataURL(file);
  });
});

//  MODAL EDICIÓN AVANZADA

const modalEdicionAvanzada = document.getElementById("modalEdicionAvanzada");
const btnGuardarEdicion = document.getElementById("btnGuardarEdicion");
const formEditarUsuario = document.getElementById("formEditarUsuario");
const formEditarDosis = document.getElementById("formEditarDosis");

const edUserNombre = document.getElementById("edUserNombre");
const edUserCorreo = document.getElementById("edUserCorreo");
const edUserCurp = document.getElementById("edUserCurp");
const edUserTipo = document.getElementById("edUserTipo");
const edUserEstado = document.getElementById("edUserEstado");

const edFecha = document.getElementById("edFecha");
const edLote = document.getElementById("edLote");
const edObs = document.getElementById("edObs");

let filaUsuarioActual = null;

tablaUsuarios?.addEventListener("click", (e) => {
  const btnEditar = e.target.closest(".editar-usuario");
  if (!btnEditar) return;

  filaUsuarioActual = btnEditar.closest("tr");
  if (!filaUsuarioActual) return;

  edUserNombre.value =
    filaUsuarioActual.getAttribute("data-user-nombre") ||
    filaUsuarioActual.cells[0].textContent.trim();
  edUserCorreo.value =
    filaUsuarioActual.getAttribute("data-user-email") ||
    filaUsuarioActual.cells[3].textContent.trim();
  edUserCurp.value =
    filaUsuarioActual.getAttribute("data-user-curp") ||
    filaUsuarioActual.cells[2].textContent.trim();
  edUserTipo.value = filaUsuarioActual.getAttribute("data-tipo") || "usuario";

  const badge = filaUsuarioActual.querySelector(".badge");
  edUserEstado.value =
    badge && badge.classList.contains("badge-activo") ? "activo" : "suspendido";

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

  modalEdicionAvanzada.classList.add("open");
});

document.querySelectorAll("[data-close-edicion-avanzada]").forEach((btn) =>
  btn.addEventListener("click", () => {
    modalEdicionAvanzada.classList.remove("open");
    filaUsuarioActual = null;
  })
);

btnGuardarEdicion?.addEventListener("click", async () => {
  if (!filaUsuarioActual) return;

  // ID del usuario desde la fila
  const idUsuario = filaUsuarioActual.dataset.userId;

  // 1) Actualizar el DOM (lo que ya tenías)
  if (userRole === "admin") {
    filaUsuarioActual.setAttribute("data-user-nombre", edUserNombre.value);
    filaUsuarioActual.setAttribute("data-user-email", edUserCorreo.value);
    filaUsuarioActual.setAttribute("data-user-curp", edUserCurp.value);
    filaUsuarioActual.setAttribute("data-tipo", edUserTipo.value);

    filaUsuarioActual.cells[0].textContent = edUserNombre.value;

    filaUsuarioActual.cells[1].textContent =
      edUserTipo.value === "medico"
        ? "Personal médico"
        : edUserTipo.value === "admin"
        ? "Administrador"
        : "Usuario";

    filaUsuarioActual.cells[2].textContent = edUserCurp.value;
    filaUsuarioActual.cells[3].textContent = edUserCorreo.value;

    const badge = filaUsuarioActual.querySelector(".badge");
    if (badge) {
      if (edUserEstado.value === "activo") {
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

  // Mandar datos al backend (solo admin)
  if (userRole === "admin" && idUsuario) {
    try {
      const form = new FormData();
      form.append("action", "update");
      form.append("id_usuario", idUsuario);
      form.append("nombre", edUserNombre.value.trim());
      form.append("correo", edUserCorreo.value.trim());
      form.append("curp", edUserCurp.value.trim());
      form.append("tipo", edUserTipo.value);       // admin | medico | usuario
      form.append("estado", edUserEstado.value);   // activo | suspendido

      const resp = await fetch("php/api_usuarios.php", {
        method: "POST",
        body: form,
      });

      const data = await resp.json();
      if (!data.ok) {
        alert("Error al actualizar en la base de datos: " + (data.error || ""));
      } else {
        // Opcional: recargar lista desde la API para asegurarte que todo está bien
        // await cargarUsuariosDesdeAPI();
        console.log("Usuario actualizado en BD.");
      }
    } catch (err) {
      console.error("Error guardando cambios en BD:", err);
      alert("Ocurrió un error al guardar en la base de datos.");
    }
  }

  // 3) Cerrar modal
  modalEdicionAvanzada.classList.remove("open");
  filaUsuarioActual = null;
});


// =======================
//  ELIMINAR USUARIO (API)
// =======================
tablaUsuarios?.addEventListener("click", async (e) => {
  const btnEliminar = e.target.closest(".eliminar-usuario");
  if (!btnEliminar) return;

  const id = btnEliminar.closest("tr")?.dataset.userId;
  if (!id) return;

  if (!confirm("¿Eliminar este usuario?")) return;

  const form = new FormData();
  form.append("action", "delete");
  form.append("id_usuario", id);

  const resp = await fetch("php/api_usuarios.php", {
    method: "POST",
    body: form,
  });
  const data = await resp.json();

  if (data.ok) {
    alert("Usuario eliminado correctamente.");
    await cargarUsuariosDesdeAPI();
  } else {
    alert("Error: " + data.error);
  }
});

// =======================
//  INICIO
// =======================
cargarUsuariosDesdeAPI();
aplicarPermisosPorRol();
cargarHistorialVacunas();
cargarVacunasEnSelect();

// =======================
//  CARTILLA FÍSICA (SLOTS)
// =======================

// Qué filas queremos en la cartilla física
const CARTILLA_MATRIZ = [
  { clave: "BCG", nombre: "BCG", slots: ["1", "", "", "R"] },
  { clave: "HEPB", nombre: "Hepatitis B", slots: ["1", "2", "3", ""] },
  {
    clave: "PENTA",
    nombre: "Pentavalente acelular",
    slots: ["1", "2", "3", "R"],
  },
  { clave: "ROTA", nombre: "Rotavirus", slots: ["1", "2", "3", ""] },
  { clave: "NEUMO", nombre: "Neumococo conjugada", slots: ["1", "2", "3", ""] },
  { clave: "SRP", nombre: "SRP (SRP)", slots: ["1", "2", "", ""] },
  { clave: "DTP", nombre: "DTP (refuerzo)", slots: ["R", "", "", ""] },
];

// =======================
//  RESUMEN DE TU CARTILLA
// =======================
// =======================
//  RESUMEN DE CARTILLA (tarjetas + barra + matriz slots)
// =======================
async function cargarResumenCartilla() {
  const vacCompEl = document.getElementById("resVacunasCompletas");
  const vacCompTagEl = document.getElementById("resVacunasCompletasTag");
  const proxDosisEl = document.getElementById("resProximasDosis");
  const proxTagEl = document.getElementById("resProximasDosisTag");
  const alertasEl = document.getElementById("resAlertas");
  const alertasTagEl = document.getElementById("resAlertasTag");
  const progTextoEl = document.getElementById("resProgresoTexto");
  const progBarEl = document.getElementById("resProgresoBar");
  const tbodyMatriz = document.getElementById("tbodyCartillaMatriz");

  if (!vacCompEl || !tbodyMatriz) return;

  // Estado inicial
  vacCompEl.textContent = "...";
  if (vacCompTagEl) vacCompTagEl.textContent = "Cargando esquema...";
  if (proxDosisEl) proxDosisEl.textContent = "...";
  if (proxTagEl) proxTagEl.textContent = "";
  if (alertasEl) alertasEl.textContent = "...";
  if (alertasTagEl) alertasTagEl.textContent = "";
  if (progTextoEl) progTextoEl.textContent = "Cargando...";
  if (progBarEl) progBarEl.style.width = "0%";
  tbodyMatriz.innerHTML = "";

  // 1) Resumen general (tarjetas + barra)
  try {
    const resp = await fetch("php/api_vacunas.php?action=resumen");
    const data = await resp.json();

    if (!data.ok) {
      throw new Error(data.error || "Error en API resumen");
    }

    const r = data.resumen || {};
    const total = Number(r.total_dosis_esquema || 0);
    const aplicadas = Number(r.dosis_aplicadas || 0);
    const porc = total > 0 ? Math.round((aplicadas * 100) / total) : 0;

    // Vacunas completas
    if (vacCompEl) vacCompEl.textContent = r.vacunas_completas || 0;
    if (vacCompTagEl) {
      vacCompTagEl.textContent =
        total > 0
          ? `Esquema completado al ${porc}%`
          : "Esquema aún no configurado";
    }

    // Próximas dosis (de momento genérico, como lo tenías)
    if (proxDosisEl) proxDosisEl.textContent = r.proximas_dosis ?? 0;
    if (proxTagEl)
      proxTagEl.textContent =
        "Próximas dosis aún no calculadas de forma detallada.";

    // 🔴 ALERTAS (con texto "Revisa: ...")
    const alertas = Number(r.alertas || 0);
    const vacunasAtrasadas = Array.isArray(r.vacunas_atrasadas)
      ? r.vacunas_atrasadas
      : [];

    if (alertasEl) alertasEl.textContent = alertas;

    if (alertasTagEl) {
      if (alertas === 0) {
        alertasTagEl.textContent = "Sin alertas por el momento.";
      } else {
        const nombres = vacunasAtrasadas.slice(0, 3).join(", ");
        alertasTagEl.textContent = `Revisa: ${nombres}${
          vacunasAtrasadas.length > 3 ? "…" : ""
        }`;
      }
    }

    // Barra de progreso
    if (progTextoEl)
      progTextoEl.textContent = `${aplicadas} / ${total} (${porc}%)`;
    if (progBarEl) progBarEl.style.width = `${porc}%`;
  } catch (err) {
    console.error("Error API resumen:", err);
    if (progTextoEl) progTextoEl.textContent = "Error al cargar esquema.";
  }

  // 2) Dosis reales para pintar la cartilla física con slots
  try {
    const resp2 = await fetch("php/api_vacunas.php?action=mis_vacunas");
    const data2 = await resp2.json();

    if (!data2.ok) {
      throw new Error(data2.error || "Error en API mis_vacunas");
    }

    const dosisBD = Array.isArray(data2.data) ? data2.data : [];
   

    // Aquí se dibujan las letras verdes y grises (1ª, 2ª, 3ª, Rª)
    renderCartillaMatrizSlots(dosisBD);
  } catch (err) {
    console.error("Error cargando cartilla matriz:", err);
    tbodyMatriz.innerHTML = `
      <tr>
        <td colspan="5">Error al cargar la información de la cartilla.</td>
      </tr>
    `;
  }
}

cargarResumenCartilla();



// dosisBD = array de filas devueltas por api_vacunas.php?action=mis_vacunas
function renderCartillaMatrizSlots(dosisBD) {
  const tbody = document.getElementById("tbodyCartillaMatriz");
  if (!tbody) return;

  tbody.innerHTML = "";

  // Normalizamos datos: solo dosis aplicadas
  const dosisAplicadas = (dosisBD || []).filter((d) => {
    return (d.estado || "").toUpperCase() === "APLICADA";
  });

  CARTILLA_MATRIZ.forEach((vac) => {
    const tr = document.createElement("tr");

    // Columna nombre vacuna
    tr.innerHTML = `<td>${vac.nombre}</td>`;

    vac.slots.forEach((slotEtiqueta) => {
      const td = document.createElement("td");
      td.classList.add("slot");

      if (!slotEtiqueta) {
        td.innerHTML = "&nbsp;"; // celda vacía
      } else {
        // ¿hay alguna dosis aplicada que coincida con este slot?
        const aplicada = dosisAplicadas.find((d) => {
          if (!d.clave_vacuna) return false;
          const clave = (d.clave_vacuna || "").toUpperCase();
          if (clave !== vac.clave.toUpperCase()) return false;

          const num = Number(d.dosis_numero || 0);
          const total = Number(d.total_dosis || 0);

          if (slotEtiqueta === "R") {
            // Refuerzo: usamos la última dosis del esquema (total_dosis)
            if (!total) return false;
            return num === total;
          } else {
            // 1, 2, 3...
            return num === Number(slotEtiqueta);
          }
        });

        if (aplicada) {
          const fecha =
            aplicada.fecha && aplicada.fecha.substring
              ? aplicada.fecha.substring(0, 10)
              : aplicada.fecha || "";
          td.innerHTML = `<span class="slot-aplicada">${fecha}</span>`;
        } else {
          const texto = slotEtiqueta === "R" ? "Rª" : `${slotEtiqueta}ª`;
          td.innerHTML = `<span class="slot-pendiente">${texto}</span>`;
        }
      }

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
}
