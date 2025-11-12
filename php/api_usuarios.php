<?php
session_start();
require __DIR__ . '/conexion.php';

header('Content-Type: application/json; charset=utf-8');

// ---- Autenticación obligatoria ----
if (!isset($_SESSION['id_usuario'], $_SESSION['id_rol'])) {
  http_response_code(401);
  echo json_encode(['ok' => false, 'error' => 'No autenticado']);
  exit;
}

$idUsuarioSesion = (int)$_SESSION['id_usuario'];
$idRolSesion     = (int)$_SESSION['id_rol'];
$action          = $_REQUEST['action'] ?? '';

/**
 * Une nombre + apellidos evitando duplicados
 */
function nombre_completo(array $u): string {
  $n  = trim($u['nombre'] ?? '');
  $ap = trim($u['apellido_paterno'] ?? '');
  $am = trim($u['apellido_materno'] ?? '');

  $base = preg_replace('/\s+/', ' ', $n);
  $extra = [];

  if ($ap && stripos(" $base ", " $ap ") === false) $extra[] = $ap;
  if ($am && stripos(" $base ", " $am ") === false) $extra[] = $am;

  $full = trim($base . ' ' . implode(' ', $extra));
  return $full !== '' ? $full : 'Usuario';
}

/**
 * Mapea nombre de rol a slug
 */
function rol_to_slug($rolNombre) {
  $r = mb_strtolower(trim((string)$rolNombre));
  if ($r === 'administrador') return 'admin';
  if ($r === 'médico' || $r === 'medico') return 'medico';
  return 'usuario';
}

try {

  // ===========================
  // LIST
  // ===========================
  if ($action === 'list') {
    // admin y médico pueden listar
    if (!in_array($idRolSesion, [1, 2], true)) {
      throw new Exception('Sin permiso');
    }

    $stmt = $conexion->query("
  SELECT 
    u.id_usuario,
    u.nombre,
    u.apellido_paterno,
    u.apellido_materno,
    TRIM(COALESCE(u.nombre,'')||' '||COALESCE(u.apellido_paterno,'')||' '||COALESCE(u.apellido_materno,'')) AS nombre_completo,
    u.correo,
    u.curp,
    u.id_rol,
    u.estatus,
    u.fecha_registro,
    r.nombre AS rol_nombre,
    CASE r.clave
      WHEN 'admin'  THEN 'admin'
      WHEN 'medico' THEN 'medico'
      ELSE 'usuario'
    END AS rol_slug
  FROM usuarios u
  JOIN roles r ON u.id_rol = r.id_rol
  ORDER BY u.fecha_registro DESC
");


    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Armar respuesta con nombre_completo y rol_slug
    $data = [];
    foreach ($rows as $u) {
      $u['nombre_completo'] = nombre_completo($u);
      $u['rol_slug']        = rol_to_slug($u['rol_nombre'] ?? '');
      $data[] = $u;
    }

    echo json_encode(['ok' => true, 'data' => $data]);
    exit;
  }

  // ===========================
  // ACTIVAR (solo admin)
  // ===========================
  if ($action === 'activar' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($idRolSesion !== 1) throw new Exception('Solo admin puede activar');

    $id = (int)($_POST['id_usuario'] ?? 0);
    if ($id <= 0) throw new Exception('ID inválido');

    $stmt = $conexion->prepare("UPDATE usuarios SET estatus = 'ACTIVO' WHERE id_usuario = :id");
    $stmt->execute([':id' => $id]);

    echo json_encode(['ok' => true, 'message' => 'Usuario activado']);
    exit;
  }

  // ===========================
  // UPDATE (solo admin)
  // ===========================
  if ($action === 'update' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($idRolSesion !== 1) throw new Exception('Sin permisos para actualizar usuarios');

    $id_usuario = (int)($_POST['id_usuario'] ?? 0);
    $nombre     = trim($_POST['nombre'] ?? '');
    $correo     = trim($_POST['correo'] ?? '');
    $curp       = trim($_POST['curp'] ?? '');
    $tipo       = trim($_POST['tipo'] ?? 'usuario');   // admin | medico | usuario
    $estado     = trim($_POST['estado'] ?? 'activo');  // activo | suspendido

    if (!$id_usuario || $nombre === '' || $correo === '') {
      throw new Exception('Faltan datos obligatorios.');
    }

    // Mapear tipo a id_rol
    $id_rol = 3;
    if ($tipo === 'admin')  $id_rol = 1;
    if ($tipo === 'medico') $id_rol = 2;

    // Mapear estado a estatus
    $estatus = (mb_strtolower($estado) === 'activo') ? 'ACTIVO' : 'SUSPENDIDO';

    // Validar duplicados de correo/CURP (excepto el mismo usuario)
    $dup = $conexion->prepare("
      SELECT 1
      FROM usuarios
      WHERE id_usuario <> :id
        AND (
          LOWER(correo) = LOWER(:correo)
          OR (curp IS NOT NULL AND curp <> '' AND curp = :curp)
        )
      LIMIT 1
    ");
    $dup->execute([
      ':id'     => $id_usuario,
      ':correo' => $correo,
      ':curp'   => $curp
    ]);
    if ($dup->fetch()) {
      throw new Exception('El correo o la CURP ya están registrados en otro usuario.');
    }

    $stmt = $conexion->prepare("
      UPDATE usuarios
         SET nombre  = :nombre,
             correo  = :correo,
             curp    = :curp,
             id_rol  = :id_rol,
             estatus = :estatus
       WHERE id_usuario = :id_usuario
    ");
    $stmt->execute([
      ':nombre'     => $nombre,
      ':correo'     => $correo,
      ':curp'       => $curp,
      ':id_rol'     => $id_rol,
      ':estatus'    => $estatus,
      ':id_usuario' => $id_usuario,
    ]);

    echo json_encode(['ok' => true, 'message' => 'Usuario actualizado correctamente.']);
    exit;
  }

  // ===========================
  // DELETE (solo admin)
  // ===========================
  if ($action === 'delete' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($idRolSesion !== 1) throw new Exception('Solo admin puede eliminar usuarios');

    $id = (int)($_POST['id_usuario'] ?? 0);
    if ($id <= 0) throw new Exception('ID de usuario inválido');
    if ($id === $idUsuarioSesion) throw new Exception('No puedes eliminar tu propia cuenta.');

    $stmt = $conexion->prepare("DELETE FROM usuarios WHERE id_usuario = :id");
    $stmt->execute([':id' => $id]);

    echo json_encode(['ok' => true, 'message' => 'Usuario eliminado correctamente.']);
    exit;
  }

  // ===========================
  // DEFAULT
  // ===========================
  throw new Exception('Acción no válida');

} catch (Exception $e) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}
