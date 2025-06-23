
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Buku {
  id: string;
  judul: string;
  pengarang: string;
  penerbit: string;
  tahunTerbit: number;
  isbn: string;
  stok: number;
  tersedia: number;
  kategori: string;
  deskripsi: string;
}

export interface Anggota {
  id: string;
  nama: string;
  email: string;
  noAnggota: string;
  alamat: string;
  noTelepon: string;
  tanggalDaftar: string;
}

export interface Peminjaman {
  id: string;
  idAnggota: string;
  idBuku: string;
  tanggalPinjam: string;
  tanggalKembali: string;
  status: 'dipinjam' | 'dikembalikan' | 'terlambat';
  denda?: number;
}

interface PustakaContextType {
  daftarBuku: Buku[];
  daftarAnggota: Anggota[];
  daftarPeminjaman: Peminjaman[];
  tambahBuku: (buku: Omit<Buku, 'id'>) => void;
  editBuku: (id: string, buku: Partial<Buku>) => void;
  hapusBuku: (id: string) => void;
  tambahAnggota: (anggota: Omit<Anggota, 'id'>) => void;
  editAnggota: (id: string, anggota: Partial<Anggota>) => void;
  hapusAnggota: (id: string) => void;
  pinjamBuku: (idAnggota: string, idBuku: string) => boolean;
  kembalikanBuku: (idPeminjaman: string) => boolean;
  hitungDenda: (tanggalKembali: string) => number;
  getPeminjamanTerlambat: () => Peminjaman[];
}

const PustakaContext = createContext<PustakaContextType | undefined>(undefined);

export const usePustaka = () => {
  const context = useContext(PustakaContext);
  if (context === undefined) {
    throw new Error('usePustaka harus digunakan dalam PustakaProvider');
  }
  return context;
};

export const PustakaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [daftarBuku, setDaftarBuku] = useState<Buku[]>([]);
  const [daftarAnggota, setDaftarAnggota] = useState<Anggota[]>([]);
  const [daftarPeminjaman, setDaftarPeminjaman] = useState<Peminjaman[]>([]);

  useEffect(() => {
    // Inisialisasi data contoh
    const bukuContoh: Buku[] = [
      {
        id: '1',
        judul: 'Laskar Pelangi',
        pengarang: 'Andrea Hirata',
        penerbit: 'Bentang Pustaka',
        tahunTerbit: 2005,
        isbn: '978-979-3062-79-2',
        stok: 5,
        tersedia: 3,
        kategori: 'Novel',
        deskripsi: 'Novel tentang perjuangan anak-anak di Belitung untuk mendapatkan pendidikan.'
      },
      {
        id: '2',
        judul: 'Bumi Manusia',
        pengarang: 'Pramoedya Ananta Toer',
        penerbit: 'Hasta Mitra',
        tahunTerbit: 1980,
        isbn: '978-979-419-019-7',
        stok: 3,
        tersedia: 2,
        kategori: 'Novel Sejarah',
        deskripsi: 'Novel pertama dari Tetralogi Buru yang mengisahkan kehidupan di masa kolonial.'
      },
      {
        id: '3',
        judul: 'Negeri 5 Menara',
        pengarang: 'Ahmad Fuadi',
        penerbit: 'Gramedia',
        tahunTerbit: 2009,
        isbn: '978-979-22-4767-2',
        stok: 4,
        tersedia: 4,
        kategori: 'Novel',
        deskripsi: 'Kisah inspiratif tentang persahabatan dan pendidikan di pesantren.'
      }
    ];

    const anggotaContoh: Anggota[] = [
      {
        id: '2',
        nama: 'Budi Santoso',
        email: 'budi@email.com',
        noAnggota: 'A001',
        alamat: 'Jl. Merdeka No. 123, Jakarta',
        noTelepon: '081234567890',
        tanggalDaftar: '2024-01-15'
      },
      {
        id: '3',
        nama: 'Siti Aminah',
        email: 'siti@email.com',
        noAnggota: 'A002',
        alamat: 'Jl. Sudirman No. 456, Bandung',
        noTelepon: '081234567891',
        tanggalDaftar: '2024-02-20'
      }
    ];

    setDaftarBuku(bukuContoh);
    setDaftarAnggota(anggotaContoh);
  }, []);

  const hitungDenda = (tanggalKembali: string): number => {
    const today = new Date();
    const dueDate = new Date(tanggalKembali);
    const diffTime = today.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return diffDays * 1000; // Denda Rp 1.000 per hari
    }
    
    return 0;
  };

  const getPeminjamanTerlambat = (): Peminjaman[] => {
    const today = new Date().toISOString().split('T')[0];
    return daftarPeminjaman.filter(p => 
      p.status === 'dipinjam' && p.tanggalKembali < today
    );
  };

  const tambahBuku = (buku: Omit<Buku, 'id'>) => {
    const bukuBaru: Buku = {
      ...buku,
      id: Date.now().toString(),
      tersedia: buku.stok
    };
    setDaftarBuku(prev => [...prev, bukuBaru]);
  };

  const editBuku = (id: string, buku: Partial<Buku>) => {
    setDaftarBuku(prev => prev.map(b => b.id === id ? { ...b, ...buku } : b));
  };

  const hapusBuku = (id: string) => {
    setDaftarBuku(prev => prev.filter(b => b.id !== id));
  };

  const tambahAnggota = (anggota: Omit<Anggota, 'id'>) => {
    const anggotaBaru: Anggota = {
      ...anggota,
      id: Date.now().toString()
    };
    setDaftarAnggota(prev => [...prev, anggotaBaru]);
  };

  const editAnggota = (id: string, anggota: Partial<Anggota>) => {
    setDaftarAnggota(prev => prev.map(a => a.id === id ? { ...a, ...anggota } : a));
  };

  const hapusAnggota = (id: string) => {
    setDaftarAnggota(prev => prev.filter(a => a.id !== id));
  };

  const pinjamBuku = (idAnggota: string, idBuku: string): boolean => {
    const buku = daftarBuku.find(b => b.id === idBuku);
    if (!buku || buku.tersedia <= 0) return false;

    const peminjamanBaru: Peminjaman = {
      id: Date.now().toString(),
      idAnggota,
      idBuku,
      tanggalPinjam: new Date().toISOString().split('T')[0],
      tanggalKembali: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'dipinjam'
    };

    setDaftarPeminjaman(prev => [...prev, peminjamanBaru]);
    setDaftarBuku(prev => prev.map(b => 
      b.id === idBuku ? { ...b, tersedia: b.tersedia - 1 } : b
    ));

    return true;
  };

  const kembalikanBuku = (idPeminjaman: string): boolean => {
    const peminjaman = daftarPeminjaman.find(p => p.id === idPeminjaman);
    if (!peminjaman || peminjaman.status !== 'dipinjam') return false;

    const denda = hitungDenda(peminjaman.tanggalKembali);
    const status: 'dikembalikan' | 'terlambat' = denda > 0 ? 'terlambat' : 'dikembalikan';

    setDaftarPeminjaman(prev => prev.map(p => 
      p.id === idPeminjaman ? { 
        ...p, 
        status: status,
        denda: denda > 0 ? denda : undefined
      } : p
    ));
    
    setDaftarBuku(prev => prev.map(b => 
      b.id === peminjaman.idBuku ? { ...b, tersedia: b.tersedia + 1 } : b
    ));

    return true;
  };

  return (
    <PustakaContext.Provider value={{
      daftarBuku,
      daftarAnggota,
      daftarPeminjaman,
      tambahBuku,
      editBuku,
      hapusBuku,
      tambahAnggota,
      editAnggota,
      hapusAnggota,
      pinjamBuku,
      kembalikanBuku,
      hitungDenda,
      getPeminjamanTerlambat
    }}>
      {children}
    </PustakaContext.Provider>
  );
};
