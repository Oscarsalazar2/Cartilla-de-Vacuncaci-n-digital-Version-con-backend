<?php
session_start();
require __DIR__ . '/conexion.php';

// Si entras escribiendo la URL en el navegador (GET), te mando al login
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../login.html');
    exit;
}

// A partir de aquí solo respondemos en JSON
header('Content-Type: application/json');

// -------- FUNCION: OBTENER FECHA DE NACIMIENTO DESDE CURP --------
function fechaNacimientoDesdeCurp(string $curp): ?string {
    $curp = strtoupper(trim($curp));

    // Formato básico de CURP (18 caracteres)
    if (!preg_match('/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/', $curp)) {
        return null;
    }

    // posiciones 5-6 = año, 7-8 = mes, 9-10 = día
    $yy = (int)substr($curp, 4, 2);
    $mm = (int)substr($curp, 6, 2);
    $dd = (int)substr($curp, 8, 2);

    // Determinar siglo (1900 o 2000)
    $currentYY = (int)date('y');
    $century   = ($yy <= $currentYY) ? 2000 : 1900;
    $year      = $century + $yy;

    if (!checkdate($mm, $dd, $year)) {
        return null;
    }

    // Formato YYYY-MM-DD
    return sprintf('%04d-%02d-%02d', $year, $mm, $dd);
}

// 1. Leer datos del formulario
$nombre   = trim($_POST['nombre']  ?? '');
$ap_pat   = trim($_POST['apellido_paterno']  ?? '');
$ap_mat   = trim($_POST['apellido_materno']  ?? '');
$correo   = trim($_POST['correo']  ?? '');
$curp     = trim($_POST['curp']    ?? '');
$password = trim($_POST['password'] ?? '');

// (opcional) si del front mandas fecha_nacimiento, la leemos
$fecha_nacimiento = trim($_POST['fecha_nacimiento'] ?? '');

// Validaciones básicas
if ($nombre === '' || $correo === '' || $password === '') {
    echo json_encode([
        'ok' => false,
        'code' => 'validation',
        'message' => 'Nombre, correo y contraseña son obligatorios.'
    ]);
    exit;
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'ok' => false,
        'code' => 'validation',
        'message' => 'El correo no tiene un formato válido.'
    ]);
    exit;
}

// Si hay CURP pero no vino fecha_nacimiento desde el front, la calculamos aquí
if ($curp !== '' && $fecha_nacimiento === '') {
    $fecha_nac_curp = fechaNacimientoDesdeCurp($curp);
    if ($fecha_nac_curp !== null) {
        $fecha_nacimiento = $fecha_nac_curp;
    }
}

try {
    //Verificar si ya existe un usuario con ese correo o CURP
    $sqlCheck = "SELECT id_usuario FROM usuarios 
                 WHERE correo = :correo OR (curp <> '' AND curp = :curp)";
    $stmtCheck = $conexion->prepare($sqlCheck);
    $stmtCheck->execute([
        ':correo' => $correo,
        ':curp'   => $curp
    ]);

    if ($stmtCheck->fetch()) {
        echo json_encode([
            'ok' => false,
            'code' => 'duplicate',
            'message' => 'Ya existe un usuario registrado con ese correo o CURP.'
        ]);
        exit;
    }

    // 4. Hash seguro de la contraseña
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    // 5. Insertar usuario nuevo como Usuario (id_rol = 3) y estatus PENDIENTE
    $sqlInsert = "INSERT INTO usuarios 
        (nombre, apellido_paterno, apellido_materno, correo, curp, fecha_nacimiento, password_hash, id_rol, estatus, fecha_registro)
        VALUES 
        (:nombre, :ap_pat, :ap_mat, :correo, :curp, :fecha_nacimiento, :password_hash, :id_rol, 'PENDIENTE', NOW())";

    $stmtInsert = $conexion->prepare($sqlInsert);
    $stmtInsert->execute([
        ':nombre'           => $nombre,
        ':ap_pat'           => $ap_pat,
        ':ap_mat'           => $ap_mat,
        ':correo'           => $correo,
        ':curp'             => $curp,
        ':fecha_nacimiento' => ($fecha_nacimiento !== '' ? $fecha_nacimiento : null),
        ':password_hash'    => $passwordHash,
        ':id_rol'           => 3  // 3 = Usuario
    ]);

    echo json_encode([
        'ok' => true,
        'code' => 'created',
        'message' => 'Registro creado. Tu cuenta está pendiente de activación.'
    ]);
    exit;

} catch (PDOException $e) {
    echo json_encode([
        'ok' => false,
        'code' => 'db',
        'message' => 'Error al registrar usuario: ' . $e->getMessage()
    ]);
    exit;
}
