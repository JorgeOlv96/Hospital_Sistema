import React, { useState, useEffect } from "react";
import Layout from "../../Layout";
import axios from "axios";
import Consultabitacora from "../../screens/BitacoraEnfermeria/Consultabitacora";
import { useNavigate, Link } from "react-router-dom";

function Bitacoraenfermeria() {
  const navigate = useNavigate();
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [filter, setFilter] = useState({
    fecha: "",
    especialidad: "",
    estado: "Programada",
  });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [open, setOpen] = useState(false);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || 'http://localhost:4000';

  const handleViewClick = (appointment) => {
    if (appointment.id_solicitud) {
      navigate(`/bitacora/Consultabitacora/${appointment.id_solicitud}`);
    } else {
      console.error("El ID de la cita no está definido:", appointment);
      // Puedes manejar este caso de otra manera, como mostrar un mensaje de error o redirigir a una página predeterminada.
    }
  };

  useEffect(() => {
    fetchPendingAppointments();
  }, []);

  const fetchPendingAppointments = async () => {
    try {
      const response = await fetch(`${baseURL}/api/solicitudes/programadas`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setPendingAppointments(data);
    } catch (error) {
      console.error("Error fetching pending appointments:", error);
    }
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
      case "programada":
        return { backgroundColor: "#68D391", color: "black" }; // Color de fondo verde y texto negro
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
        appointment.fecha_programada.includes(filter.fecha)) &&
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
      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-xl font-semibold">Bitacora Enfermería</h1>
        <div className="my-4 flex space-x-4">
          <Link
            to="/urgencias/Solicitudurgencia"
            className="btn btn-sm btn-secondary p-2 bg-red-500 text-white rounded-lg"
          >
            Agregar URGENCIA
          </Link>
          <Link
            to="/urgencias/Urgentes"
            className="bg-[#5DB259] hover:bg-[#528E4F] text-white py-2 px-4 rounded-lg inline-flex items-center"
          >
            <span>Ver solicitudes urgentes</span>
          </Link>
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
                        {appointment.nombre_paciente} {appointment.ap_paterno}{" "}
                        {appointment.ap_materno}
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
                          onClick={() => handleViewClick(appointment)}
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
         <div className="flex justify-center mt-4">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="bg-[#365b77] hover:bg-[#7498b6] text-white font-bold py-2 px-4 rounded-l"
            >
              Anterior
            </button>
            <span className="mx-4">Página {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={endIndex >= filteredAppointments.length}
              className="bg-[#365b77] hover:bg-[#7498b6] text-white font-bold py-2 px-4 rounded-r"
            >
              Siguiente
            </button>
          </div>

      </div>
    </Layout>
  );
}

export default Bitacoraenfermeria;
