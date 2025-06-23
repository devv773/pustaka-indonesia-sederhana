
import React, { useState, useEffect } from 'react';
import { usePustaka } from '@/contexts/PustakaContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface FormBukuProps {
  bukuId?: string | null;
  onClose: () => void;
}

const FormBuku: React.FC<FormBukuProps> = ({ bukuId, onClose }) => {
  const { daftarBuku, tambahBuku, editBuku } = usePustaka();
  const [formData, setFormData] = useState({
    judul: '',
    pengarang: '',
    penerbit: '',
    tahunTerbit: new Date().getFullYear(),
    isbn: '',
    stok: 1,
    kategori: '',
    deskripsi: ''
  });

  const isEdit = Boolean(bukuId);

  useEffect(() => {
    if (isEdit && bukuId) {
      const buku = daftarBuku.find(b => b.id === bukuId);
      if (buku) {
        setFormData({
          judul: buku.judul,
          pengarang: buku.pengarang,
          penerbit: buku.penerbit,
          tahunTerbit: buku.tahunTerbit,
          isbn: buku.isbn,
          stok: buku.stok,
          kategori: buku.kategori,
          deskripsi: buku.deskripsi
        });
      }
    }
  }, [isEdit, bukuId, daftarBuku]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'tahunTerbit' || name === 'stok' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.judul || !formData.pengarang || !formData.penerbit) {
      toast.error('Harap isi semua field yang wajib');
      return;
    }

    if (isEdit && bukuId) {
      editBuku(bukuId, formData);
      toast.success('Buku berhasil diperbarui');
    } else {
      tambahBuku(formData);
      toast.success('Buku berhasil ditambahkan');
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{isEdit ? 'Edit Buku' : 'Tambah Buku Baru'}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="judul">Judul Buku *</Label>
                <Input
                  id="judul"
                  name="judul"
                  value={formData.judul}
                  onChange={handleChange}
                  placeholder="Masukkan judul buku"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pengarang">Pengarang *</Label>
                <Input
                  id="pengarang"
                  name="pengarang"
                  value={formData.pengarang}
                  onChange={handleChange}
                  placeholder="Masukkan nama pengarang"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="penerbit">Penerbit *</Label>
                <Input
                  id="penerbit"
                  name="penerbit"
                  value={formData.penerbit}
                  onChange={handleChange}
                  placeholder="Masukkan nama penerbit"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tahunTerbit">Tahun Terbit</Label>
                <Input
                  id="tahunTerbit"
                  name="tahunTerbit"
                  type="number"
                  value={formData.tahunTerbit}
                  onChange={handleChange}
                  placeholder="2024"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN</Label>
                <Input
                  id="isbn"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleChange}
                  placeholder="Masukkan nomor ISBN"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stok">Jumlah Stok</Label>
                <Input
                  id="stok"
                  name="stok"
                  type="number"
                  value={formData.stok}
                  onChange={handleChange}
                  placeholder="1"
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kategori">Kategori</Label>
              <Input
                id="kategori"
                name="kategori"
                value={formData.kategori}
                onChange={handleChange}
                placeholder="Masukkan kategori buku"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea
                id="deskripsi"
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleChange}
                placeholder="Masukkan deskripsi buku"
                rows={3}
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700 flex-1"
              >
                {isEdit ? 'Perbarui' : 'Tambah'} Buku
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormBuku;
