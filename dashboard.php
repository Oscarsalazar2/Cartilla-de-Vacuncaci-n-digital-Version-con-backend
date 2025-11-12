<?php
session_start();
require __DIR__ . '/php/conexion.php';

// Si no hay sesión, regresa al login
if (!isset($_SESSION['id_usuario'])) {
  header('Location: login.html');
  exit;
}

$idUsuario = $_SESSION['id_usuario'];

try {
  $sql = "SELECT
            u.id_usuario,
            u.nombre,
            u.apellido_paterno,
            u.apellido_materno,
            u.correo,
            u.curp,
            u.id_rol,
            u.celular,
            u.telefono,
            u.calle,
            u.num_exterior,
            u.num_interior,
            u.colonia,
            u.ciudad,
            u.estado,
            u.cp,
            u.entre_calles,
            u.fecha_nacimiento,
            r.clave AS rol_clave,
            r.nombre AS rol_nombre
          FROM usuarios u
          JOIN roles r ON u.id_rol = r.id_rol
          WHERE u.id_usuario = :id";

  $stmt = $conexion->prepare($sql);
  $stmt->execute([':id' => $idUsuario]);
  $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$usuario) {
    session_destroy();
    header('Location: login.html');
    exit;
  }

  // Nombre completo
  $nombreCompleto = trim(
    ($usuario['nombre'] ?? '') . ' ' .
    ($usuario['apellido_paterno'] ?? '') . ' ' .
    ($usuario['apellido_materno'] ?? '')
  );
  if ($nombreCompleto === '') {
    $nombreCompleto = 'Usuario';
  }

  $correo    = $usuario['correo'] ?? '';
  $curp      = $usuario['curp']   ?? '';
  $rolNombre = $usuario['rol_nombre'] ?? 'Usuario';
  $rolClave  = strtolower($usuario['rol_clave'] ?? 'usuario'); // 'admin','medico','usuario'

  $celular   = $usuario['celular'] ?? '';
  $telefono  = $usuario['telefono'] ?? '';
  $calle     = $usuario['calle'] ?? '';
  $numExt    = $usuario['num_exterior'] ?? '';
  $numInt    = $usuario['num_interior'] ?? '';
  $colonia   = $usuario['colonia'] ?? '';
  $ciudad    = $usuario['ciudad'] ?? '';
  $estado    = $usuario['estado'] ?? '';
  $cp        = $usuario['cp'] ?? '';
  $entreCalles = $usuario['entre_calles'] ?? '';
  $fechaNacimiento = $usuario['fecha_nacimiento'] ?? null;

  // Iniciales para avatar
  function iniciales($nombre)
  {
    $parts = preg_split('/\s+/', trim($nombre));
    if (!$parts || $parts[0] === '') return 'US';
    if (count($parts) === 1) return mb_strtoupper(mb_substr($parts[0], 0, 1));
    return mb_strtoupper(
      mb_substr($parts[0], 0, 1) .
      mb_substr($parts[1], 0, 1)
    );
  }
  $avatarIniciales = iniciales($nombreCompleto);

} catch (PDOException $e) {
  echo "Error al cargar el perfil: " . $e->getMessage();
  exit;
}

// Slug de rol para JS / front
$rolSlug = 'usuario';
if ($_SESSION['id_rol'] == 1) $rolSlug = 'admin';
if ($_SESSION['id_rol'] == 2) $rolSlug = 'medico';
?>




<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Panel · eCartilla</title>
  <link rel="stylesheet" href="style.css" />
  <link rel="stylesheet" href="deshboard.css" />
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
</head>

<body class="dashboard" data-user-role="<?= htmlspecialchars($rolClave) ?>">
  <div class="layout">
    <!-- Rail lateral -->
    <aside class="side-rail">
      <div class="rail-logo">
        <img src="logo.jpg" alt="Logo eCartilla" />
      </div>

      <div class="rail-divider"></div>

      <nav class="rail-nav">
        <button
          class="rail-item active"
          data-section="resumen"
          title="Inicio">
          <i class="fa-solid fa-house"></i>
        </button>

        <button
          class="rail-item"
          data-section="mis-vacunas"
          title="Mis vacunas">
          <i class="fa-solid fa-syringe"></i>
        </button>

        <button class="rail-item" data-section="citas" title="Citas">
          <i class="fa-solid fa-calendar-check"></i>
        </button>

        <button class="rail-item" data-section="ajustes" title="Ajustes">
          <i class="fa-solid fa-gear"></i>
        </button>

        <button class="rail-item" data-section="perfil" title="Perfil">
          <i class="fa-solid fa-id-card"></i>
        </button>

        <button class="rail-item" data-section="qr" title="QR">
          <i class="fa-solid fa-qrcode"></i>
        </button>

        <button class="rail-item" data-section="usuarios" title="Usuarios">
          <i class="fa-solid fa-users"></i>
        </button>

        <button class="rail-item" data-section="admin" title="Admin usuarios">
          <i class="fa-solid fa-user-shield"></i>
        </button>
      </nav>

      <div class="rail-bottom-space"></div>

      <!-- Icono de salir abajo -->
      <button
        class="rail-item"
        title="Cerrar sesión"
        onclick="location.href='php/logout.php'">
        <i class="fa-solid fa-right-from-bracket"></i>
      </button>
    </aside>
    <!-- Modal: Cartilla del usuario -->
    <div class="pac-modal" id="modalCartillaUsuario">
      <div class="pac-modal-backdrop" data-close-pac-modal></div>
      <div class="pac-modal-card pac-modal-cartilla">
        <div class="pac-modal-head">
          <div>
            <h3>Cartilla de vacunación</h3>
            <p class="muted">Vacunas registradas para este usuario.</p>
          </div>
          <div class="cartilla-actions">
            <button type="button" class="btn-ghost" data-close-pac-modal>
              Cerrar
            </button>
            <button type="button" class="btn-azul" id="btnDescargarCartilla">
              <i class="fa-solid fa-download"></i> Descargar cartilla
            </button>
          </div>
        </div>

        <div class="pac-modal-body">
          <!-- SOLO esta zona se imprimirá -->
          <div id="cartillaPrintArea">
            <div class="cartilla-header">
              <div class="cartilla-logo">
                <img src="logo.jpg" alt="Logo eCartilla" />
              </div>
              <div class="cartilla-header-text">
                <!-- Estos IDs se rellenan desde JS -->
                <b id="cartillaNombreUsuario">Nombre del usuario</b>
                <span id="cartillaEmailUsuario">correo@example.com</span>
                <small>Cartilla digital de vacunación</small>
              </div>
            </div>

            <div class="dash-card cartilla-card">
              <b>Vacunas registradas</b>
              <table>
                <thead>
                  <tr>
                    <th>Vacuna</th>
                    <th>Fecha</th>
                    <th>Dosis</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody id="cartillaTablaBody">
                  <!-- filas generadas por JS -->
                </tbody>
              </table>
            </div>
          </div>
          <!-- fin cartillaPrintArea -->
        </div>
      </div>
    </div>

    <!-- Modal Registrar Vacuna -->
    <div class="pac-modal" id="modalRegistrarVacuna">
      <div class="pac-modal-backdrop"></div>

      <div class="pac-modal-card" style="max-width: 600px">
        <div class="pac-modal-head">
          <h3><i class="fa-solid fa-plus"></i> Registrar nueva vacuna</h3>
          <button class="pac-modal-close" data-close-pac-modal>
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="pac-modal-body">
          <form id="formRegistrarVacuna" class="perfil-grid">
            <label class="perfil-field perfil-field-full">
              <span>Paciente</span>
              <input
                type="text"
                id="rvPaciente"
                readonly
                placeholder="Paciente seleccionado" />
            </label>

            <label class="perfil-field perfil-field-full">
              <span>Vacuna</span>
              <select id="rvVacuna" required>
                <option value="">Seleccionar...</option>
              </select>
            </label>

            <label class="perfil-field">
              <span>Dosis</span>
              <input
                type="text"
                id="rvDosis"
                placeholder="Ej. 2 / 3"
                required />
            </label>

            <label class="perfil-field">
              <span>Lote</span>
              <input
                type="text"
                id="rvLote"
                placeholder="Ej. L-245A"
                required />
            </label>

            <label class="perfil-field">
              <span>Fecha de aplicación</span>
              <input type="date" id="rvFecha" required />
            </label>

            <label class="perfil-field perfil-field-full">
              <span>Observaciones</span>
              <textarea
                id="rvObs"
                rows="3"
                placeholder="Ej. Sin reacciones adversas"></textarea>
            </label>

            <div class="perfil-actions">
              <button class="btn-ghost" type="button" id="rvCancelar">
                Cancelar
              </button>
              <button class="btn-azul" type="submit">Guardar registro</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- MODAL: Editar usuario (demo) -->
    <!-- MODAL: Edición avanzada (usuario + última dosis) -->
    <div class="pac-modal" id="modalEdicionAvanzada">
      <div class="pac-modal-backdrop" data-close-edicion-avanzada></div>

      <div class="pac-modal-card">
        <div class="pac-modal-head">
          <h3>Edición avanzada</h3>
          <button
            type="button"
            class="pac-modal-close"
            data-close-edicion-avanzada>
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="pac-modal-body">
          <!--  SECCIÓN 1: DATOS DEL USUARIO -->
          <form id="formEditarUsuario" class="seccion-admin">
            <h4>Datos del usuario</h4>
            <div class="rv-grid">
              <div class="rv-field rv-field-full">
                <span>Nombre completo</span>
                <input type="text" id="edUserNombre" required />
              </div>

              <div class="rv-field rv-field-full">
                <span>Correo electrónico</span>
                <input type="email" id="edUserCorreo" required />
              </div>

              <div class="rv-field rv-field-full">
                <span>CURP</span>
                <input type="text" id="edUserCurp" required />
              </div>

              <div class="rv-field">
                <span>Tipo de usuario</span>
                <select id="edUserTipo">
                  <option value="Usuario">Usuario</option>
                  <option value="medico">Personal médico</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div class="rv-field">
                <span>Estado</span>
                <select id="edUserEstado">
                  <option value="activo">Activo</option>
                  <option value="suspendido">Suspendido</option>
                </select>
              </div>
            </div>
          </form>

          <hr />

          <!-- SECCIÓN 2: EDITAR ÚLTIMA DOSIS -->
          <form id="formEditarDosis" class="seccion-vacuna">
            <h4>Última dosis aplicada</h4>
            <div class="rv-grid">
              <div class="rv-field">
                <span>Fecha de aplicación</span>
                <input type="date" id="edFecha" required />
              </div>
              <div class="rv-field">
                <span>Lote</span>
                <input type="text" id="edLote" required />
              </div>
              <div class="rv-field rv-field-full">
                <span>Observaciones</span>
                <textarea id="edObs" rows="2"></textarea>
              </div>
            </div>
          </form>

          <!-- ACCIONES COMUNES -->
          <div class="rv-actions">
            <button
              type="button"
              class="btn-ghost"
              data-close-edicion-avanzada>
              Cancelar
            </button>
            <button type="button" id="btnGuardarEdicion" class="btn-azul">
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Área principal -->
    <div class="main">
      <!-- Barra superior -->
      <header class="topbar">
        <div class="topbar-left">
          <!-- <div class="topbar-title" id="topbarTitle">Luis gei</div>-->
          <!--<span class="topbar-pill">eCartilla · Demo</span>-->
        </div>
        <div class="topbar-right">
          <button class="user-menu-btn" id="userMenuBtn" type="button">
            <!-- Mini avatar también controlado por el JS -->
            <div class="user-avatar-mini" id="userAvatarMini"></div>

            <div class="user-text">
              <span id="userName"><?= htmlspecialchars($_SESSION['nombre']) ?></span>
              <span class="user-role">
                <?= htmlspecialchars($rolNombre) ?>
              </span>
            </div>

            <span class="chevron">▾</span>
          </button>

          <div class="user-dropdown" id="userDropdown">
            <div
              class="user-dropdown-item"
              onclick="location.href='dashboard.php#perfil'"
              <i class="fa-solid fa-user"></i> Ver perfil
            </div>
            <div
              class="user-dropdown-item"
              onclick="location.href='dashboard.php#notificaciones'"
              <i class="fa-solid fa-bell"></i> Notificaciones
            </div>
            <div
              class="user-dropdown-item logout"
              onclick="location.href='php/logout.php'">
              <i class="fa-solid fa-power-off"></i> Cerrar sesión
            </div>
          </div>
        </div>
      </header>

      <!-- Contenido -->
      <main class="content">
        <!-- Resumen -->
        <section class="content-section active" data-section-panel="resumen">
          <h2>Resumen de tu cartilla</h2>
          <p class="muted"></p>

          <div class="cards-grid">
            <!-- Vacunas completas -->
            <div class="dash-card">
              <b>Vacunas completas</b>
              <div class="value" id="resVacunasCompletas">0</div>
              <div class="tag" id="resVacunasCompletasTag">
                Cargando esquema...
              </div>
            </div>

            <!-- Próximas dosis -->
            <div class="dash-card">
              <b>Próximas dosis</b>
              <div class="value" id="resProximasDosis">0</div>
              <div class="tag" id="resProximasDosisTag">
                En los próximos 30 días
              </div>
            </div>

            <!-- Alertas -->
            <div class="dash-card">
              <b>Alertas</b>
              <div class="value" id="resAlertas">0</div>
              <div class="tag" id="resAlertasTag">Sin alertas por ahora</div>
            </div>
          </div>

          <!-- Progreso general -->
          <div class="dash-progress">
            <p class="muted">
              Progreso del esquema:
              <b><span id="resProgresoTexto">0 / 0</span></b>
            </p>
            <div class="progress">
              <div class="progress-bar" id="resProgresoBar" style="width:0%"></div>
            </div>
          </div>

          <div class="cartilla-fisica">
            <h3>Cartilla de vacunación</h3>

            <table class="cartilla-matriz">
              <thead>
                <tr>
                  <th>Vacuna</th>
                  <th>Primera Dosis</th>
                  <th>Segunda Dosis</th>
                  <th>Tercera Dosis</th>
                  <th>Refuerzo</th>
                </tr>
              </thead>
              <tbody id="tbodyCartillaMatriz">
                <!-- Aquí JS (cargarResumenCartilla) mete las filas -->
              </tbody>
            </table>
          </div>
        </section>


        <!-- Mis vacunas -->
        <section class="content-section" data-section-panel="mis-vacunas">
          <h2>Historial de vacunas</h2>
          <p class="muted">
            Consulta el historial de vacunas registradas en tu cartilla. Haz
            clic en una vacuna para ver el detalle de cada dosis (fecha, marca
            y lote).
          </p>

          <div class="dash-card">
            <b>Vacunas registradas</b>
            <table>
              <thead>
                <tr>
                  <th>Vacuna</th>
                  <th>Última fecha</th>
                  <th>Dosis aplicadas</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody id="histVacunasBody">
                <!-- Filas generadas por JS -->
              </tbody>
            </table>
          </div>
        </section>


        <!-- Modal de detalle de vacuna -->
        <div class="modal-vacuna" id="modalVacuna">
          <div class="modal-vacuna-backdrop" id="modalVacunaBackdrop"></div>
          <div class="modal-vacuna-content">
            <div class="modal-vacuna-header">
              <h3 id="modalVacunaTitulo">Detalle de vacuna</h3>
              <button
                type="button"
                class="modal-vacuna-close"
                id="modalVacunaCerrar"></button>
            </div>
            <div class="modal-vacuna-body">
              <p id="modalVacunaDescripcion" class="muted">
                Aquí se mostrarán las dosis aplicadas.
              </p>
              <table>
                <thead>
                  <tr>
                    <th>Dosis</th>
                    <th>Fecha</th>
                    <th>Marca</th>
                    <th>Lote</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody id="modalVacunaTablaBody">
                  <!-- Filas generadas por JS -->
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Usuarios (Admin / Médico / Usuario) -->
        <section class="content-section" data-section-panel="usuarios">
          <h2>Usuarios del sistema</h2>
          <p class="muted">
            Administra las cuentas de Usuarios y personal médico registrados
            en eCartilla.
          </p>

          <div class="dash-card">
            <div class="usuarios-header">
              <b>Listado de usuarios</b>

              <div class="usuarios-filtros">
                <button
                  class="usuarios-pill usuarios-pill-activo"
                  data-usuarios-filter="todos"
                  type="button">
                  Todos
                </button>
                <button
                  class="usuarios-pill"
                  data-usuarios-filter="usuario"
                  type="button">
                  Usuarios
                </button>
                <button
                  class="usuarios-pill"
                  data-usuarios-filter="medico"
                  type="button">
                  Personal médico
                </button>
              </div>

              <div class="usuarios-busqueda">
                <input
                  type="text"
                  id="usuariosSearchInput"
                  placeholder="Buscar por nombre, correo o CURP" />
              </div>
            </div>

            <table class="tabla-usuarios">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>CURP</th>
                  <th>Correo</th>
                  <th style="width: 220px">Estado</th>
                </tr>
              </thead>
              <tbody id="tablaUsuariosBody">
                <!-- Ejemplo demo -->
              </tbody>
            </table>
          </div>
        </section>

        <!-- Citas -->
        <section class="content-section" data-section-panel="citas">
          <h2>Citas de vacunación</h2>
          <p class="muted">
            Visualiza y organiza tus citas con la clínica o centro de salud.
          </p>

          <div class="dash-card">
            <b>Próximas citas</b>
            <p class="muted">
              No tienes citas registradas. Aquí aparecerán cuando se agreguen.
            </p>
          </div>
        </section>

        <!-- Ajustes -->
        <section class="content-section" data-section-panel="ajustes">
          <h2>Ajustes del sistema</h2>
          <p class="muted">
            Configura notificaciones, datos de tu cuenta y preferencias.
          </p>

          <div class="dash-card">
            <b>Notificaciones</b>
            <p>
              Próximamente podrás activar/desactivar recordatorios por correo,
              SMS o app.
            </p>
          </div>
        </section>

        <!--Mi Perfil-->
        <!-- Mi perfil -->
        <section class="content-section" data-section-panel="perfil">
          <h2>Mi perfil</h2>
          <p class="muted">
            En esta ventana podrás actualizar tus datos de contacto, dirección
            y cuenta.
          </p>

          <div class="perfil-layout">
            <!-- Columna izquierda: tarjeta resumen -->
            <aside class="perfil-card">
              <div class="perfil-avatar">
                <!-- Imagen de perfil (se muestra cuando el usuario sube una foto) -->
                <img
                  id="perfilFoto"
                  src=""
                  alt="Foto de perfil"
                  style="display: none" />
                <!-- Iniciales como fallback -->
                <span id="perfilAvatarIniciales">
                  <?= htmlspecialchars($avatarIniciales) ?>
                </span>
              </div>

              <div class="perfil-nombre" id="perfilNombre">
                <?= htmlspecialchars($nombreCompleto) ?>
              </div>

              <div class="perfil-rol" id="perfilRol">
                <?= htmlspecialchars($rolNombre) ?>
              </div>

              <!-- Botón para cambiar foto -->
              <div class="perfil-cambiar-foto">
                <button type="button" class="btn-foto" id="btnCambiarFoto">
                  <i class="fa-solid fa-camera"></i> Cambiar foto
                </button>
              </div>

              <!-- INPUT OCULTO PARA SUBIR LA IMAGEN -->
              <input
                type="file"
                id="inputFotoPerfil"
                accept="image/*"
                style="display: none" />

              <div class="perfil-lista">
                <div class="perfil-item">
                  <i class="fa-solid fa-id-card"></i>
                  <div>
                    <small>CURP</small>
                    <span id="perfilCurp"><?= htmlspecialchars($curp ?: 'N/D') ?></span>
                  </div>
                </div>
                <div class="perfil-item">
                  <i class="fa-solid fa-user-shield"></i>
                  <div>
                    <small>Tipo de usuario</small>
                    <span id="perfilTipoUsuario"> <?= htmlspecialchars($rolNombre) ?></span>
                  </div>
                </div>
                <div class="perfil-item">
                  <i class="fa-solid fa-envelope"></i>
                  <div>
                    <small>Correo</small>
                    <span id="perfilCorreo"><?= htmlspecialchars($_SESSION['correo']) ?></span>
                  </div>
                </div>
              </div>
            </aside>

            <!-- Columna derecha: formulario -->
            <div class="perfil-form-col">
              <div class="perfil-form-col">
                <!-- Sección 1: Datos de contacto -->
                <div
                  class="dash-card perfil-card-form perfil-acc-item perfil-acc-open">
                  <button class="perfil-acc-head" type="button">
                    <div class="perfil-section-title">
                      <div class="dot"></div>
                      <span>Datos de contacto</span>
                    </div>
                    <i class="fa-solid fa-chevron-down"></i>
                  </button>

                  <div class="perfil-acc-body">
                    <div class="perfil-grid">
                      <label class="perfil-field perfil-field-full">
                        <span>Correo electrónico</span>
                        <input
                          type="email"
                          id="perfilCorreoInput"
                          value="<?= htmlspecialchars($correo) ?>"
                          placeholder="tu.correo@ejemplo.com" />
                      </label>

                      <label class="perfil-field">
                        <span>Número de celular</span>
                        <input
                          type="tel"
                          id="perfilCelularInput"
                          value="<?= htmlspecialchars($celular) ?>"
                          placeholder="868 000 0000" />
                      </label>

                      <label class="perfil-field">
                        <span>Número de teléfono (opcional)</span>
                        <input
                          type="tel"
                          id="perfilTelefonoInput"
                          value="<?= htmlspecialchars($telefono) ?>"
                          placeholder="Casa u oficina" />

                      </label>
                    </div>
                    <p class="muted perfil-auto-msg">
                      Los cambios en esta sección se guardan automáticamente.
                    </p>
                  </div>
                </div>

                <!-- Sección 2: Dirección / domicilio / consultorio -->
                <div class="dash-card perfil-card-form perfil-acc-item">
                  <button class="perfil-acc-head" type="button">
                    <div class="perfil-section-title">
                      <div class="dot"></div>
                      <span>Datos del domicilio</span>
                    </div>
                    <i class="fa-solid fa-chevron-down"></i>
                  </button>

                  <div class="perfil-acc-body">
                    <div class="perfil-grid">
                      <label class="perfil-field perfil-field-full">
                        <span>Calle</span>
                        <input
                          type="text"
                          id="perfilCalleInput"
                          value="<?= htmlspecialchars($calle) ?>"
                          placeholder="Ej. Nicolás Guerra" />
                      </label>

                      <label class="perfil-field">
                        <span>Número exterior</span>
                        <input
                          type="text"
                          id="perfilNumExtInput"
                          value="<?= htmlspecialchars($numExt) ?>"
                          placeholder="123" />
                      </label>
                      <label class="perfil-field">
                        <span>Número interior</span>
                        <input
                          type="text"
                          id="perfilNumIntInput"
                          value="<?= htmlspecialchars($numInt) ?>"
                          placeholder="Depto / Consultorio" />
                      </label>

                      <label class="perfil-field">
                        <span>Estado</span>
                        <input
                          type="text"
                          id="perfilEstadoInput"
                          value="<?= htmlspecialchars($estado) ?>"
                          placeholder="Tamaulipas" />
                      </label>
                      <label class="perfil-field">
                        <span>Ciudad</span>
                        <input
                          type="text"
                          id="perfilCiudadInput"
                          value="<?= htmlspecialchars($ciudad) ?>"
                          placeholder="H. Matamoros" />
                      </label>

                      <label class="perfil-field">
                        <span>Colonia</span>
                        <input
                          type="text"
                          id="perfilColoniaInput"
                          value="<?= htmlspecialchars($colonia) ?>"
                          placeholder="Colonia" />
                      </label>
                      <label class="perfil-field">
                        <span>Código postal</span>
                        <input
                          type="text"
                          id="perfilCpInput"
                          value="<?= htmlspecialchars($cp) ?>"
                          placeholder="87390" />
                      </label>

                      <label class="perfil-field perfil-field-full">
                        <span>Entre calles</span>
                        <input
                          type="text"
                          id="perfilEntreCallesInput"
                          value="<?= htmlspecialchars($entreCalles) ?>"
                          placeholder="Ej. Entre Av. Juárez y Calle Morelos" />
                      </label>
                    </div>
                    <p class="muted perfil-auto-msg">
                      Los cambios en esta sección se guardan automáticamente.
                    </p>
                  </div>
                </div>

                <!-- Sección 3: Cambiar contraseña (solo aquí botones) -->
                <div class="dash-card perfil-card-form perfil-acc-item">
                  <button class="perfil-acc-head" type="button">
                    <div class="perfil-section-title">
                      <div class="dot"></div>
                      <span>Cambiar contraseña</span>
                    </div>
                    <i class="fa-solid fa-chevron-down"></i>
                  </button>

                  <div class="perfil-acc-body">
                    <div class="perfil-grid">
                      <label class="perfil-field">
                        <span>Contraseña actual</span>
                        <input
                          type="password"
                          id="perfilPassActual"
                          placeholder="••••••••" />
                      </label>
                      <label class="perfil-field">
                        <span>Nueva contraseña</span>
                        <input
                          type="password"
                          id="perfilPassNueva"
                          placeholder="Mínimo 8 caracteres" />
                      </label>
                      <label class="perfil-field">
                        <span>Confirmar nueva contraseña</span>
                        <input
                          type="password"
                          id="perfilPassConfirmar"
                          placeholder="Repetir contraseña" />
                      </label>
                    </div>

                    <div class="perfil-actions">
                      <button
                        class="btn-ghost"
                        type="button"
                        id="btnPerfilPassCancelar">
                        Cancelar
                      </button>
                      <button
                        class="btn-azul"
                        type="button"
                        id="btnPerfilPassGuardar">
                        Guardar cambios
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!--QR-->
        <section class="content-section" data-section-panel="qr">
          <h2>QR</h2>
          <p class="muted">
            Aquí se podrá generar el QR de la Cartilla de Vacunación
          </p>

          <div class="dash-card">
            <b>Generar Qr o PDF </b>
            <p>
              Proximamente se podrá generar tu QR o PDF para obtener tu
              cartilla de Vacunación
            </p>
          </div>
        </section>
        <!-- Admin usuarios -->
        <section class="content-section" data-section-panel="admin">
          <h2>Administrar usuarios</h2>
          <p class="muted">
            Desde aquí puedes validar cuentas nuevas y activar el acceso a
            eCartilla.
          </p>

          <div class="cards-grid">
            <div class="dash-card">
              <b>Usuarios pendientes</b>
              <div class="value" id="adminCountPendientes">3</div>
              <div class="tag">
                Esperando validación en el centro de salud
              </div>
            </div>
            <div class="dash-card">
              <b>Usuarios activos</b>
              <div class="value" id="adminCountActivos">12</div>
              <div class="tag">Con acceso a su eCartilla</div>
            </div>
          </div>

          <div class="dash-card" style="margin-top: 1.25rem">
            <b>Solicitudes de registro pendientes</b>
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>CURP</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody id="adminPendientesBody">
                <!-- Filas demo / luego las rellenamos con JS -->
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  </div>
  <script src="dashboard.js"></script>
  <script src="vacunas-esquema.js"></script>
  <script src="app.js"></script>
  <script>
    window.userData = {
      name: <?= json_encode($nombreCompleto) ?>,
      email: <?= json_encode($correo) ?>,
      role: <?= json_encode($rolClave) ?>
    };
    window.fechaNacimientoUsuario = <?= json_encode($fechaNacimiento) ?>;
  </script>

</body>

</html>