import React, { useState, useEffect } from "react";
import Layout from "../../Layout";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
import { saveAs } from "file-saver";
import DatePicker from "react-datepicker";
import { es } from "date-fns/locale"; // Importa el local en español
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { BiChevronLeft, BiChevronRight, BiTime } from "react-icons/bi";
import { HiOutlineViewGrid } from "react-icons/hi";
import { HiOutlineCalendarDays } from "react-icons/hi2";
import AddAppointmentModalProgramado from "../../components/Modals/AddApointmentModalProgramado";
import { Link } from "react-router-dom";
import OperatingRoomSchedule from "../../components/OperatingRoomSchedule";
import { FaHospital } from "react-icons/fa";
import * as XLSX from 'xlsx'; 
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
      <h1 className="text-xl font-semibold">Programación</h1>
      <div className="my-4 flex items-center">
        <Link
          to="/agenda/Programarsolicitud"
          className="bg-[#365b77] hover:bg-[#7498b6] text-white py-2 px-4 rounded inline-flex items-center"
        >
          Gestionar solicitudes
        </Link>

        <div className="flex ml-auto items-center">
          <label className="mr-2 font-semibold">Día a imprimir:</label>
          <input
            type="date"
            value={formatDateInputValue(printDate)}
            onChange={handlePrintDateChange}
            className="px-4 py-2 border border-main rounded-md text-main"
          />
          <button
            onClick={() => onPrint(moment(printDate).startOf("day").toDate())}
            className="bg-[#5DB259] hover:bg-[#528E4F] text-white py-2 px-4 rounded inline-flex items-center ml-4"
          >
            Imprimir Aprobadas
          </button>
          <button
            onClick={() => onExport(moment(printDate).startOf("day").toDate())}
            className="bg-[#365b77] hover:bg-[#7498b6] text-white py-2 px-4 rounded inline-flex items-center ml-4"
          >
            Exportar Datos
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
function Appointments() {
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

  // Llamada a la función de impresión
  const handlePrintClick = (printDate) => {
    printDailyAppointments(printDate);
  };

  const printDailyAppointments = async (printDate) => {
    const today = moment(printDate).format("YYYY-MM-DD");
    try {
      // Fetch de las solicitudes programadas
      const solicitudesResponse = await fetch(
        `${baseURL}/api/solicitudes/programadas`
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
      console.log("Today's Anesthesiologists for Recovery:", todaysAnesthesiologists.filter(
        (anesthesiologist) => anesthesiologist.sala_anestesio === "Recup_Matutino"
      ));

      const anesthesiologistsFilteredByDate = anesthesiologistsData.filter(
        (anesthesiologist) =>
          moment(anesthesiologist.dia_anestesio).format("YYYY-MM-DD") === today
      );
      console.log("Filtered by Date:", anesthesiologistsFilteredByDate);
      
      const anesthesiologistsFilteredByRoom = anesthesiologistsData.filter(
        (anesthesiologist) =>
          anesthesiologist.sala_anestesio === "Recup_Matutino"
      );
      console.log("Filtered by Room (Recup_Matutino):", anesthesiologistsFilteredByRoom);
      

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
              ">Hoja de impresión APROBADA:</h1>
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
                <th>Procedencia</th>
                <th>Expediente</th>
                <th>Procedimiento CIE-9</th>
                <th>Diagnostico</th>
                <th>Especialidad</th>
                <th>Tiempo est.</th>
                <th>Cirujano</th>
                <TH>Anestesiólogo</th>
                <th>Insumos</th>
              </tr>
            </thead>
<tbody>
            ${["Matutino", "Vespertino", "Nocturno"]
                .map((turno) => {
                    const sortedRegistrations = todaysRegistrations
                        .filter((appointment) => {
                            const hour = moment(appointment.hora_asignada, "HH:mm").hour();
                            if (turno === "Matutino") return hour >= 8 && hour < 14;
                            if (turno === "Vespertino") return hour >= 14 && hour < 20;
                            return hour >= 20 || hour < 8;  // Nota: Esto cubre el turno Nocturno correctamente
                        })
                        .sort((a, b) => {
                            const salaOrder = [
                                "A1", "A2", "T1", "T2", "1", "2", "3", "4", "5", "6", "E", "H", "RX"
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
                    
                    // Generar el HTML para las solicitudes ordenadas
                    return `
                        <tr class="turno-section ${turno.toLowerCase()}">
                            <td colspan="13">${turno} (de ${
                                turno === "Matutino"
                                    ? "08:00 a 15:00"
                                    : turno === "Vespertino"
                                    ? "15:00 a 21:00"
                                    : "21:00 a 08:00" 
                            })</td>
                        </tr>
                        ${sortedRegistrations
                            .map(
                                (appointment, index) => `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td>${appointment.folio || ""}</td>
                                        <td>${moment(appointment.hora_asignada, "HH:mm").format("LT")}</td>
                                        <td>Sala: ${appointment.sala_quirofano || ""}</td>
                                        <td>${appointment.ap_paterno} ${appointment.ap_materno} ${appointment.nombre_paciente}</td>
                                        <td>${appointment.edad || ""}</td>
                                        <td>${appointment.sexo ? (appointment.sexo === "Femenino" ? "F" : "M") : "No especificado"}</td>
                                                                                <td>${(() => {
                                            switch (appointment.tipo_admision) {
                                                case "CONSULTA EXTERNA": return "C.E.";
                                                case "CAMA": return `Cama - ${appointment.cama}`;
                                                case "URGENCIAS": return "Urgencias";
                                                default: return appointment.tipo_admision || "No especificado";
                                            }
                                        })()}</td>
                                         <td>${appointment.no_expediente || ""}</td>
                                        <td>${(() => {
                                            const procedimientos = appointment.procedimientos_paciente || "";
                                            const [beforeDash, afterDash] = procedimientos.split("-", 2);
                                            const truncatedBeforeDash = beforeDash.slice(0, 45);
                                            return `${truncatedBeforeDash}${afterDash ? "-" + afterDash : ""}`;
                                        })()}</td>
                                        <td>${(() => {
                                            const procedimientos = appointment.diagnostico || "";
                                            const [beforeDash, afterDash] = procedimientos.split("-", 2);
                                            const truncatedBeforeDash = beforeDash.slice(0, 45);
                                            return `${truncatedBeforeDash}${afterDash ? "-" + afterDash : ""}`;
                                        })()}</td>
                                        <td>${appointment.nombre_especialidad || ""}</td>
                                        <td>${appointment.tiempo_estimado} min</td>
                                        <td>${(() => {
                                            const nombre = appointment.nombre_cirujano || "";
                                            const words = nombre.split(" ");
                                            const truncatedName = words.slice(0, 2).join(" ");
                                            return truncatedName;
                                        })()}</td>
                                        <td>${(() => {
                                            const nombreanes = appointment.nombre_anestesiologo || "";
                                            const words = nombreanes.split(" ");
                                            const truncatedName = words.slice(0, 2).join(" ");
                                            return truncatedName;
                                        })()}</td>
                                        <td>${appointment.req_insumo || ""}</td>
                                    </tr>
                                `
                            )
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
                  "Rec_Nocturno"
                ]
                  .map(
                    (room) => `
                    <td>
${todaysAnesthesiologists
  .filter(
    (anesthesiologist) =>
      anesthesiologist.sala_anestesio.includes(room)
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
      const printWindow = window.open("", "_blank");
      printWindow.document.open();
      printWindow.document.write(printableContent);
      printWindow.document.close();
      printWindow.print();
    } catch (error) {
      console.error("Error al imprimir las solicitudes:", error);
    }
  };
  const exportToExcel = async (selectedDate) => {
    const formattedDate = moment(selectedDate).format("YYYY-MM-DD");
  
    try {
      // Fetch de las solicitudes programadas
      const solicitudesResponse = await fetch(
        `${baseURL}/api/solicitudes/programadas`
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
  
      // Reorganizar las propiedades para que 'cama' esté junto a 'tipo_intervencion'
      const reorganizedAppointments = orderedAppointments.map((solicitud) => {
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
          tipo_admision: solicitud.tipo_admision,
          cama: solicitud.cama, // Mover cama junto a tipo_intervencion
          fecha_solicitada: solicitud.fecha_solicitada,
          turno_solicitado: solicitud.turno_solicitado,
          sala_quirofano: solicitud.sala_quirofano,
          nombre_especialidad: solicitud.nombre_especialidad,
          req_insumo: solicitud.req_insumo,
          nombre_anestesiologo: solicitud.nombre_anestesiologo,
          cirujano: solicitud.nombre_cirujano,
          procedimientos_extra: solicitud.procedimientos_extra
          // Añade cualquier otro campo que desees
        };
      });
  
      // Crear la hoja de cálculo a partir de los datos ordenados y reorganizados
      const worksheet = XLSX.utils.json_to_sheet(reorganizedAppointments);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Solicitudes programadas");
  
      // Generar el archivo Excel y guardarlo con FileSaver
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const data = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
  
      // Nombre del archivo con la fecha seleccionada
      const fileName = `Programadas_${formattedDate}.xlsx`;
      saveAs(data, fileName);
    } catch (error) {
      console.error("Error exporting data:", error);
    }
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
      onView={handleViewChange}
      onNavigate={handleViewChange}
      onPrint={handlePrintClick}
      selectedDate={selectedDate}
      handleDateChange={handleDateChange}
      onExport={exportToExcel}
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

export default Appointments;
