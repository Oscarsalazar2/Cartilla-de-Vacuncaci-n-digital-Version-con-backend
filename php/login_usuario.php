<?php
session_start();
require __DIR__ . '/conexion.php';

// Si entran por GET, regresamos al login
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../login.html');
    exit;
}

header('Content-Type: application/json');

$identidad = trim($_POST['identidad'] ?? ''); // puede ser correo o CURP
$password  = trim($_POST['password'] ?? '');

if ($identidad === '' || $password === '') {
    echo json_encode(['ok' => false, 'code' => 'validation', 'message' => 'Faltan datos']);
    exit;
}

try {
    // Buscar usuario por correo o curp
    $sql = "SELECT * FROM usuarios WHERE correo = :identidad OR curp = :identidad LIMIT 1";
    $stmt = $conexion->prepare($sql);
    $stmt->execute([':identidad' => $identidad]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {
        echo json_encode(['ok' => false, 'code' => 'not_found', 'message' => 'Usuario no encontrado']);
        exit;
    }

    if (!password_verify($password, $usuario['password_hash'])) {
        echo json_encode(['ok' => false, 'code' => 'bad_password', 'message' => 'Contraseña incorrecta']);
        exit;
    }

    if ($usuario['estatus'] !== 'ACTIVO') {
        echo json_encode(['ok' => false, 'code' => 'pending', 'message' => 'Tu cuenta aún no ha sido activada']);
        exit;
    }

    // Guardar sesión
    $_SESSION['id_usuario'] = $usuario['id_usuario'];
    $_SESSION['id_rol']     = $usuario['id_rol'];
    $_SESSION['nombre']     = $usuario['nombre'];
    $_SESSION['correo']     = $usuario['correo'];
    $_SESSION['curp']       = $usuario['curp'];

    echo json_encode(['ok' => true, 'code' => 'login_ok']);
    exit;

} catch (PDOException $e) {
    echo json_encode(['ok' => false, 'code' => 'db', 'message' => $e->getMessage()]);
    exit;
}
