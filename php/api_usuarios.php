<?php
session_start();
require __DIR__ . '/conexion.php';
header('Content-Type: application/json');

if (!isset($_SESSION['id_usuario'], $_SESSION['id_rol'])) {
  echo json_encode(['ok' => false, 'error' => 'No autenticado']);
  exit;
}

$idRol = (int)$_SESSION['id_rol'];
$action = $_REQUEST['action'] ?? ''; 
try {
  // ===== LISTAR =====
  if ($action === 'list') {
    if (!in_array($idRol, [1, 2])) throw new Exception('Sin permiso');
    $stmt = $conexion->query("SELECT u.*, r.nombre AS rol_nombre
                              FROM usuarios u
                              JOIN roles r ON u.id_rol = r.id_rol
                              ORDER BY u.fecha_registro DESC");
    echo json_encode(['ok' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    exit;
  }

  // ===== ACTIVAR =====
  if ($action === 'activar') {
    if ($idRol != 1) throw new Exception('Solo admin puede activar');
    $id = (int)($_POST['id_usuario'] ?? 0);
    if ($id <= 0) throw new Exception('ID inválido');
    $conexion->prepare("UPDATE usuarios SET estatus='ACTIVO' WHERE id_usuario=?")->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
  }

  // ===== ELIMINAR =====
  if ($action === 'delete') {
    if ($idRol != 1) throw new Exception('Solo admin puede eliminar');
    $id = (int)($_POST['id_usuario'] ?? 0);
    if ($id <= 0) throw new Exception('ID inválido');

    // Antes de eliminar, opcional: evitar que se borre a sí mismo
    if ($id == $_SESSION['id_usuario']) throw new Exception('No puedes eliminar tu propia cuenta.');

    $conexion->prepare("DELETE FROM usuarios WHERE id_usuario=?")->execute([$id]);
    echo json_encode(['ok' => true, 'message' => 'Usuario eliminado']);
    exit;
  }



//  ACTUALIZAR USUARIO (admin) POST php/api_usuarios.php action = update

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'update') {
    // Solo admin puede editar usuarios
    if (!isset($_SESSION['id_rol']) || (int)$_SESSION['id_rol'] !== 1) {
        echo json_encode(['ok' => false, 'error' => 'Sin permisos para actualizar usuarios']);
        exit;
    }

    $id_usuario = (int)($_POST['id_usuario'] ?? 0);
    $nombre     = trim($_POST['nombre'] ?? '');
    $correo     = trim($_POST['correo'] ?? '');
    $curp       = trim($_POST['curp'] ?? '');
    $tipo       = trim($_POST['tipo'] ?? 'usuario');   // admin | medico | usuario
    $estado     = trim($_POST['estado'] ?? 'activo');  // activo | suspendido

    if (!$id_usuario || $nombre === '' || $correo === '') {
        echo json_encode(['ok' => false, 'error' => 'Faltan datos obligatorios.']);
        exit;
    }

    // Mapear tipo (string) -> id_rol (numérico)
    $id_rol = 3; // usuario por defecto
    if ($tipo === 'admin') {
        $id_rol = 1;
    } elseif ($tipo === 'medico') {
        $id_rol = 2;
    }

    // Mapear estado (string) -> estatus (texto en BD)
    $estatus = strtoupper($estado) === 'ACTIVO' ? 'ACTIVO' : 'SUSPENDIDO';

    try {
        $sql = "
            UPDATE usuarios
               SET nombre   = :nombre,
                   correo   = :correo,
                   curp     = :curp,
                   id_rol   = :id_rol,
                   estatus  = :estatus
             WHERE id_usuario = :id_usuario
        ";

        $stmt = $conexion->prepare($sql);
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
    } catch (Exception $e) {
        echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
        exit;
    }
}

  // ===== DEFAULT =====
  throw new Exception('Acción no válida');
} catch (Exception $e) {
  echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}
