<?php
$host = "localhost";
$puerto = "5432";
$bsdnombre = "cartilla_vacunacion";
$usuario = "postgres";  // tu usuario de postgres
$password = "root"; // tu contraseña

try {
    $conexion = new PDO(
        "pgsql:host=$host;port=$puerto;dbname=$bsdnombre",
        $usuario,
        $password
    );
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // NADA de echo/print aquí
} catch (PDOException $e) {
    // En APIs devolvemos JSON, aquí solo lanzamos error
    die("Error de conexión: " . $e->getMessage());
}