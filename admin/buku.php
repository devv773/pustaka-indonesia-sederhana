<?php
require_once '../config/session.php';
require_once '../config/database.php';

requireAdmin();

$database = new Database();
$db = $database->getConnection();

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (isset($_POST['action'])) {
        switch ($_POST['action']) {
            case 'add':
                $query = "INSERT INTO buku (judul, pengarang, penerbit, tahun_terbit, isbn, stok, tersedia, kategori, deskripsi) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
                $stmt = $db->prepare($query);
                $stok = (int)$_POST['stok'];
                if ($stmt->execute([$_POST['judul'], $_POST['pengarang'], $_POST['penerbit'], $_POST['tahun_terbit'], $_POST['isbn'], $stok, $stok, $_POST['kategori'], $_POST['deskripsi']])) {
                    $_SESSION['success'] = 'Buku berhasil ditambahkan';
                } else {
                    $_SESSION['error'] = 'Gagal menambahkan buku';
                }
                break;
                
            case 'edit':
                $query = "UPDATE buku SET judul=?, pengarang=?, penerbit=?, tahun_terbit=?, isbn=?, stok=?, kategori=?, deskripsi=? WHERE id=?";
                $stmt = $db->prepare($query);
                if ($stmt->execute([$_POST['judul'], $_POST['pengarang'], $_POST['penerbit'], $_POST['tahun_terbit'], $_POST['isbn'], $_POST['stok'], $_POST['kategori'], $_POST['deskripsi'], $_POST['id']])) {
                    $_SESSION['success'] = 'Buku berhasil diperbarui';
                } else {
                    $_SESSION['error'] = 'Gagal memperbarui buku';
                }
                break;
                
            case 'delete':
                $query = "DELETE FROM buku WHERE id=?";
                $stmt = $db->prepare($query);
                if ($stmt->execute([$_POST['id']])) {
                    $_SESSION['success'] = 'Buku berhasil dihapus';
                } else {
                    $_SESSION['error'] = 'Gagal menghapus buku';
                }
                break;
        }
        header('Location: buku.php');
        exit();
    }
}

// Get all books
$query = "SELECT * FROM buku ORDER BY judul";
$stmt = $db->prepare($query);
$stmt->execute();
$books = $stmt->fetchAll(PDO::FETCH_ASSOC);

$page_title = 'Kelola Buku - Admin';
include '../includes/header.php';
?>

<!-- Header -->
<header class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
            <div class="flex items-center space-x-3">
                <a href="dashboard.php" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-arrow-left"></i>
                </a>
                <div class="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                    <i class="fas fa-book text-white"></i>
                </div>
                <div>
                    <h1 class="text-xl font-bold text-gray-900">Kelola Buku</h1>
                    <p class="text-sm text-gray-500">Pustaka Indonesia</p>
                </div>
            </div>
            
            <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">
                    <strong><?php echo $_SESSION['nama']; ?></strong>
                </span>
                <a href="../logout.php" class="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-50">
                    <i class="fas fa-sign-out-alt mr-2"></i>Keluar
                </a>
            </div>
        </div>
    </div>
</header>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-lg font-semibold">Daftar Buku</h2>
                    <p class="text-gray-600">Kelola koleksi buku perpustakaan</p>
                </div>
                <button onclick="openModal('add')" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center space-x-2">
                    <i class="fas fa-plus"></i>
                    <span>Tambah Buku</span>
                </button>
            </div>
        </div>
        
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pengarang</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tersedia</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <?php foreach ($books as $book): ?>
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div>
                                <div class="text-sm font-medium text-gray-900"><?php echo htmlspecialchars($book['judul']); ?></div>
                                <div class="text-sm text-gray-500">ISBN: <?php echo htmlspecialchars($book['isbn']); ?></div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><?php echo htmlspecialchars($book['pengarang']); ?></td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><?php echo htmlspecialchars($book['kategori']); ?></td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><?php echo $book['stok']; ?></td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><?php echo $book['tersedia']; ?></td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button onclick="editBook(<?php echo htmlspecialchars(json_encode($book)); ?>)" class="text-indigo-600 hover:text-indigo-900">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteBook(<?php echo $book['id']; ?>, '<?php echo htmlspecialchars($book['judul']); ?>')" class="text-red-600 hover:text-red-900">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Modal -->
<div id="bookModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden">
    <div class="flex items-center justify-center min-h-screen p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div class="p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 id="modalTitle" class="text-lg font-semibold">Tambah Buku</h3>
                    <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="bookForm" method="POST">
                    <input type="hidden" name="action" id="formAction" value="add">
                    <input type="hidden" name="id" id="bookId">
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Judul Buku *</label>
                            <input type="text" name="judul" id="judul" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Pengarang *</label>
                            <input type="text" name="pengarang" id="pengarang" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Penerbit *</label>
                            <input type="text" name="penerbit" id="penerbit" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Tahun Terbit</label>
                            <input type="number" name="tahun_terbit" id="tahun_terbit" min="1900" max="<?php echo date('Y'); ?>" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">ISBN</label>
                            <input type="text" name="isbn" id="isbn" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Jumlah Stok</label>
                            <input type="number" name="stok" id="stok" min="1" value="1" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                        </div>
                    </div>
                    
                    <div class="mt-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                        <input type="text" name="kategori" id="kategori" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                    </div>
                    
                    <div class="mt-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                        <textarea name="deskripsi" id="deskripsi" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"></textarea>
                    </div>
                    
                    <div class="flex space-x-2 mt-6">
                        <button type="submit" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex-1">
                            <span id="submitText">Tambah Buku</span>
                        </button>
                        <button type="button" onclick="closeModal()" class="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md flex-1">
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
function openModal(action) {
    document.getElementById('bookModal').classList.remove('hidden');
    if (action === 'add') {
        document.getElementById('modalTitle').textContent = 'Tambah Buku';
        document.getElementById('submitText').textContent = 'Tambah Buku';
        document.getElementById('formAction').value = 'add';
        document.getElementById('bookForm').reset();
    }
}

function closeModal() {
    document.getElementById('bookModal').classList.add('hidden');
}

function editBook(book) {
    document.getElementById('modalTitle').textContent = 'Edit Buku';
    document.getElementById('submitText').textContent = 'Perbarui Buku';
    document.getElementById('formAction').value = 'edit';
    document.getElementById('bookId').value = book.id;
    document.getElementById('judul').value = book.judul;
    document.getElementById('pengarang').value = book.pengarang;
    document.getElementById('penerbit').value = book.penerbit;
    document.getElementById('tahun_terbit').value = book.tahun_terbit;
    document.getElementById('isbn').value = book.isbn;
    document.getElementById('stok').value = book.stok;
    document.getElementById('kategori').value = book.kategori;
    document.getElementById('deskripsi').value = book.deskripsi;
    document.getElementById('bookModal').classList.remove('hidden');
}

function deleteBook(id, title) {
    Swal.fire({
        title: 'Hapus Buku?',
        text: `Apakah Anda yakin ingin menghapus buku "${title}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.innerHTML = `
                <input type="hidden" name="action" value="delete">
                <input type="hidden" name="id" value="${id}">
            `;
            document.body.appendChild(form);
            form.submit();
        }
    });
}
</script>

<?php include '../includes/footer.php'; ?>