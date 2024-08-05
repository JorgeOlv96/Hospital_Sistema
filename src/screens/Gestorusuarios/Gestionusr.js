import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Layout from "../../Layout";
import { toast } from 'react-toastify';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Gestionusuarios() {
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

  const [formData, setFormData] = useState({
    nombre: "",
    dia_anestesio: "",
    turno_anestesio: "",
    sala_anestesio: "",
    hora_inicio: "",
    hora_fin: "",
  });

  const [usuarios, setUsuarios] = useState([]);
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";

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

  // Fetch usuarios on component mount
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await fetch(`${baseURL}/api/users/users`);
        if (!response.ok) {
          const data = await response.json();
          setError(data.message);
        } else {
          const data = await response.json();
          setUsuarios(data);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Error fetching users. Please try again later.");
      }
    };

    fetchUsuarios();
  }, []);

  // Edit user and open modal
  const handleEdit = (user) => {
    setUserToEdit(user);
    setShowModal(true);
  };

  // Delete user
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${baseURL}/api/users/users/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.message);
      } else {
        // Remove user from state without needing to refetch
        setUsuarios((prevUsuarios) =>
          prevUsuarios.filter((user) => user.id_usuario !== id)
        );
        setSuccess("User deleted successfully.");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Error deleting user. Please try again later.");
    }
  };

  // Save edited user
  const handleSave = async (e) => {
    e.preventDefault();
    const { id_usuario, nombre, ap_paterno, ap_materno, nivel_usuario, email, cedula } =
      userToEdit;

    try {
      // Primero, desactivamos cualquier notificación existente
      toast.dismiss();

      // Realiza la solicitud de actualización
      const response = await fetch(`${baseURL}/api/users/users/${id_usuario}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          ap_paterno,
          ap_materno,
          nivel_usuario,
          email,
          cedula,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message);
        toast.error(data.message); // Mostrar mensaje de error
      } else {
        const updatedUser = await response.json();
        console.log("Updated user:", updatedUser); // Agregado para depuración
        console.log("Usuarios state:", usuarios); // Agregado para depuración
        setUsuarios(
          usuarios.map((user) => (user.id_usuario === id_usuario ? updatedUser : user))
        );
        setShowModal(false);
        toast.success("User updated successfully"); // Mostrar mensaje de éxito
      }
    } catch (err) {
      console.error("Error updating user:", err);
      setError("Error updating user. Please try again later.");
      toast.error("Error updating user. Please try again later."); // Mostrar mensaje de error
    }
  };

  // Handle input change in the modal form
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserToEdit((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
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
      const response = await axios.post(`${baseURL}/api/auth/register`, {
        nombre,
        ap_paterno: apPaterno,
        ap_materno: apMaterno,
        email,
        password,
        nivel_usuario: nivelUsuario,
        cedula,
      });

      if (response.status === 201) {
        navigate("/login");
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error("Error en el registro:", err);
      setError("Error en el registro. Inténtalo de nuevo más tarde.");
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-xl font-semibold">Gestión de Usuarios</h1>

        <div className="my-4 flex items-center">
          <div className="flex flex-col">
            <div className="flex flex-col">
              <div className="flex mb-2 space-x-4">
                <div className="w-1/4">
                  <div className="mb-4">
                    <label
                      htmlFor="nombre"
                      className="block text-gray-700 mb-1"
                    >
                      Nombre
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className={`w-full p-3 border ${
                        errors.nombre ? "border-red-500" : "border-gray-300"
                      } rounded-lg`}
                    />
                    {errors.nombre && (
                      <span className="text-red-500">{errors.nombre}</span>
                    )}
                  </div>
                </div>

                <div className="w-1/4">
                  <label>Apellido Paterno</label>
                  <input
                    type="text"
                    value={apPaterno}
                    onChange={(e) => setApPaterno(e.target.value)}
                    className={`w-full p-3 border ${
                      errors.apPaterno ? "border-red-500" : "border-gray-300"
                    } rounded-lg`}
                  />
                  {errors.apPaterno && (
                    <span className="text-red-500">{errors.apPaterno}</span>
                  )}
                </div>

                <div className="w-1/4">
                  <label>Apellido Materno</label>
                  <input
                    type="text"
                    value={apMaterno}
                    onChange={(e) => setApMaterno(e.target.value)}
                    className={`w-full p-3 border ${
                      errors.apMaterno ? "border-red-500" : "border-gray-300"
                    } rounded-lg`}
                  />
                  {errors.apMaterno && (
                    <span className="text-red-500">{errors.apMaterno}</span>
                  )}
                </div>

                <div className="w-1/4">
                  <label>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full p-3 border ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } rounded-lg`}
                  />
                  {errors.email && (
                    <span className="text-red-500">{errors.email}</span>
                  )}
                </div>
                <div className="w-1/4">
                  <label>Password</label>
                  <input
                    type="password"
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

                <div className="w-1/4">
                  <label>Nivel de Usuario</label>
                  <input
                    type="text"
                    value={nivelUsuario}
                    onChange={(e) => setNivelUsuario(e.target.value)}
                    className={`w-full p-3 border ${
                      errors.nivelUsuario ? "border-red-500" : "border-gray-300"
                    } rounded-lg`}
                  />
                  {errors.nivelUsuario && (
                    <span className="text-red-500">{errors.nivelUsuario}</span>
                  )}
                </div>

                <div className="w-1/4">
                  <label>Cédula</label>
                  <input
                    type="text"
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
              </div>
              <button
                onClick={handleRegister}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Registrar
              </button>
            </div>
          </div>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">Nombre</th>
              <th className="border p-2">Apellido Paterno</th>
              <th className="border p-2">Apellido Materno</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Nivel Usuario</th>
              <th className="border p-2">Cédula</th>
              <th className="border p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((user) => (
              <tr key={user.id_usuario}>
                <td className="border p-2">{user.nombre}</td>
                <td className="border p-2">{user.ap_paterno}</td>
                <td className="border p-2">{user.ap_materno}</td>
                <td className="border p-2">{user.email}</td>
                <td className="border p-2">{user.nivel_usuario}</td>
                <td className="border p-2">{user.cedula}</td>
                <td className="border p-2 flex justify-center space-x-4">
                  <button
                    onClick={() => handleEdit(user)}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(user.id_usuario)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-xl mb-4">Editar Usuario</h2>
            <form onSubmit={handleSave}>
              <div className="mb-4">
                <label htmlFor="nombre" className="block text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={userToEdit.nombre}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="ap_paterno" className="block text-gray-700 mb-2">Apellido Paterno</label>
                <input
                  type="text"
                  id="ap_paterno"
                  name="ap_paterno"
                  value={userToEdit.ap_paterno}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="ap_materno" className="block text-gray-700 mb-2">Apellido Materno</label>
                <input
                  type="text"
                  id="ap_materno"
                  name="ap_materno"
                  value={userToEdit.ap_materno}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userToEdit.email}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="nivel_usuario" className="block text-gray-700 mb-2">Nivel de Usuario</label>
                <input
                  type="text"
                  id="nivel_usuario"
                  name="nivel_usuario"
                  value={userToEdit.nivel_usuario}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="cedula" className="block text-gray-700 mb-2">Cédula</label>
                <input
                  type="text"
                  id="cedula"
                  name="cedula"
                  value={userToEdit.cedula}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer />
    </Layout>
  );
}

export default Gestionusuarios;
