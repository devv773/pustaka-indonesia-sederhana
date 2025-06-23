
import React, { useState, useEffect } from 'react';
import { usePustaka } from '@/contexts/PustakaContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface FormAnggotaProps {
  anggotaId?: string | null;
  onClose: () => void;
}

const FormAnggota: React.FC<FormAnggotaProps> = ({ anggotaId, onClose }) => {
  const { daftarAnggota, tambahAnggota, editAnggota } = usePustaka();
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    noAnggota: '',
    alamat: '',
    noTelepon: '',
    tanggalDaftar: new Date().toISOString().split('T')[0]
  });

  const isEdit = Boolean(anggotaId);

  useEffect(() => {
    if (isEdit && anggotaId) {
      const anggota = daftarAnggota.find(a => a.id === anggotaId);
      if (anggota) {
        setFormData({
          nama: anggota.nama,
          email: anggota.email,
          noAnggota: anggota.noAnggota,
          alamat: anggota.alamat,
          noTelepon: an

ggota.noTelepon,
          tanggalDaftar: anggota.tanggalDaftar
        });
      }
    } else if (!isEdit) {
      // Generate nomor anggota otomatis untuk anggota baru
      const nextNumber = daftarAnggota.length + 1;
      setFormData(prev => ({
        ...prev,
        noAnggota: `A${nextNumber.toString().padStart(3, '0')}`
      }));
    }
  }, [isEdit, anggotaId, daftarAnggota]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nama || !formData.email || !formData.noAnggota) {
      toast.error('Harap isi semua field yang wajib');
      return;
    }

    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Format email tidak valid');
      return;
    }

    // Cek duplikasi email dan nomor anggota (kecuali untuk edit)
    const emailExists = daftarAnggota.some(a => 
      a.email === formData.email && (!isEdit || a.id !== anggotaId)
    );
    const noAnggotaExists = daftarAnggota.some(a => 
      a.noAnggota === formData.noAnggota && (!isEdit || a.id !== anggotaId)
    );

    if (emailExists) {
      toast.error('Email sudah terdaftar');
      return;
    }

    if (noAnggotaExists) {
      toast.error('Nomor anggota sudah digunakan');
      return;
    }

    if (isEdit && anggotaId) {
      editAnggota(anggotaId, formData);
      toast.success('Data anggota berhasil diperbarui');
    } else {
      tambahAnggota(formData);
      toast.success('Anggota baru berhasil ditambahkan');
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{isEdit ? 'Edit Anggota' : 'Tambah Anggota Baru'}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap *</Label>
                <Input
                  id="nama"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Masukkan alamat email"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="noAnggota">Nomor Anggota *</Label>
                <Input
                  id="noAnggota"
                  name="noAnggota"
                  value={formData.noAnggota}
                  onChange={handleChange}
                  placeholder="Nomor anggota"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="noTelepon">Nomor Telepon</Label>
                <Input
                  id="noTelepon"
                  name="noTelepon"
                  value={formData.noTelepon}
                  onChange={handleChange}
                  placeholder="Masukkan nomor telepon"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alamat">Alamat</Label>
              <Textarea
                id="alamat"
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                placeholder="Masukkan alamat lengkap"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggalDaftar">Tanggal Daftar</Label>
              <Input
                id="tanggalDaftar"
                name="tanggalDaftar"
                type="date"
                value={formData.tanggalDaftar}
                onChange={handleChange}
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700 flex-1"
              >
                {isEdit ? 'Perbarui' : 'Tambah'} Anggota
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

export default FormAnggota;
