import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Layout from "../../Layout";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserFormModal from "../../components/Modals/UserFormModal";
import EditUserModal from "../../components/Modals/UserFormModalEdit";

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
  const [selectedUser, setSelectedUser] = useState(null);

  const [userToEdit, setUserToEdit] = useState({
    nombre: "",
    ap_paterno: "",
    ap_materno: "",
    email: "",
    nivel_usuario: "",
    cedula: "",
    especialidad: "",
    pantallasDisponibles: [], // Agregar este campo
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
    5: "Analista de producción",
    6: "Admin",
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

      // Asegúrate de incluir pantallasDisponibles en userToEdit
      const response = await fetch(
        `${baseURL}/api/users/users/${userToEdit.id_usuario}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...userToEdit,
            pantallasDisponibles: userToEdit.pantallasDisponibles.join(","), // Debe coincidir con el nombre que esperas en el backend
          }),
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
                      <td className="border px-6 py-2 flex justify-center items-center">
                        <button
                          className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-700"
                          onClick={() => setShowModal(true)}
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

          <div>
            
              <EditUserModal
                showModal={showModal}
                setShowModal={setShowModal}
                userToEdit={userToEdit}
                handleInputChange={handleInputChange}
                handleSave={handleSave}
                errors={errors}
              />
            </div>

        </div>
      </div>
       </div>
    </Layout>
  );
}

export default Gestionusuarios;
