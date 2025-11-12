const VACUNAS_ESQUEMA = [
  // 🧒 Menores de 10 años
  {
    idEsquema: "BCG_1",
    claveVacuna: "BCG",
    nombreVacuna: "BCG",
    grupoEdad: "MENOR_10",
    edadMinMeses: 0,
    edadMaxMeses: 1,
    descripcionEdad: "Recién nacido (al nacer)",
    dosisNumero: 1,
    totalDosis: 1,
    obligatoria: true,
  },
  {
    idEsquema: "HEPB_1",
    claveVacuna: "HEPB",
    nombreVacuna: "Hepatitis B",
    grupoEdad: "MENOR_10",
    edadMinMeses: 0,
    edadMaxMeses: 1,
    descripcionEdad: "Recién nacido",
    dosisNumero: 1,
    totalDosis: 3,
    obligatoria: true,
  },
  {
    idEsquema: "HEPB_2",
    claveVacuna: "HEPB",
    nombreVacuna: "Hepatitis B",
    grupoEdad: "MENOR_10",
    edadMinMeses: 2,
    edadMaxMeses: 3,
    descripcionEdad: "2 meses",
    dosisNumero: 2,
    totalDosis: 3,
    obligatoria: true,
  },
  {
    idEsquema: "HEPB_3",
    claveVacuna: "HEPB",
    nombreVacuna: "Hepatitis B",
    grupoEdad: "MENOR_10",
    edadMinMeses: 6,
    edadMaxMeses: 7,
    descripcionEdad: "6 meses",
    dosisNumero: 3,
    totalDosis: 3,
    obligatoria: true,
  },

  // Pentavalente 2,4,6,18 meses
  {
    idEsquema: "PENTA_1",
    claveVacuna: "PENTA",
    nombreVacuna: "Pentavalente acelular",
    grupoEdad: "MENOR_10",
    edadMinMeses: 2,
    edadMaxMeses: 3,
    descripcionEdad: "2 meses",
    dosisNumero: 1,
    totalDosis: 4,
    obligatoria: true,
  },
  {
    idEsquema: "PENTA_2",
    claveVacuna: "PENTA",
    nombreVacuna: "Pentavalente acelular",
    grupoEdad: "MENOR_10",
    edadMinMeses: 4,
    edadMaxMeses: 5,
    descripcionEdad: "4 meses",
    dosisNumero: 2,
    totalDosis: 4,
    obligatoria: true,
  },
  {
    idEsquema: "PENTA_3",
    claveVacuna: "PENTA",
    nombreVacuna: "Pentavalente acelular",
    grupoEdad: "MENOR_10",
    edadMinMeses: 6,
    edadMaxMeses: 7,
    descripcionEdad: "6 meses",
    dosisNumero: 3,
    totalDosis: 4,
    obligatoria: true,
  },
  {
    idEsquema: "PENTA_4",
    claveVacuna: "PENTA",
    nombreVacuna: "Pentavalente acelular",
    grupoEdad: "MENOR_10",
    edadMinMeses: 18,
    edadMaxMeses: 20,
    descripcionEdad: "18 meses",
    dosisNumero: 4,
    totalDosis: 4,
    obligatoria: true,
  },

  // Rotavirus
  {
    idEsquema: "ROTA_1",
    claveVacuna: "ROTA",
    nombreVacuna: "Rotavirus",
    grupoEdad: "MENOR_10",
    edadMinMeses: 2,
    edadMaxMeses: 3,
    descripcionEdad: "2 meses",
    dosisNumero: 1,
    totalDosis: 3,
    obligatoria: true,
  },
  {
    idEsquema: "ROTA_2",
    claveVacuna: "ROTA",
    nombreVacuna: "Rotavirus",
    grupoEdad: "MENOR_10",
    edadMinMeses: 4,
    edadMaxMeses: 5,
    descripcionEdad: "4 meses",
    dosisNumero: 2,
    totalDosis: 3,
    obligatoria: true,
  },
  {
    idEsquema: "ROTA_3",
    claveVacuna: "ROTA",
    nombreVacuna: "Rotavirus",
    grupoEdad: "MENOR_10",
    edadMinMeses: 6,
    edadMaxMeses: 7,
    descripcionEdad: "6 meses",
    dosisNumero: 3,
    totalDosis: 3,
    obligatoria: true,
  },

  // Neumococo 2,4,12 meses
  {
    idEsquema: "NEUMO_1",
    claveVacuna: "NEUMO",
    nombreVacuna: "Neumococo conjugada",
    grupoEdad: "MENOR_10",
    edadMinMeses: 2,
    edadMaxMeses: 3,
    descripcionEdad: "2 meses",
    dosisNumero: 1,
    totalDosis: 3,
    obligatoria: true,
  },
  {
    idEsquema: "NEUMO_2",
    claveVacuna: "NEUMO",
    nombreVacuna: "Neumococo conjugada",
    grupoEdad: "MENOR_10",
    edadMinMeses: 4,
    edadMaxMeses: 5,
    descripcionEdad: "4 meses",
    dosisNumero: 2,
    totalDosis: 3,
    obligatoria: true,
  },
  {
    idEsquema: "NEUMO_3",
    claveVacuna: "NEUMO",
    nombreVacuna: "Neumococo conjugada",
    grupoEdad: "MENOR_10",
    edadMinMeses: 12,
    edadMaxMeses: 15,
    descripcionEdad: "12 meses",
    dosisNumero: 3,
    totalDosis: 3,
    obligatoria: true,
  },

  // SRP
  {
    idEsquema: "SRP_1",
    claveVacuna: "SRP",
    nombreVacuna: "SRP (Sarampión, Rubéola, Parotiditis)",
    grupoEdad: "MENOR_10",
    edadMinMeses: 12,
    edadMaxMeses: 15,
    descripcionEdad: "1 año",
    dosisNumero: 1,
    totalDosis: 2,
    obligatoria: true,
  },
  {
    idEsquema: "SRP_2",
    claveVacuna: "SRP",
    nombreVacuna: "SRP (Sarampión, Rubéola, Parotiditis)",
    grupoEdad: "MENOR_10",
    edadMinMeses: 72,
    edadMaxMeses: 77,
    descripcionEdad: "6 años (refuerzo)",
    dosisNumero: 2,
    totalDosis: 2,
    obligatoria: true,
  },

  // DTP refuerzo
  {
    idEsquema: "DTP_R1",
    claveVacuna: "DTP",
    nombreVacuna: "DTP (refuerzo)",
    grupoEdad: "MENOR_10",
    edadMinMeses: 48,
    edadMaxMeses: 53,
    descripcionEdad: "4 años",
    dosisNumero: 1,
    totalDosis: 1,
    obligatoria: true,
  },

  // 🧑‍🎓 Adolescentes
  {
    idEsquema: "VPH_1",
    claveVacuna: "VPH",
    nombreVacuna: "Virus del Papiloma Humano",
    grupoEdad: "ADOLESCENTE",
    edadMinMeses: 108,
    edadMaxMeses: 168,
    descripcionEdad: "9 a 14 años (1ª dosis)",
    dosisNumero: 1,
    totalDosis: 2,
    obligatoria: true,
  },
  {
    idEsquema: "VPH_2",
    claveVacuna: "VPH",
    nombreVacuna: "Virus del Papiloma Humano",
    grupoEdad: "ADOLESCENTE",
    edadMinMeses: 114,
    edadMaxMeses: 174,
    descripcionEdad: "2ª dosis (6 meses después)",
    dosisNumero: 2,
    totalDosis: 2,
    obligatoria: true,
  },
  {
    idEsquema: "TD_ADO_1",
    claveVacuna: "TD",
    nombreVacuna: "Tétanos y Difteria (Td)",
    grupoEdad: "ADOLESCENTE",
    edadMinMeses: 144,
    edadMaxMeses: 180,
    descripcionEdad: "12 años",
    dosisNumero: 1,
    totalDosis: 1,
    obligatoria: true,
  },

  // 🧑‍🦳 Adultos (ejemplo)
  {
    idEsquema: "TD_ADULTO_REF",
    claveVacuna: "TD",
    nombreVacuna: "Tétanos y Difteria (Td)",
    grupoEdad: "ADULTO",
    edadMinMeses: 240,
    edadMaxMeses: null,
    descripcionEdad: "Cada 10 años",
    dosisNumero: 1,
    totalDosis: 999,
    obligatoria: true,
  },
  {
    idEsquema: "INFLU_ADULTO_ANUAL",
    claveVacuna: "INFLU",
    nombreVacuna: "Influenza",
    grupoEdad: "ADULTO",
    edadMinMeses: 240,
    edadMaxMeses: null,
    descripcionEdad: "Anual (temporada invernal)",
    dosisNumero: 1,
    totalDosis: 999,
    obligatoria: true,
  },
];

// =======================
// 1) Edad en meses
// =======================
function calcularEdadEnMeses(fechaNacimientoStr) {
  if (!fechaNacimientoStr) return 0;
  const hoy = new Date();
  const fn = new Date(fechaNacimientoStr);
  if (isNaN(fn.getTime())) return 0;
  const años = hoy.getFullYear() - fn.getFullYear();
  const meses = hoy.getMonth() - fn.getMonth();
  const totalMeses = años * 12 + meses;
  return totalMeses < 0 ? 0 : totalMeses;
}

// =======================
// 2) Resumen de la cartilla (tarjetas + barra)
// =======================
function actualizarResumenCartilla(vacunasUsuario, fechaNacimientoStr) {
  const totalEsquema = VACUNAS_ESQUEMA.length;

  const completas = VACUNAS_ESQUEMA.filter((esq) =>
    vacunasUsuario.some((v) => v.idEsquema === esq.idEsquema)
  ).length;

  const elemCompletas = document.getElementById("resVacunasCompletas");
  const elemCompletasTag = document.getElementById("resVacunasCompletasTag");
  const elemProgresoTexto = document.getElementById("resProgresoTexto");
  const elemProgresoBar = document.getElementById("resProgresoBar");

  if (elemCompletas) elemCompletas.textContent = completas;

  if (elemCompletasTag) {
    elemCompletasTag.textContent =
      totalEsquema > 0
        ? `Has completado ${completas} de ${totalEsquema} vacunas del esquema.`
        : "No hay esquema configurado.";
  }

  const porcentaje =
    totalEsquema === 0 ? 0 : Math.round((completas / totalEsquema) * 100);

  if (elemProgresoTexto) {
    elemProgresoTexto.textContent = `${completas} / ${totalEsquema} (${porcentaje}%)`;
  }
  if (elemProgresoBar) {
    elemProgresoBar.style.width = `${porcentaje}%`;
  }

  // Próximas dosis
  const edadMeses = calcularEdadEnMeses(fechaNacimientoStr);

  const faltantes = VACUNAS_ESQUEMA.filter(
    (esq) => !vacunasUsuario.some((v) => v.idEsquema === esq.idEsquema)
  );

  const proximas = faltantes.filter(
    (esq) =>
      esq.edadMinMeses != null &&
      esq.edadMinMeses >= edadMeses &&
      esq.edadMinMeses <= edadMeses + 1
  );

  const elemProximas = document.getElementById("resProximasDosis");
  const elemProximasTag = document.getElementById("resProximasDosisTag");

  if (elemProximas) elemProximas.textContent = proximas.length;

  if (elemProximasTag) {
    if (proximas.length === 0) {
      elemProximasTag.textContent = "Sin dosis próximas en el mes.";
    } else {
      const nombres = [...new Set(proximas.map((p) => p.nombreVacuna))].slice(
        0,
        3
      );
      elemProximasTag.textContent = `Próximas: ${nombres.join(", ")}${
        proximas.length > 3 ? "…" : ""
      }`;
    }
  }

  // Alertas (vacunas atrasadas)
  const atrasadas = faltantes.filter(
    (esq) => esq.edadMinMeses != null && esq.edadMinMeses < edadMeses
  );

  const elemAlertas = document.getElementById("resAlertas");
  const elemAlertasTag = document.getElementById("resAlertasTag");

  if (elemAlertas) elemAlertas.textContent = atrasadas.length;

  if (elemAlertasTag) {
    if (atrasadas.length === 0) {
      elemAlertasTag.textContent = "Sin alertas por el momento.";
    } else {
      const nombresAtrasadas = [
        ...new Set(atrasadas.map((a) => a.nombreVacuna)),
      ].slice(0, 3);
      elemAlertasTag.textContent = `Revisa: ${nombresAtrasadas.join(", ")}${
        atrasadas.length > 3 ? "…" : ""
      }`;
    }
  }
}

// =======================
// 3) Cartilla (tablas de la izquierda)
// =======================
function renderCartilla(vacunasUsuario) {
  const grupos = {
    MENOR_10: document.getElementById("tbodyEsquemaNino"),
    ADOLESCENTE: document.getElementById("tbodyEsquemaAdolescente"),
    ADULTO: document.getElementById("tbodyEsquemaAdulto"),
  };

  Object.values(grupos).forEach((tbody) => tbody && (tbody.innerHTML = ""));

  VACUNAS_ESQUEMA.forEach((esq) => {
    const tbody = grupos[esq.grupoEdad];
    if (!tbody) return;

    const aplicada = vacunasUsuario.some((v) => v.idEsquema === esq.idEsquema);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${esq.nombreVacuna}</td>
      <td>${esq.descripcionEdad}</td>
      <td>${esq.dosisNumero} de ${esq.totalDosis}</td>
      <td>
        <span class="badge ${aplicada ? "badge-activo" : "badge-pendiente"}">
          ${aplicada ? "Completada" : "Pendiente"}
        </span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// =======================
// 4) Cartilla física (matriz con slots)
// =======================

const CARTILLA_MATRIZ_DEMO = [
  { clave: "BCG", nombre: "BCG", slots: ["1", "", "", ""] },
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

function renderCartillaMatrizDemo(vacunasUsuario) {
  const tbody = document.getElementById("tbodyCartillaMatriz");
  if (!tbody) return;

  tbody.innerHTML = "";

  CARTILLA_MATRIZ_DEMO.forEach((vac) => {
    const tr = document.createElement("tr");

    // Columna nombre
    tr.innerHTML = `<td>${vac.nombre}</td>`;

    // Slots: 1ª, 2ª, 3ª, Rª
    vac.slots.forEach((slotEtiqueta) => {
      const td = document.createElement("td");
      td.classList.add("slot");

      if (!slotEtiqueta) {
        // celda vacía
        td.innerHTML = "&nbsp;";
      } else {
        // ¿Hay alguna vacuna aplicada que caiga en este slot?
        const aplicada = vacunasUsuario.find((vu) => {
          const esquema = VACUNAS_ESQUEMA.find(
            (e) => e.idEsquema === vu.idEsquema
          );
          if (!esquema) return false;
          if (esquema.claveVacuna !== vac.clave) return false;

          const esRefuerzo = slotEtiqueta === "R";

          if (esRefuerzo) {
            // Caso especial: DTP (refuerzo) → cualquier dosis cuenta como R
            if (vac.clave === "DTP") {
              return true;
            }

            // Para el resto: refuerzo = ÚLTIMA dosis del esquema
            if (!esquema.totalDosis || esquema.totalDosis < 2) return false;
            return esquema.dosisNumero === esquema.totalDosis;
          }

          // Slots "1", "2", "3"
          return esquema.dosisNumero === Number(slotEtiqueta);
        });

        if (aplicada) {
          // Fecha en verde
          td.innerHTML = `<span class="slot-aplicada">${aplicada.fechaAplicacion}</span>`;
        } else {
          // Texto grisito: 1ª, 2ª, 3ª, Rª
          const texto = slotEtiqueta === "R" ? "Rª" : `${slotEtiqueta}ª`;
          td.innerHTML = `<span class="slot-pendiente">${texto}</span>`;
        }
      }

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
}


// =======================
// 5) Cargar datos REALES desde la API
// =======================
async function cargarCartillaDesdeAPI(fechaNacimientoStr) {
  try {
    const resp = await fetch("php/api_vacunas.php?action=esquema_usuario");
    const data = await resp.json();

    if (!data.ok) {
      console.error("Error API esquema_usuario:", data.error);
      return;
    }

    // Transformamos filas de BD -> formato que usan las funciones
    // { idEsquema: 'BCG_1', fechaAplicacion: '2024-01-10' }
    const vacunasUsuario = data.data
      .filter((row) => row.fecha_aplicacion) // solo aplicadas
      .map((row) => ({
        idEsquema: row.id_esquema_front, // debe coincidir con VACUNAS_ESQUEMA.idEsquema
        fechaAplicacion: row.fecha_aplicacion.substring(0, 10),
      }));

    const fn = fechaNacimientoStr || window.fechaNacimientoUsuario || null;

    renderCartilla(vacunasUsuario); // tablas por grupo
    actualizarResumenCartilla(vacunasUsuario, fn); // tarjetas + barra
    renderCartillaMatriz(vacunasUsuario); // cartilla física
  } catch (err) {
    console.error("Error cargando cartilla desde API:", err);
  }
}

// =======================
// 6) INICIO
// =======================
document.addEventListener("DOMContentLoaded", () => {
  const fn = window.fechaNacimientoUsuario || null;
  cargarCartillaDesdeAPI(fn);
});
