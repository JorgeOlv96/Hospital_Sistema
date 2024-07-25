// src/api.js
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const api = axios.create({
    baseURL: 'http://localhost:4000/api',
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 403) {
            // Mostrar notificación
            toast.error('Your session has expired. Please log in again.');

            // Redirigir al login
            const navigate = useNavigate();
            navigate('/login');

            // Opcional: Limpiar token del localStorage
            localStorage.removeItem('token');
        }
        return Promise.reject(error);
    }
);

export default api;
