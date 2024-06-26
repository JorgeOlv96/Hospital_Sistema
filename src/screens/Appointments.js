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
import AddAppointmentModalPending from "../components/Modals/AddApointmentModalPending";
import { Link, useNavigate } from "react-router-dom";

moment.locale("es"); // Configura moment para usar el idioma español

// custom toolbar
const CustomToolbar = (toolbar) => {
  // today button handler
  const goToBack = () => {
    toolbar.date.setMonth(toolbar.date.getMonth() - 1);
    toolbar.onNavigate("prev");
  };

  // next button handler
  const goToNext = () => {
    toolbar.date.setMonth(toolbar.date.getMonth() + 1);
    toolbar.onNavigate("next");
  };

  // today button handler
  const goToCurrent = () => {
    toolbar.onNavigate("TODAY");
  };

  // month button handler
  const goToMonth = () => {
    toolbar.onView("month");
  };

  // week button handler
  const goToWeek = () => {
    toolbar.onView("week");
  };

  // day button handler
  const goToDay = () => {
    toolbar.onView("day");
  };

  // view button group
  const viewNamesGroup = [
    { view: "month", label: "Mes" },
    { view: "week", label: "Semana" },
    { view: "day", label: "Día" },
  ];

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

        {/* label */}
        <div className="md:col-span-6 flex items-center justify-center">
          <button onClick={goToBack} className="text-2xl text-subMain">
            <BiChevronLeft />
          </button>
          <span className="text-xl font-semibold mx-4">
            {moment(toolbar.date).format("MMMM YYYY")}
          </span>
          <button onClick={goToNext} className="text-2xl text-subMain">
            <BiChevronRight />
          </button>
        </div>
        {/* dropdown */}
        <div className="md:col-span-3 flex justify-center">
          <select className="px-4 py-2 border border-subMain rounded-md text-subMain">
            <option>Sala A1</option>
            <option>Sala A2</option>
            <option>Sala T1</option>
            <option>Sala T2</option>
            <option>Sala 1</option>
            <option>Sala 2</option>
            <option>Sala 3</option>
            <option>Sala 4</option>
            <option>Sala 5</option>
            <option>Sala 6</option>
            <option>Sala E</option>
            <option>Sala H</option>
            <option>Sala RX</option>
          </select>
        </div>
        {/* filter */}
        <div className="md:col-span-2 grid grid-cols-3 rounded-md border border-subMain">
          {viewNamesGroup.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                if (item.view === "month") goToMonth();
                else if (item.view === "week") goToWeek();
                else if (item.view === "day") goToDay();
              }}
              className={`border-l text-xl py-2 flex-colo border-subMain ${
                toolbar.view === item.view
                  ? "bg-subMain text-white"
                  : "text-subMain"
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
  const [open, setOpen] = React.useState(false);
  const [data, setData] = React.useState({});
  const [appointments, setAppointments] = useState([]);

  // handle modal close
  const handleClose = () => {
    setOpen(!open);
    setData({});
  };

  const events = [
    {
      id: 0,
      start: moment({ hours: 7 }).toDate(),
      end: moment({ hours: 9 }).toDate(),
      color: "#001B58",
      title: "John Doe",
      message: "No está seguro sobre la hora",
      service: servicesData[1],
      shareData: {
        email: true,
        sms: true,
        whatsapp: false,
      },
    },
  ];

  // onClick event handler
  const handleEventClick = (event) => {
    setData(event);
    setOpen(!open);
  };

  return (
    <Layout>
      {open && (
        <AddAppointmentModalPending
          datas={data}
          isOpen={open}
          closeModal={handleClose}
        />
      )}
      {/* calendario */}

      <Calendar
        localizer={localizer}
        events={appointments}
        startAccessor="start"
        endAccessor="end"
        style={{
          // altura del calendario
          height: 900,
          marginBottom: 50,
        }}
        onSelectEvent={handleEventClick}
        defaultDate={new Date()}
        timeslots={1}
        resizable
        step={60}
        selectable
        //
        // estilo personalizado para eventos
        eventPropGetter={(event) => {
          const style = {
            backgroundColor: "#001B58",
            borderRadius: "10px",
            color: "white",
            border: "1px",
            borderColor: "#F2FAF8",
            fontSize: "12px",
            padding: "5px 5px",
          };
          return {
            style,
          };
        }}
        // estilo personalizado para fechas
        dayPropGetter={(date) => {
          const backgroundColor = "white";
          const style = {
            backgroundColor,
          };
          return {
            style,
          };
        }}
        // eliminar vista de agenda
        views={["month", "day", "week"]}
        // toolbar={false}|
        components={{ toolbar: CustomToolbar }}
      />
    </Layout>
  );
}

export default Appointments;
