import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/index';
import { loadUser } from '../store/slices/authSlice';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'admin' | 'votante';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
    const { isAuthenticated, user, isLoading, token } = useSelector((state: RootState) => state.auth);
    const location = useLocation();
    const dispatch = useDispatch<AppDispatch>();

    React.useEffect(() => {
        if (token && !user && !isLoading) {
            dispatch(loadUser());
        }
    }, [dispatch, token, user, isLoading]);

    // Si está cargando, mostramos un indicador de carga
    if (isLoading) {
        return <div>Cargando...</div>;
    }

    // Si no está autenticado, redirigimos al login
    if (!isAuthenticated || !token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si se requiere un rol específico y el usuario no lo tiene
    if (requiredRole && user?.rol !== requiredRole) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;