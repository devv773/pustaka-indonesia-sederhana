<?php
require_once '../config/session.php';
require_once '../config/database.php';

requireAnggota();

$database = new Database();
$db = $database->getConnection();

$user_id = $_SESSION['user_id'];

// Handle book borrowing
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['action']) && $_POST['action'] == 'pinjam') {
    $id_buku = $_POST['id_buku'];
    $tanggal_kembali = $_POST['tanggal_kembali'];
    
    // Check if book is available
    $check_query = "SELECT tersedia FROM buku WHERE id = ?";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->execute([$id_buku]);
    $book = $check_stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($book && $book['tersedia'] > 0) {
        // Insert borrowing record
        $insert_query = "INSERT INTO peminjaman (id_anggota, id_buku, tanggal_kembali) VALUES (?, ?, ?)";
        $insert_stmt = $db->prepare($insert_query);
        
        if ($insert_stmt->execute([$user_id, $id_buku, $tanggal_kembali])) {
            // Update book availability
            $update_query = "UPDATE buku SET tersedia = tersedia - 1 WHERE id = ?";
            $update_stmt = $db->prepare($update_query);
            $update_stmt->execute([$id_buku]);
            
            $_SESSION['success'] = 'Buku berhasil dipinjam!';
        } else {
            $_SESSION['error'] = 'Gagal meminjam buku';
        }
    } else {
        $_SESSION['error'] = 'Buku tidak tersedia';
    }
    
    header('Location: dashboard.php');
    exit();
}

// Get statistics
$stats_query = "
    SELECT 
        (SELECT COUNT(*) FROM buku) as total_buku,
        (SELECT COUNT(*) FROM peminjaman WHERE id_anggota = ? AND status = 'dipinjam') as sedang_dipinjam,
        (SELECT COUNT(*) FROM peminjaman WHERE id_anggota = ? AND status = 'dipinjam' AND tanggal_kembali < CURDATE()) as terlambat,
        (SELECT COUNT(*) FROM peminjaman WHERE id_anggota = ?) as total_dipinjam
";
$stats_stmt = $db->prepare($stats_query);
$stats_stmt->execute([$user_id, $user_id, $user_id]);
$stats = $stats_stmt->fetch(PDO::FETCH_ASSOC);

// Get books
$search = isset($_GET['search']) ? $_GET['search'] : '';
$books_query = "SELECT * FROM buku WHERE judul LIKE ? OR pengarang LIKE ? OR kategori LIKE ? ORDER BY judul";
$books_stmt = $db->prepare($books_query);
$search_param = "%$search%";
$books_stmt->execute([$search_param, $search_param, $search_param]);
$books = $books_stmt->fetchAll(PDO::FETCH_ASSOC);

// Get user's borrowings
$borrowings_query = "
    SELECT p.*, b.judul, b.pengarang 
    FROM peminjaman p 
    JOIN buku b ON p.id_buku = b.id 
    WHERE p.id_anggota = ? 
    ORDER BY p.tanggal_pinjam DESC
";
$borrowings_stmt = $db->prepare($borrowings_query);
$borrowings_stmt->execute([$user_id]);
$borrowings = $borrowings_stmt->fetchAll(PDO::FETCH_ASSOC);

$page_title = 'Dashboard Anggota - Pustaka Indonesia';
include '../includes/header.php';
?>

<!-- Header -->
<header class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
            <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                    <i class="fas fa-book text-white"></i>
                </div>
                <div>
                    <h1 class="text-xl font-bold text-gray-900">Pustaka Indonesia</h1>
                    <p class="text-sm text-gray-500">Portal Anggota</p>
                </div>
            </div>
            
            <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">
                    Selamat datang, <strong><?php echo $_SESSION['nama']; ?></strong>
                </span>
                <a href="../logout.php" class="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-50 flex items-center space-x-2">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Keluar</span>
                </a>
            </div>
        </div>
    </div>
</header>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <i class="fas fa-book text-blue-600 text-2xl"></i>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Total Buku</p>
                    <p class="text-2xl font-bold text-gray-900"><?php echo $stats['total_buku']; ?></p>
                </div>
            </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <i class="fas fa-bookmark text-orange-600 text-2xl"></i>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Sedang Dipinjam</p>
                    <p class="text-2xl font-bold text-gray-900"><?php echo $stats['sedang_dipinjam']; ?></p>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Terlambat</p>
                    <p class="text-2xl font-bold text-gray-900"><?php echo $stats['terlambat']; ?></p>
                </div>
            </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <i class="fas fa-check-circle text-green-600 text-2xl"></i>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Total Dipinjam</p>
                    <p class="text-2xl font-bold text-gray-900"><?php echo $stats['total_dipinjam']; ?></p>
                </div>
            </div>
        </div>
    </div>

    <!-- Alert for overdue books -->
    <?php if ($stats['terlambat'] > 0): ?>
    <div class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <div class="flex items-center space-x-3">
            <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
            <div>
                <h3 class="text-lg font-semibold text-red-800">Perhatian!</h3>
                <p class="text-red-700">
                    Anda memiliki <?php echo $stats['terlambat']; ?> buku yang terlambat dikembalikan. 
                    Segera kembalikan untuk menghindari denda tambahan.
                </p>
            </div>
        </div>
    </div>
    <?php endif; ?>

    <!-- Navigation Tabs -->
    <div class="bg-white rounded-lg shadow mb-6">
        <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8 px-6">
                <a href="#" onclick="showTab('katalog')" id="tab-katalog" class="tab-link border-red-500 text-red-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                    Katalog Buku
                </a>
                <a href="#" onclick="showTab('peminjaman')" id="tab-peminjaman" class="tab-link border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                    Peminjaman Saya
                </a>
            </nav>
        </div>
        
        <!-- Katalog Buku -->
        <div id="content-katalog" class="tab-content p-6">
            <!-- Search -->
            <div class="mb-6">
                <form method="GET" class="relative">
                    <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <input type="text" name="search" value="<?php echo htmlspecialchars($search); ?>" 
                           placeholder="Cari buku berdasarkan judul, pengarang, atau kategori..."
                           class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                </form>
            </div>

            <!-- Books Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <?php foreach ($books as $book): ?>
                <div class="bg-white border rounded-lg shadow hover:shadow-lg transition-shadow">
                    <div class="p-6">
                        <h3 class="text-lg font-semibold mb-2"><?php echo htmlspecialchars($book['judul']); ?></h3>
                        <div class="space-y-1 text-sm text-gray-600 mb-4">
                            <p><strong>Pengarang:</strong> <?php echo htmlspecialchars($book['pengarang']); ?></p>
                            <p><strong>Penerbit:</strong> <?php echo htmlspecialchars($book['penerbit']); ?></p>
                            <p><strong>Tahun:</strong> <?php echo $book['tahun_terbit']; ?></p>
                            <p><strong>Kategori:</strong> <?php echo htmlspecialchars($book['kategori']); ?></p>
                        </div>
                        
                        <p class="text-sm text-gray-600 mb-4"><?php echo htmlspecialchars($book['deskripsi']); ?></p>
                        
                        <div class="flex justify-between items-center">
                            <span class="px-2 py-1 rounded-full text-xs font-medium <?php echo $book['tersedia'] > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'; ?>">
                                <?php echo $book['tersedia'] > 0 ? "Tersedia: {$book['tersedia']}" : 'Tidak Tersedia'; ?>
                            </span>
                            
                            <button onclick="pinjamBuku(<?php echo $book['id']; ?>, '<?php echo htmlspecialchars($book['judul']); ?>')" 
                                    <?php echo $book['tersedia'] == 0 ? 'disabled' : ''; ?>
                                    class="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm">
                                Pinjam
                            </button>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>

            <?php if (count($books) == 0): ?>
            <div class="text-center py-12">
                <i class="fas fa-book text-gray-400 text-4xl mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Tidak ada buku ditemukan</h3>
                <p class="text-gray-500">Coba ubah kata kunci pencarian Anda</p>
            </div>
            <?php endif; ?>
        </div>
        
        <!-- Peminjaman Saya -->
        <div id="content-peminjaman" class="tab-content p-6 hidden">
            <?php if (count($borrowings) > 0): ?>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buku</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Pinjam</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Kembali</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Denda</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <?php foreach ($borrowings as $borrowing): ?>
                        <?php 
                        $is_overdue = $borrowing['status'] == 'dipinjam' && $borrowing['tanggal_kembali'] < date('Y-m-d');
                        $status_class = '';
                        $status_text = '';
                        
                        if ($borrowing['status'] == 'dipinjam') {
                            if ($is_overdue) {
                                $status_class = 'bg-red-100 text-red-800';
                                $status_text = 'Terlambat';
                            } else {
                                $status_class = 'bg-yellow-100 text-yellow-800';
                                $status_text = 'Sedang Dipinjam';
                            }
                        } elseif ($borrowing['status'] == 'dikembalikan') {
                            $status_class = 'bg-green-100 text-green-800';
                            $status_text = 'Dikembalikan';
                        } else {
                            $status_class = 'bg-red-100 text-red-800';
                            $status_text = 'Terlambat';
                        }
                        ?>
                        <tr class="hover:bg-gray-50 <?php echo $is_overdue ? 'bg-red-50' : ''; ?>">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div>
                                    <div class="text-sm font-medium text-gray-900"><?php echo htmlspecialchars($borrowing['judul']); ?></div>
                                    <div class="text-sm text-gray-500"><?php echo htmlspecialchars($borrowing['pengarang']); ?></div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><?php echo date('d/m/Y', strtotime($borrowing['tanggal_pinjam'])); ?></td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><?php echo date('d/m/Y', strtotime($borrowing['tanggal_kembali'])); ?></td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 py-1 rounded-full text-xs font-medium <?php echo $status_class; ?>">
                                    <?php echo $status_text; ?>
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <?php echo $borrowing['denda'] ? 'Rp ' . number_format($borrowing['denda'], 0, ',', '.') : '-'; ?>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
            <?php else: ?>
            <div class="text-center py-12">
                <i class="fas fa-clock text-gray-400 text-4xl mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Tidak ada riwayat peminjaman</h3>
                <p class="text-gray-500">Mulai pinjam buku dari katalog untuk melihat riwayat di sini</p>
            </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<!-- Borrow Modal -->
<div id="borrowModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden">
    <div class="flex items-center justify-center min-h-screen p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div class="p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">Pilih Tanggal Pengembalian</h3>
                    <button onclick="closeBorrowModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="borrowForm" method="POST">
                    <input type="hidden" name="action" value="pinjam">
                    <input type="hidden" name="id_buku" id="borrowBookId">
                    
                    <p class="text-gray-600 mb-4">Pilih tanggal pengembalian untuk buku: <strong id="borrowBookTitle"></strong></p>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal Pengembalian</label>
                        <input type="date" name="tanggal_kembali" id="tanggalKembali" required 
                               min="<?php echo date('Y-m-d', strtotime('+1 day')); ?>" 
                               max="<?php echo date('Y-m-d', strtotime('+30 days')); ?>"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                    </div>
                    
                    <div class="bg-blue-50 p-4 rounded-lg mb-4">
                        <div class="flex items-center space-x-2 text-blue-800">
                            <i class="fas fa-calendar"></i>
                            <span class="font-medium">Pastikan Anda mengembalikan buku tepat waktu untuk menghindari denda</span>
                        </div>
                    </div>
                    
                    <div class="flex space-x-2">
                        <button type="submit" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex-1">
                            Konfirmasi Peminjaman
                        </button>
                        <button type="button" onclick="closeBorrowModal()" class="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md flex-1">
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
// Tab functionality
function showTab(tabName) {
    // Hide all tab contents
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.add('hidden'));
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab-link');
    tabs.forEach(tab => {
        tab.classList.remove('border-red-500', 'text-red-600');
        tab.classList.add('border-transparent', 'text-gray-500');
    });
    
    // Show selected tab content
    document.getElementById('content-' + tabName).classList.remove('hidden');
    
    // Add active class to selected tab
    const activeTab = document.getElementById('tab-' + tabName);
    activeTab.classList.remove('border-transparent', 'text-gray-500');
    activeTab.classList.add('border-red-500', 'text-red-600');
}

function pinjamBuku(bookId, bookTitle) {
    document.getElementById('borrowBookId').value = bookId;
    document.getElementById('borrowBookTitle').textContent = bookTitle;
    document.getElementById('tanggalKembali').value = '<?php echo date('Y-m-d', strtotime('+14 days')); ?>';
    document.getElementById('borrowModal').classList.remove('hidden');
}

function closeBorrowModal() {
    document.getElementById('borrowModal').classList.add('hidden');
}
</script>

<?php include '../includes/footer.php'; ?>