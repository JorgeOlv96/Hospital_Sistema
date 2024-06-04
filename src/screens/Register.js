import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [apPaterno, setApPaterno] = useState('');
  const [apMaterno, setApMaterno] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nivelUsuario, setNivelUsuario] = useState('');
  const [cedula, setCedula] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!nombre || !apPaterno || !apMaterno || !email || !password || !nivelUsuario || !cedula) {
      setError('Todos los campos son obligatorios');
      return;
    }

    // Depuración: Verifica los datos antes de enviarlos
    console.log({
      nombre,
      ap_paterno: apPaterno,
      ap_materno: apMaterno,
      email,
      password,
      nivel_usuario: nivelUsuario,
      cedula
    });

    try {
      const response = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          nombre, 
          ap_paterno: apPaterno, 
          ap_materno: apMaterno, 
          email, 
          password,
          nivel_usuario: nivelUsuario, 
          cedula 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/login');
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Error en el registro:', err);
      setError('Error en el registro. Inténtalo de nuevo más tarde.');
    }
  };

  return (
    <div className="w-full h-screen flex-colo bg-dry">
      <form className="w-2/5 p-8 rounded-2xl mx-auto bg-white flex-colo" onSubmit={handleRegister}>
        <img src="/images/logo.png" alt="logo" className="w-48 h-16 object-contain" />
        {error && <p className="text-red-500">{error}</p>}
        <div className="flex flex-col gap-4 w-full mb-6">
          <input
            type="text"
            placeholder="Nombre(s)"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Apellido Paterno"
            value={apPaterno}
            onChange={(e) => setApPaterno(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Apellido Materno"
            value={apMaterno}
            onChange={(e) => setApMaterno(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Nivel de Usuario"
            value={nivelUsuario}
            onChange={(e) => setNivelUsuario(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Cedula"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>
        <button type="submit" className="w-full p-3 bg-[#001B58]  text-white rounded-lg">
          Registrar
        </button>
        <div className="mt-4 text-center">
          <p>¿Ya tienes una cuenta? <span className="text-blue-500 cursor-pointer" onClick={() => navigate('/login')}>Inicia sesión</span></p>
        </div>
      </form>
    </div>
  );
}

export default Register;
