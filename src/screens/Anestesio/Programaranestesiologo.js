import React, { useState, useEffect, useMemo } from "react";
import Layout from "../../Layout";
import AsyncSelect from "react-select/async";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { startOfWeek, endOfWeek, format } from "date-fns";
import Select from "react-select";

function Programaranestesiologo() {
  const [formData, setFormData] = useState({
    nombre: "",
    dia_anestesio: "",
    turno_anestesio: "",
    sala_anestesio: [], // Cambiado a array para manejar múltiples selecciones
    hora_inicio: "",
    hora_fin: "",
  });
  

  /*   const options = [
    { value: 'A1', label: 'Sala A1' },
    { value: 'A2', label: 'Sala A2' },
    { value: 'T1', label: 'Sala T1' },
    { value: 'T2', label: 'Sala T2' },
    { value: '1', label: 'Sala 1' },
    { value: '2', label: 'Sala 2' },
    { value: '3', label: 'Sala 3' },
    { value: '4', label: 'Sala 4' },
    { value: '5', label: 'Sala 5' },
    { value: '6', label: 'Sala 6' },
    { value: 'E', label: 'Sala E' },
    { value: 'H', label: 'Sala H' },
    { value: 'RX', label: 'Sala RX' }
  ]; */

  const [selectedOptions, setSelectedOptions] = useState([]);

  const [anesthesiologists, setAnesthesiologists] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [salasDisponibles, setSalasDisponibles] = useState([]);
  const [anesthesiologistsPerPage] = useState(10);

  const [page, setPage] = useState(1);
  const [endIndex, setEndIndex] = useState(10);
  const [sortedSolicitudes, setSortedSolicitudes] = useState([]);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("nombre_paciente");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";
  const [showModal, setShowModal] = useState(false);
  const [editingAnesthesiologist, setEditingAnesthesiologist] = useState({
    nombre: "",
    dia_anestesio: "",
    turno_anestesio: "",
    sala_anestesio: [],
    hora_inicio: "",
    hora_fin: ""
  });

  const handleSave = async (e) => {
    e.preventDefault();

    if (!editingAnesthesiologist) return;

    try {
      toast.dismiss();


      const response = await fetch(
        `${baseURL}/api/anestesio/anestesiologos/${editingAnesthesiologist.id_anestesiologo}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...editingAnesthesiologist,
            sala_anestesio: editingAnesthesiologist.sala_anestesio.join(","), // Debe coincidir con el nombre que esperas en el backend
          }),
        }
      );

      // Check if the response is ok, otherwise handle the error
      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }

      // If the response is ok, update the state with the updated user
      const updatedAestesio = await response.json();
      setAnesthesiologists((prevAnestesio) =>
        prevAnestesio.map((anesthesiologist) =>
          anesthesiologist.id_anestesiologo === anesthesiologist.id_anestesiologo ? updatedAestesio : anesthesiologist
        )
      );

      // Close the modal and show a success message
      setShowModal(false);
      toast.success("Anestesiologo actualizado correctamente");
    } catch (err) {
      // Handle any errors from the try block or fetch
      console.error("Error updating anesthesiologist:", err);
      setError(err.message || "Error updating anesthesiologist. Please try again later.");
      toast.error(
        err.message || "Error updating anesthesiologist. Please try again later."
      );
    }
  };

    // Manejar cambios en los inputs del formulario modal
    const handleEditChange = (event) => {
      const { name, value } = event.target;
      setEditingAnesthesiologist((prevAnestesio) => ({
        ...prevAnestesio,
        [name]: value,
      }));
    };

      // Edit user and open modal
  const handleEdit = (anesthesiologist) => {
    setEditingAnesthesiologist(anesthesiologist);
    setShowModal(true);
  };


  const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
  const endOfCurrentWeek = endOfWeek(new Date(), { weekStartsOn: 1 });

  const fetchActiveAnesthesiologists = async (inputValue) => {
    try {
      const response = await fetch(
        `${baseURL}/api/anestesiologos/activos?search=${inputValue}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data.map((anesthesiologist) => ({
        label: anesthesiologist.nombre_completo,
        value: anesthesiologist.nombre_completo,
      }));
    } catch (error) {
      console.error("Error fetching active anesthesiologists:", error);
      return [];
    }
  };

  // Define las opciones de salas
  const normalRooms = [
    { value: "A1", label: "Sala A1" },
    { value: "A2", label: "Sala A2" },
    { value: "T1", label: "Sala T1" },
    { value: "T2", label: "Sala T2" },
    { value: "1", label: "Sala 1" },
    { value: "2", label: "Sala 2" },
    { value: "3", label: "Sala 3" },
    { value: "4", label: "Sala 4" },
    { value: "5", label: "Sala 5" },
    { value: "6", label: "Sala 6" },
    { value: "E", label: "Sala E" },
    { value: "H", label: "Sala H" },
    { value: "RX", label: "Sala RX" },
  ];

  const specialRooms = [
    { value: "Recup_Matutino", label: "Recuperación Matutino" },
    { value: "Con_Ext_P1_mat", label: "Consulta Externa Piso 1 Mat" },
    { value: "Con_Ext_P2_mat", label: "Consulta Externa Piso 2 Mat" },
    { value: "Rec_Vespertino", label: "Recuperación Vespertino" },
    { value: "Con_Ext_P2_vesp", label: "Consulta Externa Piso 2 Vesp." },
    { value: "Rec_Nocturno", label: "Recuperación Nocturno" }
  ];

  const allRooms = [
    ...normalRooms.map((option) => ({
      ...option,
      isDisabled: selectedOptions.some((opt) =>
        specialRooms.map((room) => room.value).includes(opt.value)
      ),
    })),
    ...specialRooms.map((option) => ({
      ...option,
      isDisabled:
        selectedOptions.length > 0 &&
        !specialRooms
          .map((room) => room.value)
          .includes(selectedOptions[0]?.value),
    })),
  ];

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value, // Esto actualizará el campo correspondiente
    }));

    if (name === "turno_anestesio") {
      switch (value) {
        case "Matutino":
          setFormData((prevFormData) => ({
            ...prevFormData,
            hora_inicio: "08:00",
            hora_fin: "15:00",
          }));
          break;
        case "Vespertino":
          setFormData((prevFormData) => ({
            ...prevFormData,
            hora_inicio: "15:00",
            hora_fin: "21:00",
          }));
          break;
        case "Nocturno":
          setFormData((prevFormData) => ({
            ...prevFormData,
            hora_inicio: "21:00",
            hora_fin: "06:00",
          }));
          break;
        default:
          setFormData((prevFormData) => ({
            ...prevFormData,
            hora_inicio: "",
            hora_fin: "",
          }));
      }
    }
  };

  const handleSaveAnesthesiologist = async () => {
    try {
      // Verificar si hay un anestesiólogo asignado a la misma sala en el mismo día
      const existingAssignment = anesthesiologists.find(
        (anesthesiologist) =>
          anesthesiologist.dia_anestesio === formData.dia_anestesio &&
          anesthesiologist.turno_anestesio === formData.turno_anestesio &&
          anesthesiologist.sala_anestesio.some((sala) =>
            formData.sala_anestesio.includes(sala)
          )
      );
  
      if (existingAssignment) {
        toast.error(
          "Ya hay un anestesiólogo asignado a esta sala en el mismo día."
        );
        return;
      }
  
      const response = await fetch(`${baseURL}/api/anestesio/anestesiologos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("Anesthesiologist saved successfully:", data);
  
      // Mostrar notificación de éxito
      toast.success("¡Anestesiólogo asignado con éxito!");
  
      // Limpiar el formulario
      setFormData({
        nombre: "",
        dia_anestesio: "",
        turno_anestesio: "",
        sala_anestesio: [], // Limpiar el campo de salas
        hora_inicio: "",
        hora_fin: "",
      });
  
      // Limpiar selectedOptions
      setSelectedOptions([]);
  
      // Actualizar la lista de anestesiólogos después de guardar uno nuevo
      fetchAnesthesiologists();
    } catch (error) {
      console.error("Error saving anesthesiologist:", error);
      // Mostrar notificación de error
      toast.error("Error al guardar el anestesiólogo");
    }
  };
  

  const handleDeleteAnesthesiologist = async (id) => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar este anestesiólogo?"
      )
    ) {
      try {
        const response = await fetch(
          `${baseURL}/api/anestesio/anestesiologos/${id}`,
          {
            method: "DELETE",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Network response was not ok");
        }

        // Actualizar la lista de anestesiólogos después de eliminar uno
        fetchAnesthesiologists();
        toast.success(data.message || "Anestesiólogo eliminado con éxito");
      } catch (error) {
        console.error("Error deleting anesthesiologist:", error);
        toast.error(error.message || "Error al eliminar el anestesiólogo");
      }
    }
  };

  const fetchAnesthesiologists = async () => {
    try {
      const response = await fetch(`${baseURL}/api/anestesio/anestesiologos`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      let data = await response.json();
      const sortedData = data.sort((a, b) => b.id_anestesiologo - a.id_anestesiologo); // Ordenar por id_solicitud de mayor a menor
      setAnesthesiologists(sortedData);
    } catch (error) {
      console.error("Error fetching anesthesiologists:", error);
      toast.error("Error al obtener los anestesiólogos");
    }
  };
  
  useEffect(() => {
    fetchAnesthesiologists();
  }, []);
  

  // Calcular índices para la paginación
  const indexOfLastAnesthesiologist = page * anesthesiologistsPerPage;
  const indexOfFirstAnesthesiologist =
    indexOfLastAnesthesiologist - anesthesiologistsPerPage;

  // Filtrar anestesiólogos según el término de búsqueda y el campo seleccionado
  const currentAnesthesiologists = anesthesiologists
    .filter((anesthesiologist) => {
      const fieldValue = anesthesiologist[searchField]?.toLowerCase() || "";
      return fieldValue.includes(searchTerm.toLowerCase());
    })
    .slice(indexOfFirstAnesthesiologist, indexOfLastAnesthesiologist);

  useEffect(() => {
    fetchSalasDisponibles();
  }, []);

  const fetchSalasDisponibles = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/salas/salas`);
      const disponibles = response.data.filter((sala) => sala.estado);
      setSalasDisponibles(disponibles);
    } catch (error) {
      console.error("Error fetching salas:", error);
    }
  };

  const handleSort = (field) => {
    const newSortOrder =
      sortBy === field ? (sortOrder === "asc" ? "desc" : "asc") : "asc";
    setSortBy(field);
    setSortOrder(newSortOrder);

    const sortedData = [...anesthesiologists].sort((a, b) => {
      if (a[field] < b[field]) return newSortOrder === "asc" ? -1 : 1;
      if (a[field] > b[field]) return newSortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setSortedSolicitudes(sortedData);
  };

  // Función para obtener el color de fondo basado en el turno
  const getTurnColor = (turno_anestesio) => {
    switch (turno_anestesio) {
      case "Matutino":
        return "rgba(129, 164, 255, 0.43)";
      case "Vespertino":
        return "rgba(109, 255, 19, 0.43)";
      case "Nocturno":
        return "rgba(255, 169, 89, 0.43)";
      default:
        return "transparent";
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  // Cambiar página
  const paginate = (pageNumber) => {
    setPage(pageNumber);
    setEndIndex(pageNumber * anesthesiologistsPerPage);
  };

  // Funciones de paginación para adelante y regreso
  const handleNextPage = () => {
    if (page < Math.ceil(anesthesiologists.length / anesthesiologistsPerPage)) {
      paginate(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      paginate(page - 1);
    }
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleChange = (selected) => {
    setSelectedOptions(selected);
    setFormData((prevFormData) => ({
      ...prevFormData,
      sala_anestesio: selected ? selected.map((option) => option.value) : [],
    }));
  };


  return (
    <Layout>
      <ToastContainer position="bottom-right" />
      <div
        data-aos="fade-right"
        data-aos-duration="1000"
        data-aos-delay="100"
        data-aos-offset="200"
      >
        <div className="flex flex-col gap-2 mb-4">
          <h1 className="text-xl font-semibold">Anestesiólogos asignados</h1>
          <div className="my-4">
            <div>
              <Link
                to="/anestesiólogos"
                className="bg-[#365b77] hover:bg-[#7498b6] text-white py-2 px-4 rounded inline-flex items-center"
              >
                <span>Ver agenda de Anestesiólogos</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex flex-col">
              <div className="flex mb-2 space-x-4">
                <div className="w-1/4">
                  <label
                    style={{ marginBottom: "30px" }}
                    className="text-sm font-medium text-gray-700"
                  >
                    Nombre de anestesiólogo
                  </label>
                  <input
                    placeholder="Nombre del anestesiologo"
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ minHeight: "auto" }}
                  />
                </div>

                <div className="w-1/4">
                  <label className="block text-sm font-medium text-gray-700">
                    Asignar día
                  </label>
                  <input
                    type="date"
                    name="dia_anestesio"
                    value={formData.dia_anestesio}
                    onChange={handleInputChange}
                    placeholder="dd/mm/aaaa"
                    className="mt-1 block w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="w-1/4">
                  <label className="block text-sm font-medium text-gray-700">
                    Asignar turno
                  </label>
                  <select
                    name="turno_anestesio"
                    value={formData.turno_anestesio}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar</option>
                    <option value="Matutino">Matutino</option>
                    <option value="Vespertino">Vespertino</option>
                    <option value="Nocturno">Nocturno</option>
                  </select>
                </div>

                <div className="w-1/8">
                  <label className="block text-sm font-medium text-gray-700">
                    Hora Inicio
                  </label>
                  <input
                    type="text"
                    name="hora_inicio"
                    value={formData.hora_inicio}
                    readOnly
                    className="mt-1 block w-full px-2 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-200 cursor-default"
                  />
                </div>
                <div className="w-1/8">
                  <label className="block text-sm font-medium text-gray-700">
                    Hora Fin
                  </label>
                  <input
                    type="text"
                    name="hora_fin"
                    value={formData.hora_fin}
                    readOnly
                    className="mt-1 block w-full px-2 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-200 cursor-default"
                  />
                </div>

                <div className="w-1/4">
                  <div className="form-group">
                    <label htmlFor="nombre">Asignar sala (s)</label>
                    <Select
                      options={allRooms}
                      isMulti
                      value={selectedOptions}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="px-2 py-2 text-right">
                <button
                  onClick={handleSaveAnesthesiologist}
                  className="bg-[#365b77] text-white px-5 py-2 rounded-md hover:bg-[#7498b6]"
                >
                  Guardar
                </button>
              </div>
            </div>

            {/* Filtros de búsqueda */}
            <div className="mt-1/2">
              <div className="text-left">
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center space-x-4">
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
                      <option value="nombre">Nombre</option>
                      <option value="dia_anestesio">Día asignado</option>
                      <option value="turno_anestesio">Turno asignado</option>
                      <option value="hora_inicio">Hora inicio</option>
                      <option value="hora_fin">Hora fin</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden border-b border-white-200 shadow sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#365b77] text-white">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider"
                    >
                      ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider"
                    >
                      Nombre
                      <span>
                        {sortBy === "nombre" &&
                          (sortOrder === "asc" ? "▲" : "▼")}
                      </span>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider"
                    >
                      Día asignado
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider"
                    >
                      Turno asignado
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider"
                    >
                      Sala asignada
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider"
                    >
                      Hora inicio
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider"
                    >
                      Hora fin
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-white-500 uppercase tracking-wider"
                    >
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentAnesthesiologists.map((anesthesiologist, index) => (
                    <tr key={anesthesiologist.folio}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-300">
                        {(page - 1) * anesthesiologistsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap border-r border-gray-300">
                        <div className="text-sm font-medium text-gray-900">
                          {anesthesiologist.nombre}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap border-r border-gray-300">
                        <div className="text-sm text-gray-900">
                          {anesthesiologist.dia_anestesio}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-300">
                        <span
                          className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          style={{
                            backgroundColor: getTurnColor(
                              anesthesiologist.turno_anestesio
                            ),
                          }}
                        >
                          {anesthesiologist.turno_anestesio}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-300">
                        {Array.isArray(anesthesiologist.sala_anestesio)
                          ? anesthesiologist.sala_anestesio.join(", ")
                          : anesthesiologist.sala_anestesio}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-300">
                        {anesthesiologist.hora_inicio}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-300">
                        {anesthesiologist.hora_fin}
                      </td>
                      <td className="border px-6 py-2 flex justify-center items-center">
                      <button
                          className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-700"
                          onClick={() => handleEdit(anesthesiologist)}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteAnesthesiologist(
                              anesthesiologist.id_anestesiologo
                            )
                          }
                          className="bg-[#CB2525] text-white px-5 py-2 rounded-md hover:bg-[#E54F4F]"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Controles de paginación */}
          <div className="flex justify-center items-center mt-6 space-x-4">
            <button
              onClick={handlePreviousPage}
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
              onClick={handleNextPage}
              disabled={
                page >=
                Math.ceil(anesthesiologists.length / anesthesiologistsPerPage)
              }
              className={`${
                page >=
                Math.ceil(anesthesiologists.length / anesthesiologistsPerPage)
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#365b77] hover:bg-[#7498b6]"
              } text-white font-semibold py-2 px-6 rounded-full shadow-md transition-all duration-300 ease-in-out transform hover:scale-105`}
            >
              &#8594;
            </button>
          </div>
        </div>
        {showModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded shadow-lg w-1/3">
      <h2 className="text-xl mb-4">Editar Anestesiólogo</h2>
      <form
        onSubmit={(e) => {
          handleSave(e);
          setShowModal(false);
          window.location.reload();
        }}
      >
        <div className="mb-4">
          <label htmlFor="nombre" className="block text-gray-700 mb-2">
            Nombre
          </label>
          <input
            type="text"
            name="nombre"
            value={editingAnesthesiologist?.nombre || ""}
            onChange={handleEditChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="dia_anestesio" className="block text-gray-700 mb-2">
            Día asignado
          </label>
          <input
            type="date"
            id="dia_anestesio"
            name="dia_anestesio"
            value={editingAnesthesiologist.dia_anestesio || ""}
            onChange={handleEditChange}
            className="w-full p-3 border rounded-lg"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="turno_anestesio" className="block text-gray-700 mb-2">
            Turno asignado
          </label>
          <select
            id="turno_anestesio"
            name="turno_anestesio"
            value={editingAnesthesiologist.turno_anestesio || ""}
            onChange={(e) => {
              const turno = e.target.value;
              let horaInicio = "";
              let horaFin = "";

              switch (turno) {
                case "Matutino":
                  horaInicio = "08:00";
                  horaFin = "14:00";
                  break;
                case "Vespertino":
                  horaInicio = "14:00";
                  horaFin = "20:00";
                  break;
                case "Nocturno":
                  horaInicio = "20:00";
                  horaFin = "06:00";
                  break;
                default:
                  horaInicio = "";
                  horaFin = "";
              }

              // Actualiza el turno y las horas correspondientes
              setEditingAnesthesiologist((prevState) => ({
                ...prevState,
                turno_anestesio: e.target.value,
                hora_inicio: horaInicio,
                hora_fin: horaFin,
              }));
            }}
            className="w-full p-3 border rounded-lg"
          >
            <option value="">Seleccionar turno</option>
            <option value="Matutino">Matutino</option>
            <option value="Vespertino">Vespertino</option>
            <option value="Nocturno">Nocturno</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="hora_inicio" className="block text-gray-700 mb-2">
            Hora de inicio de turno
          </label>
          <input
            type="time"
            id="hora_inicio"
            name="hora_inicio"
            value={editingAnesthesiologist.hora_inicio || ""}
            readOnly
            className="w-full p-3 border rounded-lg bg-gray-100"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="hora_fin" className="block text-gray-700 mb-2">
            Hora de fin de turno
          </label>
          <input
            type="time"
            id="hora_fin"
            name="hora_fin"
            value={editingAnesthesiologist.hora_fin || ""}
            readOnly
            className="w-full p-3 border rounded-lg bg-gray-100"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="sala_anestesio" className="block text-gray-700 mb-2">
            Salas Asignadas
          </label>
          <Select
            isMulti
            options={allRooms}
            value={allRooms.filter((option) =>
              editingAnesthesiologist.sala_anestesio.includes(option.value)
            )}
            onChange={(selectedOptions) => {
              const selectedValues = selectedOptions.map(option => option.value);
              setEditingAnesthesiologist({
                ...editingAnesthesiologist,
                sala_anestesio: selectedValues,
              });
            }}
            className="basic-multi-select"
            classNamePrefix="select"
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
    </Layout>
  );
}

export default Programaranestesiologo;
