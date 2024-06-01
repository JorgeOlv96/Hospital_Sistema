import React, { useState } from 'react';
import { Button, Input } from '../components/Form';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [apPaterno, setApPaterno] = useState('');
  const [apMaterno, setApMaterno] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    const response = await fetch('http://localhost:4000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nombre, ap_paterno: apPaterno, ap_materno: apMaterno, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      navigate('/login');
    } else {
      setError(data.message);
    }
  };

  return (
    <div className="w-full h-screen flex-colo bg-dry">
      <form
        className="w-2/5 p-8 rounded-2xl mx-auto bg-white flex-colo"
        onSubmit={handleRegister}
      >
        <img
          src="/images/logo.png"
          alt="logo"
          className="w-48 h-16 object-contain"
        />
        {error && <p className="text-red-500">{error}</p>}
        <div className="flex flex-col gap-4 w-full mb-6">
          <Input
            label="Nombre"
            type="text"
            color={true}
            placeholder={'Nombre(s)'}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <Input
            label="Apellido Paterno"
            type="text"
            color={true}
            placeholder={'Apellido paterno'}
            value={apPaterno}
            onChange={(e) => setApPaterno(e.target.value)}
          />
          <Input
            label="Apellido Materno"
            type="text"
            color={true}
            placeholder={'Apellido materno'}
            value={apMaterno}
            onChange={(e) => setApMaterno(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            color={true}
            placeholder={''}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            color={true}
            placeholder={''}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button
          label="Register"
          type="submit"
        />
      </form>
    </div>
  );
}

export default Register;
