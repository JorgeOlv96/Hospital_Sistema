import React, { useState, useEffect } from "react";
import Layout from "../../Layout";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
import DatePicker from "react-datepicker";
import { es } from "date-fns/locale"; // Importa el local en español
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { BiChevronLeft, BiChevronRight, BiTime } from "react-icons/bi";
import { HiOutlineViewGrid } from "react-icons/hi";
import { HiOutlineCalendarDays } from "react-icons/hi2";
import AddAppointmentModal from "../../components/Modals/AddApointmentModal";
import { Link } from "react-router-dom";
import OperatingRoomSchedule from "../../components/OperatingRoomSchedule";
import { FaHospital } from "react-icons/fa";
import { FaCalendarAlt } from 'react-icons/fa'; // Asegúrate de instalar react-icons si aún no lo has hecho


moment.locale("es");

const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";


const CustomToolbar = ({ date, view, onView, onNavigate, onPrint, selectedDate, handleDateChange, onExport }) => {

  const [printDate, setPrintDate] = useState(new Date());

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

  const handlePrintDateChange = (e) => {
    const selectedDate = moment(e.target.value).startOf("day").toDate();
    setPrintDate(selectedDate);
  };
  return (
    <div className="flex flex-col gap-4 mb-6">
      <h1 className="text-xl font-semibold">Agenda</h1>

      <div className="grid sm:grid-cols-2 md:grid-cols-12 gap-4">
        <div className="md:col-span-1 flex sm:justify-start justify-center items-center">

        </div>

        <div className="md:col-span-6 flex items-center justify-center">
          <span className="text-xl font-semibold mx-4">
            {moment(date).format("DD MMMM YYYY")}
          </span>

        </div>

        <div className="md:col-span-2 flex items-center justify-center">
          <div className="relative">
          <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="dd-MM-yyyy"
              locale={es} // Configura el local en español
              className="px-4 py-2 border border-subMain rounded-md text-subMain w-40" // Ajusta el ancho aquí
            />
            <FaCalendarAlt
              className="absolute top-1/2 right-2 transform -translate-y-1/2 text-subMain cursor-pointer"
              size={20}
              onClick={() => document.querySelector('.react-datepicker__input-container input').focus()} // Focaliza el DatePicker al hacer clic en el ícono
            />
          </div>
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
function AppointmentsEnf() {
  const localizer = momentLocalizer(moment);
  const [openModal, setOpenModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState("operatingRooms");
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${baseURL}/api/solicitudes/programadas`);
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

          const patientFullName = `${appointment.ap_paterno} ${appointment.ap_materno} ${appointment.nombre_paciente}`;
          const isRSeries = /R[1-9]/i.test(appointment.folio);

        return {
          id: appointment.id_solicitud,
          start: startDateTime,
          end: endDateTime,
          title: patientFullName,
          folio: appointment.folio,
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
          <AddAppointmentModal
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
      onView={handleViewChange}
      onNavigate={handleViewChange}
      selectedDate={selectedDate}
      handleDateChange={handleDateChange}
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
        </div>
      </div>
    </Layout>
  );
}

export default AppointmentsEnf;
