import React, { useState, useEffect, useContext } from "react";
import Layout from "../../Layout";
import SolicitudInsumosModal from "../../components/Modals/SolicitudInsumosModal";
import axios from "axios";
import { Link } from 'react-router-dom';
import { AuthContext } from "../../AuthContext";
import { FaTable, FaThLarge } from "react-icons/fa"; // Asegúrate de tener esta biblioteca instalada


function SolicitudesInsumos() {
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [open, setOpen] = useState(false);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;
  const { user } = useContext(AuthContext);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";

  // Estados para los filtros
  const [nameFilter, setNameFilter] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [view, setView] = useState("table"); // State to toggle view
  // Extrae la especialidad del usuario
  const userSpecialty = user?.especialidad || "";
  const [filter, setFilter] = useState({
    estado: "", // valor inicial para el estado de la solicitud
    // otros filtros aquí
  });

  const appointment = {
    estado_solicitud: "Pendiente", // o cualquier otro estado que tengas
    // otros datos aquí
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prevFilter) => ({
      ...prevFilter,
      [name]: value,
    }));
  };

  useEffect(() => {
    fetchPendingAppointments();
  }, []);

  const fetchPendingAppointments = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/insumos/solicitudes-insumos`);
  
      // Obtener los datos directamente desde la respuesta
      const data = response.data;
  
      // Ordenar los datos solo por fecha solicitada de manera ascendente
      const sortedData = data.sort((a, b) => new Date(a.fecha_solicitada) - new Date(b.fecha_solicitada));
  
      // Actualizar el estado con todos los datos ordenados
      setPendingAppointments(sortedData);
    } catch (error) {
      console.error("Error fetching pending appointments:", error);
    }
  };
  
  


  const handleViewModal = (appointment) => {
    setSelectedAppointment(appointment);
    setOpen(true);
  };

  const handleModal = () => {
    setOpen(false);
  };

  const handleDeleteAppointment = (appointmentId) => {
    console.log("Eliminar cita con id:", appointmentId);
  };

  const getEstadoColor = (estado = "") => {
    switch (estado.toLowerCase()) {
      case "programada":
        return "bg-green-400";
      case "realizada":
        return "bg-blue-400";
      case "suspendida":
        return "bg-yellow-400";
      case "pendiente":
        return "bg-orange-400";
      case "pre-programada":
        return "bg-red-400";
      case "urgencia":
        return "bg-red-400";
      default:
        return "";
    }
  };
  
  const getEstadoColorStyle = (estado = "") => {
    switch (estado.toLowerCase()) {
      case "programada":
        return { backgroundColor: "#68D391", color: "white" };
      case "realizada":
        return { backgroundColor: "#63B3ED", color: "white" };
      case "suspendida":
        return { backgroundColor: "#F6E05E", color: "white" };
      case "pendiente":
        return { backgroundColor: "#E9972F", color: "white" };
      case "pre-programada":
        return { backgroundColor: "#06ABC9", color: "white" };
      case "urgencia":
        return { backgroundColor: "#FC8181", color: "white" };
      default:
        return {};
    }
  };
  

  const formatFechaSolicitada = (fecha) => {
    if (!fecha) return "";
    const [year, month, day] = fecha.split("-");
    return `${day}-${month}-${year}`;
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const sortedAppointments = [...pendingAppointments].sort((a, b) => {
    if (!sortBy) return 0;

    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Método de filtrado
  const filteredAppointments = sortedAppointments.filter((appointment) => {
    const matchesFolio = filter.folio
      ? (appointment.folio || "").toString().toLowerCase().includes(filter.folio.toLowerCase())
      : true;
  
    const matchesInsumos = filter.nombre_insumos
      ? (appointment.nombre_insumos || "").toLowerCase().includes(filter.nombre_insumos.toLowerCase())
      : true;
  
    const matchesPaquetes = filter.nombre_paquetes
      ? (appointment.nombre_paquetes || "").toLowerCase().includes(filter.nombre_paquetes.toLowerCase())
      : true;
  
    const matchesEstado = filter.estado
      ? (appointment.estado_solicitud || "").toLowerCase().includes(filter.estado.toLowerCase())
      : true;
  
    return matchesFolio && matchesInsumos && matchesPaquetes && matchesEstado;
  });
  

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return (
    <Layout>
      <div
        data-aos="fade-right"
        data-aos-duration="1000"
        data-aos-delay="100"
        data-aos-offset="200"
      >
        <div
          data-aos="fade-right"
          data-aos-duration="1000"
          data-aos-delay="100"
          data-aos-offset="200"
        >
          <div className="flex flex-col gap-8 mb-8">
            <h1 className="text-xl font-semibold">Solicitudes que requieren Insumos</h1>

            {open && selectedAppointment && (
              <SolicitudInsumosModal
                datas={pendingAppointments}
                isOpen={open}
                closeModal={handleModal}
                onDeleteAppointment={handleDeleteAppointment}
                appointmentId={selectedAppointment.id}
              />
            )}

            {/* Contenedor de filtros centrado */}
            <div className="flex justify-center">
              {/* Filtros */}
              <div className="flex gap-4 mb-4 items-center">
                <input
                  type="text"
                  placeholder="Filtrar por nombre"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  className="border rounded-lg px-4 py-2"
                />
                <input
                  type="text"
                  placeholder="Filtrar por especialidad"
                  value={specialtyFilter}
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                  className="border rounded-lg px-4 py-2"
                />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="border rounded-lg px-4 py-2"
                />
                  <input
                    type="text"
                    placeholder="Filtrar por estado"
                    name="estado"
                    value={filter.estado}
                    onChange={handleFilterChange}
                    className="border rounded-lg px-4 py-2"
                    style={{
                      ...getEstadoColorStyle(filter.estado),
                    }}
                  />

              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setView("table")}
                      className={`p-2 rounded-md ${
                        view === "table"
                          ? "bg-[#365b77] text-white"
                          : "text-[#365b77]"
                      }`}
                      aria-label="Vista en tabla"
                    >
                      <FaTable size={24} />
                    </button>
                    <button
                      onClick={() => setView("cards")}
                      className={`p-2 rounded-md ${
                        view === "cards"
                          ? "bg-[#365b77] text-white"
                          : "text-[#365b77]"
                      }`}
                      aria-label="Vista en tarjetas"
                    >
                      <FaThLarge size={24} />
                    </button>
                  </div>
                </div>

                {filteredAppointments.length === 0 ? (
                  <div className="text-center text-white font-extrabold bg-gradient-to-r from-blue-500 to-green-400 p-4 rounded-lg shadow-lg mt-6 text-xl animate-pulse">
                    <span role="img" aria-label="confetti" className="mr-2">
                      🎉
                    </span>
                    ¡No hay solicitudes pendientes!
                    <span role="img" aria-label="confetti" className="ml-2">
                      🎉
                    </span>
                  </div>
                ) : view === "table" ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                      <thead className="bg-[#365b77] text-white">
                        <tr>
                          <th
                            className="px-4 py-3 cursor-pointer"
                            onClick={() => handleSort("id_solicitud")}
                          >
                            ID{" "}
                            <span>
                              {sortBy === "id_solicitud"
                                ? sortOrder === "asc"
                                  ? "▲"
                                  : "▼"
                                : ""}
                            </span>
                          </th>
                          <th
                            className="px-4 py-2 cursor-pointer"
                            onClick={() => handleSort("folio")}
                          >
                            Folio{" "}
                            <span>
                              {sortBy === "folio"
                                ? sortOrder === "asc"
                                  ? "▲"
                                  : "▼"
                                : ""}
                            </span>
                          </th>
                          <th
                            className="px-4 py-2 cursor-pointer"
                          >
                            Insumos requeridos{" "}
                          </th>
                          <th
                            className="px-4 py-2 cursor-pointer"
                          >
                            Paquetes requeridos{" "}

                          </th>
                          <th
                            className="px-4 py-2 cursor-pointer"
                            onClick={() => handleSort("estado_solicitud")}
                          >
                            Estado{" "}
                            <span>
                              {sortBy === "estado_solicitud"
                                ? sortOrder === "asc"
                                  ? "▲"
                                  : "▼"
                                : ""}
                            </span>
                          </th>
                          <th
                            className="px-4 py-2 cursor-pointer"
                            onClick={() => handleSort("turno_solicitado")}
                          >
                            Progreso{" "}
                            <span>
                              {sortBy === "turno_solicitado"
                                ? sortOrder === "asc"
                                  ? "▲"
                                  : "▼"
                                : ""}
                            </span>
                          </th>
                          <th className="px-4 py-3">Acciones</th>
                        
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAppointments
                          .slice(startIndex, endIndex)
                          .map((appointment) => (
                            <tr
                              key={appointment.id}
                              className="bg-blue-50 hover:bg-blue-300"
                            >
                              <td className="border px-6 py-4">
                                {appointment.id}
                              </td>
                              <td className="border px-4 py-2">
                                {appointment.folio}
                              </td>
                              <td className="border px-4 py-2 uppercase">
                                {
                                  appointment.nombre_insumos}
                              </td>
                              <td className="border px-4 py-2">
                              {appointment.nombre_paquetes}
                              </td>
                              <td className="border px-4 py-2 text-center align-middle">
                                {appointment.estado}
                              </td>
                              <td className="border px-4 py-2 text-center align-middle">
                                {appointment.sala_quirofano}
                              </td>
                              <td className="border px-4 py-2 flex justify-center">
                                <Link
                                  to={`/solicitudInsumosDetalle/${appointment.id}`}
                                  className="bg-[#365b77] text-white px-5 py-2 rounded-md hover:bg-blue-800"
                                >
                                  Ver
                                </Link>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredAppointments
                      .slice(startIndex, endIndex)
                      .map((appointment) => (
                        <div
                          key={appointment.id}
                          className="relative p-4 border border-gray-200 rounded-lg shadow-md transition-transform transform hover:scale-105 hover:shadow-xl"
                          style={{ borderRadius: "10px" }}
                          onClick={() => handleViewModal(appointment)}
                        >
                          <div className="flex flex-col h-full">
                            <div
                              className="absolute top-0 left-0 h-full"
                              style={{
                                width: "10px",
                                borderTopLeftRadius: "10px",
                                borderBottomLeftRadius: "10px",
                                ...getEstadoColorStyle(
                                  appointment.estado_solicitud
                                ),
                              }}
                            ></div>
                            <div className="mb-2 pl-3">
                              <div className="flex justify-between">
                                <p className="text-lg font-semibold">
                                  {appointment.nombre_paciente}{" "}
                                  {appointment.ap_paterno}{" "}
                                  {appointment.ap_materno}
                                </p>
                                <p className="text-sm">
                                  {appointment.sala_quirofano}
                                </p>
                              </div>
                              <p className="text-sm text-gray-600">
                                {appointment.folio}
                              </p>
                              <p className="text-sm text-gray-600">
                                {appointment.clave_esp}
                              </p>
                              <div className="flex justify-between">
                                <p className="text-sm text-gray-600">
                                  {appointment.turno_solicitado}
                                </p>
                              </div>
                              <p className="text-sm text-gray-600">
                                {appointment.nombre_cirujano}
                              </p>
                              <p className="text-sm text-gray-600">
                                {appointment.insumos}
                              </p>
                              <p className="text-sm text-gray-600">
                                Estatus: {appointment.estado_solicitud}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
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
                disabled={endIndex >= filteredAppointments.length}
                className={`${
                  endIndex >= filteredAppointments.length
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-[#365b77] hover:bg-[#7498b6]"
                } text-white font-semibold py-2 px-6 rounded-full shadow-md transition-all duration-300 ease-in-out transform hover:scale-105`}
              >
                &#8594;
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default SolicitudesInsumos;
