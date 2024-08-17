import React, { useState, useEffect } from "react";
import Layout from "../../Layout";
import axios from "axios";
import AddAppointmentModalProgramado from "../../components/Modals/AddApointmentModalProgramado";
import { Link } from "react-router-dom";

function Solicitudesurgentes() {
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [filter, setFilter] = useState({
    fecha: "",
    especialidad: "",
    estado: "Urgencia",
  });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [open, setOpen] = useState(false);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";

  useEffect(() => {
    fetchPendingAppointments();
  }, []);

  const fetchPendingAppointments = async () => {
    try {
      const response = await fetch(`${baseURL}/api/solicitudes/geturgencias`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setPendingAppointments(data);
    } catch (error) {
      console.error("Error fetching pending appointments:", error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({
      ...filter,
      [name]: value,
    });
    setPage(1); // Reset to first page on filter change
  };

  const handleViewModal = (appointment) => {
    setSelectedAppointment(appointment);
    setOpen(true);
  };

  const handleModal = () => {
    setOpen(false);
  };

  const handleDeleteAppointment = (appointmentId) => {
    // Implementa la lógica para eliminar una cita aquí
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
      case "urgencia":
        return { backgroundColor: "#FC8181" }; // Rosa claro
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

  const filteredAppointments = sortedAppointments.filter((appointment) => {
    return (
      (filter.fecha === "" ||
        appointment.fecha_solicitud.includes(filter.fecha)) &&
      (filter.especialidad === "" ||
        appointment.nombre_especialidad.includes(filter.especialidad)) &&
      (filter.estado === "" ||
        appointment.estado_solicitud.includes(filter.estado))
    );
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
        <div className="flex flex-col gap-2 mb-4">
          <h1 className="text-xl font-semibold">Solicitudes Urgentes</h1>
          <div className="flex my-4 space-x-4">
            <div>
              <Link
                to="/bitacora/Bitaenfermeria"
                className="bg-[#365b77] hover:bg-[#7498b6] text-white py-2 px-4 rounded inline-flex items-center"
              >
                <span style={{ display: "inline-flex", alignItems: "center" }}>
                  <span>&lt;</span>
                  <span style={{ marginLeft: "5px" }}>Regresar a bitácora</span>
                </span>
              </Link>
            </div>
          </div>

          {open && selectedAppointment && (
            <AddAppointmentModalProgramado
              datas={pendingAppointments}
              isOpen={open}
              closeModal={handleModal}
              onDeleteAppointment={handleDeleteAppointment}
              appointmentId={selectedAppointment.id_solicitud}
            />
          )}

          <div className="flex mb-4 space-x-4">
            <div className="flex-1">
              <label className="block font-semibold">Filtrar por Fecha:</label>
              <input
                type="date"
                name="fecha"
                value={filter.fecha}
                onChange={handleFilterChange}
                className="border border-gray-300 rounded-lg px-2 py-1 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-[#001B58] focus:border-[#001B58]"
              />
            </div>

            <div className="flex-1">
              <label className="block font-semibold">
                Filtrar por Especialidad:
              </label>
              <input
                type="text"
                name="especialidad"
                value={filter.especialidad}
                onChange={handleFilterChange}
                className="border border-gray-300 rounded-lg px-2 py-1 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-[#001B58] focus:border-[#001B58]"
              />
            </div>

            <div className="flex-1">
              <label className="block font-semibold">
                Estado de Solicitud:
              </label>
              <input
                type="text"
                name="estado"
                value={filter.estado}
                onChange={handleFilterChange}
                readOnly
                className="border border-gray-300 rounded-lg px-2 py-1 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-[#001B58] focus:border-[#001B58]"
              />
            </div>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="text-center text-gray-500 mt-4">
              No hay pendientes :)
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                <thead className="bg-[#365b77] text-white">
                  <tr>
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
                    .map((appointment) => (
                      <tr
                        key={appointment.id}
                        className="bg-blue-50 hover:bg-blue-300"
                      >
                        <td className="px-4 py-2">{appointment.folio}</td>
                        <td className="px-4 py-2">
                        {appointment.ap_paterno}{" "}
                        {appointment.ap_materno}{" "}{appointment.nombre_paciente} 
                        </td>
                        <td className="px-4 py-2">
                          {appointment.nombre_especialidad}
                        </td>
                        <td className="px-4 py-2">
                          {appointment.fecha_programada}
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
                            className="bg-[#365b77] text-white px-5 py-2 rounded-md hover:bg-[#7498b6]"
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
    </Layout>
  );
}

export default Solicitudesurgentes;
