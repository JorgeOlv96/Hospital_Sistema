import React, { useState, useEffect } from "react";
import Layout from "../Layout";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es"; // Importa el idioma español para moment
import {
  BiChevronLeft,
  BiChevronRight,
  BiPlus,
  BiTime,
  BiTable,
} from "react-icons/bi";
import { HiOutlineViewGrid } from "react-icons/hi";
import { HiOutlineCalendarDays } from "react-icons/hi2";
import AddAppointmentModalProgramado from "../components/Modals/AddApointmentModalProgramado"; // Importa el modal adecuado
import { Link, useNavigate } from "react-router-dom";

moment.locale("es"); // Configura moment para usar el idioma español

// custom toolbar
const CustomToolbar = ({ date, view, views, onNavigate, onView }) => {
  const goToBack = () => {
    const newDate = new Date(date);
    newDate.setMonth(date.getMonth() - 1);
    onNavigate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(date);
    newDate.setMonth(date.getMonth() + 1);
    onNavigate(newDate);
  };

  const goToCurrent = () => {
    const today = new Date();
    onNavigate(today);
  };

  const goToMonth = () => {
    onView("month");
  };

  const goToWeek = () => {
    onView("week");
  };

  const goToDay = (selectedDate) => {
    onView("day");
    onNavigate(selectedDate);
  };

  const viewNamesGroup = [
    { view: "month", label: "Mes" },
    { view: "week", label: "Semana" },
    { view: "day", label: "Día" },
  ];

  const formatDateInputValue = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
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
              goToDay(selectedDate);
            }}
            className="px-4 py-2 border border-subMain rounded-md text-subMain"
          />
        </div>

        <div className="md:col-span-2 grid grid-cols-3 rounded-md border border-subMain">
          {viewNamesGroup.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                if (item.view === "month") goToMonth();
                else if (item.view === "week") goToWeek();
                else if (item.view === "day") goToDay(date);
              }}
              className={`border-l text-xl py-2 flex-colo border-subMain ${
                view === item.view ? "bg-subMain text-white" : "text-subMain"
              }`}
            >
              {item.view === "month" ? (
                <HiOutlineViewGrid />
              ) : item.view === "week" ? (
                <HiOutlineCalendarDays />
              ) : (
                <BiTime />
              )}
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

  const fetchAppointments = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/solicitudes/programadas");
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
          color: "#304678",
          message: appointment.mensaje || "",
          service: appointment.servicio || "",
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

  const eventsForSelectedDate = appointments.filter((event) => {
    const eventStartDate = moment(event.start).format("YYYY-MM-DD");
    const selectedFormattedDate = moment(selectedDate).format("YYYY-MM-DD");
    return eventStartDate === selectedFormattedDate;
  });

  console.log("Events for selected date:", eventsForSelectedDate);

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
        views={["month", "day", "week"]}
        components={{
          toolbar: (props) => (
            <CustomToolbar {...props} onNavigate={(date) => handleSelectDate(date)} />
          ),
        }}
      />
    </Layout>
  );
}

export default Appointments;





