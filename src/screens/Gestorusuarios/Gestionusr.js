import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Layout from "../../Layout";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserFormModal from "../../components/Modals/UserFormModal";

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

  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10); // Cambia el número según tus necesidades

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("nombre_paciente");
  const [updatedPantallas, setUpdatedPantallas] = useState([]);
  const [filterNombre, setFilterNombre] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [pantallasDisponibles, setPantallasDisponibles] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState({
    nombre: "",
    ap_paterno: "",
    ap_materno: "",
    email: "",
    nivel_usuario: "",
    cedula: "",
    especialidad: "",
    pantallasDisponibles: [], // Agregar este campo
    turno: "",
  });
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

  const nivelUsuarioMap = {
    1: "Programación Qx",
    2: "Enfermería",
    3: "Anestesiología",
    4: "Médico",
    5: "Gestor de insumos",
    6: "Admin",
    7: "Admin Enfermería",
    8: "Compras"
  };

  const handleCheckboxChange = (screen) => {
    setUserToEdit((prevUser) => {
      const updatedPantallas = prevUser.pantallasDisponibles
        ? prevUser.pantallasDisponibles.split(',')
        : [];
      const index = updatedPantallas.indexOf(screen);
      if (index > -1) {
        updatedPantallas.splice(index, 1);
      } else {
        updatedPantallas.push(screen);
      }
      return { ...prevUser, pantallasDisponibles: updatedPantallas.join(',') };
    });
  };

  const handleFilterChange = (searchTerm) => {
    // Filter pantallasDisponibles based on searchTerm
    const filteredPantallas = pantallasDisponibles.filter((pantalla) => {
      // Implement your filtering logic here, e.g., by name
      return pantalla.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Update filtered data state
    setUpdatedPantallas(filteredPantallas);
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
    if (window.confirm("¿Estás seguro de que quieres eliminar este Usuario?")) {
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

          setSuccess("Usuario eliminado correctamente.");
          toast.success("Usuario eliminado correctamente.");
        }
      } catch (err) {
        console.error("Error deleting user:", err);
        setError("Error deleting user. Please try again later.");
      }
    }
  };

  // Save edited user
  const handleSave = async (e) => {
    e.preventDefault();

    if (!userToEdit) return;

    try {
      toast.dismiss();

      console.log("Pantallas disponibles:", userToEdit.pantallasDisponibles);

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

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }

      const updatedUser = await response.json();
      setUsuarios((prevUsuarios) =>
        prevUsuarios.map((user) =>
          user.id_usuario === updatedUser.id_usuario ? updatedUser : user
        )
      );

      setShowModal(false);
      toast.success("Usuario actualizado correctamente");
    } catch (err) {
      console.error("Error updating user:", err);
      setError(err.message || "Error updating user. Please try again later.");
      toast.error(err.message || "Error updating user. Please try again later.");
    }
  };

  const availableScreens = [
    "Dashboard", "Solicitudes", "Evaluación", "Agenda", "Anestesiólogos",
    "Bitácora enfermería", "Bitácora anestesiología", "Gestor de salas",
    "Solicitudes insumos", "Gestor de productividad", "Gestor de usuarios", "Insumos"
  ];
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
        fetchUsuarios();
        toast.success("Usuario agregado correctamente");

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

  // Calculate pagination
  const totalPages = Math.ceil(usuariosFiltrados.length / itemsPerPage);
  const offset = (page - 1) * itemsPerPage;
  const currentPageData = usuariosFiltrados.slice(
    offset,
    offset + itemsPerPage
  );

  return (
    <Layout>
      {/* Mostrar notificaciones */}
      <ToastContainer position="bottom-right" />

      <div
        data-aos="fade-right"
        data-aos-duration="1000"
        data-aos-delay="100"
        data-aos-offset="200"
      >
        <div className="flex flex-col gap-4 mb-6">
          <h1 className="text-xl font-semibold">Gestor de Usuarios</h1>

          <div className="flex flex-col gap-4 mb-6">
            <div className="my-4 flex items-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-sm btn-secondary p-2 bg-[#365b77] text-white rounded-lg"
            >
              Registrar nuevo usuario
            </button>
            <UserFormModal
              isOpen={isModalOpen}
              closeModal={() => setIsModalOpen(false)}
              nombre={nombre}
              setNombre={setNombre}
              apPaterno={apPaterno}
              setApPaterno={setApPaterno}
              apMaterno={apMaterno}
              setApMaterno={setApMaterno}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              cedula={cedula}
              setCedula={setCedula}
              nivelUsuario={nivelUsuario}
              setNivelUsuario={setNivelUsuario}
              errors={errors}
              handleRegister={handleRegister}
            />
            </div>
         

          {/* Filtros de búsqueda */}
          <div className="text-left">
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
                  <th className="px-4 py-2">Rol de usuario</th>
                  <th className="px-4 py-2">Especialidad</th>
                  <th className="px-4 py-2">Turno</th>
                  <th className="px-4 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentPageData.length > 0 ? (
                  currentPageData.map((user) => (
                    <tr
                      key={user.id_usuario}
                      className="bg-blue-50 hover:bg-[#7498b6]"
                    >
                      <td className="border px-4 py-2">{user.nombre}</td>
                      <td className="border px-4 py-2">{user.ap_paterno}</td>
                      <td className="border px-4 py-2">{user.ap_materno}</td>
                      <td className="border px-4 py-2">{user.email}</td>
                      <td className="border px-4 py-2">
                        {nivelUsuarioMap[user.nivel_usuario] || "Desconocido"}
                      </td>
                      <td className="border px-4 py-2">
                        {user.especialidad || ""}
                      </td>
                      <td className="border px-4 py-2">
                        {user.turno || ""}
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

          {/* Paginación */}
          <div className="flex justify-center items-center mt-6 space-x-4">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className={`${
                page === 1
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#365b77] hover:bg-[#7498b6]"
              } text-white font-semibold py-2 px-6 rounded-full shadow-md transition-all duration-300 ease-in-out transform hover:scale-105`}
            >
              &#8592;
            </button>
            <span className="text-lg font-semibold text-gray-800">
              Página {page}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className={`${
                page === totalPages
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#365b77] hover:bg-[#7498b6]"
              } text-white font-semibold py-2 px-6 rounded-full shadow-md transition-all duration-300 ease-in-out transform hover:scale-105`}
            >
              &#8594;
            </button>
          </div>

          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded shadow-lg w-1/2">
                <h2 className="text-xl mb-4">Editar Usuario</h2>
                <form onSubmit={handleSave}>
                  <div className="mb-4 grid grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="nombre"
                        className="block text-gray-700 mb-2"
                      >
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
                    <div>
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
                    <div>
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
                  </div>

                  <div className="mb-4 grid grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-gray-700 mb-2"
                      >
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
                    <div>
                      <label
                        htmlFor="nivel_usuario"
                        className="block text-gray-700 mb-2"
                      >
                        Rol de usuario
                      </label>
                      <select
                        id="nivel_usuario"
                        name="nivel_usuario"
                        value={userToEdit.nivel_usuario || ""}
                        onChange={handleInputChange}
                        className="w-full p-3 border rounded-lg"
                      >
                        <option value="">Seleccionar</option>
                        <option value="1">(1) Programación Qx</option>
                        <option value="2">(2) Enfermería</option>
                        <option value="3">(3) Anestesiología</option>
                        <option value="4">(4) Médico</option>
                        <option value="5">(5) Gestor de insumos</option>
                        <option value="6">(6) Admin</option>
                        <option value="7">(7) Admin Enfermería</option>
                        <option value="7">(8) Compras</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="cedula"
                        className="block text-gray-700 mb-2"
                      >
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
                    <div>
                      <label
                        htmlFor="contraseña"
                        className="block text-gray-700 mb-2"
                      >
                        Contraseña
                      </label>
                      <input
                        type="password"
                        id="contraseña"
                        name="contraseña"
                        value={userToEdit.contraseña || ""}
                        onChange={handleInputChange}
                        className="w-full p-3 border rounded-lg"
                      />
                    </div>
                    <div className="mb-4 w-full">
                      <label
                        htmlFor="especialidad"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Especialidad
                      </label>
                      <select
                        id="especialidad"
                        name="especialidad"
                        value={userToEdit.especialidad}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Selecciona una especialidad</option>
                        <option value="Algología">Algología</option>
                        <option value="Angiología">Angiología</option>
                        <option value="C.Plástica y Reconstructiva">
                          C.Plástica y Reconstructiva
                        </option>
                        <option value="Cardiología">Cardiología</option>
                        <option value="Cirugía de Torax">
                          Cirugía de Torax
                        </option>
                        <option value="Cirugía Bariatrica">
                          Cirugía Bariatrica
                        </option>
                        <option value="Cirugía Cardiaca">
                          Cirugía Cardiaca
                        </option>
                        <option value="Cirugía General">Cirugía General</option>
                        <option value="Cirugía Hepatobiliar">
                          Cirugía Hepatobiliar
                        </option>
                        <option value="Coloproctología">Coloproctología</option>
                        <option value="Columna">Columna</option>
                        <option value="Endoscopia">Endoscopia</option>
                        <option value="Gastroenterología">
                          Gastroenterología
                        </option>
                        <option value="Hemodinamía">Hemodinamía</option>
                        <option value="Imagenología">Imagenología</option>
                        <option value="Maxilofacial">Maxilofacial</option>
                        <option value="Neurocirugía">Neurocirugía</option>
                        <option value="Oftalmología">Oftalmología</option>
                        <option value="Oncología">Oncología</option>
                        <option value="Orbitología">Orbitología</option>
                        <option value="Otorrinolaringología">
                          Otorrinolaringología
                        </option>
                        <option value="Proctología">Proctología</option>
                        <option value="Procuración">Procuración</option>
                        <option value="T. de córnea">T. de córnea</option>
                        <option value="T. Hepático">T. Hepático</option>
                        <option value="T. Renal">T. Renal</option>
                        <option value="Transplantes">Transplantes</option>
                        <option value="Trauma y Ortopedia">
                          Trauma y Ortopedia
                        </option>
                        <option value="Urología">Urología</option>
                      </select>
                    </div>
                    <div className="mb-4 w-full">
                      <label
                        htmlFor="turno"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Turno
                      </label>
                      <select
                        id="turno"
                        name="turno"
                        value={userToEdit.turno}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Asignar turno de enfermería</option>
                        <option value="Matutino">Matutino</option>
                        <option value="Vespertino">Vespertino</option>
                        <option value="Nocturno">Nocturno</option>
                        <option value="Especial Diurno">Especial Diurno</option>
                        <option value="Especial Nocturno">Especial Nocturno</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                <label className="block text-center mb-2">Pantallas Disponibles</label>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {availableScreens.map((screen) => (
                    <div key={screen} className="flex items-center">
                      <input
                        type="checkbox"
                        id={screen}
                        checked={userToEdit.pantallasDisponibles?.split(',').includes(screen) || false}
                        onChange={() => handleCheckboxChange(screen)}
                      />
                      <label htmlFor={screen} className="ml-2">{screen}</label>
                    </div>
                  ))}
                </div>
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
      </div>
       </div>
    </Layout>
  );
}

export default Gestionusuarios;
