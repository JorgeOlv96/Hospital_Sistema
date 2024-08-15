import React, { useState, useEffect, useContext } from "react";
import Layout from "../Layout";
import AddAppointmentModalEvaluar from "../components/Modals/AddApointmentModalEvaluar";
import { Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../AuthContext";

function Evaluacion() {
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [open, setOpen] = useState(false);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const { user } = useContext(AuthContext);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";

  // Estados para los filtros
  const [nameFilter, setNameFilter] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

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
      const response = await fetch(`${baseURL}/api/solicitudes/pendientes`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setPendingAppointments(data);
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

  const getEstadoColor = (estado) => {
    switch (estado.toLowerCase()) {
      case "programada":
        return "bg-green-400";
      case "realizada":
        return "bg-blue-400";
      case "suspendida":
        return "bg-yellow-400";
      case "pendiente":
        return "bg-orange-400";
      case "Pre-programada":
        return "bg-red-400";
      case "Urgencia":
        return "bg-red-400";
      default:
        return "";
    }
  };

  const getEstadoColorStyle = (estado) => {
    switch (estado.toLowerCase()) {
      case "pendiente":
        return { backgroundColor: "#E9972F", color: "black" };
      default:
        return {};
    }
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
    const matchesName =
      `${appointment.nombre_paciente} ${appointment.ap_paterno} ${appointment.ap_materno}`
        .toLowerCase()
        .includes(nameFilter.toLowerCase());
    const matchesSpecialty = appointment.nombre_especialidad
      .toLowerCase()
      .includes(specialtyFilter.toLowerCase());
    const matchesDate = dateFilter
      ? new Date(appointment.fecha_solicitada).toISOString().slice(0, 10) ===
        dateFilter
      : true;

    return matchesName && matchesSpecialty && matchesDate;
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
            <h1 className="text-xl font-semibold">Evaluación pendientes</h1>

            {open && selectedAppointment && (
              <AddAppointmentModalEvaluar
                datas={pendingAppointments}
                isOpen={open}
                closeModal={handleModal}
                onDeleteAppointment={handleDeleteAppointment}
                appointmentId={selectedAppointment.id_solicitud}
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
                  value={
                    filter.estado ||
                    appointment?.estado_solicitud ||
                    "No disponible"
                  }
                  onChange={handleFilterChange}
                  readOnly
                  className="border rounded-lg px-4 py-2"
                  style={{
                    ...getEstadoColorStyle(appointment.estado_solicitud),
                  }}
                />
              </div>
            </div>

            {filteredAppointments.length === 0 ? (
              <div className="text-center text-gray-500 mt-4">
                No hay solicitudes pendientes :)
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                  <thead className="bg-[#365b77] text-white">
                    <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider"
                      onClick={() => handleSort("id_solicitud")}
                    >
                      ID {" "}
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
                        onClick={() => handleSort("nombre_paciente")}
                      >
                        Nombre del paciente{" "}
                        <span>
                          {sortBy === "nombre_paciente"
                            ? sortOrder === "asc"
                              ? "▲"
                              : "▼"
                            : ""}
                        </span>
                      </th>
                      <th
                        className="px-4 py-2 cursor-pointer"
                        onClick={() => handleSort("nombre_especialidad")}
                      >
                        Especialidad{" "}
                        <span>
                          {sortBy === "nombre_especialidad"
                            ? sortOrder === "asc"
                              ? "▲"
                              : "▼"
                            : ""}
                        </span>
                      </th>
                      <th
                        className="px-4 py-2 cursor-pointer"
                        onClick={() => handleSort("fecha_solicitada")}
                      >
                        Fecha solicitada{" "}
                        <span>
                          {sortBy === "fecha_solicitada"
                            ? sortOrder === "asc"
                              ? "▲"
                              : "▼"
                            : ""}
                        </span>
                      </th>
                      <th
                        className="px-4 py-2 cursor-pointer"
                        onClick={() => handleSort("sala_quirofano")}
                      >
                        Sala solicitada{" "}
                        <span>
                          {sortBy === "sala_quirofano"
                            ? sortOrder === "asc"
                              ? "▲"
                              : "▼"
                            : ""}
                        </span>
                      </th>
                      <th className="px-4 py-2 cursor-pointer">Estado</th>
                      <th className="px-4 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments
                    .slice(startIndex, endIndex)
                    .map((appointment, index) => (
                      <tr key={appointment.id} className="bg-blue-50 hover:bg-blue-300">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-300">
                          {appointment.id_solicitud}
                        </td>
                          <td className="px-4 py-2">{appointment.folio}</td>
                          <td className="px-4 py-2">
                            {appointment.nombre_paciente}{" "}
                            {appointment.ap_paterno} {appointment.ap_materno}
                          </td>
                          <td className="px-4 py-2">
                            {appointment.nombre_especialidad}
                          </td>
                          <td className="px-4 py-2">
                            {appointment.fecha_solicitada}
                          </td>
                          <td className="px-4 py-2 flex justify-center">
                            {appointment.sala_quirofano}
                          </td>
                          <td className="border px-4 py-2">
                            <div
                              className={`inline-block px-1 py-1 rounded-lg ${getEstadoColor(
                                appointment.estado_solicitud
                              )}`}
                              style={{
                                ...getEstadoColorStyle(
                                  appointment.estado_solicitud
                                ),
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "100%",
                                width: "100%",
                                textAlign: "center",
                              }}
                            >
                              {appointment.estado_solicitud}
                            </div>
                          </td>
                          <td className="px-4 py-2 flex justify-center">
                            <button
                              onClick={() => handleViewModal(appointment)}
                              className="bg-[#365b77] text-white px-5 py-2 rounded-md hover:bg-blue-800"
                            >
                              Ver
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

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

export default Evaluacion;
