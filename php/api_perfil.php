<?php
session_start();
require __DIR__ . '/conexion.php';

header('Content-Type: application/json');

if (!isset($_SESSION['id_usuario'])) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'No autenticado']);
    exit;
}

$idUsuario = (int)$_SESSION['id_usuario'];
$action = $_POST['action'] ?? '';

try {

    // ========================
    // GUARDAR DATOS DE CONTACTO
    // ========================
    if ($action === 'contacto') {
        $correo   = trim($_POST['correo']   ?? '');
        $celular  = trim($_POST['celular']  ?? '');
        $telefono = trim($_POST['telefono'] ?? '');

        if ($correo === '' || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['ok' => false, 'error' => 'Correo inválido']);
            exit;
        }

        // (opcional) revisar que el correo no lo esté usando otro usuario
        $sqlCheck = "SELECT id_usuario FROM usuarios WHERE correo = :correo AND id_usuario <> :id";
        $stCheck = $conexion->prepare($sqlCheck);
        $stCheck->execute([':correo' => $correo, ':id' => $idUsuario]);
        if ($stCheck->fetch()) {
            echo json_encode(['ok' => false, 'error' => 'El correo ya está en uso por otra cuenta']);
            exit;
        }

        $sql = "UPDATE usuarios
                SET correo = :correo,
                    celular = :celular,
                    telefono = :telefono
                WHERE id_usuario = :id";

        $stmt = $conexion->prepare($sql);
        $stmt->execute([
            ':correo'  => $correo,
            ':celular' => $celular,
            ':telefono'=> $telefono,
            ':id'      => $idUsuario
        ]);

        // actualizar sesión
        $_SESSION['correo'] = $correo;

        echo json_encode(['ok' => true, 'correo' => $correo]);
        exit;
    }

    // ========================
    // GUARDAR DOMICILIO
    // ========================
    if ($action === 'domicilio') {
        $calle       = trim($_POST['calle']       ?? '');
        $num_ext     = trim($_POST['num_exterior']?? '');
        $num_int     = trim($_POST['num_interior']?? '');
        $estado      = trim($_POST['estado']      ?? '');
        $ciudad      = trim($_POST['ciudad']      ?? '');
        $colonia     = trim($_POST['colonia']     ?? '');
        $cp          = trim($_POST['cp']          ?? '');
        $entre_calles= trim($_POST['entre_calles']?? '');

        $sql = "UPDATE usuarios
                SET calle = :calle,
                    num_exterior = :num_ext,
                    num_interior = :num_int,
                    estado = :estado,
                    ciudad = :ciudad,
                    colonia = :colonia,
                    cp = :cp,
                    entre_calles = :entre_calles
                WHERE id_usuario = :id";

        $stmt = $conexion->prepare($sql);
        $stmt->execute([
            ':calle'        => $calle,
            ':num_ext'      => $num_ext,
            ':num_int'      => $num_int,
            ':estado'       => $estado,
            ':ciudad'       => $ciudad,
            ':colonia'      => $colonia,
            ':cp'           => $cp,
            ':entre_calles' => $entre_calles,
            ':id'           => $idUsuario
        ]);

        echo json_encode(['ok' => true]);
        exit;
    }

    echo json_encode(['ok' => false, 'error' => 'Acción no válida']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}
