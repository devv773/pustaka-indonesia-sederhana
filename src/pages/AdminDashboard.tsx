import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePustaka } from '@/contexts/PustakaContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Users, BookMarked, LogOut, Plus, Edit, Trash2, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import FormBuku from '@/components/FormBuku';
import FormAnggota from '@/components/FormAnggota';

const AdminDashboard = () => {
  const { pengguna, logout } = useAuth();
  const { 
    daftarBuku, 
    daftarAnggota, 
    daftarPeminjaman, 
    hapusBuku, 
    hapusAnggota, 
    kembalikanBuku,
    getPeminjamanTerlambat,
    hitungDenda,
    getStatistikBulanan,
    getAnggotaTerAktif
  } = usePustaka();
  const [showFormBuku, setShowFormBuku] = useState(false);
  const [showFormAnggota, setShowFormAnggota] = useState(false);
  const [editingBuku, setEditingBuku] = useState<string | null>(null);
  const [editingAnggota, setEditingAnggota] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    toast.success('Berhasil keluar');
  };

  const handleHapusBuku = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
      hapusBuku(id);
      toast.success('Buku berhasil dihapus');
    }
  };

  const handleHapusAnggota = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus anggota ini?')) {
      hapusAnggota(id);
      toast.success('Anggota berhasil dihapus');
    }
  };

  const handleKembalikanBuku = (idPeminjaman: string) => {
    const berhasil = kembalikanBuku(idPeminjaman);
    if (berhasil) {
      const peminjaman = daftarPeminjaman.find(p => p.id === idPeminjaman);
      const denda = peminjaman ? hitungDenda(peminjaman.tanggalKembali) : 0;
      
      if (denda > 0) {
        toast.success(`Buku dikembalikan dengan denda Rp ${denda.toLocaleString()}`);
      } else {
        toast.success('Buku berhasil dikembalikan');
      }
    } else {
      toast.error('Gagal mengembalikan buku');
    }
  };

  const bukuDipinjam = daftarPeminjaman.filter(p => p.status === 'dipinjam').length;
  const peminjamanTerlambat = getPeminjamanTerlambat();
  const peminjamanAktif = daftarPeminjaman.filter(p => p.status === 'dipinjam');
  const statistikBulanan = getStatistikBulanan();
  const anggotaTerAktif = getAnggotaTerAktif();

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
                <p className="text-sm text-gray-500">Dashboard Admin</p>
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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
                <Users className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Anggota</p>
                  <p className="text-2xl font-bold text-gray-900">{daftarAnggota.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookMarked className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Buku Dipinjam</p>
                  <p className="text-2xl font-bold text-gray-900">{bukuDipinjam}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Terlambat</p>
                  <p className="text-2xl font-bold text-gray-900">{peminjamanTerlambat.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Buku Tersedia</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {daftarBuku.reduce((total, buku) => total + buku.tersedia, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Loan Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>Aktivitas Peminjaman Bulanan</span>
              </CardTitle>
              <CardDescription>Grafik peminjaman buku per bulan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={statistikBulanan}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bulan" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="jumlah" 
                      stroke="#dc2626" 
                      strokeWidth={2}
                      name="Jumlah Peminjaman"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Most Active Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-600" />
                <span>Anggota Paling Aktif</span>
              </CardTitle>
              <CardDescription>5 anggota dengan peminjaman terbanyak</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {anggotaTerAktif.length > 0 ? (
                  anggotaTerAktif.map((item, index) => (
                    <div key={item.anggota.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.anggota.nama}</p>
                          <p className="text-sm text-gray-500">{item.anggota.noAnggota}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-red-600">{item.jumlahPeminjaman}</p>
                        <p className="text-xs text-gray-500">peminjaman</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Belum ada data peminjaman</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="buku" className="space-y-6">
          <TabsList>
            <TabsTrigger value="buku">Kelola Buku</TabsTrigger>
            <TabsTrigger value="anggota">Kelola Anggota</TabsTrigger>
            <TabsTrigger value="peminjaman">Data Peminjaman</TabsTrigger>
            <TabsTrigger value="pengembalian">Pengembalian</TabsTrigger>
          </TabsList>

          {/* Kelola Buku */}
          <TabsContent value="buku">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Daftar Buku</CardTitle>
                    <CardDescription>Kelola koleksi buku perpustakaan</CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowFormBuku(true)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Buku
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">Judul</th>
                        <th className="text-left p-4 font-medium">Pengarang</th>
                        <th className="text-left p-4 font-medium">Kategori</th>
                        <th className="text-left p-4 font-medium">Stok</th>
                        <th className="text-left p-4 font-medium">Tersedia</th>
                        <th className="text-left p-4 font-medium">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {daftarBuku.map((buku) => (
                        <tr key={buku.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">{buku.judul}</td>
                          <td className="p-4">{buku.pengarang}</td>
                          <td className="p-4">{buku.kategori}</td>
                          <td className="p-4">{buku.stok}</td>
                          <td className="p-4">{buku.tersedia}</td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingBuku(buku.id);
                                  setShowFormBuku(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleHapusBuku(buku.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Kelola Anggota */}
          <TabsContent value="anggota">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Daftar Anggota</CardTitle>
                    <CardDescription>Kelola data anggota perpustakaan</CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowFormAnggota(true)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Anggota
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">No. Anggota</th>
                        <th className="text-left p-4 font-medium">Nama</th>
                        <th className="text-left p-4 font-medium">Email</th>
                        <th className="text-left p-4 font-medium">No. Telepon</th>
                        <th className="text-left p-4 font-medium">Tanggal Daftar</th>
                        <th className="text-left p-4 font-medium">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {daftarAnggota.map((anggota) => (
                        <tr key={anggota.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">{anggota.noAnggota}</td>
                          <td className="p-4">{anggota.nama}</td>
                          <td className="p-4">{anggota.email}</td>
                          <td className="p-4">{anggota.noTelepon}</td>
                          <td className="p-4">{anggota.tanggalDaftar}</td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingAnggota(anggota.id);
                                  setShowFormAnggota(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleHapusAnggota(anggota.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Peminjaman */}
          <TabsContent value="peminjaman">
            <Card>
              <CardHeader>
                <CardTitle>Data Peminjaman</CardTitle>
                <CardDescription>Monitoring peminjaman dan pengembalian buku</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">Anggota</th>
                        <th className="text-left p-4 font-medium">Buku</th>
                        <th className="text-left p-4 font-medium">Tanggal Pinjam</th>
                        <th className="text-left p-4 font-medium">Tanggal Kembali</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Denda</th>
                      </tr>
                    </thead>
                    <tbody>
                      {daftarPeminjaman.map((peminjaman) => {
                        const anggota = daftarAnggota.find(a => a.id === peminjaman.idAnggota);
                        const buku = daftarBuku.find(b => b.id === peminjaman.idBuku);
                        
                        return (
                          <tr key={peminjaman.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">{anggota?.nama || 'Unknown'}</td>
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
                                {peminjaman.status}
                              </span>
                            </td>
                            <td className="p-4">
                              {peminjaman.denda ? `Rp ${peminjaman.denda.toLocaleString()}` : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pengembalian */}
          <TabsContent value="pengembalian">
            <div className="space-y-6">
              {/* Peminjaman Terlambat */}
              {peminjamanTerlambat.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <span>Peminjaman Terlambat</span>
                    </CardTitle>
                    <CardDescription>Buku yang terlambat dikembalikan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-4 font-medium">Anggota</th>
                            <th className="text-left p-4 font-medium">Buku</th>
                            <th className="text-left p-4 font-medium">Tgl Kembali</th>
                            <th className="text-left p-4 font-medium">Hari Terlambat</th>
                            <th className="text-left p-4 font-medium">Denda</th>
                            <th className="text-left p-4 font-medium">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {peminjamanTerlambat.map((peminjaman) => {
                            const anggota = daftarAnggota.find(a => a.id === peminjaman.idAnggota);
                            const buku = daftarBuku.find(b => b.id === peminjaman.idBuku);
                            const denda = hitungDenda(peminjaman.tanggalKembali);
                            const hariTerlambat = Math.ceil((new Date().getTime() - new Date(peminjaman.tanggalKembali).getTime()) / (1000 * 60 * 60 * 24));
                            
                            return (
                              <tr key={peminjaman.id} className="border-b hover:bg-red-50">
                                <td className="p-4">{anggota?.nama || 'Unknown'}</td>
                                <td className="p-4">{buku?.judul || 'Unknown'}</td>
                                <td className="p-4">{peminjaman.tanggalKembali}</td>
                                <td className="p-4 text-red-600 font-medium">{hariTerlambat} hari</td>
                                <td className="p-4 text-red-600 font-medium">Rp {denda.toLocaleString()}</td>
                                <td className="p-4">
                                  <Button
                                    size="sm"
                                    onClick={() => handleKembalikanBuku(peminjaman.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Kembalikan + Denda
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Semua Peminjaman Aktif */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span>Peminjaman Aktif</span>
                  </CardTitle>
                  <CardDescription>Buku yang sedang dipinjam</CardDescription>
                </CardHeader>
                <CardContent>
                  {peminjamanAktif.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-4 font-medium">Anggota</th>
                            <th className="text-left p-4 font-medium">Buku</th>
                            <th className="text-left p-4 font-medium">Tgl Pinjam</th>
                            <th className="text-left p-4 font-medium">Tgl Kembali</th>
                            <th className="text-left p-4 font-medium">Status</th>
                            <th className="text-left p-4 font-medium">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {peminjamanAktif.map((peminjaman) => {
                            const anggota = daftarAnggota.find(a => a.id === peminjaman.idAnggota);
                            const buku = daftarBuku.find(b => b.id === peminjaman.idBuku);
                            const isOverdue = peminjaman.tanggalKembali < new Date().toISOString().split('T')[0];
                            
                            return (
                              <tr key={peminjaman.id} className={`border-b hover:bg-gray-50 ${isOverdue ? 'bg-red-50' : ''}`}>
                                <td className="p-4">{anggota?.nama || 'Unknown'}</td>
                                <td className="p-4">{buku?.judul || 'Unknown'}</td>
                                <td className="p-4">{peminjaman.tanggalPinjam}</td>
                                <td className="p-4">{peminjaman.tanggalKembali}</td>
                                <td className="p-4">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    isOverdue 
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {isOverdue ? 'Terlambat' : 'Aktif'}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <Button
                                    size="sm"
                                    onClick={() => handleKembalikanBuku(peminjaman.id)}
                                    className={isOverdue ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                                  >
                                    {isOverdue ? 'Kembalikan + Denda' : 'Kembalikan'}
                                  </Button>
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
                        Tidak ada peminjaman aktif
                      </h3>
                      <p className="text-gray-500">
                        Semua buku telah dikembalikan
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {showFormBuku && (
        <FormBuku
          bukuId={editingBuku}
          onClose={() => {
            setShowFormBuku(false);
            setEditingBuku(null);
          }}
        />
      )}
      
      {showFormAnggota && (
        <FormAnggota
          anggotaId={editingAnggota}
          onClose={() => {
            setShowFormAnggota(false);
            setEditingAnggota(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
