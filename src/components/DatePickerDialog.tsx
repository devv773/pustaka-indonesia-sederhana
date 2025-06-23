
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface DatePickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string) => void;
  bookTitle: string;
}

const DatePickerDialog: React.FC<DatePickerDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  bookTitle
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>();

  const handleConfirm = () => {
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      onConfirm(dateString);
      onClose();
    }
  };

  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 30); // Maximum 30 days from today

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pilih Tanggal Pengembalian</DialogTitle>
          <DialogDescription>
            Pilih tanggal pengembalian untuk buku: <strong>{bookTitle}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center py-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < today || date > maxDate}
            initialFocus
            className="rounded-md border"
          />
        </div>

        {selectedDate && (
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center space-x-2 text-blue-800">
              <CalendarIcon className="w-4 h-4" />
              <span className="font-medium">
                Tanggal pengembalian: {format(selectedDate, 'dd MMMM yyyy', { locale: id })}
              </span>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              Pastikan Anda mengembalikan buku tepat waktu untuk menghindari denda
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!selectedDate}
            className="bg-red-600 hover:bg-red-700"
          >
            Konfirmasi Peminjaman
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DatePickerDialog;
