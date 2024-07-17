import React, { useState, useEffect } from "react";
import Layout from "../../Layout";
import Consultabitacora from "../../screens/BitacoraEnfermeria/Consultabitacora";
import { useNavigate } from 'react-router-dom';

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
  
  const handleViewClick = (appointment) => {
    if (appointment.id_solicitud) {
      navigate(`/bitacora/Consultabitacora/${appointment.id_solicitud}`);
    } else {
      console.error('El ID de la cita no está definido:', appointment);
      // Puedes manejar este caso de otra manera, como mostrar un mensaje de error o redirigir a una página predeterminada.
    }
  };

  useEffect(() => {
    fetchPendingAppointments();
  }, []);

  const fetchPendingAppointments = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/solicitudes/programadas"
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
      <div className="flex flex-col gap-8 mb-8">
        <h1 className="text-xl font-semibold">Bitacora Enfermería</h1>

        <div className="flex mb-4 space-x-4">
          {/* Código del filtro y otras entradas */}
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
                  <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort("folio")}>
                    Folio <span>{sortBy === "folio" ? (sortOrder === "asc" ? "▲" : "▼") : ""}</span>
                  </th>
                  <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort("nombre_paciente")}>
                    Nombre del paciente <span>{sortBy === "nombre_paciente" ? (sortOrder === "asc" ? "▲" : "▼") : ""}</span>
                  </th>
                  <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort("nombre_especialidad")}>
                    Especialidad <span>{sortBy === "nombre_especialidad" ? (sortOrder === "asc" ? "▲" : "▼") : ""}</span>
                  </th>
                  <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort("fecha_solicitada")}>
                    Fecha solicitada <span>{sortBy === "fecha_solicitada" ? (sortOrder === "asc" ? "▲" : "▼") : ""}</span>
                  </th>
                  <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort("sala_quirofano")}>
                    Sala solicitada <span>{sortBy === "sala_quirofano" ? (sortOrder === "asc" ? "▲" : "▼") : ""}</span>
                  </th>
                  <th className="px-4 py-2 cursor-pointer">
                    Estado 
                  </th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.slice(startIndex, endIndex).map((appointment) => (
                  <tr key={appointment.id} className="bg-blue-50 hover:bg-blue-300">
                    <td className="px-4 py-2">{appointment.folio}</td>
                    <td className="px-4 py-2">
                      {appointment.nombre_paciente} {appointment.ap_paterno}{" "}
                      {appointment.ap_materno}
                    </td>
                    <td className="px-4 py-2">{appointment.nombre_especialidad}</td>
                    <td className="px-4 py-2">{appointment.fecha_programada}</td>
                    <td className="px-4 py-2 flex justify-center">
                      {appointment.sala_quirofano}
                    </td>
                    <td
                      className="px-4 py-2"
                      style={getEstadoColorStyle(appointment.estado_solicitud)}
                    >
                      {appointment.estado_solicitud}
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

        <div className="flex justify-center mt-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="bg-[#365b77] hover:bg-[#7498b6] text-white font-bold py-2 px-4 rounded-l"
          >
            Anterior
          </button>
          <span>Página {page}</span>
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
};
  
export default Bitacoraenfermeria;