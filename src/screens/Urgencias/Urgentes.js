import React, { useState, useEffect, navigate } from "react";
import Layout from "../../Layout";
import axios from "axios";
import AddAppointmentModalProgramado from "../../components/Modals/AddApointmentModalProgramado";
import { useNavigate, Link } from "react-router-dom";
import moment from "moment";
import "moment/locale/es"; // Importa el idioma de moment.js

import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

function Solicitudesurgentes() {
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const navigate = useNavigate();
  const [filter, setFilter] = useState({
    fecha: "",
    especialidad: "",
    estado: "",
  });

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
  const [view, setView] = useState(""); // Default view
  const [selectedDate, setSelectedDate] = useState(new Date());
  const appointment = {
    estado_solicitud: "Urgencia", // o cualquier otro estado que tengas
    // otros datos aquí
  };

  useEffect(() => {
    fetchPendingAppointments();
  }, []);

const fetchPendingAppointments = async () => {
  try {
    // Ejecutar ambas solicitudes en paralelo usando Promise.all
    const [urgenciasResponse, realizadasResponse] = await Promise.all([
      fetch(`${baseURL}/api/solicitudes/geturgencias`),
      fetch(`${baseURL}/api/solicitudes/realizadas`)
    ]);

    // Verificar si ambas respuestas son válidas
    if (!urgenciasResponse.ok || !realizadasResponse.ok) {
      throw new Error("Una o más respuestas de red no fueron correctas");
    }

    // Obtener los datos de ambas respuestas
    const urgenciasData = await urgenciasResponse.json();
    const realizadasData = await realizadasResponse.json();

    // Combinar ambos resultados en un solo array (si es necesario)
    const combinedAppointments = [...urgenciasData, ...realizadasData];

    // Actualizar el estado con la lista combinada
    setPendingAppointments(combinedAppointments);

  } catch (error) {
    console.error("Error fetching appointments:", error);
  }
};


  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({
      ...filter,
      [name]: value,
    });
  };

  const handleViewClick = (appointment) => {
    if (!appointment.id_solicitud) {
      console.error("El ID de la cita no está definido:", appointment);
      return;
    }
  
    // Verificar el estado de la solicitud para decidir la redirección
    if (appointment.estado_solicitud === 'Urgencia') {
      navigate(`/urgencias/Consultaurgencia/${appointment.id_solicitud}`);
    } else if (appointment.estado_solicitud === 'Realizada') {
      navigate(`/solicitudes/Consultarealizada/${appointment.id_solicitud}`);
    } else {
      console.warn("Estado de solicitud no reconocido:", appointment.estado);
      // Puedes redirigir a una página de error o manejar este caso como desees
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
      case "urgencia":
        return { backgroundColor: "#FC8181", color: "white" }; // Rosa claro
        case "realizada":
          return { backgroundColor: "#63B3ED", color: "white" }; 
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

  const handlePrintClick = (selectedDate) => {
    printDailyAppointments(selectedDate);
  };

  const formatFechaSolicitada = (fecha) => {
    if (!fecha) return "";
    const [year, month, day] = fecha.split("-");
    return `${day}-${month}-${year}`;
  };

  // Función para exportar datos a Excel
  const exportToExcel = async (selectedDate) => {
    const formattedDate = moment(selectedDate).format("YYYY-MM-DD");
  
    try {
      // Ejecutar ambas solicitudes en paralelo
      const [solicitudesResponse, urgenciasResponse] = await Promise.all([
        fetch(`${baseURL}/api/solicitudes/realizadas`),
        fetch(`${baseURL}/api/solicitudes/geturgencias`)
      ]);
  
      if (!solicitudesResponse.ok || !urgenciasResponse.ok) {
        throw new Error("Una o más respuestas de red no fueron correctas");
      }
  
      const solicitudesData = await solicitudesResponse.json();
      const urgenciasData = await urgenciasResponse.json();
  
      // Filtrar las solicitudes por la fecha seleccionada
      const filteredSolicitudes = solicitudesData.filter(
        (solicitud) =>
          moment(solicitud.fecha_solicitada).format("YYYY-MM-DD") === formattedDate
      );
  
      // Filtrar urgencias también por la fecha seleccionada
      const filteredUrgencias = urgenciasData.filter(
        (urgencia) =>
          moment(urgencia.fecha).format("YYYY-MM-DD") === formattedDate
      );
  
      // Combinar ambas listas
      const combinedAppointments = [...filteredSolicitudes, ...filteredUrgencias];
  
      // Reorganizar los datos para la exportación
      const reorganizedAppointments = combinedAppointments.map((solicitud) => {
        return {
          id: solicitud.id_solicitud,
          folio: solicitud.folio,
          ap_paterno: solicitud.ap_paterno,
          ap_materno: solicitud.ap_materno,
          nombre_paciente: solicitud.nombre_paciente,
          edad: solicitud.edad,
          sexo: solicitud.sexo,
          procedimientos_paciente: solicitud.procedimientos_paciente,
          diagnostico: solicitud.diagnostico,
          tiempo_estimado: solicitud.tiempo_estimado,
          tipo_intervencion: solicitud.tipo_intervencion,
          cama: solicitud.cama,
          fecha_solicitada: solicitud.fecha_solicitada,
          turno_solicitado: solicitud.turno_solicitado,
          sala_quirofano: solicitud.sala_quirofano,
          nombre_especialidad: solicitud.nombre_especialidad,
          cirujano: solicitud.nombre_cirujano,
          req_insumo: solicitud.req_insumo,
          procedimientos_extra: solicitud.procedimientos_extra,
          // Cualquier otro campo necesario
        };
      });
  
      // Crear la hoja de cálculo
      const worksheet = XLSX.utils.json_to_sheet(reorganizedAppointments);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Solicitudes y Urgencias");
  
      // Generar el archivo Excel
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const data = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
  
      const fileName = `Solicitudes_y_Urgencias_${formattedDate}.xlsx`;
      saveAs(data, fileName);
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };
  
  const handleExport = async () => {
    if (selectedDate) {
      await exportToExcel(selectedDate);
    } else {
      console.warn("No date selected!");
    }
  };
  
  const printDailyAppointments = async (selectedDate) => {
    const today = moment(printDate).format("YYYY-MM-DD");
    try {
      const [solicitudesResponse, anesthesiologistsResponse, urgenciasResponse] = await Promise.all([
        fetch(`${baseURL}/api/solicitudes/realizadas`),
        fetch(`${baseURL}/api/anestesio/anestesiologos`),
        fetch(`${baseURL}/api/solicitudes/geturgencias`)
      ]);
  
      if (!solicitudesResponse.ok || !anesthesiologistsResponse.ok || !urgenciasResponse.ok) {
        throw new Error("Network response was not ok");
      }
  
      const solicitudesData = await solicitudesResponse.json();
      const anesthesiologistsData = await anesthesiologistsResponse.json();
      const urgenciasData = await urgenciasResponse.json();
  
      // Filtrar las solicitudes y urgencias del día seleccionado
      const todaysRegistrations = [
        ...solicitudesData.filter(
          (solicitud) => moment(solicitud.fecha_programada).format("YYYY-MM-DD") === today
        ),
        ...urgenciasData.filter(
          (urgencia) => moment(urgencia.fecha_programada).format("YYYY-MM-DD") === today
        )
      ];
      
  
      // Filtrar anestesiólogos asignados para el día seleccionado
      const todaysAnesthesiologists = anesthesiologistsData.filter(
        (anesthesiologist) =>
          moment(anesthesiologist.dia_anestesio).format("YYYY-MM-DD") === today
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
                        <th>Edad</th>
                        <th>Sexo</th>
                        <th>Procedimiento CIE-9</th>
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
                <tbody>
                ${["Matutino", "Vespertino", "Nocturno"]
                  .map((turno) => {
                    const sortedRegistrations = todaysRegistrations
                      .filter((appointment) => {
                        const hour = moment(
                          appointment.hora_asignada,
                          "HH:mm"
                        ).hour();
                        if (turno === "Matutino") return hour >= 8 && hour < 15;
                        if (turno === "Vespertino")
                          return hour >= 15 && hour < 21;
                        return hour >= 21 || hour < 6;
                      })
                      .sort((a, b) => {
                        const salaOrder = [
                          "A1",
                          "A2",
                          "T1",
                          "T2",
                          "1",
                          "2",
                          "3",
                          "4",
                          "5",
                          "6",
                          "E",
                          "H",
                          "RX",
                        ];
                        const salaA = salaOrder.indexOf(a.sala_quirofano);
                        const salaB = salaOrder.indexOf(b.sala_quirofano);
                        if (salaA !== salaB) {
                          return salaA - salaB;
                        }
                        const horaA = moment(a.hora_asignada, "HH:mm");
                        const horaB = moment(b.hora_asignada, "HH:mm");
                        return horaA - horaB;
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
                          .map((appointment, index) => {
                            const assignedAnesthesiologist =
                              todaysAnesthesiologists.find(
                                (anesthesiologist) =>
                                  anesthesiologist.sala_anestesio.includes(
                                    appointment.sala_quirofano
                                  ) &&
                                  anesthesiologist.turno_anestesio === turno
                              );

                            const anesthesiologistName =
                              assignedAnesthesiologist
                                ? assignedAnesthesiologist.nombre
                                : "No asignado";

                            return `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${appointment.folio || ""}</td>
                                    <td>${moment(
                                      appointment.hora_asignada,
                                      "HH:mm"
                                    ).format("LT")}</td>
                                    <td>Sala: ${
                                      appointment.sala_quirofano || ""
                                    }</td>
                                    <td>${appointment.ap_paterno} ${
                              appointment.ap_materno
                            } ${appointment.nombre_paciente}</td>
                                    <td>${appointment.edad || ""}</td>
                                    <td>${
                                      appointment.sexo
                                        ? appointment.sexo === "Femenino"
                                          ? "F"
                                          : "M"
                                        : "No especificado"
                                    }</td>
                                    <td>${
                                      appointment.procedimientos_paciente
                                        ? appointment.procedimientos_paciente.slice(
                                            0,
                                            60
                                          )
                                        : ""
                                    }</td>
                                    <td>${
                                      appointment.diagnostico
                                        ? appointment.diagnostico.slice(0, 60)
                                        : ""
                                    }</td>
                                    <td>${
                                      appointment.nombre_especialidad || ""
                                    }</td>
                                                                            <td>${(() => {
                                                                              switch (
                                                                                appointment.tipo_admision
                                                                              ) {
                                                                                case "CONSULTA EXTERNA":
                                                                                  return "C.E.";
                                                                                case "CAMA":
                                                                                  return `Cama - ${appointment.cama}`;
                                                                                case "URGENCIAS":
                                                                                  return "Urgencias";
                                                                                default:
                                                                                  return (
                                                                                    appointment.tipo_admision ||
                                                                                    "No especificado"
                                                                                  );
                                                                              }
                                                                            })()}</td>
                                    <td>${appointment.tiempo_estimado} min</td>
                                    <td>${anesthesiologistName}</td>
                                    <td>${
                                      appointment.nombre_cirujano
                                        ? appointment.nombre_cirujano
                                            .split(" ")
                                            .slice(0, 2)
                                            .join(" ")
                                        : ""
                                    }</td>
                                    <td>${appointment.req_insumo || ""}</td>
                                </tr>
                            `;
                          })
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
                        <th>Consulta Externa Piso 1 Mat</th>
                        <th>Consulta Externa Piso 2 Mat</th>
                        <th>Recuperación Vespertino</th>
                        <th>Consulta Externa Piso 2 Vespertino</th>
                        <th>Recuperación Nocturno</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        ${[
                          "Recup_Matutino",
                          "Con_Ext_P1_mat",
                          "Con_Ext_P2_mat",
                          "Rec_Vespertino",
                          "Con_Ext_P2_vesp",
                          "Rec_Nocturno",
                        ]
                          .map((sala) => {
                            const assignedAnesthesiologists =
                              todaysAnesthesiologists
                                .filter((anesthesiologist) =>
                                  anesthesiologist.sala_anestesio.includes(sala)
                                )
                                .map(
                                  (anesthesiologist) => anesthesiologist.nombre
                                )
                                .join(", ");
                            return `<td>${
                              assignedAnesthesiologists || "No asignado"
                            }</td>`;
                          })
                          .join("")}
                    </tr>
                </tbody>
            </table>
        </body>
        </html>
        `;

      const newWindow = window.open();
      newWindow.document.write(printableContent);
      newWindow.document.close();
      newWindow.print();
    } catch (error) {
      console.error("Error printing:", error);
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
      ? new Date(appointment.fecha_programada).toISOString().slice(0, 10) ===
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
        <div className="flex flex-col gap-2 mb-4">
          <h1 className="text-xl font-semibold">Solicitudes Urgentes</h1>
          
          <div className="flex justify-between my-4">
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

          <div>
              {/* Enlaces para cambiar vistas */}
              <div className="flex justify-center space-x-4 mb-4">
                <button
                  onClick={() => setView("print")}
                  className={`py-2 px-4 rounded ${
                    view === "print" ? "bg-[#5DB259]" : "bg-gray-300"
                  } text-white`}
                >
                  Imprimir
                </button>
                <button
                  onClick={() => setView("export")}
                  className={`py-2 px-4 rounded ${
                    view === "export" ? "bg-[#4A5568]" : "bg-gray-300"
                  } text-white`}
                >
                  Exportar
                </button>
              </div>

              {/* Contenido según la vista seleccionada */}
              {view === "print" && (
                <div className="flex flex-col items-center space-y-2">
                  <label className="font-semibold">Día a imprimir:</label>
                  <input
                    type="date"
                    value={formatDateInputValue(printDate)}
                    onChange={handlePrintDateChange}
                    className="px-2 py-2 border border-main rounded-md text-main"
                  />
                  <button
                    onClick={printDailyAppointments}
                    className="bg-[#5DB259] hover:bg-[#528E4F] text-white py-2 px-4 rounded inline-flex items-center"
                  >
                    Imprimir Urgentes
                  </button>
                </div>
              )}

              {view === "export" && (
                <div className="flex flex-col items-center space-y-2">
                  <label className="font-semibold">Día a exportar:</label>
                  <input
                    type="date"
                    value={selectedDate || ""}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-2 py-2 border rounded"
                  />
                  <button
                    onClick={handleExport}
                    className="bg-[#4A5568] hover:bg-[#758195] text-white py-2 px-4 rounded inline-flex items-center"
                  >
                    Exportar a Excel
                  </button>
                </div>
              )}
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
                      onClick={() => handleSort("fecha_programada")}
                    >
                      Fecha de urgencia{" "}
                      <span>
                        {sortBy === "fecha_programada"
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
                          {appointment.ap_paterno} {appointment.ap_materno}{" "}
                          {appointment.nombre_paciente}
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
