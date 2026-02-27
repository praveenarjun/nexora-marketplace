import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useContext(AuthContext);

    if (!isAuthenticated()) {
        // Redirect unauthenticated users to login page
        return <Navigate to="/login" replace />;
    }

    return children;
};

export const AdminRoute = ({ children }) => {
    const { isAuthenticated, isAdmin } = useContext(AuthContext);

    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin()) {
        // Redirect authenticated but non-admin users to home
        return <Navigate to="/" replace />;
    }

    return children;
};
