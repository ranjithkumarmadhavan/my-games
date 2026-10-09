<?php
/**
 * Hand Cricket room server.
 *
 * Deliberately small: it stores rooms, hides each player's pick until both have
 * picked, then reveals the pair. All cricket rules run in the browser from the
 * revealed event log (see src/lib/game.js). dev/mockApi.js mirrors this file for
 * local development — keep the two in sync.
 *
 * POST JSON: { action: create|join|state|act, ... }
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const ROOM_TTL = 6 * 3600;      // rooms idle longer than this are deleted
const ONLINE_WINDOW = 8;        // seconds since last poll to count as online
const MAX_EVENTS = 5000;
const WORDS = ['odd', 'even', 'bat', 'bowl', 'rematch'];

function reply(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function clean_name($name): string
{
    $name = trim((string) preg_replace('/\s+/u', ' ', (string) $name));
    $name = mb_substr($name, 0, 20);
    return $name === '' ? 'Player' : $name;
}

function valid_value($v): bool
{
    return (is_int($v) && $v >= 0 && $v <= 6) || (is_string($v) && in_array($v, WORDS, true));
}

function view(array $room, int $seat): array
{
    $now = time();
    $pending = [];
    $mine = [];
    foreach ($room['pending'] as $key => $p) {
        $pending[$key] = [isset($p['s0']), isset($p['s1'])];
        if (isset($p["s$seat"])) {
            $mine[$key] = $p["s$seat"];
        }
    }
    return [
        'code' => $room['code'],
        'seat' => $seat,
        'players' => array_map(
            fn ($p) => ['name' => $p['name'], 'online' => ($now - $p['seen']) < ONLINE_WINDOW],
            $room['players']
        ),
        'events' => $room['events'],
        'pending' => (object) $pending,
        'mine' => (object) $mine,
    ];
}

function load_locked(PDO $db, string $code): ?array
{
    $st = $db->prepare('SELECT data FROM hc_rooms WHERE code = ? FOR UPDATE');
    $st->execute([$code]);
    $row = $st->fetch();
    return $row ? json_decode($row['data'], true) : null;
}

function save(PDO $db, array $room): void
{
    $st = $db->prepare('UPDATE hc_rooms SET data = ?, updated_at = ? WHERE code = ?');
    $st->execute([json_encode($room), time(), $room['code']]);
}

function seat_for(array $room, $token): int
{
    foreach ($room['players'] as $i => $p) {
        if (hash_equals($p['token'], (string) $token)) {
            return $i;
        }
    }
    return -1;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    reply(['error' => 'Method not allowed'], 405);
}

$in = json_decode(file_get_contents('php://input') ?: '', true);
if (!is_array($in)) {
    reply(['error' => 'Bad request'], 400);
}

try {
    $config = require __DIR__ . '/config.php';
    $db = new PDO(
        "mysql:host={$config['host']};dbname={$config['name']};charset=utf8mb4",
        $config['user'],
        $config['pass'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
    );
} catch (Throwable $e) {
    reply(['error' => 'Server unavailable'], 503);
}

$action = (string) ($in['action'] ?? '');
$code = strtoupper((string) preg_replace('/[^A-Za-z0-9]/', '', (string) ($in['code'] ?? '')));

try {
    if ($action === 'create') {
        $db->exec('CREATE TABLE IF NOT EXISTS hc_rooms (
            code CHAR(4) PRIMARY KEY,
            data MEDIUMTEXT NOT NULL,
            updated_at INT NOT NULL,
            INDEX (updated_at)
        ) ENGINE=InnoDB');
        $db->prepare('DELETE FROM hc_rooms WHERE updated_at < ?')->execute([time() - ROOM_TTL]);

        for ($try = 0; $try < 20; $try++) {
            $c = '';
            for ($i = 0; $i < 4; $i++) {
                $c .= ALPHABET[random_int(0, strlen(ALPHABET) - 1)];
            }
            $token = bin2hex(random_bytes(16));
            $room = [
                'code' => $c,
                'players' => [['name' => clean_name($in['name'] ?? ''), 'token' => $token, 'seen' => time()]],
                'events' => [],
                'pending' => [],
            ];
            try {
                $db->prepare('INSERT INTO hc_rooms (code, data, updated_at) VALUES (?, ?, ?)')
                    ->execute([$c, json_encode($room), time()]);
                reply(['token' => $token] + view($room, 0));
            } catch (PDOException $e) {
                if ((int) ($e->errorInfo[1] ?? 0) !== 1062) {
                    throw $e; // anything other than a duplicate code
                }
            }
        }
        reply(['error' => 'Could not create a room, try again'], 503);
    }

    if (!in_array($action, ['join', 'state', 'act'], true)) {
        reply(['error' => 'Unknown action'], 400);
    }

    $db->beginTransaction();
    $room = load_locked($db, $code);
    if (!$room) {
        $db->rollBack();
        reply(['error' => 'Room not found'], 404);
    }

    if ($action === 'join') {
        if (count($room['players']) >= 2) {
            $db->rollBack();
            reply(['error' => 'Room is full'], 409);
        }
        $token = bin2hex(random_bytes(16));
        $room['players'][] = ['name' => clean_name($in['name'] ?? ''), 'token' => $token, 'seen' => time()];
        save($db, $room);
        $db->commit();
        reply(['token' => $token] + view($room, 1));
    }

    $seat = seat_for($room, $in['token'] ?? '');
    if ($seat < 0) {
        $db->rollBack();
        reply(['error' => 'Not a player in this room'], 403);
    }
    $room['players'][$seat]['seen'] = time();

    if ($action === 'act') {
        $key = (string) ($in['key'] ?? '');
        $value = $in['value'] ?? null;
        $mode = $in['mode'] ?? '';
        if (!preg_match('/^[a-z0-9:]{1,40}$/', $key) || !valid_value($value) || !in_array($mode, ['single', 'pair'], true)) {
            $db->rollBack();
            reply(['error' => 'Invalid move'], 400);
        }
        if (count($room['events']) >= MAX_EVENTS) {
            $db->rollBack();
            reply(['error' => 'Room is full of moves, start a new one'], 409);
        }

        $done = false;
        foreach ($room['events'] as $e) {
            if ($e['key'] === $key) {
                $done = true;
                break;
            }
        }

        if (!$done) {
            if ($mode === 'single') {
                $room['events'][] = ['key' => $key, 'seat' => $seat, 'value' => $value];
            } else {
                if (!isset($room['pending'][$key]["s$seat"])) {
                    $room['pending'][$key]["s$seat"] = $value;
                }
                $p = $room['pending'][$key];
                if (isset($p['s0'], $p['s1'])) {
                    $room['events'][] = ['key' => $key, 'values' => [$p['s0'], $p['s1']]];
                    unset($room['pending'][$key]);
                }
            }
        }
    }

    save($db, $room);
    $db->commit();
    reply(view($room, $seat));
} catch (Throwable $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    reply(['error' => 'Server error'], 500);
}
