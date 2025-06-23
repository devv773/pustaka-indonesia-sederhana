
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Pengguna {
  id: string;
  nama: string;
  email: string;
  role: 'admin' | 'anggota';
  noAnggota?: string;
}

interface AuthContextType {
  pengguna: Pengguna | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth harus digunakan dalam AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pengguna, setPengguna] = useState<Pengguna | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulasi cek session dari localStorage
    const savedUser = localStorage.getItem('pustaka_pengguna');
    if (savedUser) {
      setPengguna(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulasi data pengguna (dalam implementasi nyata akan menggunakan API)
    const daftarPengguna = [
      {
        id: '1',
        nama: 'Administrator',
        email: 'admin@pustaka.id',
        password: 'admin123',
        role: 'admin' as const
      },
      {
        id: '2',
        nama: 'Budi Santoso',
        email: 'budi@email.com',
        password: 'budi123',
        role: 'anggota' as const,
        noAnggota: 'A001'
      },
      {
        id: '3',
        nama: 'Siti Aminah',
        email: 'siti@email.com',
        password: 'siti123',
        role: 'anggota' as const,
        noAnggota: 'A002'
      }
    ];

    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulasi delay

    const user = daftarPengguna.find(u => u.email === email && u.password === password);
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      setPengguna(userWithoutPassword);
      localStorage.setItem('pustaka_pengguna', JSON.stringify(userWithoutPassword));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setPengguna(null);
    localStorage.removeItem('pustaka_pengguna');
  };

  return (
    <AuthContext.Provider value={{ pengguna, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
