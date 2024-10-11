import React, { useState, useEffect, useMemo, useContext } from "react";
import Layout from "../../Layout";
import moment from "moment";
import axios from "axios";
import { Link } from "react-router-dom";
import AddAppointmentModal from "../../components/Modals/AddApointmentModal";
import { AuthContext } from "../../AuthContext";
import { FaTable, FaThLarge } from "react-icons/fa"; // Asegúrate de tener esta biblioteca instalada

function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(6);
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

  const [filterState, setFilterState] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [view, setView] = useState("table"); // State to toggle view
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { user } = useContext(AuthContext);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";

    // Extrae la especialidad del usuario
  const userSpecialty = user?.especialidad || "";

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
        
        // Filtra las solicitudes según la especialidad del usuario
        const filteredData = data
          .filter((solicitud) => {
            return solicitud.estado_solicitud !== "Eliminada" && 
                   (userSpecialty === "" || 
                    solicitud.nombre_especialidad === userSpecialty);
          })
          .sort((a, b) => b.id_solicitud - a.id_solicitud); // Ordenar por id_solicitud de mayor a menor
        
        setSolicitudes(filteredData);
      } catch (error) {
        console.error("Error fetching solicitudes:", error);
      }
    };

    fetchSolicitudes();
  }, [userSpecialty]);
  

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

  const formatFechaSolicitada = (fecha) => {
    if (!fecha) return "";
    const [year, month, day] = fecha.split("-");
    return `${day}-${month}-${year}`;
  };

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

      const totalSolicitudes = todaysRegistrations.length;

      const printableContent = `
      <html>
        <head>
          <style>
            body {
              background-color: #ffffff;
              font-family: Arial, sans-serif;
              font-size: 9px !important;
              margin: 5px;
              padding: 5px;
            }
            .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            .header img {
              max-width: 120px;
              height: auto;
              margin-right: 5px;
            }
            .header .date {
              font-size: 9px !important;
              text-align: left;
              margin-right: 5px;
            }
            .header h1 {
              font-size: 9px !important;
              margin: 5px;
              flex-grow: 2;
              text-align: right;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 5px;
              font-size: 8px !important;
            }
            th, td {
              border: 1px solid black;
              padding: 2px !important; /* Reduce padding */
              text-align: left;
              white-space: nowrap;
            }
            .turno-section {
              background-color: #d3d3d3;
              text-align: left;
              font-weight: bold;
              font-size: 8px; /* Reduce font size */
              padding: 3px !important; /* Reduce padding */
              border-top: 1px solid black;
              border-bottom: 1px solid black;
            }
            .total-count {
              font-weight: bold;
              text-align: left;
              font-size: 7px;
            }
          </style>
        </head>
        <body>
          <div class="header" style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 5px;
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
                font-size: 0.9em;
                line-height: 1;
              ">Hoja de impresión PRELIMINAR:</h1>
              <div class="date" style="
                margin-left: 7px;
                font-size: 0.9em;
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
                <th>Diagnóstico</th>
                <th>Especialidad</th>
                <th>Procedencia</th>
                <th>Tiempo est.</th>
                <th>Cirujano</th>
                <th>Insumos</th>
                <th>Proc. prev</th>
              </tr>
            </thead>
            <tbody>
  ${["Matutino", "Vespertino", "Nocturno"]
    .map((turno) => {
      // Filtrar y ordenar las solicitudes por sala y hora
      const sortedRegistrations = todaysRegistrations
        .filter((appointment) => {
          const hour = moment(appointment.hora_solicitada, "HH:mm").hour();
          if (turno === "Matutino") return hour >= 8 && hour <= 14;
          if (turno === "Vespertino") return hour >= 14 && hour <= 20;
          return hour >= 20 || hour < 8;
        })
        .sort((a, b) => {
          // Ordenar primero por sala y luego por hora
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
          if (salaA !== salaB) return salaA - salaB;
          return moment(a.hora_solicitada, "HH:mm").diff(
            moment(b.hora_solicitada, "HH:mm")
          );
        });

      // Generar el HTML para las solicitudes ordenadas
      return `
        <tr class="turno-section">
          <td colspan="13">${turno} (de ${
        turno === "Matutino"
          ? "08:00 a 15:00"
          : turno === "Vespertino"
          ? "15:00 a 21:00"
          : "21:00 a 06:00"
      })</td>
        </tr>
        ${sortedRegistrations
          .map(
            (appointment, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${appointment.folio || ""}</td>
                <td>${moment(appointment.hora_solicitada, "HH:mm").format(
                  "LT"
                )}</td>
                <td>Sala: ${appointment.sala_quirofano || ""}</td>
                <td>${appointment.ap_paterno} ${
              appointment.ap_materno
            } ${appointment.nombre_paciente}</td>
                <td>${
                  appointment.sexo
                    ? appointment.sexo === "Femenino"
                      ? "F"
                      : "M"
                    : "No especificado"
                }</td>
                <td>
                  ${(() => {
                    const procedimientos =
                      appointment.diagnostico || "";
                    const [beforeDash, afterDash] = procedimientos.split(
                      "-",
                      2
                    );
                    const truncatedBeforeDash = beforeDash.slice(0, 45);
                    return `${truncatedBeforeDash}${
                      afterDash ? "-" + afterDash : ""
                    }`;
                  })()}
                </td>
                <td>${appointment.nombre_especialidad || "N/A"}</td>
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
                <td>
                  ${appointment.nombre_cirujano || ""}
                </td>
                <td>${appointment.req_insumo || ""}</td>
                <th>${appointment.procedimientos_extra || ""}</td>
              </tr>
            `
          )
          .join("")}
      `;
    })
    .join("")}
  <tr>
    <td class="total-count">${totalSolicitudes}</td>
    <td colspan="12"></td>
  </tr>
</tbody>

          </table>
      
          <table>
            <thead>
              <tr>
                <th>Recuperación Matutino</th>
                <th>Consulta Externa Piso 1 Mat</th>
                <th>Consulta Externa Piso 2 Mat</th>
                <th>Recuperación Vespertino</th>
                <th>Consulta Externa Piso 1 Vesp</th>
                <th>Consulta Externa Piso 2 Vesp</th>
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
                            anesthesiologist.sala_anestesio === room
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
      const printWindow = window.open("", "");
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
      <div
        data-aos="fade-right"
        data-aos-duration="1000"
        data-aos-delay="100"
        data-aos-offset="200"
      >
        <div
          data-aos="fade-right"
          data-aos-duration="1000"
          data-aos-delay="100"
          data-aos-offset="200"
        >
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

            <div className="flex flex-col space-y-1">
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
                        <option value="nombre_especialidad">
                          Especialidad
                        </option>
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
                        Todas las solicitudes ({totalSolicitudes})
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

                  <div className="flex items-center justify-center mt-4 mb-2">
                    <p className="text-lg font-semibold">
                      Lista de Solicitudes
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <div className="flex flex-col space-y-4">
                    
                    <div className="flex justify-between">
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
                                onClick={() =>
                                  handleSort("nombre_especialidad")
                                }
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
                                        {[
                                          solicitud.ap_paterno,
                                          solicitud.ap_materno,
                                          solicitud.nombre_paciente
                                        ].filter(Boolean).join(' ')}
                                      </td>
                                    <td className="border px-4 py-2 text-center">
                                      {solicitud.nombre_especialidad}
                                    </td>
                                    <td className="border px-4 py-2 text-center">
                                      {solicitud.estado_solicitud === 'Urgencia'
                                      ? formatFechaSolicitada(solicitud.fecha_programada)
                                      : formatFechaSolicitada(solicitud.fecha_solicitada)}
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
                                        onClick={() =>
                                          handleViewModal(solicitud)
                                        }
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
      </div>
    </Layout>
  );
}

export default Solicitudes;
