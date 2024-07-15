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

const CustomToolbar = ({ date, view, onView, onNavigate }) => {
  const goToBack = () => {
    const newDate = moment(date)
      .subtract(1, view === "week" ? "week" : "day")
      .toDate();
    onNavigate(newDate);
  };

  const goToNext = () => {
    const newDate = moment(date)
      .add(1, view === "week" ? "week" : "day")
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
      <h1 className="text-xl font-semibold">Agenda de Anestesiólogos</h1>
      <div className="my-4">
        <Link
          to="/anestesio/Programaranestesiologo"
          className="btn btn-sm btn-secondary p-2 bg-[#365b77] hover:bg-[#7498b6] text-white rounded-lg"
        >
          Asignar Anestesiólogo
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-12 gap-4">
        <div className="md:col-span-1 flex sm:justify-start justify-center items-center">
          <button
            onClick={goToCurrent}
            className="px-6 py-2 border border-subMain rounded-md text-subMain"
          >
            Solo hoy
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

        <div className="md:col-span-3 grid grid-cols-3 rounded-md border border-subMain">
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

function Anesthesiologos() {
  const localizer = momentLocalizer(moment);
  const [openModal, setOpenModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState({});
  const [anesthesiologists, setAnesthesiologists] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState("operatingRooms");

  const fetchAnesthesiologists = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/anestesio/anestesiologos"
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();

      const transformedData = data.map((anesthesiologist) => {
        const startDateTime = moment(
          `${anesthesiologist.dia_anestesio}T${anesthesiologist.hora_inicio}`,
          "YYYY-MM-DDTHH:mm"
        ).toDate();

        const endDateTime = moment(
          `${anesthesiologist.dia_anestesio}T${anesthesiologist.hora_fin}`,
          "YYYY-MM-DDTHH:mm"
        ).toDate();

        return {
          id: anesthesiologist.id,
          start: startDateTime,
          end: endDateTime,
          title: anesthesiologist.nombre,
          turno: anesthesiologist.turno_anestesio,
          operatingRoom: anesthesiologist.sala_anestesio,
        };
      });

      setAnesthesiologists(transformedData);
      console.log("Anesthesiologists fetched and transformed:", transformedData);
    } catch (error) {
      console.error("Error fetching anesthesiologists:", error);
    }
  };

  useEffect(() => {
    fetchAnesthesiologists();
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
      <AddAppointmentModalProgramado
        closeModal={handleCloseModal}
        isOpen={openModal}
        appointmentId={selectedEvent.id}
        onSuspendAppointment={(appointmentId) => {
          fetchAnesthesiologists();
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
      />
      {view === "operatingRooms" ? (
        <OperatingRoomSchedule
          date={selectedDate}
          appointments={anesthesiologists}
          onEventClick={handleEventClick}
        />
      ) : (
        <Calendar
          localizer={localizer}
          events={anesthesiologists}
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

export default Anesthesiologos;
