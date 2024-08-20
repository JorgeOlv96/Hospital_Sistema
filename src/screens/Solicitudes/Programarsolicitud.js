import React, { useState, useEffect } from "react";
import Layout from "../../Layout";
import axios from "axios";
import AddAppointmentModalPending from "../../components/Modals/AddApointmentModalPending";
import { Link } from "react-router-dom";
import moment from "moment";

function ProgramarSolicitud() {
  const [pendingAppointments, setPendingAppointments] = useState([]);

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [open, setOpen] = useState(false);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const [printDate, setPrintDate] = useState(new Date());
  const itemsPerPage = 10;
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
    estado_solicitud: "Pre-programada", // o cualquier otro estado que tengas
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
      const response = await fetch(`${baseURL}/api/solicitudes/preprogramadas`);
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
      case "pre-programada":
        return { backgroundColor: "#06ABC9", color: "white" }; // Color de fondo y texto
      case "duplicada":
        return { backgroundColor: "red", color: "white" }; // Color de fondo amarillo y texto rojo
      default:
        return {};
    }
  };

  const isDuplicated = (appointment) => {
    return (
      pendingAppointments.filter(
        (a) =>
          a.nombre_paciente === appointment.nombre_paciente &&
          a.fecha_solicitada === appointment.fecha_solicitada &&
          a.id_solicitud !== appointment.id_solicitud
      ).length > 0
    );
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

  const onPrint = (date) => {
    console.log("Printing for date:", date);
    // Aquí agregarías la lógica para imprimir las solicitudes aprobadas en la fecha seleccionada
  };

  const formatDateInputValue = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handlePrintDateChange = (e) => {
    const selectedDate = moment(e.target.value).startOf("day").toDate();
    setPrintDate(selectedDate);
  };
  // Llamada a la función de impresión
  const handlePrintClick = (selectedDate) => {
    printDailyAppointments(selectedDate);
  };

  const printDailyAppointments = async (selectedDate) => {
    const today = moment(printDate).format("YYYY-MM-DD");
    try {
      // Fetch de las solicitudes programadas
      const solicitudesResponse = await fetch(
        `${baseURL}/api/solicitudes/preprogramadas`
      );
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
      console.log(
        "Today's Anesthesiologists for Recovery:",
        todaysAnesthesiologists.filter(
          (anesthesiologist) =>
            anesthesiologist.sala_anestesio === "Recup_Matutino"
        )
      );

      const anesthesiologistsFilteredByDate = anesthesiologistsData.filter(
        (anesthesiologist) =>
          moment(anesthesiologist.dia_anestesio).format("YYYY-MM-DD") === today
      );
      console.log("Filtered by Date:", anesthesiologistsFilteredByDate);

      const anesthesiologistsFilteredByRoom = anesthesiologistsData.filter(
        (anesthesiologist) =>
          anesthesiologist.sala_anestesio === "Recup_Matutino"
      );
      console.log(
        "Filtered by Room (Recup_Matutino):",
        anesthesiologistsFilteredByRoom
      );

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
      ">Hoja de impresión PRE-APROBADAS:</h1>
      <div class="date" style="
        margin-left: 10px;
        font-size: 1em;
      ">${moment(printDate).format("DD-MM-YYYY")}</div>
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
        <th>Diagnostico</th>
        <th>Especialidad</th>
        <th>Procedencia</th>
        <th>Tiempo est.</th>
        <th>Anestesiólogo</th>
        <th>Cirujano</th>
        <th>Insumos</th>
      </tr>
    </thead>
    <tbody>
      ${["Matutino", "Vespertino", "Nocturno"]
        .map((turno) => {
          const sortedRegistrations = todaysRegistrations
            .filter((appointment) => {
              const hour = moment(appointment.hora_solicitada, "HH:mm").hour();
              if (turno === "Matutino") return hour >= 8 && hour <= 14;
              if (turno === "Vespertino") return hour >= 14 && hour <= 20;
              return hour >= 20 || hour < 8;
            })
            .sort((a, b) => {
              const salaOrder = [
                "A1", "A2", "T1", "T2", "1", "2", "3", "4", "5", "6", "E", "H", "RX",
              ];
              const salaA = salaOrder.indexOf(a.sala_quirofano);
              const salaB = salaOrder.indexOf(b.sala_quirofano);
              if (salaA !== salaB) return salaA - salaB;
              return moment(a.hora_solicitada, "HH:mm").diff(moment(b.hora_solicitada, "HH:mm"));
            });

          return `
            <tr class="turno-section">
              <td colspan="13">${turno} (de ${
              turno === "Matutino"
                ? "08:00 a 14:00"
                : turno === "Vespertino"
                ? "14:00 a 20:00"
                : "20:00 a 06:00"
            })</td>
            </tr>
            ${sortedRegistrations
              .map(
                (appointment, index) => {
                  // Obtener el anestesiólogo asignado para la solicitud actual
                  const assignedAnesthesiologist = todaysAnesthesiologists.find(
                    (anesthesiologist) =>
                      anesthesiologist.sala_anestesio.includes(appointment.sala_quirofano) &&
                      moment(anesthesiologist.dia_anestesio).isSame(moment(appointment.fecha_solicitada), 'day')
                  );
                  
                  const anesthesiologistName = assignedAnesthesiologist
                    ? assignedAnesthesiologist.nombre
                    : "No asignado";
                  
                  return `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${appointment.folio || ""}</td>
                      <td>${moment(appointment.hora_solicitada, "HH:mm").format("LT")}</td>
                      <td>Sala: ${appointment.sala_quirofano || ""}</td>
                      <td>${appointment.nombre_paciente} ${appointment.ap_paterno} ${appointment.ap_materno}</td>
                      <td>${appointment.sexo ? (appointment.sexo === "Femenino" ? "F" : "M") : "No especificado"}</td>
                      <td>
                        ${(() => {
                          const procedimientos = appointment.diagnostico || "";
                          const [beforeDash, afterDash] = procedimientos.split("-", 2);
                          const truncatedBeforeDash = beforeDash.slice(0, 45);
                          return `${truncatedBeforeDash}${afterDash ? "-" + afterDash : ""}`;
                        })()}
                      </td>
                      <td>${appointment.nombre_especialidad || ""}</td>
                      <td>
                        ${(() => {
                          switch (appointment.tipo_admision) {
                            case "CONSULTA EXTERNA":
                              return "C.E.";
                            case "CAMA":
                              return `Cama - ${appointment.cama}`;
                            case "URGENCIAS":
                              return "Urgencias";
                            default:
                              return appointment.tipo_admision || "No especificado";
                          }
                        })()}
                      </td>
                      <td>${appointment.tiempo_estimado} min</td>
                      <td>${anesthesiologistName}</td>
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
                  `;
                }
              )
              .join("")}
          `;
        })
        .join("")}
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
          .map(
            (room) => `
            <td>
              ${todaysAnesthesiologists
                .filter(
                  (anesthesiologist) =>
                    anesthesiologist.sala_anestesio.includes(room)
                )
                .map((anesthesiologist) => anesthesiologist.nombre)
                .join(", ")}
            </td>`
          )
          .join("")}
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

  return (
    <Layout>
      <div
        data-aos="fade-right"
        data-aos-duration="1000"
        data-aos-delay="100"
        data-aos-offset="200"
      >
        <div className="flex flex-col gap-2 mb-4">
          <h1 className="text-xl font-semibold">Solicitudes pre-programadas</h1>

          <div className="flex my-4 space-x-4">
            <div>
              <Link
                to="/appointments"
                className="bg-[#365b77] hover:bg-[#7498b6] text-white py-2 px-4 rounded inline-flex items-center"
              >
                <span>Agenda</span>
              </Link>
            </div>

            <div>
              <Link
                to="/solicitudes/todas"
                className="bg-[#4A5568] hover:bg-[#758195] text-white py-2 px-4 rounded inline-flex items-center"
              >
                <span>Todas las solicitudes</span>
              </Link>
            </div>

            <div>
              <Link
                to="/solicitudes/Solicitudesprogramadas"
                className="bg-[#5DB259] hover:bg-[#528E4F] text-white py-2 px-4 rounded inline-flex items-center"
              >
                <span>Programadas</span>
              </Link>
            </div>

            <div>
              <Link
                to="/solicitudes/Solicitudreaizada"
                className="bg-[#63B3ED] hover:bg-[#63B3ED] text-white py-2 px-4 rounded inline-flex items-center"
              >
                <span>Realizadas</span>
              </Link>
            </div>

            <div>
              <Link
                to="/solicitudes/Solicitudsuspendida"
                className="bg-[#D87D09] hover:bg-[#BF6E07] text-white py-2 px-4 rounded inline-flex items-center"
              >
                <span>Suspendidas</span>
              </Link>
            </div>
            <div className="flex ml-auto items-center">
              <label className="mr-2 font-semibold">Día a imprimir:</label>
              <input
                type="date"
                value={formatDateInputValue(printDate)}
                onChange={handlePrintDateChange}
                className="px-4 py-2 border border-main rounded-md text-main"
              />
              <button
                onClick={printDailyAppointments}
                className="bg-[#5DB259] hover:bg-[#528E4F] text-white py-2 px-4 rounded inline-flex items-center ml-4"
              >
                Imprimir Pre-progrmadas
              </button>
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
              {isDuplicated(appointment) && (
                <span
                  style={{
                    textDecoration: "underline",
                    color: "red",
                    marginLeft: "10px",
                  }}
                >
                  Duplicada
                </span>
              )}
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
                      onClick={() => handleSort("fecha_solicitada")}
                    >
                      Fecha de solicitud{" "}
                      <span>
                        {sortBy === "fecha_solicitud" &&
                          (sortOrder === "asc" ? "▲" : "▼")}
                      </span>
                    </th>
                    <th
                      className="px-4 py-3 cursor-pointer"
                      onClick={() => handleSort("sala_quirofano")}
                    >
                      Sala{" "}
                      <span>
                        {sortBy === "sala_quirofano" &&
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
                    <th className="px-4 py-3 cursor-pointer">Duplicada</th>
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
                          {appointment.ap_paterno}
                          {"  "} {appointment.ap_materno}
                          {"  "}
                          {appointment.nombre_paciente}
                        </td>
                        <td className="px-4 py-2">
                          {appointment.nombre_especialidad}
                        </td>
                        <td className="px-4 py-2">
                          {appointment.fecha_solicitud}
                        </td>
                        <td className="px-4 py-2">
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
                        <td className="px-4 py-2">
                          {isDuplicated(appointment) && (
                            <div
                              style={{
                                ...getEstadoColorStyle("duplicada"),
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "100%",
                                width: "100%",
                                textAlign: "center",
                                borderRadius: "8px",
                                padding: "2px 1px",
                              }}
                            >
                              Duplicada
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-2">
                          <button
                            onClick={() => handleViewModal(appointment)}
                            className="bg-[#365b77] text-white px-5 py-2 rounded-md hover:bg-[#7498b6]"
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

export default ProgramarSolicitud;
