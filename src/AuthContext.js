// src/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get('http://localhost:4000/api/auth/user', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUser(response.data);
                } catch (error) {
                    console.error('Error checking auth:', error);
                    localStorage.removeItem('token');
                    setUser(null);
                    if (location.pathname !== '/login' && location.pathname !== '/register') {
                        navigate('/login');
                    }
                }
            } else {
                navigate('/login');
            }
        };
        checkAuth();
    }, [navigate, location]);

    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:4000/api/auth/login', { email, password });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setUser(user);
        } catch (error) {
            console.error('Error during login:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    const hasRole = (roles) => {
        return user && roles.includes(user.nivel_usuario);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };
