import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = () => {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    // Redireciona para o login salvando a rota que o usuário tentou acessar
    return <Navigate to="/crm/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
