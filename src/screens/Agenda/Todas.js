import React, { useState, useEffect, useMemo } from "react";
import Layout from "../../Layout";
import moment from "moment";
import axios from "axios";
import { Link } from "react-router-dom";
import AddAppointmentModal from "../../components/Modals/AddApointmentModal";
import AddAppointmentModalProgramado from "../../components/Modals/AddApointmentModalProgramado";
import AddAppointmentModalPending from "../../components/Modals/AddApointmentModalPending";
import AddApointmentModalSuspendida from "../../components/Modals/AddApointmentModalSuspendida";
import { FaTable, FaThLarge } from "react-icons/fa"; // Asegúrate de tener esta biblioteca instalada

function TodasSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(9);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("nombre_paciente");
  const [filteredResults, setFilteredResults] = useState([]);

  const [totalSolicitudes, setTotalSolicitudes] = useState(0);
  const [totalProgramadas, setTotalProgramadas] = useState(0);
  const [totalSuspendidas, setTotalSuspendidas] = useState(0);
  const [totalRealizadas, setTotalRealizadas] = useState(0);
  const [totalPendientes, setTotalPendientes] = useState(0);
  const [totalPreprogramadas, setTotalPreprogramadas] = useState(0);
  const [totalUrgentes, setTotalUrgentes] = useState(0);
  const [openProgramado, setOpenProgramado] = useState(false);
  const [openPreProgramado, setOpenPreProgramado] = useState(false);
  const [openSuspendida, setOpenSuspendida] = useState(false);
  const [openSolicitud, setOpenSolicitud] = useState(false);
  const [openRealizada, setOpenRealizada] = useState(false);
  const [filterState, setFilterState] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [view, setView] = useState("table"); // State to toggle view
  const [selectedDate, setSelectedDate] = useState(new Date());
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";

  useEffect(() => {
    const fetchTotalSolicitudes = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/solicitudes`);
        setTotalSolicitudes(response.data.length); // Asegúrate de que 'length' sea la propiedad correcta
      } catch (error) {
        console.error("Error fetching solicitudes:", error);
      }
    };

    const fetchTotalProgramadas = async () => {
      try {
        const response = await axios.get(
          `${baseURL}/api/solicitudes/programadas`
        );
        setTotalProgramadas(response.data.length); // Asegúrate de que 'length' sea la propiedad correcta
      } catch (error) {
        console.error("Error fetching programadas:", error);
      }
    };

    const fetchTotalSuspendidas = async () => {
      try {
        const response = await axios.get(
          `${baseURL}/api/solicitudes/suspendidas`
        );
        setTotalSuspendidas(response.data.length); // Asegúrate de que 'length' sea la propiedad correcta
      } catch (error) {
        console.error("Error fetching programadas:", error);
      }
    };

    const fetchTotalRealizadas = async () => {
      try {
        const response = await axios.get(
          `${baseURL}/api/solicitudes/reailizadas`
        );
        setTotalRealizadas(response.data.length); // Asegúrate de que 'length' sea la propiedad correcta
      } catch (error) {
        console.error("Error fetching programadas:", error);
      }
    };

    const fetchTotalPendientes = async () => {
      try {
        const response = await axios.get(
          `${baseURL}/api/solicitudes/pendientes`
        );
        setTotalPendientes(response.data.length); // Asegúrate de que 'length' sea la propiedad correcta
      } catch (error) {
        console.error("Error fetching programadas:", error);
      }
    };

    const fetchTotalPreprogramadas = async () => {
      try {
        const response = await axios.get(
          `${baseURL}/api/solicitudes/preprogramadas`
        );
        setTotalPreprogramadas(response.data.length); // Asegúrate de que 'length' sea la propiedad correcta
      } catch (error) {
        console.error("Error fetching programadas:", error);
      }
    };

    const fetchTotalUrgentes = async () => {
      try {
        const response = await axios.get(
          `${baseURL}/api/solicitudes/geturgencias`
        );
        setTotalUrgentes(response.data.length); // Asegúrate de que 'length' sea la propiedad correcta
      } catch (error) {
        console.error("Error fetching programadas:", error);
      }
    };

    fetchTotalSolicitudes();
    fetchTotalProgramadas();
    fetchTotalSuspendidas();
    fetchTotalRealizadas();
    fetchTotalPendientes();
    fetchTotalPreprogramadas();
    fetchTotalUrgentes();
  }, []); // Se ejecuta solo una vez al cargar el componente

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/solicitudes`);
        if (response.status !== 200) {
          throw new Error("Network response was not ok");
        }
        const data = response.data;
        const filteredData = data
          .filter((solicitud) => solicitud.estado_solicitud !== "Eliminada")
          .sort((a, b) => b.id_solicitud - a.id_solicitud); // Ordenar por id_solicitud de mayor a menor
        setSolicitudes(filteredData);
      } catch (error) {
        console.error("Error fetching solicitudes:", error);
      }
    };
  
    fetchSolicitudes();
  }, []);
  

  const handleModal = () => {
    setOpen(!open);
  };

  const handleViewModal = (solicitud) => {
    setSelectedAppointment(solicitud);
  
    switch (solicitud.estado_solicitud) {
      case "Programada":
        setOpenProgramado(true);
        break;
      case "Pre-programada":
        setOpenPreProgramado(true);
        break;
      case "Suspendida":
        setOpenSuspendida(true);
        break;
        case "Pendiente":
          setOpenSolicitud(true);
          break;
          case "Realizada":
            setOpenSolicitud(true);
            break;
      default:
        break;
    }
  };
  
  const renderModal = () => {
    if (!selectedAppointment) return null;
  
    switch (selectedAppointment.estado_solicitud) {
      case "Programada":
        return (
          <AddAppointmentModalProgramado
            datas={solicitudes}
            isOpen={openProgramado}
            closeModal={() => setOpenProgramado(false)}
            appointmentId={selectedAppointment.id_solicitud}
          />
        );
      case "Pre-programada":
        return (
          <AddAppointmentModalPending
            datas={solicitudes}
            isOpen={openPreProgramado}
            closeModal={() => setOpenPreProgramado(false)}
            appointmentId={selectedAppointment.id_solicitud}
          />
        );
      case "Suspendida":
        return (
          <AddApointmentModalSuspendida
            datas={solicitudes}
            isOpen={openSuspendida}
            closeModal={() => setOpenSuspendida(false)}
            appointmentId={selectedAppointment.id_solicitud}
          />
        );
        case "Pendiente":
          return (
            <AddAppointmentModal
              datas={solicitudes}
              isOpen={openSolicitud}
              closeModal={() => setOpenSolicitud(false)}
              appointmentId={selectedAppointment.id_solicitud}
            />
          );
          case "Realizada":
            return (
              <AddAppointmentModal
                datas={solicitudes}
                isOpen={openSolicitud}
                closeModal={() => setOpenSolicitud(false)}
                appointmentId={selectedAppointment.id_solicitud}
              />
            );
      default:
        return null;
    }
  };

  const formatFechaSolicitada = (fecha) => {
    if (!fecha) return "";
    const [year, month, day] = fecha.split("-");
    return `${day}-${month}-${year}`;
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      const response = await fetch(
        `${baseURL}/api/solicitudes/${appointmentId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Error deleting appointment");
      }
      // Actualizar la lista de solicitudes después de eliminar
      const updatedSolicitudes = solicitudes.filter(
        (solicitud) => solicitud.id_solicitud !== appointmentId
      );
      setSolicitudes(updatedSolicitudes);
      // Cerrar el modal después de eliminar
      setOpen(false);
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  const filteredSolicitudes = useMemo(() => {
    return solicitudes
      .filter((solicitud) => {
        let fieldValue = solicitud[searchField];

        if (searchField === "nombre_paciente") {
          // Concatenar nombre, apellido paterno y apellido materno
          fieldValue = `${solicitud.nombre_paciente} ${solicitud.ap_paterno} ${solicitud.ap_materno}`;
        }

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
        const solicitudDate = new Date(solicitud.fecha_solicitada); // Cambia a 'fecha_solicitada'
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (start && solicitudDate < start) return false;
        return !(end && solicitudDate > end);
      });
  }, [solicitudes, searchField, searchTerm, filterState, startDate, endDate]);

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

  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;

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
        return { backgroundColor: "#68D391" }; // Verde claro
      case "realizada":
        return { backgroundColor: "#63B3ED" }; // Azul claro
      case "suspendida":
        return { backgroundColor: "#F6E05E" }; // Amarillo
      case "pendiente":
        return { backgroundColor: "#E9972F" }; // Rojo claro
      case "pre-programada":
        return { backgroundColor: "#06ABC9" }; // Rosa claro
      case "urgencia":
        return { backgroundColor: "#FC8181" }; // Rosa claro
      default:
        // Aquí puedes manejar el caso por defecto

        return {};
    }
  };

  const estadoButtonClasses = (estado) => {
    return `px-3 py-2 border border-gray-300 rounded-md ${
      filterState === estado ? "text-white" : ""
    }`;
  };

  return (
    <Layout>
      <div
        data-aos="fade-right"
        data-aos-duration="1000"
        data-aos-delay="100"
        data-aos-offset="200"
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold">Todas las solicitudes</h1>
          <div className="flex my-4 space-x-4">
            <div>
              <Link
                to="/agenda/appointments"
                className="bg-[#365b77] hover:bg-[#7498b6] text-white py-2 px-4 rounded inline-flex items-center"
              >
                <span>Agenda</span>
              </Link>
            </div>

            <div className="flex items-center justify-center">
              <div className="flex space-x-2">
                <button
                  className={`px-4 py-2 rounded-lg ${estadoButtonClasses(
                    "all"
                  )}`}
                  style={
                    filterState === "all"
                      ? { backgroundColor: "#4A5568", color: "#fff" }
                      : { backgroundColor: "#CBD5E0" }
                  }
                  onClick={() => setFilterState("all")}
                >
                  Todas las solicitudes ({totalSolicitudes})
                </button>
                <button
                  className={`px-4 py-2 rounded-lg ${estadoButtonClasses(
                    "programada"
                  )}`}
                  style={
                    filterState === "programada"
                      ? {
                          ...getEstadoColorStyle("programada"),
                          opacity: 0.9,
                        }
                      : {
                          ...getEstadoColorStyle("programada"),
                          opacity: 0.7,
                        }
                  }
                  onClick={() => setFilterState("programada")}
                >
                  Programadas ({totalProgramadas})
                </button>
                <button
                  className={`px-4 py-2 rounded-lg ${estadoButtonClasses(
                    "realizada"
                  )}`}
                  style={
                    filterState === "realizada"
                      ? {
                          ...getEstadoColorStyle("realizada"),
                          opacity: 0.9,
                        }
                      : {
                          ...getEstadoColorStyle("realizada"),
                          opacity: 0.7,
                        }
                  }
                  onClick={() => setFilterState("realizada")}
                >
                  Realizadas ({totalRealizadas})
                </button>
                <button
                  className={`px-4 py-2 rounded-lg ${estadoButtonClasses(
                    "suspendida"
                  )}`}
                  style={
                    filterState === "suspendida"
                      ? {
                          ...getEstadoColorStyle("suspendida"),
                          opacity: 0.9,
                        }
                      : {
                          ...getEstadoColorStyle("suspendida"),
                          opacity: 0.7,
                        }
                  }
                  onClick={() => setFilterState("suspendida")}
                >
                  Suspendidas ({totalSuspendidas})
                </button>
                <button
                  className={`px-4 py-2 rounded-lg ${estadoButtonClasses(
                    "pendiente"
                  )}`}
                  style={
                    filterState === "pendiente"
                      ? {
                          ...getEstadoColorStyle("pendiente"),
                          opacity: 0.9,
                        }
                      : {
                          ...getEstadoColorStyle("pendiente"),
                          opacity: 0.7,
                        }
                  }
                  onClick={() => setFilterState("pendiente")}
                >
                  Pendientes ({totalPendientes})
                </button>
                <button
                  className={`px-4 py-2 rounded-lg ${estadoButtonClasses(
                    "pre-programada"
                  )}`}
                  style={
                    filterState === "pre-programada"
                      ? {
                          ...getEstadoColorStyle("pre-programada"),
                          opacity: 0.9,
                        }
                      : {
                          ...getEstadoColorStyle("pre-programada"),
                          opacity: 0.7,
                        }
                  }
                  onClick={() => setFilterState("pre-programada")}
                >
                  Pre-programadas ({totalPreprogramadas})
                </button>
                <button
                  className={`px-4 py-2 rounded-lg ${estadoButtonClasses(
                    "urgencia"
                  )}`}
                  style={
                    filterState === "urgencia"
                      ? {
                          ...getEstadoColorStyle("urgencia"),
                          opacity: 0.9,
                        }
                      : {
                          ...getEstadoColorStyle("urgencia"),
                          opacity: 0.7,
                        }
                  }
                  onClick={() => setFilterState("urgencia")}
                >
                  Urgentes ({totalUrgentes})
                </button>
              </div>
            </div>
          </div>

          {open && selectedAppointment && (
            <AddAppointmentModal
              datas={solicitudes}
              isOpen={open}
              closeModal={handleModal}
              onDeleteAppointment={handleDeleteAppointment}
              appointmentId={selectedAppointment.id_solicitud}
            />
          )}

          <div className="flex flex-col space-y-4">
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
                      <option value="sala_quirofano">Sala</option>
                    </select>

                    <div className="flex items-center space-x-2">
                      <label>Por Fecha Solicitada De:</label>
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

                {/* Renderizado de resultados filtrados */}
                <ul>
                  {filteredResults.map((paciente, index) => (
                    <li key={index}>
                      {paciente.nombre_paciente} {paciente.ap_paterno}{" "}
                      {paciente.ap_materno}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Lista de Solicitudes */}
            <div className="mt-0">
              <div className="text-left">
                <div className="flex items-center justify-center">
                  <p className="text-lg font-semibold">Lista de Solicitudes</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="flex flex-col space-y-4 mt-4">
                  <div className="flex justify-between mb-4">
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
                  {renderModal()}

                  {view === "table" ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full shadow-md rounded-lg overflow-hidden">
                        <thead className="bg-[#365b77] text-white">
                          <tr>
                            <th
                              className="px-4 py-3 cursor-pointer"
                              onClick={() => handleSort("id_solicitud")}
                            >
                              ID{" "}
                              <span>
                                {sortBy === "id_solicitud" &&
                                  (sortOrder === "asc" ? "▲" : "▼")}
                              </span>
                            </th>
                            <th
                              className="px-4 py-3 cursor-pointer"
                              onClick={() => handleSort("folio")}
                            >
                              Folio{" "}
                              <span>
                                {sortBy === "folio" &&
                                  (sortOrder === "asc" ? "▲" : "▼")}
                              </span>
                            </th>
                            <th
                              className="px-4 py-3 cursor-pointer"
                              onClick={() => handleSort("nombre_paciente")}
                            >
                              Nombre{" "}
                              <span>
                                {sortBy === "nombre_paciente" &&
                                  (sortOrder === "asc" ? "▲" : "▼")}
                              </span>
                            </th>
                            <th
                              className="px-4 py-3 cursor-pointer"
                              onClick={() => handleSort("nombre_especialidad")}
                            >
                              Especialidad{" "}
                              <span>
                                {sortBy === "nombre_especialidad" &&
                                  (sortOrder === "asc" ? "▲" : "▼")}
                              </span>
                            </th>
                            <th
                              className="px-4 py-3 cursor-pointer"
                              onClick={() => handleSort("fecha_solicitud")}
                            >
                              Fecha solicitada{" "}
                              <span>
                                {sortBy === "fecha_solicitada" &&
                                  (sortOrder === "asc" ? "▲" : "▼")}
                              </span>
                            </th>
                            <th
                              className="px-4 py-3 cursor-pointer"
                              onClick={() => handleSort("fecha_solicitud")}
                            >
                              Insumos{" "}
                              <span>
                                {sortBy === "req_insumo" &&
                                  (sortOrder === "asc" ? "▲" : "▼")}
                              </span>
                            </th>
                            <th
                              className="px-4 py-3 cursor-pointer"
                              onClick={() => handleSort("fecha_solicitud")}
                            >
                              Sala{" "}
                              <span>
                                {sortBy === "sala" &&
                                  (sortOrder === "asc" ? "▲" : "▼")}
                              </span>
                            </th>
                            <th
                              className="px-4 py-3 cursor-pointer"
                              onClick={() => handleSort("estado_solicitud")}
                            >
                              Estado{" "}
                              <span>
                                {sortBy === "estado_solicitud" &&
                                  (sortOrder === "asc" ? "▲" : "▼")}
                              </span>
                            </th>
                            <th className="px-4 py-3">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedSolicitudes
                            .slice(startIndex, endIndex)
                            .map((solicitud) => {
                              return (
                                <tr
                                  key={solicitud.id_solicitud}
                                  className="bg-blue-50 hover:bg-[#7498b6]"
                                >
                                  <td className="border px-4 py-2">
                                    {solicitud.id_solicitud}
                                  </td>
                                  <td className="border px-4 py-2">
                                    {solicitud.folio}
                                  </td>
                                  <td className="border px-4 py-2">
                                    {solicitud.ap_paterno}{" "}
                                    {solicitud.ap_materno}{" "}
                                    {solicitud.nombre_paciente}
                                  </td>
                                  <td className="border px-4 py-2 text-center">
                                    {solicitud.nombre_especialidad}
                                  </td>
                                  <td className="border px-4 py-2 text-center">
                                  {formatFechaSolicitada(
                                  solicitud.fecha_solicitada
                                )}
                                  </td>
                                  <td className="border px-4 py-2 text-center">
                                    {solicitud.req_insumo}
                                  </td>
                                  <td className="border px-4 py-2 text-center">
                                    {solicitud.sala_quirofano}
                                  </td>

                                  <td className="border px-4 py-2">
                                    <div
                                      className={`inline-block px-1 py-1 rounded-lg ${getEstadoColor(
                                        solicitud.estado_solicitud
                                      )}`}
                                      style={{
                                        ...getEstadoColorStyle(
                                          solicitud.estado_solicitud
                                        ),
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        height: "100%",
                                        width: "100%",
                                        textAlign: "center",
                                      }}
                                    >
                                      {solicitud.estado_solicitud}
                                    </div>
                                  </td>
                                  <td className="border px-4 py-2 text-center">
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
                  ) : (
                    //Cards
                    //Cards
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {sortedSolicitudes
                        .slice(startIndex, endIndex)
                        .map((solicitud) => (
                          <div
                            key={solicitud.id_solicitud}
                            className="relative p-4 border border-gray-200 rounded-lg shadow-md transition-transform transform hover:scale-105 hover:shadow-xl"
                            style={{ borderRadius: "10px" }} // Puedes ajustar el valor de borderRadius según tus preferencias
                            onClick={() => handleViewModal(solicitud)}
                          >
                            <div className="flex flex-col h-full">
                              <div
                                className="absolute top-0 left-0 h-full"
                                style={{
                                  width: "10px",
                                  borderTopLeftRadius: "10px",
                                  borderBottomLeftRadius: "10px",
                                  ...getEstadoColorStyle(
                                    solicitud.estado_solicitud
                                  ),
                                }}
                              ></div>
                              <div className="mb-2 pl-3">
                                {" "}
                                {/* Ajustado el padding left para acomodar la línea más ancha */}
                                <div className="flex justify-between">
                                  <p className="text-lg font-semibold">
                                    {solicitud.nombre_paciente}{" "}
                                    {solicitud.ap_paterno}{" "}
                                    {solicitud.ap_materno}
                                  </p>
                                  <p className="text-sm">{solicitud.sala}</p>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {solicitud.folio}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {solicitud.nombre_especialidad}
                                </p>
                                <div className="flex justify-between">
                                  <p className="text-sm text-gray-600">
                                    {solicitud.turno}
                                  </p>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {solicitud.nombre_cirujano}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {solicitud.insumos}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Estatus: {solicitud.estado_solicitud}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
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
                disabled={endIndex >= sortedSolicitudes.length}
                className={`${
                  endIndex >= sortedSolicitudes.length
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

export default TodasSolicitudes;
