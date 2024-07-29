// src/MainRoutes.js
import React, { useContext } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import Dashboard from './screens/Dashboard';
import Solicitudes from './screens/Solicitudes/Solicitudes';
import Login from './screens/Login';
import Register from './screens/Register';
import Crearsolicitud from './screens/Solicitudes/Crearsolicitud';
import Programarsolicitud from './screens/Solicitudes/Programarsolicitud';
import Evaluacionmedica from './screens/Evaluacion';
import Appointments from './screens/Appointments';
import Anestesiólogos from './screens/Anestesiologos';
import Urgencias from './screens/Urgencias';
import Bitacora from './screens/Bitacora';
import NotFound from './screens/NotFound';

const MainRoutes = () => {
  const { user, hasRole } = useContext(AuthContext);

  const ProtectedRoute = ({ roles, children }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    if (!hasRole(roles)) {
      return <Navigate to="/" />;
    }
    return children;
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/solicitudes" element={<ProtectedRoute roles={[1, 5]}><Solicitudes /></ProtectedRoute>} />
      <Route path="/solicitudes/crearsolicitud" element={<ProtectedRoute roles={[1, 5]}><Crearsolicitud /></ProtectedRoute>} />
      <Route path="/solicitudes/Programarsolicitud" element={<ProtectedRoute roles={[1, 5]}><Programarsolicitud /></ProtectedRoute>} />
      <Route path="/evaluacion" element={<ProtectedRoute roles={[2, 5]}><Evaluacionmedica /></ProtectedRoute>} />
      <Route path="/appointments" element={<ProtectedRoute roles={[1, 5]}><Appointments /></ProtectedRoute>} />
      <Route path="/anestesiólogos" element={<ProtectedRoute roles={[4, 5]}><Anestesiólogos /></ProtectedRoute>} />
      <Route path="/urgencias" element={<ProtectedRoute roles={[3, 5]}><Urgencias /></ProtectedRoute>} />
      <Route path="/bitacora" element={<ProtectedRoute roles={[3, 5]}><Bitacora /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default MainRoutes;
