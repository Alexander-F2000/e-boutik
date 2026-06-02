<?php
$uri = $_SERVER['REQUEST_URI'];
$path = parse_url($uri, PHP_URL_PATH);
$root = __DIR__;

file_put_contents($root . '/router.log', date('H:i:s') . " URI=$uri PATH=$path ROOT=$root\n", FILE_APPEND);

// API routing
if (strpos($path, '/api/') === 0) {
    $apiFile = dirname(__DIR__) . '/backend' . $path;
    if (file_exists($apiFile)) {
        require $apiFile;
        return true;
    }
    http_response_code(404);
    echo json_encode(['error' => 'API not found', 'file' => $apiFile]);
    return true;
}

// Static files
if ($path === '/') $path = '/index.html';
$file = $root . str_replace('/', DIRECTORY_SEPARATOR, $path);
file_put_contents($root . '/router.log', "CHECK file=$file exists=" . (file_exists($file) ? 'YES' : 'NO') . "\n", FILE_APPEND);

if (file_exists($file) && is_file($file)) {
    $ext = pathinfo($file, PATHINFO_EXTENSION);
    $mime = [
        'html' => 'text/html', 'css' => 'text/css', 'js' => 'application/javascript',
        'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png',
        'webp' => 'image/webp', 'gif' => 'image/gif',
    ];
    if (isset($mime[$ext])) header('Content-Type: ' . $mime[$ext]);
    readfile($file);
    return true;
}

http_response_code(404);
echo json_encode(['error' => 'Not found', 'path' => $path, 'file_check' => $file]);
return true;
