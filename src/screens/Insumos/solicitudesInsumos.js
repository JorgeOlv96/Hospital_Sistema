import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import Layout from "../../Layout";
import AddAppointmentModalInsumos from "../../components/Modals/AddApointmentModalInsumos";
import toast, { Toaster } from 'react-hot-toast';

function SolicitudesInsumos() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [open, setOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [perPage, setPerPage] = useState(9);
  const [filterState, setFilterState] = useState("all");
  const [searchField, setSearchField] = useState("nombre_paciente");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "fecha_solicitada",
    direction: "asc",
  });
  const itemsPerPage = 10;

  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;

  const previousSolicitudesRef = useRef([]);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/solicitudes`);
        if (response.status !== 200) {
          throw new Error("Network response was not ok");
        }
        const data = response.data;

        const filteredData = data.filter(
          (solicitud) =>
            solicitud.estado_solicitud === "Pendiente" &&
            solicitud.req_insumo &&
            solicitud.req_insumo.trim().toLowerCase() === "si"
        );

        // Ordenar los datos por fecha_solicitada más próxima al inicio
        const sortedData = filteredData.sort((a, b) => new Date(a.fecha_solicitada) - new Date(b.fecha_solicitada));

        // Mostrar notificación si hay nuevas solicitudes pendientes
        const previousSolicitudes = previousSolicitudesRef.current;
        const newSolicitudes = sortedData.filter(
          (solicitud) =>
            !previousSolicitudes.some((prev) => prev.id_solicitud === solicitud.id_solicitud)
        );

        if (newSolicitudes.length > 0) {
          toast.success(`Tienes ${newSolicitudes.length} nueva(s) solicitud(es) pendiente(s) que requieren insumos.`);
        }

        setSolicitudes(sortedData);
        previousSolicitudesRef.current = sortedData; // Asegúrate de actualizar la referencia previa
      } catch (error) {
        toast.error("Error fetching solicitudes");
      }
    };

    fetchSolicitudes();

    // Configurar el intervalo para revisar nuevas solicitudes cada 30 segundos
    const interval = setInterval(fetchSolicitudes, 1000);

    return () => clearInterval(interval);
  }, [baseURL]);

  const handleModal = () => {
    setOpen(!open);
  };

  const handleViewModal = (solicitud) => {
    setSelectedAppointment(solicitud);
    setOpen(true);
  };


  const filteredSolicitudes = useMemo(() => {
    return solicitudes
      .filter((solicitud) => {
        const fieldValue = solicitud[searchField];

        if (typeof fieldValue === "string") {
          return fieldValue.toLowerCase().includes(searchTerm.toLowerCase());
        } else if (typeof fieldValue === "number") {
          return fieldValue.toString().includes(searchTerm.toLowerCase());
        } else {
          return false;
        }
      })
      .filter((solicitud) => {
        if (filterState === "all") return true;
        return solicitud.estado_solicitud.toLowerCase() === filterState;
      })
      .filter((solicitud) => {
        const solicitudDate = new Date(solicitud.fecha_solicitud);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (start && solicitudDate < start) return false;
        if (end && solicitudDate > end) return false;
        return true;
      });
  }, [solicitudes, searchTerm, searchField, filterState, startDate, endDate]);


  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedSolicitudes = [...solicitudes].sort((a, b) => {
      if (direction === "asc") {
        return a[key] > b[key] ? 1 : -1;
      } else {
        return a[key] < b[key] ? 1 : -1;
      }
    });
    setSolicitudes(sortedSolicitudes);
  };

  const sortedSolicitudes = useMemo(() => {
    let sorted = [...filteredSolicitudes];
    if (sortBy) {
      sorted.sort((a, b) => {
        const factor = sortOrder === "asc" ? 1 : -1;
        if (typeof a[sortBy] === "string") {
          return factor * a[sortBy].localeCompare(b[sortBy]);
        } else {
          return factor * (a[sortBy] - b[sortBy]);
        }
      });
    }
    return sorted;
  }, [filteredSolicitudes, sortBy, sortOrder]);

  const paginatedSolicitudes = solicitudes.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const totalPages = Math.ceil(solicitudes.length / itemsPerPage);

  return (
    <Layout>
      {open && selectedAppointment && (
        <AddAppointmentModalInsumos
          datas={solicitudes}
          isOpen={open}
          closeModal={handleModal}
          appointmentId={selectedAppointment.id_solicitud}
        />
      )}

      <Toaster position="top-right" reverseOrder={false} />
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-xl font-semibold">Solicitudes Insumos</h1>
        
         {/* Filtros de búsqueda */}
         <div className="mt-8">
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
                    <option value="id_solicitud">ID</option>
                    <option value="folio">Folio</option>
                    <option value="nombre_paciente">Nombre</option>
                    <option value="nombre_especialidad">Especialidad</option>
                    <option value="fecha_solicitud">Fecha</option>
                    <option value="estado_solicitud">Estado</option>
                  </select>

                  <div className="flex items-center space-x-2">
                    <label> Por fecha De:</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <label>A:</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>







        <div className="overflow-x-auto">
        <table className="min-w-full shadow-md rounded-lg overflow-hidden">
          <thead className="bg-[#365b77] text-white">
            <tr className="border border-gray-300 md:border-none block md:table-row absolute -top-full md:top-auto -left-full md:left-auto md:relative">
              <th
                onClick={() => handleSort("folio")}
                className="p-2 cursor-pointer"
              >
                Folio
              </th>
              <th
                onClick={() => handleSort("nombre_paciente")}
                className="p-2 cursor-pointer"
              >
                Nombre
              </th>
              <th
                onClick={() => handleSort("nombre_especialidad")}
                className="p-2 cursor-pointer"
              >
                Especialidad
              </th>
              <th
                onClick={() => handleSort("fecha_solicitada")}
                className="p-2 cursor-pointer"
              >
                Fecha
              </th>
              <th
                onClick={() => handleSort("estado_solicitud")}
                className="p-2 cursor-pointer"
              >
                Estado
              </th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
                        {sortedSolicitudes
                          .slice(startIndex, endIndex)
                          .map((solicitud) => {
                            const formattedDate = new Date(
                              solicitud.fecha_solicitud
                            ).toLocaleDateString();
                            return (
              <tr
                key={solicitud.id_solicitud}
                className="bg-white border border-gray-300 md:border-none block md:table-row"
              >
                <td className="p-2 md:border md:border-gray-300 text-left block md:table-cell">
                  {solicitud.folio}
                </td>
                <td className="p-2 md:border md:border-gray-300 text-left block md:table-cell">
                  {solicitud.nombre_paciente} {solicitud.ap_paterno} {solicitud.ap_materno}
                </td>
                <td className="p-2 md:border md:border-gray-300 text-left block md:table-cell">
                  {solicitud.nombre_especialidad}
                </td>
                <td className="p-2 md:border md:border-gray-300 text-left block md:table-cell">
                  {solicitud.fecha_solicitada}
                </td>
                <td className="p-2 md:border md:border-gray-300 text-left block md:table-cell">
                  {solicitud.estado_solicitud}
                </td>
                <td className="p-2 md:border md:border-gray-300 text-left block md:table-cell">
                  <button
                    onClick={() => handleViewModal(solicitud)}
                    className="bg-[#365b77] text-white px-4 py-2 rounded-md hover:bg-[#7498b6]"
                  >
                    Ver
                  </button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
        </div>
        
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
              disabled={endIndex >= sortedSolicitudes.length}
              className="bg-[#365b77] hover:bg-[#7498b6] text-white font-bold py-2 px-4 rounded-r"
            >
              Siguiente
            </button>
          </div>

      </div>
    </Layout>
  );
}

export default SolicitudesInsumos;
