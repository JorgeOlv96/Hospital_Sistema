import React, { useState, useEffect } from "react";
import Layout from "../../Layout";
import AddAppointmentModalPending from "../../components/Modals/AddApointmentModalPending";
import { Link } from "react-router-dom";

function Programaranestesiologo() {
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [filter, setFilter] = useState({
    fecha: "",
    especialidad: "",
    estado: "Pre-programada",
  });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [open, setOpen] = useState(false);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState("");

  useEffect(() => {
    fetchPendingAppointments();
  }, []);

  const fetchPendingAppointments = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/solicitudes/");
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
      case "pre-programada":
        return { backgroundColor: "#F7BAEC", color: "black" }; // Color de fondo rojo y texto negro
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

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    // Actualizar el estado del formulario
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
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
      <div className="flex flex-col gap-8 mb-8">
        <h1 className="text-xl font-semibold">Anestesiologos asignados</h1>
        <div className="flex my-4 space-x-4">
          <div>
            <Link
              to="/anestesiólogos"
              className="bg-[#001B58] hover:bg-[#001B58] text-white py-2 px-4 rounded inline-flex items-center"
            >
              <span>Ver agenda de anestesiologos</span>
            </Link>
          </div>
        </div>

        {open && selectedAppointment && (
          <AddAppointmentModalPending
            datas={pendingAppointments}
            isOpen={open}
            closeModal={handleModal}
            onDeleteAppointment={handleDeleteAppointment}
            appointmentId={selectedAppointment.id_solicitud}
          />
        )}

        <div className="flex flex-col">
          <div className="flex mb-2 space-x-4">
          <div className="w-1/4">
              <label className="block text-sm font-medium text-gray-700">Nombre de anestesiólogo</label>
              <input
                type="text"
                placeholder="Nombre"
                className="mt-1 block w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-1/4">
            <label htmlFor="hora_solicitada" className="block text-sm font-medium text-gray-700">
              Hora solicitada:
            </label>
            <input
              type="time"
              id="hora_solicitada"
              name="hora_solicitada"
              value={formData.hora_solicitada}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
            <div className="w-1/4">
              <label className="block text-sm font-medium text-gray-700">Día asignado</label>
              <input
                type="date"
                placeholder="dd/mm/aaaa"
                className="mt-1 block w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-1/4">
              <label className="block text-sm font-medium text-gray-700">Turno asignado</label>
              <input
                type="text"
                placeholder="Turno"
                className="mt-1 block w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-1/4">
              <label className="block text-sm font-medium text-gray-700">Sala asignada</label>
              <input
                type="text"
                placeholder="Sala"
                className="mt-1 block w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <td className="px-2 py-2 text-right"> 
          <button className="bg-[#001B58] text-white px-5 py-2 rounded-md hover:bg-blue-800">
            Guardar
          </button>
          </td>

        </div>

        {filteredAppointments.length === 0 ? (
          <div className="text-center text-gray-500 mt-4">
            No hay solicitudes pendientes :)
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-[#304678] text-white">
                <tr>
                  <th
                    className="px-4 py-3 cursor-pointer text-center"
                    onClick={() => handleSort("nombre_paciente")}
                  >
                    Nombre{" "}
                    <span>
                      {sortBy === "nombre_paciente" &&
                        (sortOrder === "asc" ? "▲" : "▼")}
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 cursor-pointer text-center"
                    onClick={() => handleSort("nombre_especialidad")}
                  >
                    Turno{" "}
                    <span>
                      {sortBy === "nombre_especialidad" &&
                        (sortOrder === "asc" ? "▲" : "▼")}
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 cursor-pointer text-center"
                    onClick={() => handleSort("sala_quirofano")}
                  >
                    Sala{" "}
                    <span>
                      {sortBy === "sala_quirofano" &&
                        (sortOrder === "asc" ? "▲" : "▼")}
                    </span>
                  </th>
                  <th className="px-4 py-3 text-center">Acciones</th>
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
                      <td className="px-2 py-2 text-center">
                        {appointment.nombre_especialidad}
                      </td>
                      <td className="px-2 py-2 text-center">
                        {appointment.fecha_solicitud}
                      </td>
                      <td className="px-2 py-2 text-center">
                        {appointment.sala_quirofano}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button
                          onClick={() => handleViewModal(appointment)}
                          className="bg-[#001B58] text-white px-5 py-2 rounded-md hover:bg-blue-800"
                        >
                          Gestionar
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
            className="bg-[#001B58] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-l"
          >
            Anterior
          </button>
          <span className="mx-4">Página {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={endIndex >= filteredAppointments.length}
            className="bg-[#001B58] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r"
          >
            Siguiente
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default Programaranestesiologo;
