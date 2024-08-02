import React, { useState, useEffect, useMemo } from "react";
import Layout from "../../Layout";
import moment from "moment";
import { Link } from "react-router-dom";
import AddAppointmentModal from "../../components/Modals/AddApointmentModal";
import { FaTable, FaThLarge } from "react-icons/fa"; // Asegúrate de tener esta biblioteca instalada

function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(9);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("nombre_paciente");
  const [filterState, setFilterState] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [view, setView] = useState("table"); // State to toggle view
  const [selectedDate, setSelectedDate] = useState(new Date());
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const response = await fetch(`${baseURL}/api/solicitudes`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setSolicitudes(data);
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
    setOpen(true);
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

  const printRequestedAppointments = async () => {
    const today = moment(selectedDate).format("YYYY-MM-DD"); // Usa la fecha seleccionada

    try {
      // Fetch de las solicitudes tentativas
      const solicitudesResponse = await fetch(`${baseURL}/api/solicitudes`);
      if (!solicitudesResponse.ok) {
        throw new Error("Network response for solicitudes was not ok");
      }
      const solicitudesData = await solicitudesResponse.json();
      console.log("Solicitudes Data:", solicitudesData);

      // Fetch de los anestesiólogos
      const anesthesiologistsResponse = await fetch(
        `${baseURL}/api/anestesio/anestesiologos`
      );
      if (!anesthesiologistsResponse.ok) {
        throw new Error("Network response for anesthesiologists was not ok");
      }
      const anesthesiologistsData = await anesthesiologistsResponse.json();
      console.log("Anesthesiologists Data:", anesthesiologistsData);

      // Filtrar las solicitudes del día seleccionado
      const todaysRegistrations = solicitudesData.filter(
        (solicitud) =>
          moment(solicitud.fecha_solicitada).format("YYYY-MM-DD") === today
      );
      console.log("Today's Registrations:", todaysRegistrations);

      // Filtrar los anestesiólogos asignados para el día seleccionado
      const todaysAnesthesiologists = anesthesiologistsData.filter(
        (anesthesiologist) =>
          moment(anesthesiologist.dia_anestesio).format("YYYY-MM-DD") === today
      );
      console.log("Today's Anesthesiologists:", todaysAnesthesiologists);
      const printableContent = `
      <html>
        <head>
          <style>
            body {
              background-color: #ffffff;
              font-family: Arial, sans-serif;
              font-size: 10px !important;
              margin: 10px;
              padding: 5px;
            }
            .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 10px;
            }
            .header img {
              max-width: 150px;
              height: auto;
              margin-right: 5px;
            }
            .header .date {
              font-size: 10px !important;
              text-align: left;
              margin-right: 5px;
            }
            .header h1 {
              font-size: 10px !important;
              margin: 5px;
              flex-grow: 2;
              text-align: right;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              font-size: 8px !important;
            }
            th, td {
              border: 1px solid black;
              padding: 3px !important;
              text-align: left;
              white-space: nowrap;
            }
            .turno-section {
              background-color: #d3d3d3;
              text-align: left;
              font-weight: bold;
              padding: 5px;
              border-top: 2px solid black;
              border-bottom: 2px solid black;
            }
          </style>
        </head>
        <body>
          <div class="header" style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            background-color: #f4f4f4;
          ">
            <h4 style="margin: 0;">Solicitudes Programadas</h4>
            <div style="
              display: flex;
              align-items: center;
              text-align: right;
            ">
              <h1 style="
                margin: 0;
                font-size: 1em;
                line-height: 1;
              ">PRELIMINAR:</h1>
              <div class="date" style="
                margin-left: 10px;
                font-size: 1em;
              ">${moment(selectedDate).format("DD-MM-YYYY")}</div>
            </div>
          </div>
      
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Folio</th>
                <th>Hra. asign.</th>
                <th>Sala</th>
                <th>Nom. completo</th>
                <th>Sexo</th>
                <th>Procedimientos</th>
                <th>Esp.</th>
                <th>Fecha solicitada</th>
                <th>Tiempo est.</th>
                <th>Turno</th>
                <th>Cirujano</th>
                <th>Ins.</th>
              </tr>
            </thead>
            <tbody>
              ${['Matutino', 'Vespertino', 'Nocturno'].map(turno => `
                <tr class="turno-section">
                  <td colspan="13">${turno} (de ${turno === 'Matutino' ? '08:00 a 14:00' : turno === 'Vespertino' ? '14:00 a 20:00' : '20:00 a 06:00'})</td>
                </tr>
                ${todaysRegistrations
                  .filter(appointment => {
                    const hour = moment(appointment.hora_solicitada, "HH:mm").hour();
                    if (turno === 'Matutino') return hour >= 8 && hour <= 14;
                    if (turno === 'Vespertino') return hour >= 14 && hour <= 20;
                    return hour >= 20 || hour < 8;
                  })
                  .map((appointment, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${appointment.folio || ""}</td>
                      <td>${moment(appointment.hora_solicitada, "HH:mm").format("LT")}</td>
                      <td>Sala: ${appointment.sala_quirofano || ""}</td>
                      <td>${appointment.nombre_paciente} ${appointment.ap_paterno} ${appointment.ap_materno}</td>
                      <td>${appointment.sexo ? (appointment.sexo === "Femenino" ? "F" : "M") : "No especificado"}</td>
                     <td>
                        ${(() => {
                          const procedimientos =
                            appointment.procedimientos_paciente || "";
                          const [beforeDash, afterDash] = procedimientos.split("-", 2);
                          const truncatedBeforeDash = beforeDash.slice(0, 20);
                          return `${truncatedBeforeDash}${
                            afterDash ? "-" + afterDash : ""
                          }`;
                        })()}
                      </td>
                      <td>${appointment.clave_esp || ""}</td>
                      <td>${moment(appointment.fecha_solicitada).format("DD-MM-YYYY")}</td>
                      <td>${appointment.tiempo_estimado} min</td>
                      <td>
                          ${(() => {
                            const turno = appointment.turno || "";
                            const turnMap = {
                              Vespertino: "V",
                              Matutino: "M",
                              Nocturno: "N",
                              Especial: "E",
                            };
                            return turnMap[turno] || "";
                          })()}
                        </td>
                       <td>
                          ${(() => {
                            const nombre = appointment.nombre_cirujano || "";
                            const words = nombre.split(" ");
                            const truncatedName = words.slice(0, 2).join(" ");
                            return truncatedName;
                          })()}
                        </td>
                      <td>${appointment.req_insumo || ""}</td>
                    </tr>
                  `).join('')}
              `).join('')}
            </tbody>
          </table>
      
          <table>
            <thead>
              <tr>
                <th>Recuperación Matutino</th>
                <th>Consulta Externa Piso 1</th>
                <th>Consulta Externa Piso 2</th>
                <th>Recuperación Vespertino</th>
                <th>Consulta Externa Piso 1</th>
                <th>Consulta Externa Piso 2</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                ${[
                  "Recup_Matutino",
                  "Con_Ext_P1_mat",
                  "Con_Ext_P2_mat",
                  "Rec_Vespertino",
                  "Con_Ext_P1_vesp",
                  "Con_Ext_P2_vesp",
                ]
                  .map(room => `
                    <td>
                      ${todaysAnesthesiologists
                        .filter(anesthesiologist => anesthesiologist.sala_anestesio === room)
                        .map(anesthesiologist => anesthesiologist.nombre)
                        .join(", ")}
                    </td>`
                  )
                  .join('')}
              </tr>
            </tbody>
          </table>
        </body>
      </html>
      `;
      
      // Crear una ventana de impresión y escribir el contenido
      const printWindow = window.open("", "_blank");
      printWindow.document.open();
      printWindow.document.write(printableContent);
      printWindow.document.close();
      printWindow.print();
    } catch (error) {
      console.error("Error al imprimir las solicitudes:", error);
    }
  };

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
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-xl font-semibold">Solicitudes</h1>
        <div className="my-4 flex items-center">
          <Link
            to="./Crearsolicitud"
            className="btn btn-sm btn-secondary p-2 bg-[#365b77] text-white rounded-lg"
          >
            Nueva Solicitud
          </Link>

          <div className="flex ml-auto">
            <input
              type="date"
              value={moment(selectedDate).format("YYYY-MM-DD")}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />

            <button
              onClick={printRequestedAppointments}
              className="bg-[#FFA500] hover:bg-[#E9A856] text-white py-2 px-4 rounded inline-flex items-center ml-4"
            >
              Imprimir Preliminar
            </button>
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

        <div className="flex flex-col space-y-4 mt-4">
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

          {/* Lista de Solicitudes */}
          <div className="mt-8">
            <div className="text-left">
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
                    Todas las solicitudes
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg ${estadoButtonClasses(
                      "programada"
                    )}`}
                    style={
                      filterState === "programada"
                        ? { ...getEstadoColorStyle("programada"), opacity: 0.9 }
                        : { ...getEstadoColorStyle("programada"), opacity: 0.7 }
                    }
                    onClick={() => setFilterState("programada")}
                  >
                    Programada
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg ${estadoButtonClasses(
                      "realizada"
                    )}`}
                    style={
                      filterState === "realizada"
                        ? { ...getEstadoColorStyle("realizada"), opacity: 0.9 }
                        : { ...getEstadoColorStyle("realizada"), opacity: 0.7 }
                    }
                    onClick={() => setFilterState("realizada")}
                  >
                    Realizada
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg ${estadoButtonClasses(
                      "suspendida"
                    )}`}
                    style={
                      filterState === "suspendida"
                        ? { ...getEstadoColorStyle("suspendida"), opacity: 0.9 }
                        : { ...getEstadoColorStyle("suspendida"), opacity: 0.7 }
                    }
                    onClick={() => setFilterState("suspendida")}
                  >
                    Suspendida
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg ${estadoButtonClasses(
                      "pendiente"
                    )}`}
                    style={
                      filterState === "pendiente"
                        ? { ...getEstadoColorStyle("pendiente"), opacity: 0.9 }
                        : { ...getEstadoColorStyle("pendiente"), opacity: 0.7 }
                    }
                    onClick={() => setFilterState("pendiente")}
                  >
                    Pendiente
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
                    Pre-programadas
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg ${estadoButtonClasses(
                      "urgencia"
                    )}`}
                    style={
                      filterState === "urgencia"
                        ? { ...getEstadoColorStyle("urgencia"), opacity: 0.9 }
                        : { ...getEstadoColorStyle("urgencia"), opacity: 0.7 }
                    }
                    onClick={() => setFilterState("urgencia")}
                  >
                    Urgentes
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center mt-4 mb-4">
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
                            Fecha{" "}
                            <span>
                              {sortBy === "fecha_solicitud" &&
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
                            const formattedDate = new Date(
                              solicitud.fecha_solicitud
                            ).toLocaleDateString();
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
                                  {solicitud.nombre_paciente}{" "}
                                  {solicitud.ap_paterno} {solicitud.ap_materno}
                                </td>
                                <td className="border px-4 py-2">
                                  {solicitud.nombre_especialidad}
                                </td>
                                <td className="border px-4 py-2">
                                  {solicitud.fecha_solicitud}
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
                                <td className="border px-4 py-2">
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
                                  {solicitud.ap_paterno} {solicitud.ap_materno}
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
      </div>
    </Layout>
  );
}

export default Solicitudes;
