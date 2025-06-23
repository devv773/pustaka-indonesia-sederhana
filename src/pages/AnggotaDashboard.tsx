
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePustaka } from '@/contexts/PustakaContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BookOpen, LogOut, Search, BookMarked, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const AnggotaDashboard = () => {
  const { pengguna, logout } = useAuth();
  const { daftarBuku, daftarAnggota, daftarPeminjaman, pinjamBuku, kembalikanBuku } = usePustaka();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'katalog' | 'peminjaman'>('katalog');

  const handleLogout = () => {
    logout();
    toast.success('Berhasil keluar');
  };

  const handlePinjamBuku = (idBuku: string) => {
    if (!pengguna) return;
    
    const berhasil = pinjamBuku(pengguna.id, idBuku);
    if (berhasil) {
      toast.success('Buku berhasil dipinjam!');
    } else {
      toast.error('Gagal meminjam buku. Stok mungkin habis.');
    }
  };

  const handleKembalikanBuku = (idPeminjaman: string) => {
    const berhasil = kembalikanBuku(idPeminjaman);
    if (berhasil) {
      toast.success('Buku berhasil dikembalikan!');
    } else {
      toast.error('Gagal mengembalikan buku.');
    }
  };

  const bukuTerfilter = daftarBuku.filter(buku =>
    buku.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
    buku.pengarang.toLowerCase().includes(searchTerm.toLowerCase()) ||
    buku.kategori.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const peminjamanSaya = pengguna 
    ? daftarPeminjaman.filter(p => p.idAnggota === pengguna.id)
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Pustaka Indonesia</h1>
                <p className="text-sm text-gray-500">Portal Anggota</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Selamat datang, <strong>{pengguna?.nama}</strong>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Buku</p>
                  <p className="text-2xl font-bold text-gray-900">{daftarBuku.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookMarked className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sedang Dipinjam</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {peminjamanSaya.filter(p => p.status === 'dipinjam').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Dipinjam</p>
                  <p className="text-2xl font-bold text-gray-900">{peminjamanSaya.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6">
          <Button
            variant={activeTab === 'katalog' ? 'default' : 'outline'}
            onClick={() => setActiveTab('katalog')}
            className={activeTab === 'katalog' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            Katalog Buku
          </Button>
          <Button
            variant={activeTab === 'peminjaman' ? 'default' : 'outline'}
            onClick={() => setActiveTab('peminjaman')}
            className={activeTab === 'peminjaman' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            Peminjaman Saya
          </Button>
        </div>

        {/* Katalog Buku */}
        {activeTab === 'katalog' && (
          <div className="space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Cari buku berdasarkan judul, pengarang, atau kategori..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Daftar Buku */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bukuTerfilter.map((buku) => (
                <Card key={buku.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{buku.judul}</CardTitle>
                    <CardDescription>
                      <div className="space-y-1">
                        <p><strong>Pengarang:</strong> {buku.pengarang}</p>
                        <p><strong>Penerbit:</strong> {buku.penerbit}</p>
                        <p><strong>Tahun:</strong> {buku.tahunTerbit}</p>
                        <p><strong>Kategori:</strong> {buku.kategori}</p>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">{buku.deskripsi}</p>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          <span className={`px-2 py-1 rounded-full ${
                            buku.tersedia > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {buku.tersedia > 0 ? `Tersedia: ${buku.tersedia}` : 'Tidak Tersedia'}
                          </span>
                        </div>
                        
                        <Button
                          size="sm"
                          onClick={() => handlePinjamBuku(buku.id)}
                          disabled={buku.tersedia === 0}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Pinjam
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {bukuTerfilter.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Tidak ada buku ditemukan
                  </h3>
                  <p className="text-gray-500">
                    Coba ubah kata kunci pencarian Anda
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Peminjaman Saya */}
        {activeTab === 'peminjaman' && (
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Peminjaman</CardTitle>
              <CardDescription>Daftar buku yang pernah atau sedang Anda pinjam</CardDescription>
            </CardHeader>
            <CardContent>
              {peminjamanSaya.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">Buku</th>
                        <th className="text-left p-4 font-medium">Tanggal Pinjam</th>
                        <th className="text-left p-4 font-medium">Tanggal Kembali</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {peminjamanSaya.map((peminjaman) => {
                        const buku = daftarBuku.find(b => b.id === peminjaman.idBuku);
                        
                        return (
                          <tr key={peminjaman.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">{buku?.judul || 'Unknown'}</td>
                            <td className="p-4">{peminjaman.tanggalPinjam}</td>
                            <td className="p-4">{peminjaman.tanggalKembali}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                peminjaman.status === 'dipinjam' 
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : peminjaman.status === 'dikembalikan'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {peminjaman.status === 'dipinjam' ? 'Sedang Dipinjam' : 
                                 peminjaman.status === 'dikembalikan' ? 'Dikembalikan' : 'Terlambat'}
                              </span>
                            </td>
                            <td className="p-4">
                              {peminjaman.status === 'dipinjam' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleKembalikanBuku(peminjaman.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Kembalikan
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Tidak ada riwayat peminjaman
                  </h3>
                  <p className="text-gray-500">
                    Mulai pinjam buku dari katalog untuk melihat riwayat di sini
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AnggotaDashboard;
