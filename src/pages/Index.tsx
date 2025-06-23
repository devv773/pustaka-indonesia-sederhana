
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { pengguna, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }
  
  if (!pengguna) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect berdasarkan role pengguna
  return pengguna.role === 'admin' ? 
    <Navigate to="/admin" replace /> : 
    <Navigate to="/anggota" replace />;
};

export default Index;
