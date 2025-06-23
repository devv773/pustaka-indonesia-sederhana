-- Database Schema untuk Sistem Perpustakaan
CREATE DATABASE IF NOT EXISTS pustaka_indonesia;
USE pustaka_indonesia;

-- Tabel pengguna (admin dan anggota)
CREATE TABLE pengguna (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'anggota') NOT NULL,
    no_anggota VARCHAR(20) NULL,
    alamat TEXT NULL,
    no_telepon VARCHAR(20) NULL,
    tanggal_daftar DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel buku
CREATE TABLE buku (
    id INT AUTO_INCREMENT PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    pengarang VARCHAR(255) NOT NULL,
    penerbit VARCHAR(255) NOT NULL,
    tahun_terbit YEAR NOT NULL,
    isbn VARCHAR(20) NULL,
    stok INT NOT NULL DEFAULT 1,
    tersedia INT NOT NULL DEFAULT 1,
    kategori VARCHAR(100) NULL,
    deskripsi TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel peminjaman
CREATE TABLE peminjaman (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_anggota INT NOT NULL,
    id_buku INT NOT NULL,
    tanggal_pinjam DATE NOT NULL DEFAULT CURRENT_DATE,
    tanggal_kembali DATE NOT NULL,
    tanggal_dikembalikan DATE NULL,
    status ENUM('dipinjam', 'dikembalikan', 'terlambat') NOT NULL DEFAULT 'dipinjam',
    denda DECIMAL(10,2) NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_anggota) REFERENCES pengguna(id) ON DELETE CASCADE,
    FOREIGN KEY (id_buku) REFERENCES buku(id) ON DELETE CASCADE
);

-- Insert data admin default
INSERT INTO pengguna (nama, email, password, role) VALUES 
('Administrator', 'admin@pustaka.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Insert data anggota contoh
INSERT INTO pengguna (nama, email, password, role, no_anggota, alamat, no_telepon) VALUES 
('Budi Santoso', 'budi@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'anggota', 'A001', 'Jl. Merdeka No. 123, Jakarta', '081234567890'),
('Siti Aminah', 'siti@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'anggota', 'A002', 'Jl. Sudirman No. 456, Bandung', '081234567891');

-- Insert data buku contoh
INSERT INTO buku (judul, pengarang, penerbit, tahun_terbit, isbn, stok, tersedia, kategori, deskripsi) VALUES 
('Laskar Pelangi', 'Andrea Hirata', 'Bentang Pustaka', 2005, '978-979-3062-79-2', 5, 3, 'Novel', 'Novel tentang perjuangan anak-anak di Belitung untuk mendapatkan pendidikan.'),
('Bumi Manusia', 'Pramoedya Ananta Toer', 'Hasta Mitra', 1980, '978-979-419-019-7', 3, 2, 'Novel Sejarah', 'Novel pertama dari Tetralogi Buru yang mengisahkan kehidupan di masa kolonial.'),
('Negeri 5 Menara', 'Ahmad Fuadi', 'Gramedia', 2009, '978-979-22-4767-2', 4, 4, 'Novel', 'Kisah inspiratif tentang persahabatan dan pendidikan di pesantren.');

-- Password untuk semua akun adalah: password123