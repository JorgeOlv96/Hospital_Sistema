import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Layout from "../../Layout";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Gestionusuarios() {
  const [formData, setFormData] = useState({
    nombre: "",
    dia_anestesio: "",
    turno_anestesio: "",
    sala_anestesio: "",
    hora_inicio: "",
    hora_fin: "",
  });

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

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("nombre_paciente");

  const [filterNombre, setFilterNombre] = useState("");
  const [filterEmail, setFilterEmail] = useState("");

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

  // Mover fetchUsuarios fuera del useEffect
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

  useEffect(() => {
    fetchUsuarios();
  }, []);

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
        // Filtrar el usuario eliminado de la lista
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

    if (!userToEdit) return;

    try {
      toast.dismiss();

      const response = await fetch(
        `${baseURL}/api/users/users/${userToEdit.id_usuario}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userToEdit),
        }
      );

      // Check if the response is ok, otherwise handle the error
      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }

      // If the response is ok, update the state with the updated user
      const updatedUser = await response.json();
      setUsuarios((prevUsuarios) =>
        prevUsuarios.map((user) =>
          user.id_usuario === updatedUser.id_usuario ? updatedUser : user
        )
      );

      // Close the modal and show a success message
      setShowModal(false);
      toast.success("Usuario actualizado correctamente");
    } catch (err) {
      // Handle any errors from the try block or fetch
      console.error("Error updating user:", err);
      setError(err.message || "Error updating user. Please try again later.");
      toast.error(
        err.message || "Error updating user. Please try again later."
      );
    }
  };

  // Manejar cambios en los inputs del formulario modal
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserToEdit((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  // Edit user and open modal
  const handleEdit = (user) => {
    setUserToEdit(user);
    setShowModal(true);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

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
        // Si el registro es exitoso, actualiza la lista de usuarios
        fetchUsuarios();

        // Mostrar notificación de éxito
        toast.success("Usuario agregado correctamente");

        // Limpiar el formulario
        setNombre("");
        setApPaterno("");
        setApMaterno("");
        setEmail("");
        setPassword("");
        setNivelUsuario("");
        setCedula("");
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error("Error en el registro:", err);
      setError("Error en el registro. Inténtalo de nuevo más tarde.");
      // Mostrar notificación de error
      toast.error("Error al registrar el usuario");
    }
  };

  // Filtrar usuarios según el término de búsqueda y el campo seleccionado
  const usuariosFiltrados = usuarios.filter((user) => {
    if (searchField === "nombre") {
      return (
        user.nombre &&
        user.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else if (searchField === "email") {
      return (
        user.email &&
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true; // Si no se selecciona un campo válido, no filtra
  });

  return (
    <Layout>
      <div
        data-aos="fade-right"
        data-aos-duration="1000"
        data-aos-delay="100"
        data-aos-offset="200"
      >
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-xl font-semibold">Gestor de Usuarios</h1>

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

                <div className="w-1/4">
                  <label>Nivel de usuario</label>
                  <select
                    value={nivelUsuario}
                    onChange={(e) => setNivelUsuario(e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar</option>
                    <option value="1">
                      (1) Dashboard, Solicitudes, Agenda
                    </option>
                    <option value="2">(2) Dashboard, Evaluación</option>
                    <option value="3">
                      (3) Bitacora Enfermeria y Dasboard
                    </option>
                    <option value="3">(4) Bitacora Anestesio y Dasboard</option>
                    <option value="4">(5) Anestesiólogos, Dashboard</option>
                    <option value="5">(6) Todos ( Admin ) </option>
                  </select>
                </div>
              </div>

              <div className="px-2 py-2 text-right mb-2">
                <button
                  onClick={handleRegister}
                  className="bg-[#365b77] text-white px-5 py-2 rounded-md hover:bg-[#7498b6]"
                >
                  Registrar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros de búsqueda */}
        <div className="text-left mb-2">
          <div className="flex justify-center  items-center space-x-2">
            {" "}
            {/* Reducido el espacio */}
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md w-64"
            />
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            > 
              
              <option value="">Seleccionar</option>
              <option value="nombre">Nombre</option>
              <option value="email">Email</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden border-b border-white-200 shadow sm:rounded-lg">
          <table className="min-w-full divide-y divide-white-200">
            <thead className="bg-[#365b77] text-white">
              <tr>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Apellido Paterno</th>
                <th className="px-4 py-2">Apellido Materno</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Nivel de Usuario</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.length > 0 ? (
                usuariosFiltrados.map((user) => (
                  <tr key={user.id_usuario} className="bg-blue-50 hover:bg-[#7498b6]" >
                    <td className="border px-4 py-2">{user.nombre}</td>
                    <td className="border px-4 py-2">{user.ap_paterno}</td>
                    <td className="border px-4 py-2">{user.ap_materno}</td>
                    <td className="border px-4 py-2">{user.email}</td>
                    <td className="border px-4 py-2 text-center">
                      {user.nivel_usuario}
                    </td>

                    <td className="border px-6 py-2 flex justify-center items-center">
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-700"
                        onClick={() => handleEdit(user)}
                      >
                        Editar
                      </button>

                      <button
                        className="bg-[#CB2525] text-white px-4 py-2 rounded-md hover:bg-[#E54F4F]"
                        onClick={() => handleDelete(user.id_usuario)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="border px-4 py-2 text-center">
                    No hay usuarios disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg w-1/3">
              <h2 className="text-xl mb-4">Editar Usuario</h2>
              <form onSubmit={handleSave}>
                <div className="mb-4">
                  <label htmlFor="nombre" className="block text-gray-700 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={userToEdit?.nombre || ""}
                    onChange={handleInputChange}
                    className={`w-full p-3 border ${
                      errors.nombre ? "border-red-500" : "border-gray-300"
                    } rounded-lg`}
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="ap_paterno"
                    className="block text-gray-700 mb-2"
                  >
                    Apellido Paterno
                  </label>
                  <input
                    type="text"
                    id="ap_paterno"
                    name="ap_paterno"
                    value={userToEdit.ap_paterno || ""}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="ap_materno"
                    className="block text-gray-700 mb-2"
                  >
                    Apellido Materno
                  </label>
                  <input
                    type="text"
                    id="ap_materno"
                    name="ap_materno"
                    value={userToEdit.ap_materno || ""}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={userToEdit.email}
                    onChange={handleInputChange || ""}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="nivel_usuario"
                    className="block text-gray-700 mb-2"
                  >
                    Nivel de Usuario
                  </label>
                  <select
                    id="nivel_usuario"
                    name="nivel_usuario"
                    value={userToEdit.nivel_usuario || ""}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="">Seleccionar</option>
                    <option value="1">
                      (1) Dashboard, Solicitudes, Agenda
                    </option>
                    <option value="2">(2) Dashboard, Evaluación</option>
                    <option value="3">
                      (3) Bitacora Enfermeria y Dashboard
                    </option>
                    <option value="4">
                      (4) Bitacora Anestesio y Dashboard
                    </option>
                    <option value="5">(5) Anestesiólogos, Dashboard</option>
                    <option value="6">(6) Todos (Admin)</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="cedula" className="block text-gray-700 mb-2">
                    Cédula
                  </label>
                  <input
                    type="text"
                    id="cedula"
                    name="cedula"
                    value={userToEdit.cedula || ""}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>

                
                <div className="flex justify-end space-x-4">
                  <button
                    type="submit"
                    className="bg-green-500 bg-opacity-20 text-green-500 text-sm p-4 rounded-lg font-light"
                  >
                    Guardar cambios
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-red-500 bg-opacity-20 text-red-500 text-sm p-4 rounded-lg font-light"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      {/* Mostrar notificaciones */}
      <ToastContainer position="bottom-right" />
      </div>
    </Layout>
  );
}

export default Gestionusuarios;
