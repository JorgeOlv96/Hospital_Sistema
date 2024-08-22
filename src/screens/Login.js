import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../src/IndexPage.css'; // Importa el CSS del índice

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [error, setError] = useState(''); // For general login error
    const [sessionExpired, setSessionExpired] = useState(false); // Flag for expired session
    const baseURL = process.env.REACT_APP_APP_BACK_SSQ || 'http://localhost:4000'; // Define base URL

    useEffect(() => {
        // Check for session expiration message in localStorage on component mount
        const sessionExpiredMessage = localStorage.getItem('sessionExpired');
        if (sessionExpiredMessage) {
            setSessionExpired(true);
            localStorage.removeItem('sessionExpired'); // Clear message for future visits
        }
    }, []);

    const validateForm = () => {
        const newErrors = {};
        if (!email) {
            newErrors.email = 'Campo requerido';
        }
        if (!password) {
            newErrors.password = 'Campo requerido';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        // Validate the form
        if (validateForm()) {
            try {
                const response = await axios.post(`${baseURL}/api/auth/login`, { email, password });

                if (response.status === 200) {
                    localStorage.setItem('token', response.data.token);
                    navigate('/dashboard');
                } else {
                    setError(response.data.message || 'Correo electrónico o contraseña inválidos');
                }
            } catch (err) {
                console.error('Error en el inicio de sesión:', err);
                setError('Inténtalo de nuevo más tarde o revisa tu conexion a internet');
            }
        } else {
            console.log('Datos inválidos');
        }
    };

    return (
        <div
            className="w-full h-screen flex-colo relative"
            style={{
                backgroundImage: "url(/images/hospital.jpeg)",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {/* Overlay with pseudo-element */}
            <div
                className="absolute top-0 left-0 w-full h-full"
                style={{
                    background: "rgba(146, 146, 146, 0.7)",
                    zIndex: 1, // Ensure overlay is behind content
                }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
                {sessionExpired && (
                    <div className="mb-6 text-red-500 font-bold">
                        Su sesión ha expirado. Inicie sesión nuevamente.
                    </div>
                )}
                <div className="flex justify-center mb-6">
                    <img
                        src="/images/logologin.png"
                        alt="logo"
                        className="w-90 h-20 object-contain"
                    />
                </div>

                <form
                    className="w-3/4 sm:w-1/2 md:w-1/4 p-6 rounded-2xl mx-auto bg-white flex-colo"
                    onSubmit={handleLogin}
                >
                    <div className="flex flex-col gap-4 w-full mb-6">
                        <input
                            label="Email"
                            type="email"
                            color={true}
                            placeholder={"usuario@dominio.com"}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full p-3 border ${
                                errors.email ? "border-red-500" : "border-gray-300"
                            } rounded-lg`}
                        />

                        {errors.email && <span className="text-red-500">{errors.email}</span>}
                        <input
                            label="Password"
                            type="password"
                            color={true}
                            placeholder={"*********"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full p-3 border ${
                                errors.password ? "border-red-500" : "border-gray-300"
                            } rounded-lg`}
                        />
                        {errors.password && (
                            <span className="text-red-500">{errors.password}</span>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full p-3 bg-[#001B58] text-white rounded-lg"
                    >
                        Iniciar sesión
                    </button>
                    {error && <div className="mt-4 text-red-500">{error}</div>}
                </form>
            </div>
        </div>
    );
}

export default Login;
