<?php
require_once 'config/session.php';

if (!isLoggedIn()) {
    header('Location: login.php');
    exit();
}

if (isAdmin()) {
    header('Location: admin/dashboard.php');
} else {
    header('Location: anggota/dashboard.php');
}
exit();
?>