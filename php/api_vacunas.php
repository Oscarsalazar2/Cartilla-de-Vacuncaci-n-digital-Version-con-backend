<?php
session_start();
require __DIR__ . '/conexion.php';

// Siempre respondemos JSON
header('Content-Type: application/json; charset=utf-8');

// -------- Validar sesión --------
if (!isset($_SESSION['id_usuario'], $_SESSION['id_rol'])) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'No autenticado']);
    exit;
}

$idUsuarioSesion = (int)$_SESSION['id_usuario'];
$idRol           = (int)$_SESSION['id_rol']; // 1 = admin, 2 = médico, 3 = ciudadano
$method          = $_SERVER['REQUEST_METHOD'];
$action          = $_GET['action'] ?? $_POST['action'] ?? '';

try {

    if ($method === 'POST' && $action === 'registrar') {
        if (!in_array($idRol, [1, 2], true)) {
            http_response_code(403);
            echo json_encode(['ok' => false, 'error' => 'Sin permisos para registrar vacunas']);
            exit;
        }

        $id_usuario = (int)($_POST['id_usuario'] ?? 0);
        $vacunaTxt  = trim($_POST['vacuna'] ?? '');     // nombre (compat)
        $idVacunaIn = (int)($_POST['id_vacuna'] ?? 0);  // opcional
        $dosisTxt   = trim($_POST['dosis'] ?? '');
        $lote       = trim($_POST['lote'] ?? '');
        $fecha      = $_POST['fecha'] ?? null;
        $obs        = trim($_POST['observaciones'] ?? '');

        $idMarca    = (int)($_POST['id_marca'] ?? 0);   // opcional
        $marcaTxt   = trim($_POST['marca'] ?? '');      // opcional

        if (!$id_usuario || (!$idVacunaIn && $vacunaTxt === '') || !$fecha) {
            throw new Exception('Faltan datos obligatorios (usuario, vacuna o fecha).');
        }

        // Evita auto-aplicación
        if (in_array($idRol, [1, 2], true) && $id_usuario === $idUsuarioSesion) {
            throw new Exception('Por seguridad, no puedes registrarte vacunas a ti mismo.');
        }

        // Fecha válida y no futura
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) {
            throw new Exception('Fecha con formato inválido (YYYY-MM-DD).');
        }
        if (strtotime($fecha) > time()) {
            throw new Exception('La fecha de aplicación no puede ser futura.');
        }

        $conexion->beginTransaction();
        try {
            // 1) Resolver id_vacuna
            if ($idVacunaIn > 0) {
                $stmt = $conexion->prepare("SELECT id_vacuna, nombre FROM vacunas WHERE id_vacuna = :id LIMIT 1");
                $stmt->execute([':id' => $idVacunaIn]);
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                if (!$row) throw new Exception('La vacuna indicada no existe.');
                $idVacuna  = (int)$row['id_vacuna'];
                $vacunaTxt = $row['nombre'];
            } else {
                $stmt = $conexion->prepare("SELECT id_vacuna FROM vacunas WHERE LOWER(nombre)=LOWER(:n) LIMIT 1");
                $stmt->execute([':n' => $vacunaTxt]);
                $row = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($row) {
                    $idVacuna = (int)$row['id_vacuna'];
                } else {
                    $clave = substr(preg_replace('/\s+/', '', strtoupper($vacunaTxt)), 0, 5);
                    $stmt = $conexion->prepare("
                    INSERT INTO vacunas (clave, nombre)
                    VALUES (:c, :n)
                    RETURNING id_vacuna
                ");
                    $stmt->execute([':c' => $clave, ':n' => $vacunaTxt]);
                    $idVacuna = (int)$stmt->fetchColumn();
                }
            }

            // 2) Resolver próxima dosis (y evitar duplicados)
            $stmt = $conexion->prepare("SELECT COUNT(*) FROM esquema_vacunas WHERE id_vacuna = :v");
            $stmt->execute([':v' => $idVacuna]);
            $tieneEsquema = ((int)$stmt->fetchColumn() > 0);

            $idEsquema = null;
            $dosisNum = null;
            $totalDosis = null;

            if ($tieneEsquema) {
                $stmt = $conexion->prepare("
                SELECT ev.id_esquema, ev.dosis_numero, ev.total_dosis
                FROM esquema_vacunas ev
                WHERE ev.id_vacuna = :v
                  AND NOT EXISTS (
                    SELECT 1 FROM aplicaciones_vacuna av
                    WHERE av.id_usuario = :u
                      AND av.estado = 'APLICADA'
                      AND av.id_esquema = ev.id_esquema
                  )
                ORDER BY ev.dosis_numero ASC
                LIMIT 1
            ");
                $stmt->execute([':v' => $idVacuna, ':u' => $id_usuario]);
                $rowNext = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$rowNext) {
                    throw new Exception('Esquema completo: ya registraste todas las dosis para esta vacuna.');
                }

                $idEsquema  = (int)$rowNext['id_esquema'];
                $dosisNum   = (int)$rowNext['dosis_numero'];
                $totalDosis = (int)$rowNext['total_dosis'];
            } else {
                // single-shot sin esquema → NO duplicar
                $stmt = $conexion->prepare("
                SELECT 1
                FROM aplicaciones_vacuna
                WHERE id_usuario = :u
                  AND id_vacuna  = :v
                  AND id_esquema IS NULL
                  AND estado = 'APLICADA'
                LIMIT 1
            ");
                $stmt->execute([':u' => $id_usuario, ':v' => $idVacuna]);
                if ($stmt->fetch()) {
                    throw new Exception('Ya existe un registro aplicado de esta vacuna para este usuario.');
                }
                $dosisNum = 1;
                $totalDosis = 1;
            }

            // 2.1 Marca (opcional)
            if ($idMarca > 0) {
                $stmt = $conexion->prepare("
                SELECT 1 FROM marcas_vacuna WHERE id_marca = :m AND id_vacuna = :v
            ");
                $stmt->execute([':m' => $idMarca, ':v' => $idVacuna]);
                if (!$stmt->fetch()) throw new Exception('La marca no es válida para esta vacuna.');
            } elseif ($marcaTxt !== '') {
                $stmt = $conexion->prepare("
                SELECT id_marca FROM marcas_vacuna
                WHERE id_vacuna=:v AND LOWER(nombre)=LOWER(:n) LIMIT 1
            ");
                $stmt->execute([':v' => $idVacuna, ':n' => $marcaTxt]);
                $rowMk = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($rowMk) {
                    $idMarca = (int)$rowMk['id_marca'];
                } else {
                    $stmt = $conexion->prepare("
                    INSERT INTO marcas_vacuna (id_vacuna, nombre)
                    VALUES (:v, :n)
                    RETURNING id_marca
                ");
                    $stmt->execute([':v' => $idVacuna, ':n' => $marcaTxt]);
                    $idMarca = (int)$stmt->fetchColumn();
                }
            } else {
                $idMarca = null;
            }

            // 2.2 Observaciones: escribir la dosis real
            $obsFinal = trim($obs);
            $obsDosis = ($dosisNum !== null && $totalDosis !== null) ? ($dosisNum . ' / ' . $totalDosis) : null;
            if ($obsDosis) {
                $obsFinal = $obsFinal ? ($obsFinal . " | Dosis: " . $obsDosis) : ("Dosis: " . $obsDosis);
            }

            // 3) Insertar
            $stmt = $conexion->prepare("
            INSERT INTO aplicaciones_vacuna (
                id_usuario, id_esquema, id_vacuna, id_marca,
                fecha_aplicacion, lote, observaciones, estado,
                id_registrada_por, fecha_registro
            ) VALUES (
                :u, :e, :v, :m,
                :f, :l, :o, 'APLICADA',
                :rp, NOW()
            )
        ");
            $stmt->execute([
                ':u'  => $id_usuario,
                ':e'  => $idEsquema,        // puede ser NULL
                ':v'  => $idVacuna,
                ':m'  => $idMarca,          // puede ser NULL
                ':f'  => $fecha,
                ':l'  => $lote ?: null,
                ':o'  => $obsFinal ?: null,
                ':rp' => $idUsuarioSesion
            ]);

            $conexion->commit();
            echo json_encode(['ok' => true, 'message' => 'Vacuna registrada correctamente.']);
            exit;
        } catch (Exception $ex) {
            $conexion->rollBack();
            throw $ex;
        }
    }


    // ============================
    // 2) MIS VACUNAS (Historial del usuario logueado)
    //    GET php/api_vacunas.php?action=mis_vacunas
    // ============================
    if ($method === 'GET' && $action === 'mis_vacunas') {
        $idUsuario = $idUsuarioSesion;

        $sql = "
            SELECT
                av.id_aplicacion,
                COALESCE(av.id_vacuna, v.id_vacuna) AS id_vacuna,
                COALESCE(v.nombre, 'Vacuna') AS vacuna,
                v.clave AS clave_vacuna,
                av.fecha_aplicacion AS fecha,
                ev.dosis_numero,
                ev.total_dosis,
                CASE
                    WHEN ev.dosis_numero IS NOT NULL AND ev.total_dosis IS NOT NULL THEN
                        ev.dosis_numero::text || ' / ' || ev.total_dosis::text
                    ELSE NULL
                END AS dosis,
                av.estado,
                av.lote,
                av.observaciones
            FROM aplicaciones_vacuna av
            LEFT JOIN esquema_vacunas ev ON av.id_esquema = ev.id_esquema
            LEFT JOIN vacunas v ON v.id_vacuna = COALESCE(av.id_vacuna, ev.id_vacuna)
            WHERE av.id_usuario = :id
            ORDER BY av.fecha_aplicacion ASC, av.id_aplicacion ASC
        ";

        $stmt = $conexion->prepare($sql);
        $stmt->execute([':id' => $idUsuario]);
        $vacunas = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['ok' => true, 'data' => $vacunas]);
        exit;
    }

    // ============================
    // 3) RESUMEN DE CARTILLA (panel principal)
    //    GET php/api_vacunas.php?action=resumen 
    // ============================
    if ($method === 'GET' && $action === 'resumen') {
        $idUsuario = $idUsuarioSesion;

        // Totales de esquema y dosis aplicadas
        $sqlTotales = "
            SELECT 
              (SELECT COUNT(*) FROM esquema_vacunas) AS total_dosis_esquema,
              (SELECT COUNT(*) 
                 FROM aplicaciones_vacuna 
                WHERE id_usuario = :id 
                  AND estado = 'APLICADA') AS dosis_aplicadas
        ";
        $stmtTot = $conexion->prepare($sqlTotales);
        $stmtTot->execute([':id' => $idUsuario]);
        $totales = $stmtTot->fetch(PDO::FETCH_ASSOC) ?: [
            'total_dosis_esquema' => 0,
            'dosis_aplicadas'     => 0
        ];

        $totalDosisEsquema = (int)$totales['total_dosis_esquema'];
        $dosisAplicadas    = (int)$totales['dosis_aplicadas'];

        // Matriz por vacuna - SOLO las que tienen al menos una dosis aplicada (HAVING)
        $sqlMatriz = "
            SELECT
                v.id_vacuna,
                v.clave,
                v.nombre AS vacuna,
                MAX(av.fecha_aplicacion) AS ultima_fecha,
                COUNT(av.id_aplicacion) AS dosis_aplicadas,
                COALESCE(MAX(ev.total_dosis), 0) AS total_dosis,
                CASE
                    WHEN COUNT(av.id_aplicacion) >= COALESCE(MAX(ev.total_dosis), 0)
                         AND COALESCE(MAX(ev.total_dosis), 0) > 0
                        THEN 'Completa'
                    WHEN COUNT(av.id_aplicacion) > 0
                        THEN 'En progreso'
                    ELSE 'Pendiente'
                END AS estado
            FROM esquema_vacunas ev
            JOIN vacunas v ON ev.id_vacuna = v.id_vacuna
            LEFT JOIN aplicaciones_vacuna av
                   ON av.id_esquema = ev.id_esquema
                  AND av.id_usuario = :id
                  AND av.estado = 'APLICADA'
            GROUP BY v.id_vacuna, v.clave, v.nombre
            HAVING COUNT(av.id_aplicacion) > 0
            ORDER BY v.nombre
        ";

        $stmtMat = $conexion->prepare($sqlMatriz);
        $stmtMat->execute([':id' => $idUsuario]);
        $matriz = $stmtMat->fetchAll(PDO::FETCH_ASSOC);

        // Vacunas completas
        $vacunasCompletas = 0;
        foreach ($matriz as $row) {
            if ($row['estado'] === 'Completa') {
                $vacunasCompletas++;
            }
        }

        // ---- Calcular alertas reales (vacunas atrasadas) ----
        $stmtFn = $conexion->prepare("SELECT fecha_nacimiento FROM usuarios WHERE id_usuario = :id");
        $stmtFn->execute([':id' => $idUsuario]);
        $fechaNac = $stmtFn->fetchColumn();

        $alertas = 0;
        $vacunasAtrasadas = [];

        if ($fechaNac) {
            $fn  = new DateTime($fechaNac);
            $hoy = new DateTime();
            $diff = $hoy->diff($fn);
            $edadMeses = $diff->y * 12 + $diff->m;

            // Esquemas que ya debería tener aplicados (edad_min_meses <= edad) y no los tiene
            $sqlAtrasadas = "
                SELECT DISTINCT v.nombre AS vacuna
                FROM esquema_vacunas ev
                JOIN vacunas v ON ev.id_vacuna = v.id_vacuna
                LEFT JOIN aplicaciones_vacuna av
                       ON av.id_esquema = ev.id_esquema
                      AND av.id_usuario = :id
                      AND av.estado = 'APLICADA'
                WHERE av.id_aplicacion IS NULL
                  AND ev.edad_min_meses IS NOT NULL
                  AND ev.edad_min_meses <= :edad
            ";

            $stmtAtr = $conexion->prepare($sqlAtrasadas);
            $stmtAtr->execute([
                ':id'   => $idUsuario,
                ':edad' => $edadMeses
            ]);
            $rowsAtr = $stmtAtr->fetchAll(PDO::FETCH_ASSOC);

            $alertas = count($rowsAtr);
            $vacunasAtrasadas = array_column($rowsAtr, 'vacuna');
        }

        // Próximas dosis (simple aproximación)
        // ---------- Próximas dosis reales (en base a edad y esquema) ----------
        $proximasDosis = 0;
        $proximasDetalle = [];

        if ($fechaNac) {
            $hoy = new DateTime();
            $fn  = new DateTime($fechaNac);

            // edad en meses del usuario
            $stmtEdad = $conexion->prepare("
    SELECT (EXTRACT(YEAR FROM age(CURRENT_DATE, :fn)) * 12
          + EXTRACT(MONTH FROM age(CURRENT_DATE, :fn)))::int AS edad_meses
  ");
            $stmtEdad->execute([':fn' => $fechaNac]);
            $edadMeses = (int)$stmtEdad->fetchColumn();

            // dosis PENDIENTES (no aplicadas) de su esquema
            // due_in = meses que faltan para llegar a la edad mínima recomendada
            // due_date = fecha_nacimiento + edad_min_meses
            $stmtProx = $conexion->prepare("
    SELECT
      v.nombre                                AS vacuna,
      ev.dosis_numero,
      ev.total_dosis,
      ev.edad_min_meses,
      (ev.edad_min_meses - :edad)::int        AS due_in,
      (:fn::date + (ev.edad_min_meses || ' months')::interval)::date AS due_date
    FROM esquema_vacunas ev
    JOIN vacunas v ON v.id_vacuna = ev.id_vacuna
    WHERE NOT EXISTS (
      SELECT 1
      FROM aplicaciones_vacuna av
      WHERE av.id_usuario = :id
        AND av.estado = 'APLICADA'
        AND av.id_esquema = ev.id_esquema
    )
    ORDER BY ev.edad_min_meses ASC, ev.dosis_numero ASC
  ");
            $stmtProx->execute([
                ':fn'   => $fechaNac,
                ':edad' => $edadMeses,
                ':id'   => $idUsuario
            ]);
            $rowsProx = $stmtProx->fetchAll(PDO::FETCH_ASSOC);

            // Separamos atrasadas vs próximas:
            // - atrasadas: due_in < 0  (ya están vencidas) -> ya las cuentas como alertas
            // - próximas:  due_in >= 0 (por venir)
            foreach ($rowsProx as $r) {
                if ((int)$r['due_in'] >= 0) {
                    $proximasDetalle[] = [
                        'vacuna'       => $r['vacuna'],
                        'dosis_numero' => (int)$r['dosis_numero'],
                        'total_dosis'  => (int)$r['total_dosis'],
                        'due_in'       => (int)$r['due_in'],                 // meses faltantes
                        'due_date'     => $r['due_date'],                    // YYYY-MM-DD
                    ];
                }
            }

            $proximasDosis = count($proximasDetalle);
        } else {
            // si NO hay fecha de nacimiento, dejamos el cálculo simple como fallback
            $proximasDosis = max(0, $totalDosisEsquema - $dosisAplicadas);
            $proximasDetalle = [];
        }

        echo json_encode([
            'ok' => true,
            'resumen' => [
                'total_dosis_esquema' => $totalDosisEsquema,
                'dosis_aplicadas'     => $dosisAplicadas,
                'vacunas_completas'   => $vacunasCompletas,
                'proximas_dosis'      => $proximasDosis,
                'proximas_detalle'    => $proximasDetalle,   // <- NUEVO
                'alertas'             => $alertas,
                'vacunas_atrasadas'   => $vacunasAtrasadas
            ],

            'matriz' => $matriz
        ]);
        exit;
    }

    // ============================
    // 4) ESQUEMA_USUARIO (para la cartilla bonita)
    //    GET php/api_vacunas.php?action=esquema_usuario
    // ============================
    if ($method === 'GET' && $action === 'esquema_usuario') {
        $idUsuario = $idUsuarioSesion;

        $sql = "
            SELECT
                av.id_aplicacion,
                av.fecha_aplicacion,
                av.estado,
                av.lote,
                av.observaciones,
                ev.id_esquema       AS id_esquema_db,
                ev.id_esquema_front,
                ev.dosis_numero,
                ev.total_dosis,
                ev.grupo_edad,
                ev.edad_min_meses,
                ev.edad_max_meses,
                v.clave      AS clave_vacuna,
                v.nombre     AS nombre_vacuna
            FROM aplicaciones_vacuna av
            JOIN esquema_vacunas ev ON av.id_esquema = ev.id_esquema
            JOIN vacunas        v  ON ev.id_vacuna  = v.id_vacuna
            WHERE av.id_usuario = :id
              AND av.estado = 'APLICADA'
            ORDER BY av.fecha_aplicacion ASC, av.id_aplicacion ASC
        ";

        $stmt = $conexion->prepare($sql);
        $stmt->execute([':id' => $idUsuario]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['ok' => true, 'data' => $rows]);
        exit;
    }

    // ============================
    // 5) DETALLE POR VACUNA (para el modal)
    //    GET php/api_vacunas.php?action=detalle_vacuna&id_vacuna=XX
    // ============================
    if ($method === 'GET' && $action === 'detalle_vacuna') {
        $idVacuna = (int)($_GET['id_vacuna'] ?? 0);
        if (!$idVacuna) {
            throw new Exception('id_vacuna es obligatorio.');
        }

        $sql = "
           SELECT
  av.id_aplicacion,
  av.fecha_aplicacion,
  av.lote,
  av.estado,
  av.observaciones,
  ev.dosis_numero,  
  ev.total_dosis,
  mv.nombre AS marca
FROM aplicaciones_vacuna av
LEFT JOIN esquema_vacunas ev ON av.id_esquema = ev.id_esquema
LEFT JOIN marcas_vacuna mv ON av.id_marca = mv.id_marca
WHERE av.id_usuario = :id_usuario
  AND (
    av.id_vacuna = :id_vacuna
    OR (av.id_vacuna IS NULL AND ev.id_vacuna = :id_vacuna)
  )
ORDER BY av.fecha_aplicacion ASC, av.id_aplicacion ASC

        ";

        $stmt = $conexion->prepare($sql);
        $stmt->execute([
            ':id_usuario' => $idUsuarioSesion,
            ':id_vacuna'  => $idVacuna
        ]);
        $detalle = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['ok' => true, 'data' => $detalle]);
        exit;
    }

    // ============================
    // 6) CATÁLOGO DE VACUNAS (para el <select>)
    //    GET php/api_vacunas.php?action=catalogo_vacunas
    // ============================
    if ($method === 'GET' && $action === 'catalogo_vacunas') {

        $sql = "SELECT id_vacuna, clave, nombre 
                FROM vacunas
                ORDER BY nombre ASC";

        $stmt = $conexion->prepare($sql);
        $stmt->execute();
        $vacunas = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'ok'   => true,
            'data' => $vacunas
        ]);
        exit;
    }

    // ============================
    // 7) MIS VACUNAS DE UN USUARIO ESPECÍFICO (para modal admin / médico)
    //    GET php/api_vacunas.php?action=mis_vacunas_usuario&id_usuario=123
    // ============================
    if ($method === 'GET' && $action === 'mis_vacunas_usuario') {
        // id del usuario que queremos consultar
        $idUsuario = (int)($_GET['id_usuario'] ?? 0);
        if (!$idUsuario) {
            throw new Exception('id_usuario es obligatorio.');
        }

        // Seguridad: ciudadanos solo pueden ver su propia cartilla
        if ($idRol === 3 && $idUsuario !== $idUsuarioSesion) {
            http_response_code(403);
            echo json_encode(['ok' => false, 'error' => 'No autorizado']);
            exit;
        }

        $sql = "
          SELECT
            av.id_aplicacion,
            COALESCE(av.id_vacuna, v.id_vacuna) AS id_vacuna,
            COALESCE(v.nombre, 'Vacuna') AS vacuna,
            v.clave AS clave_vacuna,
            av.fecha_aplicacion AS fecha,
            ev.dosis_numero,
            ev.total_dosis,
            CASE
              WHEN ev.dosis_numero IS NOT NULL AND ev.total_dosis IS NOT NULL THEN
                ev.dosis_numero::text || ' / ' || ev.total_dosis::text
              ELSE NULL
            END AS dosis,
            av.estado,
            av.lote,
            av.observaciones
          FROM aplicaciones_vacuna av
          LEFT JOIN esquema_vacunas ev ON av.id_esquema = ev.id_esquema
          LEFT JOIN vacunas v         ON v.id_vacuna = COALESCE(av.id_vacuna, ev.id_vacuna)
          WHERE av.id_usuario = :id
          ORDER BY av.fecha_aplicacion ASC, av.id_aplicacion ASC
        ";

        $stmt = $conexion->prepare($sql);
        $stmt->execute([':id' => $idUsuario]);
        $vacunas = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['ok' => true, 'data' => $vacunas]);
        exit;
    }


    // ============================
    //  NUEVA ACCIÓN: dosis_siguiente
    //  GET php/api_vacunas.php?action=dosis_siguiente&id_usuario=XX&id_vacuna=YY
    // ============================
    if ($method === 'GET' && $action === 'dosis_siguiente') {
        $idUsuario = (int)($_GET['id_usuario'] ?? 0);
        $idVacuna  = (int)($_GET['id_vacuna'] ?? 0);

        if (!$idUsuario || !$idVacuna) {
            throw new Exception('id_usuario e id_vacuna son obligatorios.');
        }

        // Contar cuántas dosis aplicadas tiene este usuario de esta vacuna
        $sql = "
        SELECT COUNT(*) AS aplicadas, 
               COALESCE(MAX(ev.total_dosis), 1) AS total_dosis
        FROM aplicaciones_vacuna av
        LEFT JOIN esquema_vacunas ev ON av.id_esquema = ev.id_esquema
        WHERE av.id_usuario = :id_usuario
          AND COALESCE(av.id_vacuna, ev.id_vacuna) = :id_vacuna
          AND av.estado = 'APLICADA'
    ";

        $stmt = $conexion->prepare($sql);
        $stmt->execute([
            ':id_usuario' => $idUsuario,
            ':id_vacuna'  => $idVacuna
        ]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        $aplicadas = (int)($row['aplicadas'] ?? 0);
        $total     = (int)($row['total_dosis'] ?? 1);
        $siguiente = min($aplicadas + 1, $total);

        echo json_encode([
            'ok' => true,
            'dosis_siguiente' => "{$siguiente} / {$total}"
        ]);
        exit;
    }


    // ============================
    //  X) MARCAS POR VACUNA
    //    GET php/api_vacunas.php?action=marcas_por_vacuna&id_vacuna=YY
    // ============================
    if ($method === 'GET' && $action === 'marcas_por_vacuna') {
        $idVacuna = (int)($_GET['id_vacuna'] ?? 0);
        if (!$idVacuna) {
            throw new Exception('id_vacuna es obligatorio.');
        }

        $sql = "SELECT id_marca, nombre
            FROM marcas_vacuna
            WHERE id_vacuna = :id
            ORDER BY nombre ASC";
        $stmt = $conexion->prepare($sql);
        $stmt->execute([':id' => $idVacuna]);
        $marcas = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['ok' => true, 'data' => $marcas]);
        exit;
    }


    // -------- Acción no reconocida --------
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Acción no válida']);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
    exit;
}
