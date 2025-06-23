<?php
require_once 'config/session.php';
require_once 'config/database.php';

if (isLoggedIn()) {
    header('Location: index.php');
    exit();
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = trim($_POST['email']);
    $password = $_POST['password'];
    
    if (empty($email) || empty($password)) {
        $error = 'Email dan password harus diisi';
    } else {
        $database = new Database();
        $db = $database->getConnection();
        
        $query = "SELECT id, nama, email, password, role, no_anggota FROM pengguna WHERE email = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$email]);
        
        if ($user = $stmt->fetch(PDO::FETCH_ASSOC)) {
            if (password_verify($password, $user['password'])) {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['nama'] = $user['nama'];
                $_SESSION['email'] = $user['email'];
                $_SESSION['role'] = $user['role'];
                $_SESSION['no_anggota'] = $user['no_anggota'];
                
                $_SESSION['success'] = 'Login berhasil!';
                header('Location: index.php');
                exit();
            } else {
                $error = 'Email atau password salah';
            }
        } else {
            $error = 'Email atau password salah';
        }
    }
}

$page_title = 'Login - Pustaka Indonesia';
include 'includes/header.php';
?>

<div class="min-h-screen gradient-indonesia flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white rounded-lg shadow-2xl">
        <div class="p-8">
            <div class="text-center mb-8">
                <div class="mx-auto w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
                    <i class="fas fa-book text-white text-2xl"></i>
                </div>
                <h1 class="text-2xl font-bold text-gray-800">Pustaka Indonesia</h1>
                <p class="text-gray-600">Sistem Perpustakaan Digital</p>
            </div>
            
            <?php if ($error): ?>
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <?php echo $error; ?>
                </div>
            <?php endif; ?>
            
            <form method="POST" class="space-y-4">
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div class="relative">
                        <i class="fas fa-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input type="email" id="email" name="email" required
                               class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                               placeholder="Masukkan email Anda" value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email']) : ''; ?>">
                    </div>
                </div>
                
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <div class="relative">
                        <i class="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input type="password" id="password" name="password" required
                               class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                               placeholder="Masukkan password Anda">
                    </div>
                </div>
                
                <button type="submit" class="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-200">
                    Masuk
                </button>
            </form>
            
            <div class="mt-6 pt-4 border-t border-gray-200">
                <div class="text-sm text-gray-600 space-y-2">
                    <p class="font-semibold">Akun Demo:</p>
                    <div class="space-y-1 text-xs">
                        <p><strong>Admin:</strong> admin@pustaka.id / password123</p>
                        <p><strong>Anggota:</strong> budi@email.com / password123</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include 'includes/footer.php'; ?>