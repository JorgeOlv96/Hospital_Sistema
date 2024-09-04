import React, { useState, useEffect, useMemo } from "react";
import Layout from "../../Layout";
import axios from "axios";
import AddAppointmentModalPending from "../../components/Modals/AddApointmentModalPending";
import { Link } from "react-router-dom";
import { FaTable, FaThLarge, FaInfoCircle, FaClock } from "react-icons/fa";
import OperatingRoomSchedulePrepro from "../../components/OperatingRoomSchedulePrepro";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import "moment/locale/es"; // Importa el idioma de moment.js

import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const localizer = momentLocalizer(moment);

const messages = {
  today: "Hoy",
  previous: "Anterior",
  next: "Siguiente",
  month: "Mes",
  week: "Semana",
  day: "Día",
  agenda: "Agenda",
  // Puedes añadir más traducciones si es necesario
};

function ProgramarSolicitud() {
  const [pendingAppointments, setPendingAppointments] = useState([]);

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [open, setOpen] = useState(false);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const [printDate, setPrintDate] = useState(new Date());
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";

  // Estados para los filtros
  const [nameFilter, setNameFilter] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [viewMode, setViewMode] = useState("list"); // Agregamos un estado para la vista
  const [view, setView] = useState(""); // Default view

  const [openModal, setOpenModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

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
      // Ordenar los datos por ID de solicitud de manera descendente
      const sortedData = data.sort((a, b) => b.id_solicitud - a.id_solicitud);

      setPendingAppointments(sortedData);
    } catch (error) {
      console.error("Error fetching pending appointments:", error);
    }
  };

  const handleViewModal = (appointment) => {
    setSelectedAppointment(appointment);
    setOpen(true);
  };
  const handlePreviousDay = () => {
    setSelectedDate(prevDate => moment(prevDate).subtract(1, 'day').toDate());
  };

  const handleNextDay = () => {
    setSelectedDate(prevDate => moment(prevDate).add(1, 'day').toDate());
  };
  const handleModal = () => {
    setOpen(false);
    setSelectedAppointment(null); // Limpia la selección cuando se cierra la modal
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
      case "no":
        return { backgroundColor: "#68D391", color: "white" }; // Fondo blanco y texto verde
      default:
        return {};
    }
  };

  const isDuplicated = (appointment) => {
    return (
      pendingAppointments.filter(
        (a) =>
          a.nombre_paciente === appointment.nombre_paciente &&
          a.ap_paterno === appointment.ap_paterno &&
          a.ap_materno === appointment.ap_materno &&
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

  const handleEventClick = (event) => {
    setSelectedAppointment({
      id_solicitud: event.resource.id_solicitud,
    });
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedEvent({});
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    console.log("Selected date:", date);
  };

  const handleViewChange = (newView) => {
    if (newView === "agenda") {
      setViewMode("agenda"); // Cambia a tu vista personalizada
    } else {
      setViewMode("calendar"); // Mantén el calendario para otras vistas
    }
  };
  // Llamada a la función de impresión
  const handlePrintClick = (selectedDate) => {
    printDailyAppointments(selectedDate);
  };

  const formatFechaSolicitada = (fecha) => {
    if (!fecha) return "";
    const [year, month, day] = fecha.split("-");
    return `${day}-${month}-${year}`;
  };

// Función para exportar datos a Excel
// Función para exportar datos a Excel
const exportToExcel = async (selectedDate) => {
  const formattedDate = moment(selectedDate).format("YYYY-MM-DD");

  try {
    // Fetch de las solicitudes programadas
    const solicitudesResponse = await fetch(
      `${baseURL}/api/solicitudes/preprogramadas`
    );
    if (!solicitudesResponse.ok) {
      throw new Error("Network response for solicitudes was not ok");
    }
    const solicitudesData = await solicitudesResponse.json();

    // Filtrar las solicitudes del día seleccionado
    const filteredAppointments = solicitudesData.filter(
      (solicitud) =>
        moment(solicitud.fecha_solicitada).format("YYYY-MM-DD") ===
        formattedDate
    );

    // Ordenar por turno_solicitado: Matutino, Vespertino, Nocturno
    const orderedAppointments = filteredAppointments.sort((a, b) => {
      const turnosOrder = {
        Matutino: 1,
        Vespertino: 2,
        Nocturno: 3,
      };

      return turnosOrder[a.turno_solicitado] - turnosOrder[b.turno_solicitado];
    });

    // Crear la hoja de cálculo a partir de los datos ordenados
    const worksheet = XLSX.utils.json_to_sheet(orderedAppointments);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Solicitudes preprogramadas");

    // Generar el archivo Excel y guardarlo con FileSaver
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Nombre del archivo con la fecha seleccionada
    const fileName = `Solicitudes_${formattedDate}.xlsx`;
    saveAs(data, fileName);
  } catch (error) {
    console.error("Error exporting data:", error);
  }
};



  // Manejo del evento de exportación
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
      
      const solicitudesResponse = await fetch(
        `${baseURL}/api/solicitudes/preprogramadas`
      );
      if (!solicitudesResponse.ok) {
        throw new Error("Network response for solicitudes was not ok");
      }
      const solicitudesData = await solicitudesResponse.json();

      // Fetch de los anestesiólogos
      const anesthesiologistsResponse = await fetch(
        `${baseURL}/api/anestesio/anestesiologos`
      );
      if (!anesthesiologistsResponse.ok) {
        throw new Error("Network response for anesthesiologists was not ok");
      }
      const anesthesiologistsData = await anesthesiologistsResponse.json();

      // Filtrar las solicitudes del día seleccionado
      const todaysRegistrations = solicitudesData.filter(
        (solicitud) =>
          moment(solicitud.fecha_solicitada).format("YYYY-MM-DD") === today
      );

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
                          appointment.hora_solicitada,
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
                        const horaA = moment(a.hora_solicitada, "HH:mm");
                        const horaB = moment(b.hora_solicitada, "HH:mm");
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
                                      appointment.hora_solicitada,
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

const orderedAppointments = useMemo(() => {
  return filteredAppointments
    .sort((a, b) => {
      // Ordenar por turno solicitado primero
      const turnoOrder = ["Matutino", "Vespertino", "Nocturno", "Especial"];
      const turnoDiff =
        turnoOrder.indexOf(a.turno_solicitado) - turnoOrder.indexOf(b.turno_solicitado);
      
      if (turnoDiff !== 0) return turnoDiff;

      // Luego ordenar por sala
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
      const salaDiff = salaOrder.indexOf(a.sala_quirofano) - salaOrder.indexOf(b.sala_quirofano);
      if (salaDiff !== 0) return salaDiff;

      // Luego por fecha solicitada
      const fechaDiff = new Date(a.fecha_solicitada) - new Date(b.fecha_solicitada);
      if (fechaDiff !== 0) return fechaDiff;

      // Finalmente por hora solicitada
      return a.hora_solicitada.localeCompare(b.hora_solicitada);
    });
}, [filteredAppointments]);
const events = pendingAppointments.map((app) => {
  // Calcula la hora de finalización añadiendo la duración estimada a la hora de solicitud
  const startDateTime = new Date(app.fecha_solicitada + "T" + app.hora_solicitada);
  const endDateTime = new Date(startDateTime.getTime() + (app.tiempo_estimado || 60) * 60000); // Usa 60 minutos por defecto si no está definido

  return {
    title: `${app.nombre_paciente} - ${app.nombre_especialidad}`,
    start: startDateTime,
    end: endDateTime,
    resource: app,
    estado: app.estado,
    sala_quirofano: app.sala_quirofano, // Asegúrate de que esta propiedad esté presente
  };
});


  const salas = [
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

  // Calcular índices de paginación

  const itemsPerPage = 9;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(
    startIndex + itemsPerPage,
    orderedAppointments.length
  );
  const paginatedAppointments = orderedAppointments.slice(startIndex, endIndex);

  const totalPages = Math.ceil(orderedAppointments.length / itemsPerPage);

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

          <div className="flex justify-between my-4">
            <div className="flex space-x-4">
              <div>
                <Link
                  to="/agenda/appointments"
                  className="bg-[#365b77] hover:bg-[#7498b6] text-white py-2 px-4 rounded inline-flex items-center"
                >
                  <span>Agenda</span>
                </Link>
              </div>
              <div>
                <Link
                  to="/agenda/todas"
                  className="bg-[#4A5568] hover:bg-[#758195] text-white py-2 px-4 rounded inline-flex items-center"
                >
                  <span>Todas las solicitudes</span>
                </Link>
              </div>
              <div>
                <Link
                  to="/agenda/Solicitudesprogramadas"
                  className="bg-[#5DB259] hover:bg-[#528E4F] text-white py-2 px-4 rounded inline-flex items-center"
                >
                  <span>Programadas</span>
                </Link>
              </div>
              <div>
                <Link
                  to="/agenda/Solicitudreaizada"
                  className="bg-[#63B3ED] hover:bg-[#63B3ED] text-white py-2 px-4 rounded inline-flex items-center"
                >
                  <span>Realizadas</span>
                </Link>
              </div>
              <div>
                <Link
                  to="/agenda/Solicitudsuspendida"
                  className="bg-[#D87D09] hover:bg-[#BF6E07] text-white py-2 px-4 rounded inline-flex items-center"
                >
                  <span>Suspendidas</span>
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
                    Imprimir Pre-programadas
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
                  Si
                </span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex items-center px-4 py-2 mr-2 rounded-md ${
                      viewMode === "list"
                        ? "bg-[#365b77] text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    <FaTable size={24} />
                  </button>
                  <button
                    onClick={() => setViewMode("cards")}
                    className={`flex items-center px-4 py-2 mr-2 rounded-md ${
                      viewMode === "cards"
                        ? "bg-[#365b77] text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    <FaThLarge size={24} />
                  </button>
                  <button
                    onClick={() => setViewMode("agenda")}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      viewMode === "calendar"
                        ? "bg-[#365b77] text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    <FaInfoCircle size={24} />
                  </button>
                </div>
              </div>
              <>
    {viewMode === "calendar" && (
      <div className="bg-white p-4 shadow-md rounded-lg">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 800, marginBottom: 60 }}
          onSelectEvent={handleEventClick}
          onView={handleViewChange} // Intercepta el cambio de vista
          messages={messages}
        />

        {open && selectedAppointment && (
          <AddAppointmentModalPending
            datas={pendingAppointments}
            isOpen={open}
            closeModal={handleModal}
            onDeleteAppointment={handleDeleteAppointment}
            appointmentId={selectedAppointment.id_solicitud}
          />
        )}
      </div>
    )}

{viewMode === "agenda" && (
  <div className="bg-white p-4 shadow-md rounded-lg">
    <OperatingRoomSchedulePrepro
      date={selectedDate} // Asegúrate de definir 'selectedDate' como el día seleccionado
      events={events} // Pasar los eventos/solicitudes al componente de horarios de quirófano
      onEventClick={handleEventClick} // La función para manejar clics en eventos
      onPreviousDay={handlePreviousDay} // Asegúrate de definir estas funciones si las usas
      onNextDay={handleNextDay}
    />
  </div>
)}
  </>
              {viewMode === "list" && (
                <>
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
                              onClick={() => handleSort("id_solicitud")}
                            >
                              ID{" "}
                              <span>
                                {sortBy === "id_solicitud"
                                  ? sortOrder === "asc"
                                    ? "▲"
                                    : "▼"
                                  : ""}
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
                              onClick={() => handleSort("hora_solicitada")}
                            >
                              Hora solicitada{" "}
                              <span>
                                {sortBy === "hora_solicitada" &&
                                  (sortOrder === "asc" ? "▲" : "▼")}
                              </span>
                            </th>
                            <th
                              className="px-4 py-2 cursor-pointer"
                              onClick={() => handleSort("turno_solicitado")}
                            >
                              Turno solic.{" "}
                              <span>
                                {sortBy === "turno_solicitado"
                                  ? sortOrder === "asc"
                                    ? "▲"
                                    : "▼"
                                  : ""}
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
                              Fecha solicitada{" "}
                              <span>
                                {sortBy === "fecha_solicitada" &&
                                  (sortOrder === "asc" ? "▲" : "▼")}
                              </span>
                            </th>
                            <th
                              className="px-4 py-3 cursor-pointer"
                              onClick={() => handleSort("nombre_cirujano")}
                            >
                              Cirujano responsable{" "}
                              <span>
                                {sortBy === "nombre_cirujano" &&
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
                            <th
                              className="px-4 py-3 cursor-pointer"
                              onClick={() => handleSort("duplicada")}
                            >
                              Duplicada{" "}
                              <span>
                                {sortBy === "duplicada" &&
                                  (sortOrder === "asc" ? "▲" : "▼")}
                              </span>
                            </th>
                            <th className="px-4 py-3">Acciones</th>
                          </tr>
                        </thead>

                        <tbody>
                          {paginatedAppointments.map((appointment) => (
                            <tr
                              key={appointment.id}
                              className="bg-blue-50 hover:bg-blue-300"
                            >
                              <td className="border px-4 py-2">
                                {appointment.id_solicitud}
                              </td>
                              <td className="border px-4 py-2">
                                {appointment.sala_quirofano}
                              </td>
                              <td className="border px-4 py-2">
                                {appointment.hora_solicitada}
                              </td>
                              <td className="border px-4 py-2 text-center align-middle">
                                {appointment.turno_solicitado.charAt(0)}
                              </td>
                              <td className="border px-4 py-2">
                                {[
                                  appointment.ap_paterno,
                                  appointment.ap_materno,
                                  appointment.nombre_paciente,
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                              </td>
                              <td className="border px-4 py-2">
                                {appointment.nombre_especialidad}
                              </td>
                              <td className="border px-4 py-2">
                                {formatFechaSolicitada(
                                  appointment.fecha_solicitada
                                )}
                              </td>
                              <td className="border px-4 py-2">
                                {appointment.nombre_cirujano}
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
                              <td className="border px-4 py-2">
                                <div
                                  style={{
                                    ...getEstadoColorStyle(
                                      isDuplicated(appointment)
                                        ? "duplicada"
                                        : "no"
                                    ),
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    height: "80%",
                                    width: "80%",
                                    textAlign: "center",
                                    borderRadius: "8px",
                                  }}
                                >
                                  {isDuplicated(appointment) ? "SI" : "NO"}
                                </div>
                              </td>
                              <td className="border px-4 py-2">
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
                </>
              )}
              {viewMode === "cards" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {paginatedAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="relative p-4 border border-gray-200 rounded-lg shadow-md transition-transform transform hover:scale-105 hover:shadow-xl"
                      style={{ borderRadius: "10px" }}
                      onClick={() => handleViewModal(appointment)}
                    >
                      <div className="flex flex-col h-full">
                        <div
                          className="absolute top-0 left-0 h-full"
                          style={{
                            width: "10px",
                            borderTopLeftRadius: "10px",
                            borderBottomLeftRadius: "10px",
                            ...getEstadoColorStyle(
                              appointment.estado_solicitud
                            ),
                          }}
                        ></div>
                        <div className="mb-2 pl-3">
                          <div className="flex justify-between">
                            <p className="text-lg font-semibold">
                              {[
                                appointment.nombre_paciente,
                                appointment.ap_paterno,
                                appointment.ap_materno,
                              ]
                                .filter(Boolean)
                                .join(" ")}
                            </p>
                            <p className="text-sm">
                              {appointment.sala_quirofano}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600">
                            Folio: {appointment.folio}
                          </p>
                          <p className="text-sm text-gray-600">
                            Especialidad: {appointment.nombre_especialidad}
                          </p>
                          <p className="text-sm text-gray-600">
                            Hora solicitada: {appointment.hora_solicitada}
                          </p>
                          <p className="text-sm text-gray-600">
                            Fecha solicitada:{" "}
                            {formatFechaSolicitada(
                              appointment.fecha_solicitada
                            )}
                          </p>
                          <p className="text-sm text-gray-600">
                            Estatus:{" "}
                            <span
                              className={`inline-block px-1 py-1 rounded-lg ${getEstadoColor(
                                appointment.estado_solicitud
                              )}`}
                              style={{
                                ...getEstadoColorStyle(
                                  appointment.estado_solicitud
                                ),
                              }}
                            >
                              {appointment.estado_solicitud}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Duplicada: {isDuplicated(appointment) ? "SI" : "NO"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

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
              disabled={page === totalPages}
              className={`${
                page === totalPages
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
