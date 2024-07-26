import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext'; // Asegúrate de la ruta correcta

const ProtectedRoute = ({ children }) => {
    const { user } = useContext(AuthContext);

    // Debugging: Verifica el valor de user
    console.log("ProtectedRoute user:", user);

    if (!user) {
        // Redirige al login si el usuario no está autenticado
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;
