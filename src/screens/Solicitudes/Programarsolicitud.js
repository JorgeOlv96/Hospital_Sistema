import React, { useState, useEffect } from "react";
import Layout from "../../Layout";
import AddAppointmentModal from "../../components/Modals/AddApointmentModal";
import { Link } from 'react-router-dom';


function ProgramarSolicitud() {
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [filter, setFilter] = useState({
    fecha: "",
    especialidad: "",
    estado: "Pendiente",
  });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchPendingAppointments();
  }, []);

  const fetchPendingAppointments = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/solicitudes/pendientes"
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({
      ...filter,
      [name]: value,
    });
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

  const getEstadoColorStyle = (estado) => {
    switch (estado.toLowerCase()) {
      case "pendiente":
        return { backgroundColor: "#FC8181", color: "black" }; // Color de fondo rojo y texto negro
      default:
        return {};
    }
  };

  const filteredAppointments = pendingAppointments.filter((appointment) => {
    return (
      (filter.fecha === "" ||
        appointment.fecha_solicitud.includes(filter.fecha)) &&
      (filter.especialidad === "" ||
        appointment.nombre_especialidad.includes(filter.especialidad)) &&
      (filter.estado === "" ||
        appointment.estado_solicitud.includes(filter.estado))
    );
  });

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Solicitudes Pendientes</h1>

      <div className="mb-4">
        <Link to="/appointments" className="bg-[#001B58] hover:bg-[#001B58] text-white font-bold py-2 px-4 rounded inline-flex items-center">
          <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.707 4.293a1 1 0 0 1 1.414 0l5 5a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414-1.414L13.586 11H3a1 1 0 1 1 0-2h10.586l-4.293-4.293a1 1 0 0 1 0-1.414z" clipRule="evenodd" />
          </svg>
          <span>Ver agenda</span>
        </Link>
      </div>




        {open && selectedAppointment && (
          <AddAppointmentModal
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
            <label className="block font-semibold">Estado de Solicitud:</label>
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

        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-[#304678] text-white">
            <tr>
              <th className="px-4 py-2">Fecha de Solicitud</th>
              <th className="px-4 py-2">Especialidad</th>
              <th className="px-4 py-2">CURP</th>
              <th className="px-4 py-2">Paciente</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((appointment) => (
              <tr key={appointment.id} className="border-t border-gray-300">
                <td className="px-4 py-2">{appointment.fecha_solicitud}</td>
                <td className="px-4 py-2">{appointment.nombre_especialidad}</td>
                <td className="px-4 py-2">{appointment.curp}</td>
                <td className="px-4 py-2">{appointment.nombre_paciente}</td>
                <td className="px-4 py-2" style={getEstadoColorStyle(appointment.estado_solicitud)}>
                  {appointment.estado_solicitud}
                </td>
                <td className="px-4 py-2 flex justify-center">
                  <button
                    onClick={() => handleViewModal(appointment)}
                    className="bg-[#001B58] text-white px-5 py-2 rounded-md hover:bg-blue-800"
                  >
                    Programar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

export default ProgramarSolicitud;
