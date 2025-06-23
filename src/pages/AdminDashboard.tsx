
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePustaka } from '@/contexts/PustakaContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Users, BookMarked, LogOut, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import FormBuku from '@/components/FormBuku';
import FormAnggota from '@/components/FormAnggota';

const AdminDashboard = () => {
  const { pengguna, logout } = useAuth();
  const { daftarBuku, daftarAnggota, daftarPeminjaman, hapusBuku, hapusAnggota } = usePustaka();
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

  const bukuDipinjam = daftarPeminjaman.filter(p => p.status === 'dipinjam').length;

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                <BookOpen className="w-8 h-8 text-red-600" />
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

        {/* Main Content */}
        <Tabs defaultValue="buku" className="space-y-6">
          <TabsList>
            <TabsTrigger value="buku">Kelola Buku</TabsTrigger>
            <TabsTrigger value="anggota">Kelola Anggota</TabsTrigger>
            <TabsTrigger value="peminjaman">Data Peminjaman</TabsTrigger>
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
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
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
