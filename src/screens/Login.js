import React, { useState } from 'react';
import { Button, Input } from '../components/Form';
import { BiLogInCircle } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
        setError('Todos los campos son requeridos');
        return;
    }

    console.log('Email:', email);
    console.log('Password:', password);

    try {
        const response = await fetch('http://localhost:4000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            navigate('/');
        } else {
            setError(data.message || 'Error en el inicio de sesión');
        }
    } catch (err) {
        console.error('Error en el inicio de sesión:', err);
        setError('Error en el inicio de sesión. Inténtalo de nuevo más tarde.');
    }
};


  return (
    <div className="w-full h-screen flex-colo bg-dry">
      <form
        className="w-2/5 p-8 rounded-2xl mx-auto bg-white flex-colo"
        onSubmit={handleLogin}
      >
        <img
          src="/images/logo.png"
          alt="logo"
          className="w-48 h-16 object-contain"
        />
        {error && <p className="text-red-500">{error}</p>}
        <div className="flex flex-col gap-4 w-full mb-6">
          <input
            label="Email"
            type="email"
            color={true}
            placeholder={'admin@gmail.com'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <input
            label="Password"
            type="password"
            color={true}
            placeholder={'*********'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>
        <button type="submit" className="w-full p-3 bg-blue-500 text-white rounded-lg">
          Login
        </button>
        <div className="mt-4">
          <p>
            No tienes cuenta? <span onClick={() => navigate('/register')} className="text-blue-500 cursor-pointer">Registrar usuario</span>
          </p>
        </div>
      </form>
    </div>
  );
}

export default Login;
