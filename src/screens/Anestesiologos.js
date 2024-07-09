import React, { useState, useEffect } from "react";
import Layout from "../Layout";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es"; // Importa el idioma español
import { BiChevronLeft, BiChevronRight, BiTime } from "react-icons/bi";
import { HiOutlineViewGrid } from "react-icons/hi";
import { HiOutlineCalendarDays } from "react-icons/hi2";
import { Link } from "react-router-dom";
import OperatingRoomScheduleAnestesio from "../components/OperatingRoomScheduleAnestesio";
import { FaHospital } from 'react-icons/fa';

moment.locale("es"); // Configura moment para usar el idioma español

const CustomToolbar = ({ date, view, onView, onNavigate }) => {
  const goToBack = () => {
    const newDate = moment(date).subtract(1, view === "month" ? "month" : "day").toDate();
    onNavigate(newDate);
  };

  const goToNext = () => {
    const newDate = moment(date).add(1, view === "month" ? "month" : "day").toDate();
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
    { view: "operatingRooms", label: "Quirófanos", icon: <FaHospital /> },
    { view: "week", label: "Semana", icon: <HiOutlineCalendarDays /> },
    { view: "day", label: "Día", icon: <BiTime /> },
  ];

  const formatDateInputValue = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="flex flex-col gap-8 mb-8">
      <h1 className="text-xl font-semibold">Anestesiólogos</h1>
      <div className="my-4">
        <Link
          to="/anestesio/Programaranestesiologo"
          className="btn btn-sm btn-secondary p-2 bg-[#001B58] text-white rounded-lg"
        >
          Asignar Anestesiologo
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
              onNavigate(selectedDate);
              onView("day"); // Cambia a la vista de día
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

function Anestesiologos() {
  const localizer = momentLocalizer(moment);
  const [openModal, setOpenModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState({});
  const [anesthesiologists, setAnesthesiologists] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState("operatingRooms");

  const fetchAnesthesiologists = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/anestesio/anestesiologos");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      
      console.log("Fetched Data:", data); // Verifica los datos obtenidos
  
      const transformedData = data.map((anesthesiologist) => {
        let startDateTime, endDateTime;
<<<<<<< HEAD
  
        switch (anesthesiologist.turno) {
          case "Matutino":
            startDateTime = moment(`${anesthesiologist.dia_anestesio}T07:00`, "YYYY-MM-DDTHH:mm").toDate();
            endDateTime = moment(startDateTime).add(7, "hours").toDate();
            break;
          case "Vespertino":
            startDateTime = moment(`${anesthesiologist.dia_anestesio}T14:01`, "YYYY-MM-DDTHH:mm").toDate();
            endDateTime = moment(startDateTime).add(6, "hours").toDate();
            break;
          case "Nocturno":
            startDateTime = moment(`${anesthesiologist.dia_anestesio}T20:01`, "YYYY-MM-DDTHH:mm").toDate();
            endDateTime = moment(startDateTime).add(10, "hours").toDate();
            break;
          default:
=======

        switch (view) {
          case 'week':
            // Filtrar por fecha dentro de la semana
            const weekStart = moment(selectedDate).startOf('week');
            const weekEnd = moment(selectedDate).endOf('week');
            const dateAnestesio = moment(anesthesiologist.dia_anestesio);
            if (dateAnestesio.isBetween(weekStart, weekEnd, null, '[]')) {
              startDateTime = moment(`${anesthesiologist.dia_anestesio}T${anesthesiologist.hora_inicio}`, "YYYY-MM-DDTHH:mm").toDate();
              endDateTime = moment(`${anesthesiologist.dia_anestesio}T${anesthesiologist.hora_fin}`, "YYYY-MM-DDTHH:mm").toDate();
              return {
                id: anesthesiologist.id_anestesiologo,
                start: startDateTime,
                end: endDateTime,
                title: anesthesiologist.nombre,
                operatingRoom: anesthesiologist.sala_anestesio,
              };
            }
            return null; // Devolver null si no está en la semana seleccionada
          case 'day':
            // Filtrar por fecha específica
            if (moment(anesthesiologist.dia_anestesio).isSame(selectedDate, 'day')) {
              startDateTime = moment(`${anesthesiologist.dia_anestesio}T${anesthesiologist.hora_inicio}`, "YYYY-MM-DDTHH:mm").toDate();
              endDateTime = moment(`${anesthesiologist.dia_anestesio}T${anesthesiologist.hora_fin}`, "YYYY-MM-DDTHH:mm").toDate();
              return {
                id: anesthesiologist.id_anestesiologo,
                start: startDateTime,
                end: endDateTime,
                title: anesthesiologist.nombre,
                operatingRoom: anesthesiologist.sala_anestesio,
              };
            }
            return null; // Devolver null si no es el día seleccionado
          default:
            // Caso por defecto, maneja como estaba antes
>>>>>>> b0fdecac2d5ce34eb06360ad082935fd3d9b81f4
            startDateTime = moment(
              `${anesthesiologist.dia_anestesio}T${anesthesiologist.hora_anestesio}`,
              "YYYY-MM-DDTHH:mm"
            ).toDate();
            endDateTime = moment(startDateTime).add(anesthesiologist.tiempo_estimado, "minutes").toDate();
            return {
              id: anesthesiologist.id_anestesiologo,
              start: startDateTime,
              end: endDateTime,
              title: anesthesiologist.nombre,
              operatingRoom: anesthesiologist.sala_anestesio,
            };
        }
<<<<<<< HEAD
  
        return {
          id: anesthesiologist.id_anestesiologo,
          start: startDateTime,
          end: endDateTime,
          title: anesthesiologist.nombre,
          operatingRoom: anesthesiologist.sala_anestesio,
        };
      });
  
=======
      }).filter(Boolean); // Filtrar eventos nulos

>>>>>>> b0fdecac2d5ce34eb06360ad082935fd3d9b81f4
      setAnesthesiologists(transformedData);
      console.log("Transformed Data:", transformedData); // Verifica los datos transformados
    } catch (error) {
      console.error("Error fetching anesthesiologists:", error);
    }
  };
  

  useEffect(() => {
    fetchAnesthesiologists();
  }, [selectedDate, view]); // Actualizar cuando cambia la fecha seleccionada o la vista

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
      <CustomToolbar
        date={selectedDate}
        view={view}
        onNavigate={(date) => {
          setSelectedDate(date);
          handleSelectDate(date);
        }}
        onView={handleViewChange}
      />
      {view === 'operatingRooms' ? (
        <OperatingRoomScheduleAnestesio
          date={selectedDate}
          anesthesiologists={anesthesiologists}
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
        onNavigate={date => {
          setSelectedDate(date);
          handleSelectDate(date);
        }}
        onView={handleViewChange}
        toolbar={false} // Desactiva la barra de herramientas predeterminada
      />
      )}
    </Layout>
  );
}

export default Anestesiologos;
