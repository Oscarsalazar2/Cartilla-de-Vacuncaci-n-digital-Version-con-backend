<?php
// seed_usuario_demo.php
require 'php/conexion.php';

try {
    // Datos del usuario de prueba
    $nombre   = 'Usuario Demo';
    $correo   = 'demo@correo.com';
    $curp     = 'DEMO123456HXXXRR01';
    $password = '123456'; // contraseña simple SOLO para pruebas
    $hash     = password_hash($password, PASSWORD_BCRYPT);

    // Revisar si ya existe
    $sqlCheck = "SELECT id_usuario FROM usuarios WHERE correo = :correo";
    $stmtCheck = $conexion->prepare($sqlCheck);
    $stmtCheck->execute([':correo' => $correo]);

    if ($stmtCheck->fetch()) {
        echo "El usuario demo ya existe con correo: $correo<br>";
    } else {
        // Insertar como CIUDADANO y ACTIVO para poder iniciar sesión
        $sqlInsert = "INSERT INTO usuarios
            (nombre, correo, curp, password_hash, id_rol, estatus, fecha_registro)
            VALUES
            (:nombre, :correo, :curp, :password_hash, :id_rol, 'ACTIVO', NOW())";

        $stmtInsert = $conexion->prepare($sqlInsert);
        $stmtInsert->execute([
            ':nombre'        => $nombre,
            ':correo'        => $correo,
            ':curp'          => $curp,
            ':password_hash' => $hash,
            ':id_rol'        => 3  // 3 = CIUDADANO
        ]);

        echo "Usuario demo insertado correctamente.<br>";
    }

    echo "➡️ Ahora puedes probar login con:<br>";
    echo "Correo o CURP: <b>$correo</b> o <b>$curp</b><br>";
    echo "Contraseña: <b>$password</b><br>";

} catch (PDOException $e) {
    echo "❌ Error al insertar usuario demo: " . $e->getMessage();
}
