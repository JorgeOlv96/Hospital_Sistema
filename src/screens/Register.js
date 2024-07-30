import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [apPaterno, setApPaterno] = useState("");
  const [apMaterno, setApMaterno] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nivelUsuario, setNivelUsuario] = useState("");
  const [cedula, setCedula] = useState("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!nombre) newErrors.nombre = "Campo requerido";
    if (!apPaterno) newErrors.apPaterno = "Campo requerido";
    if (!apMaterno) newErrors.apMaterno = "Campo requerido";
    if (!email) newErrors.email = "Campo requerido";
    if (!password) newErrors.password = "Campo requerido";
    if (!nivelUsuario) newErrors.nivelUsuario = "Campo requerido";
    if (!cedula) newErrors.cedula = "Campo requerido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
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
      cedula,
    });

    try {
      const response = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          ap_paterno: apPaterno,
          ap_materno: apMaterno,
          email,
          password,
          nivel_usuario: nivelUsuario,
          cedula,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/login");
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Error en el registro:", err);
      setError("Error en el registro. Inténtalo de nuevo más tarde.");
    }
  };

  return (
    <div
  className="w-full h-screen flex-colo relative"
  style={{
    backgroundImage: "url(/images/hospital.jpeg)",
    backgroundSize: "cover",
    backgroundPosition: "center"
  }}
>
  {/* Overlay */}
  <div
    className="absolute top-0 left-0 w-full h-full"
    style={{
      background: "rgba(146, 146, 146, 0.7)",
      zIndex: 1, // Asegúrate de que el overlay esté detrás del contenido
    }}
  />

  {/* Contenido */}
  <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
    <div className="flex justify-center mb-6">
      <img
        src="/images/logologin.png"
        alt="logo"
        className="w-90 h-20 object-contain"
      />
    </div>

    <form
      className="w-3/4 sm:w-1/2 md:w-1/4 p-6 rounded-2xl mx-auto bg-white flex-colo"
      onSubmit={handleRegister}
    >
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex flex-col gap-4 w-full mb-6">
        <input
          type="text"
          placeholder="Nombre(s)"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className={`w-full p-3 border ${
            errors.nombre ? "border-red-500" : "border-gray-300"
          } rounded-lg`}
        />
        {errors.nombre && (
          <span className="text-red-500">{errors.nombre}</span>
          )}
          <input
            type="text"
            placeholder="Apellido Paterno"
            value={apPaterno}
            onChange={(e) => setApPaterno(e.target.value)}
            className={`w-full p-3 border ${
              errors.apPaterno ? "border-red-500" : "border-gray-300"
            } rounded-lg`}
          />
          {errors.apPaterno && (
            <span className="text-red-500">{errors.apPaterno}</span>
          )}
          <input
            type="text"
            placeholder="Apellido Materno"
            value={apMaterno}
            onChange={(e) => setApMaterno(e.target.value)}
            className={`w-full p-3 border ${
              errors.apMaterno ? "border-red-500" : "border-gray-300"
            } rounded-lg`}
          />
          {errors.apMaterno && (
            <span className="text-red-500">{errors.apMaterno}</span>
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full p-3 border ${
              errors.email ? "border-red-500" : "border-gray-300"
            } rounded-lg`}
          />
          {errors.email && <span className="text-red-500">{errors.email}</span>}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full p-3 border ${
              errors.password ? "border-red-500" : "border-gray-300"
            } rounded-lg`}
          />
          {errors.password && (
            <span className="text-red-500">{errors.password}</span>
          )}
          <input
            type="text"
            placeholder="Nivel de Usuario"
            value={nivelUsuario}
            onChange={(e) => setNivelUsuario(e.target.value)}
            className={`w-full p-3 border ${
              errors.nivelUsuario ? "border-red-500" : "border-gray-300"
            } rounded-lg`}
          />
          {errors.nivelUsuario && (
            <span className="text-red-500">{errors.nivelUsuario}</span>
          )}
          <input
            type="text"
            placeholder="Cedula"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            className={`w-full p-3 border ${
              errors.cedula ? "border-red-500" : "border-gray-300"
            } rounded-lg`}
          />
          {errors.cedula && (
            <span className="text-red-500">{errors.cedula}</span>
          )}
        </div>
        <button
          type="submit"
          className="w-full p-3 bg-[#001B58] text-white rounded-lg"
        >
          Registrar
        </button>
    </form>
  </div>
</div>
  );
}

export default Register;
