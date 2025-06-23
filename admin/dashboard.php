<?php
require_once '../config/session.php';
require_once '../config/database.php';

requireAdmin();

$database = new Database();
$db = $database->getConnection();

// Get statistics
$stats_query = "
    SELECT 
        (SELECT COUNT(*) FROM buku) as total_buku,
        (SELECT COUNT(*) FROM pengguna WHERE role = 'anggota') as total_anggota,
        (SELECT COUNT(*) FROM peminjaman WHERE status = 'dipinjam') as buku_dipinjam,
        (SELECT COUNT(*) FROM peminjaman WHERE status = 'dipinjam' AND tanggal_kembali < CURDATE()) as terlambat,
        (SELECT SUM(tersedia) FROM buku) as buku_tersedia
";
$stats_stmt = $db->prepare($stats_query);
$stats_stmt->execute();
$stats = $stats_stmt->fetch(PDO::FETCH_ASSOC);

// Get monthly statistics
$monthly_query = "
    SELECT 
        MONTH(tanggal_pinjam) as bulan,
        MONTHNAME(tanggal_pinjam) as nama_bulan,
        COUNT(*) as jumlah
    FROM peminjaman 
    WHERE YEAR(tanggal_pinjam) = YEAR(CURDATE())
    GROUP BY MONTH(tanggal_pinjam)
    ORDER BY MONTH(tanggal_pinjam)
";
$monthly_stmt = $db->prepare($monthly_query);
$monthly_stmt->execute();
$monthly_stats = $monthly_stmt->fetchAll(PDO::FETCH_ASSOC);

// Get most active members
$active_members_query = "
    SELECT 
        p.nama, p.no_anggota, COUNT(pm.id) as jumlah_peminjaman
    FROM pengguna p
    LEFT JOIN peminjaman pm ON p.id = pm.id_anggota
    WHERE p.role = 'anggota'
    GROUP BY p.id
    HAVING jumlah_peminjaman > 0
    ORDER BY jumlah_peminjaman DESC
    LIMIT 5
";
$active_stmt = $db->prepare($active_members_query);
$active_stmt->execute();
$active_members = $active_stmt->fetchAll(PDO::FETCH_ASSOC);

$page_title = 'Dashboard Admin - Pustaka Indonesia';
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
                    <p class="text-sm text-gray-500">Dashboard Admin</p>
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
    <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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
                <i class="fas fa-users text-green-600 text-2xl"></i>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Total Anggota</p>
                    <p class="text-2xl font-bold text-gray-900"><?php echo $stats['total_anggota']; ?></p>
                </div>
            </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
                <i class="fas fa-bookmark text-orange-600 text-2xl"></i>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Buku Dipinjam</p>
                    <p class="text-2xl font-bold text-gray-900"><?php echo $stats['buku_dipinjam']; ?></p>
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
                <i class="fas fa-book-open text-purple-600 text-2xl"></i>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-600">Buku Tersedia</p>
                    <p class="text-2xl font-bold text-gray-900"><?php echo $stats['buku_tersedia']; ?></p>
                </div>
            </div>
        </div>
    </div>

    <!-- Charts and Analytics -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Monthly Statistics -->
        <div class="bg-white rounded-lg shadow">
            <div class="p-6 border-b">
                <h3 class="text-lg font-semibold flex items-center">
                    <i class="fas fa-chart-line text-blue-600 mr-2"></i>
                    Aktivitas Peminjaman Bulanan
                </h3>
                <p class="text-gray-600 text-sm">Grafik peminjaman buku per bulan</p>
            </div>
            <div class="p-6">
                <canvas id="monthlyChart" width="400" height="200"></canvas>
            </div>
        </div>

        <!-- Most Active Members -->
        <div class="bg-white rounded-lg shadow">
            <div class="p-6 border-b">
                <h3 class="text-lg font-semibold flex items-center">
                    <i class="fas fa-users text-green-600 mr-2"></i>
                    Anggota Paling Aktif
                </h3>
                <p class="text-gray-600 text-sm">5 anggota dengan peminjaman terbanyak</p>
            </div>
            <div class="p-6">
                <div class="space-y-4">
                    <?php if (count($active_members) > 0): ?>
                        <?php foreach ($active_members as $index => $member): ?>
                            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div class="flex items-center space-x-3">
                                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold
                                        <?php echo $index === 0 ? 'bg-yellow-500' : ($index === 1 ? 'bg-gray-400' : ($index === 2 ? 'bg-orange-500' : 'bg-blue-500')); ?>">
                                        <?php echo $index + 1; ?>
                                    </div>
                                    <div>
                                        <p class="font-medium text-gray-900"><?php echo htmlspecialchars($member['nama']); ?></p>
                                        <p class="text-sm text-gray-500"><?php echo htmlspecialchars($member['no_anggota']); ?></p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="font-bold text-lg text-red-600"><?php echo $member['jumlah_peminjaman']; ?></p>
                                    <p class="text-xs text-gray-500">peminjaman</p>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <div class="text-center py-8">
                            <i class="fas fa-users text-gray-400 text-4xl mb-4"></i>
                            <p class="text-gray-500">Belum ada data peminjaman</p>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="bg-white rounded-lg shadow">
        <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8 px-6">
                <a href="#" onclick="showTab('buku')" id="tab-buku" class="tab-link border-red-500 text-red-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                    Kelola Buku
                </a>
                <a href="#" onclick="showTab('anggota')" id="tab-anggota" class="tab-link border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                    Kelola Anggota
                </a>
                <a href="#" onclick="showTab('peminjaman')" id="tab-peminjaman" class="tab-link border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                    Data Peminjaman
                </a>
                <a href="#" onclick="showTab('pengembalian')" id="tab-pengembalian" class="tab-link border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                    Pengembalian
                </a>
            </nav>
        </div>
        
        <!-- Tab Contents -->
        <div id="content-buku" class="tab-content p-6">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h3 class="text-lg font-semibold">Daftar Buku</h3>
                    <p class="text-gray-600">Kelola koleksi buku perpustakaan</p>
                </div>
                <a href="buku.php" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center space-x-2">
                    <i class="fas fa-plus"></i>
                    <span>Kelola Buku</span>
                </a>
            </div>
            <p class="text-gray-600">Klik "Kelola Buku" untuk mengelola data buku.</p>
        </div>
        
        <div id="content-anggota" class="tab-content p-6 hidden">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h3 class="text-lg font-semibold">Daftar Anggota</h3>
                    <p class="text-gray-600">Kelola data anggota perpustakaan</p>
                </div>
                <a href="anggota.php" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center space-x-2">
                    <i class="fas fa-plus"></i>
                    <span>Kelola Anggota</span>
                </a>
            </div>
            <p class="text-gray-600">Klik "Kelola Anggota" untuk mengelola data anggota.</p>
        </div>
        
        <div id="content-peminjaman" class="tab-content p-6 hidden">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h3 class="text-lg font-semibold">Data Peminjaman</h3>
                    <p class="text-gray-600">Monitoring peminjaman dan pengembalian buku</p>
                </div>
                <a href="peminjaman.php" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center space-x-2">
                    <i class="fas fa-eye"></i>
                    <span>Lihat Data</span>
                </a>
            </div>
            <p class="text-gray-600">Klik "Lihat Data" untuk melihat data peminjaman.</p>
        </div>
        
        <div id="content-pengembalian" class="tab-content p-6 hidden">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h3 class="text-lg font-semibold">Pengembalian Buku</h3>
                    <p class="text-gray-600">Kelola pengembalian buku</p>
                </div>
                <a href="pengembalian.php" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center space-x-2">
                    <i class="fas fa-undo"></i>
                    <span>Kelola Pengembalian</span>
                </a>
            </div>
            <p class="text-gray-600">Klik "Kelola Pengembalian" untuk mengelola pengembalian buku.</p>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
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

// Monthly chart
const monthlyData = <?php echo json_encode($monthly_stats); ?>;
const ctx = document.getElementById('monthlyChart').getContext('2d');
new Chart(ctx, {
    type: 'line',
    data: {
        labels: monthlyData.map(item => item.nama_bulan || 'Bulan ' + item.bulan),
        datasets: [{
            label: 'Jumlah Peminjaman',
            data: monthlyData.map(item => item.jumlah),
            borderColor: '#dc2626',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            borderWidth: 2,
            fill: true
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
</script>

<?php include '../includes/footer.php'; ?>