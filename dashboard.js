// Inicializar avatar del usuario 
let userName = localStorage.getItem("userName") || ""; 
let userImage = localStorage.getItem("userImage") || ""; 

const userNameEl = document.getElementById("userName");
const railAvatar = document.getElementById("railAvatar");
const userAvatarMini = document.getElementById("userAvatarMini");

// Actualiza nombre 
if (userNameEl) {
  userNameEl.textContent = userName || "Usuario invitado";
}

// Función para obtener iniciales
function getInitials(name) {
  if (!name.trim()) return "U"; // U de "Usuario"
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// Mostrar imagen o iniciales
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

// Aplica en los dos lugares
setAvatar(railAvatar, 52);
setAvatar(userAvatarMini, 26);


// Botones del rail lateral
const railItems = document.querySelectorAll(".rail-item");
const sections = document.querySelectorAll(".content-section");
const topbarTitle = document.getElementById("topbarTitle");

const titulos = {
  resumen: "Resumen general",
  "mis-vacunas": "Historial de vacunas",
  pacientes: "Pacientes / Familia",
  citas: "Citas de vacunación",
  ajustes: "Ajustes del sistema",
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
    topbarTitle.textContent = titulos[section] || "Panel";
  });
});

// Dropdown usuario
const userBtn = document.getElementById("userMenuBtn");
const userDropdown = document.getElementById("userDropdown");

userBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  userDropdown?.classList.toggle("open");
});

document.addEventListener("click", () => {
  userDropdown?.classList.remove("open");
});

// ========= Detalle de vacuna en modal =========

// Datos de ejemplo despues conectar la bsd 
const detalleVacunas = {
  covid19: [
    {
      dosis: 1,
      fecha: "10/01/2024",
      marca: "Pfizer",
      lote: "PFZ-001",
    },
    {
      dosis: 2,
      fecha: "10/03/2024",
      marca: "Pfizer",
      lote: "PFZ-019",
    },
    {
      dosis: 3,
      fecha: "12/03/2025",
      marca: "Pfizer",
      lote: "PFZ-077",
    },
  ],
  hepB: [
    {
      dosis: 1,
      fecha: "09/11/2024",
      marca: "Sanofi",
      lote: "SNF-221",
    },
    {
      dosis: 2,
      fecha: "09/01/2025",
      marca: "Sanofi",
      lote: "SNF-310",
    },
  ],
  influenza: [
    {
      dosis: 1,
      fecha: "—",
      marca: "Por aplicar",
      lote: "—",
    },
  ],
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
      `;
      modalTablaBody.appendChild(tr);
    });

    // Mostrar modal
    modalVacuna.classList.add("open");
  });
});

// Cerrar modal
function cerrarModalVacuna() {
  modalVacuna.classList.remove("open");
}

modalCerrar?.addEventListener("click", cerrarModalVacuna);
modalBackdrop?.addEventListener("click", cerrarModalVacuna);
