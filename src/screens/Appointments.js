import React, { useState, useEffect } from "react";
import Layout from "../Layout";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
import { BiChevronLeft, BiChevronRight, BiTime } from "react-icons/bi";
import { HiOutlineViewGrid } from "react-icons/hi";
import { HiOutlineCalendarDays } from "react-icons/hi2";
import AddAppointmentModalProgramado from "../components/Modals/AddApointmentModalProgramado";
import { Link } from "react-router-dom";
import OperatingRoomSchedule from "../components/OperatingRoomSchedule";
import { FaHospital } from "react-icons/fa";

moment.locale("es");

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
    <div className="flex flex-col gap-8 mb-8">
      <h1 className="text-xl font-semibold">Agenda</h1>
      <div className="my-4">
        <Link
          to="/solicitudes/Programarsolicitud"
          className="btn btn-sm btn-secondary p-2 bg-[#001B58] text-white rounded-lg"
        >
          Programar solicitud
        </Link>
        <button
          onClick={onPrint}
          className="btn btn-sm btn-secondary p-2 bg-[#001B58] text-white rounded-lg ml-4"
        >
          Imprimir solicitudes
        </button>
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
          <button onClick={goToBack} className="text-2xl text-subMain">
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

function Appointments() {
  const localizer = momentLocalizer(moment);
  const [openModal, setOpenModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState("month");

  const fetchAppointments = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/solicitudes/programadas"
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
          anestesiologo_asignado: appointment.anestesiologo_asignado,
          nombre_cirujano: appointment.nombre_cirujano,
          req_insumo: appointment.req_insumo,
          operatingRoom: appointment.sala_quirofano,
          fecha_solicitud: appointment.fecha_solicitud, // Asegúrate de que esto esté presente en los datos
          procedimientos_paciente: appointment.procedimientos_paciente,
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

  const printDailyAppointments = () => {
    const today = moment().format("YYYY-MM-DD"); // Obtén la fecha de hoy en formato 'YYYY-MM-DD'

    const todaysRegistrations = appointments.filter(
      (appointment) =>
        moment(appointment.fecha_solicitud).format("YYYY-MM-DD") === today
    );

    const printableContent = `
      <html>
  <head>
    <h1>PRELIMINAR</h1>
    <style>
      body {
        background-color: #ffffff; /* Color de fondo blanco */
        font-family: Arial, sans-serif;
        font-size: 7px; /* Tamaño de fuente reducido */
        margin: 5px; /* Márgenes alrededor del contenido */
        padding: 2px;
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 5px; /* Más espacio debajo del encabezado */
      }
      .header img {
        max-width: 150px; /* Ajusta el tamaño máximo del logo */
        height: auto;
        margin-right: 3px;
      }
      .header .date {
        font-size: 7px;
        text-align: left;
        margin-right: 3px;
      }
      .header h1 {
        font-size: 7px; /* Tamaño de fuente del título del documento */
        margin: 2px;
        flex-grow: 2;
        text-align: right;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 5px; /* Más espacio encima de la tabla */
        font-size: 12px; /* Tamaño de fuente de las celdas de la tabla */
      }
      th, td {
        border: 1px solid black;
        padding: 2px; /* Espaciado interno de las celdas */
        text-align: left;
        white-space: nowrap; /* Mantener el texto en una sola línea */
      }
      th {
        
      }
    </style>
  </head>
  <body>
    <div class="header">
    </div>
    <table>
      <thead>
        <tr>
          <th>#</th> <!-- Agregamos la columna de enumeración -->
          
          <th>Folio</th>
          <th>Hora asignada</th>
          <th>Sala</th>
          <th>Nombre completo</th>
          <th>Sexo</th>
          <th>Procedimientos</th>
          <th>Especialidad</th>
          <th>Fecha asignada</th>
          <th>Tiempo estimado</th>
          <th>Turno</th>
          <th>Anestesiólogo</th>
          <th>Cirujano</th>
          <th>Insumos</th>
       
        </tr>
      </thead>
      <tbody>
        ${todaysRegistrations
          .map(
            (appointment, index) => `
            <tr>
              <td>${index + 1}</td> <!-- Mostramos el número de solicitud -->
              <td>${appointment.title}</td>
              <td>${moment(appointment.start).format("LT")}</td> 
              <td>${appointment.operatingRoom}</td> 
              <td class="nowrap">${appointment.nombre_paciente} ${ 
              appointment.ap_paterno
            } ${appointment.ap_materno}</td> 
              <td>${appointment.sexo}</td> 
              <td>${appointment.procedimientos_paciente}</td> 
              <td>${appointment.clave_esp}.</td>
              <td>${moment(appointment.start).format("LL")}</td>
              <td>${appointment.tiempo_estimado} min</td>
              <td>${appointment.turno}</td>              
              <td>${appointment.anestesiologo_asignado}</td>
              <td>${appointment.nombre_cirujano}</td>
              <td>${appointment.req_insumo}</td>
            </tr>
          `
          )
          .join("")}
      </tbody>
    </table>
  </body>
  </html>
    `;

    const printWindow = window.open("Solicitudes");
    printWindow.document.write(printableContent);
    printWindow.document.close();
    printWindow.print();
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
          defaultDate={new Date()}
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
