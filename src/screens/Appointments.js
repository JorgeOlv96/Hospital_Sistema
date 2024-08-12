import React, { useState, useEffect } from "react";
import Layout from "../Layout";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
import axios from "axios";
import { BiChevronLeft, BiChevronRight, BiTime } from "react-icons/bi";
import { HiOutlineViewGrid } from "react-icons/hi";
import { HiOutlineCalendarDays } from "react-icons/hi2";
import AddAppointmentModalProgramado from "../components/Modals/AddApointmentModalProgramado";
import { Link } from "react-router-dom";
import OperatingRoomSchedule from "../components/OperatingRoomSchedule";
import { FaHospital } from "react-icons/fa";

moment.locale("es");

const baseURL = process.env.REACT_APP_APP_BACK_SSQ || 'http://localhost:4000';
const CustomToolbar = ({ date, view, onView, onNavigate, onPrint }) => {
  const goToBack = () => {
    const newDate = moment(date)
      .subtract(1, view === "month" ? "month" : "day")
      .toDate();
    onNavigate(newDate);
  };

  const goToNext = () => {
    const newDate = moment(date)
      .add(1, view === "month" ? "month" : "day")
      .toDate();
    onNavigate(newDate);
  };

  const goToCurrent = () => {
    const today = new Date();
    onNavigate(today);
  };

  const goToView = (viewType) => {
    onView(viewType);
  };

  const viewNamesGroup = [
    { view: "month", label: "Mes", icon: <HiOutlineViewGrid /> },
    { view: "week", label: "Semana", icon: <HiOutlineCalendarDays /> },
    { view: "day", label: "Día", icon: <BiTime /> },
    { view: "operatingRooms", label: "Quirófanos", icon: <FaHospital /> },
  ];

  const formatDateInputValue = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      <h1 className="text-xl font-semibold">Solicitudes</h1>
      <div className="my-4 flex items-center">
        <Link
          to="/solicitudes/Programarsolicitud"
          className="bg-[#365b77] hover:bg-[#7498b6] text-white py-2 px-4 rounded inline-flex items-center"
        >
          Programar solicitud
        </Link>

        <div className="flex ml-auto">
          <button
            onClick={onPrint}
            className="bg-[#5DB259] hover:bg-[#528E4F] text-white py-2 px-4 rounded inline-flex items-center ml-4"
          >
            Imprimir Aprobadas
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-12 gap-4">
        <div className="md:col-span-1 flex sm:justify-start justify-center items-center">
          <button
            onClick={goToCurrent}
            className="px-6 py-2 border border-subMain rounded-md text-subMain"
          >
            Hoy
          </button>
        </div>

        <div className="md:col-span-6 flex items-center justify-center">
          <button onClick={goToBack} className=" text-2xl text-subMain">
            <BiChevronLeft />
          </button>
          <span className="text-xl font-semibold mx-4">
            {moment(date).format("MMMM YYYY")}
          </span>
          <button onClick={goToNext} className="text-2xl text-subMain">
            <BiChevronRight />
          </button>
        </div>

        <div className="md:col-span-2 flex justify-center">
          <input
            type="date"
            value={formatDateInputValue(date)}
            onChange={(e) => {
              const selectedDate = new Date(e.target.value);
              onNavigate(selectedDate);
              onView("day");
            }}
            className="px-4 py-2 border border-subMain rounded-md text-subMain"
          />
        </div>

        <div className="md:col-span-3 grid grid-cols-4 rounded-md border border-subMain">
          {viewNamesGroup.map((item, index) => (
            <button
              key={index}
              onClick={() => goToView(item.view)}
              className={`border-l text-xl py-2 flex-colo border-subMain ${
                view === item.view ? "bg-subMain text-white" : "text-subMain"
              }`}
            >
              {item.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Dentro del componente `Appointments`
function Appointments() {
  const localizer = momentLocalizer(moment);
  const [openModal, setOpenModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState("operatingRooms");

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${baseURL}/api/solicitudes/programadas`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();

      const transformedData = data.map((appointment) => {
        const startDateTime = moment(
          `${appointment.fecha_programada}T${appointment.hora_asignada}`,
          "YYYY-MM-DDTHH:mm"
        ).toDate();
        const endDateTime = moment(startDateTime)
          .add(appointment.tiempo_estimado, "minutes")
          .toDate();

        return {
          id: appointment.id_solicitud,
          start: startDateTime,
          end: endDateTime,
          title: appointment.folio,
          ap_paterno: appointment.ap_paterno,
          ap_materno: appointment.ap_materno,
          nombre_paciente: appointment.nombre_paciente,
          sexo: appointment.sexo,
          tiempo_estimado: appointment.tiempo_estimado,
          clave_esp: appointment.clave_esp,
          turno: appointment.turno,
          nombre_anestesiologo: appointment.nombre_anestesiologo,
          nombre_cirujano: appointment.nombre_cirujano,
          req_insumo: appointment.req_insumo,
          operatingRoom: appointment.sala_quirofano,
          fecha_solicitud: appointment.fecha_solicitud,
          procedimientos_paciente: appointment.procedimientos_paciente,
          Rec_Matutino: appointment.Rec_Matutino,
          Con_Ext_P1_mat: appointment.Con_Ext_P1_mat,
          Con_Ext_P2_mat: appointment.Con_Ext_P2_mat,
          Rec_Vespertino: appointment.Rec_Vespertino,
          Con_Ext_P1_vesp: appointment.Con_Ext_P1_vesp,
          Con_Ext_P2_vesp: appointment.Con_Ext_P2_vesp,
        };
      });

      setAppointments(transformedData);
      console.log("Appointments fetched and transformed:", transformedData);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setOpenModal(true);
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
    setView(newView);
  };

  // Llamada a la función de impresión
  const handlePrintClick = () => {
    printDailyAppointments();
  };

  const printDailyAppointments = async () => {
    const today = moment(selectedDate).format("YYYY-MM-DD"); // Usa la fecha seleccionada

    try {
      // Fetch de las solicitudes programadas
      const solicitudesResponse = await fetch(`${baseURL}/api/solicitudes/programadas`
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
          moment(solicitud.fecha_programada).format("YYYY-MM-DD") === today
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
              ">APROBADA:</h1>
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
                <TH>Anestesiólogo</th>
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
                      <td>${moment(appointment.hora_asignada, "HH:mm").format("LT")}</td>
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
                      <td>${moment(appointment.fecha_programada).format("DD-MM-YYYY")}</td>
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
                                const nombreanes = appointment.nombre_anestesiologo || "";
                                const words = nombreanes.split(" ");
                                const truncatedName = words.slice(0, 2).join(" ");
                                return truncatedName;
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

  return (
    <Layout>
      <AddAppointmentModalProgramado
        closeModal={handleCloseModal}
        isOpen={openModal}
        appointmentId={selectedEvent.id}
        onSuspendAppointment={(appointmentId) => {
          fetchAppointments();
        }}
      />
      <CustomToolbar
        date={selectedDate}
        view={view}
        onNavigate={(date) => {
          setSelectedDate(date);
          handleSelectDate(date);
        }}
        onView={handleViewChange}
        onPrint={printDailyAppointments}
      />
      {view === "operatingRooms" ? (
        <OperatingRoomSchedule
          date={selectedDate}
          appointments={appointments}
          onEventClick={handleEventClick}
        />
      ) : (
        <Calendar
          localizer={localizer}
          events={appointments}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 900, marginBottom: 50 }}
          onSelectEvent={handleEventClick}
          defaultDate={selectedDate}
          timeslots={1}
          resizable
          step={60}
          selectable
          date={selectedDate}
          view={view}
          onNavigate={(date) => {
            setSelectedDate(date);
            handleSelectDate(date);
          }}
          onView={handleViewChange}
          toolbar={false}
        />
      )}
    </Layout>
  );
}

export default Appointments;