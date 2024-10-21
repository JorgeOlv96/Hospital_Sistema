import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../src/IndexPage.css';

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [error, setError] = useState('');
    const [sessionExpired, setSessionExpired] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const baseURL = process.env.REACT_APP_APP_BACK_SSQ || 'http://localhost:4000';

    useEffect(() => {
        const sessionExpiredMessage = localStorage.getItem('sessionExpired');
        if (sessionExpiredMessage) {
            setSessionExpired(true);
            localStorage.removeItem('sessionExpired');
        }
    }, []);

    const validateForm = () => {
        const newErrors = {};
        if (!email) newErrors.email = 'Campo requerido';
        if (!password) newErrors.password = 'Campo requerido';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            setIsLoading(true);
            setError('');
            try {
                const response = await axios.post(`${baseURL}/api/auth/login`, { email, password });
                if (response.status === 200) {
                    localStorage.setItem('token', response.data.token);
                    navigate('/dashboard');
                } else {
                    throw new Error('Respuesta inesperada del servidor');
                }
            } catch (err) {
                console.error('Error en el inicio de sesión:', err);
                if (err.response && err.response.status === 401) {
                    setError('Correo electrónico o contraseña incorrectos');
                } else {
                    setError('Error de conexión. Inténtalo más tarde.');
                }
                setIsLoading(false);
            }
        } else {
            console.log('Datos inválidos');
        }
    };

    const LoadingSpinner = () => (
        <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
    );

    return (
        <div className="w-full h-screen flex-colo relative" style={{
            backgroundImage: "url(/images/hospital.jpeg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
        }}>
            <div className="absolute top-0 left-0 w-full h-full" style={{
                background: "rgba(146, 146, 146, 0.7)",
                zIndex: 1,
            }} />

            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
                {sessionExpired && (
                    <div className="mb-6 text-red-500 font-bold">
                        Su sesión ha expirado. Inicie sesión nuevamente.
                    </div>
                )}

                <h1 className="text-[#001B58] text-3xl font-bold mb-4" style={{
                    fontSize: '3.25rem',
                    textShadow: '-1px -1px 0 #FFFFFF, 1px -1px 0 #FFFFFF, -1px 1px 0 #FFFFFF, 1px 1px 0 #FFFFFF',
                }}>
                    SISQE
                </h1>
                <h2 className="text-[#001B58] text-3xl font-bold mb-4" style={{
                    fontSize: '2.5rem',
                    textShadow: '-1px -1px 0 #FFFFFF, 1px -1px 0 #FFFFFF, -1px 1px 0 #FFFFFF, 1px 1px 0 #FFFFFF',
                }}>
                    Sistema de Seguimiento Quirúrgico y Eficiencia
                </h2>

                <div className="flex justify-center mb-6">
                    <img src="/images/logologin.png" alt="logo" className="w-90 h-20 object-contain" />
                </div>

                <form className="w-3/4 sm:w-1/2 md:w-1/4 p-6 rounded-2xl mx-auto bg-white flex-colo" onSubmit={handleLogin}>
                    <div className="flex flex-col gap-4 w-full mb-6">
                        <input
                            type="email"
                            placeholder="usuario@dominio.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full p-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                        />
                        {errors.email && <span className="text-red-500">{errors.email}</span>}

                        <input
                            type="password"
                            placeholder="*********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full p-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                        />
                        {errors.password && <span className="text-red-500">{errors.password}</span>}
                    </div>

                    {isLoading ? (
                        <div className="w-full p-3 bg-[#001B58] text-white rounded-lg flex justify-center items-center">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <button type="submit" className="w-full p-3 bg-[#001B58] text-white rounded-lg">
                            Iniciar sesión
                        </button>
                    )}

                    {error && <div className="mt-4 text-red-500">{error}</div>}
                </form>
            </div>
        </div>
    );
}

export default Login;