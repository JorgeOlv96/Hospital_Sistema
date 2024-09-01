import React from 'react';
import moment from 'moment';
import './OperatingRoomSchedule.css';

const OperatingRooms = [
  'A1', 
  'A2', 
  'T1', 
  'T2', 
  '1', 
  '2', 
  '3', 
  '4', 
  '5', 
  '6', 
  'E', 
  'H', 
  'RX'
];

const OperatingRoomSchedulePrepro = ({ date, events, onEventClick }) => {
  // Agrega un console.log para verificar los datos recibidos
  console.log("Eventos recibidos:", events);

  // Filtrar eventos por la fecha seleccionada
  const filteredAppointments = events.filter(app =>
    moment(app.start).isSame(date, 'day') || moment(app.end).isSame(date, 'day')
  );

  // Agrega un console.log para verificar los eventos filtrados
  console.log("Eventos filtrados para la fecha seleccionada:", filteredAppointments);

  const getAppointmentClass = (folio) => {
    if (folio && (folio.endsWith('R1') || folio.endsWith('R2') || folio.endsWith('R3') || folio.endsWith('R4') || folio.endsWith('R5'))) {
      return 'reprogrammed';
    }
    if (folio && folio.endsWith('S')) {
      return 'suspended';
    }
    return '';
  };

  const generateSchedule = () => {
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hour = (i + 7) % 24;
      return `${String(hour).padStart(2, '0')}:00`;
    });

    // Genera el horario para cada sala
    const schedule = OperatingRooms.map(room => {
      const roomAppointments = filteredAppointments.filter(app => app.sala_quirofano === room);

      // Agrega un console.log para verificar los eventos en cada sala
      console.log(`Eventos para la sala ${room}:`, roomAppointments);

      const cells = hours.map((hour, index) => {
        const startOfHour = moment(date).startOf('day').add(index + 7, 'hours');
        const endOfHour = moment(startOfHour).add(1, 'hour');

        const overlappingAppointments = roomAppointments.filter(app =>
          moment(app.start).isBefore(endOfHour) && moment(app.end).isAfter(startOfHour)
        );

        // Agrega un console.log para verificar eventos que se superponen en cada hora
        if (overlappingAppointments.length > 0) {
          console.log(`Eventos que se superponen en ${hour}:`, overlappingAppointments);

          return (
            <div key={hour} className="schedule-slot occupied">
              {overlappingAppointments.map((appointment, idx) => {
                const startMinute = moment(appointment.start).diff(startOfHour, 'minutes');
                const durationInMinutes = moment(appointment.end).diff(appointment.start, 'minutes');
                const appointmentClass = getAppointmentClass(appointment.folio);

                return (
                  <div
                    key={idx}
                    className={`appointment-block ${appointmentClass}`}
                    style={{
                      top: `${(startMinute / 60) * 100}%`,
                      height: `${(durationInMinutes / 60) * 100}%`,
                    }}
                    onClick={() => onEventClick(appointment)}
                  >
                    <div className="appointment-info">
                      <p>{appointment.title}</p>
                      <p>{moment(appointment.start).format('HH:mm')} - {moment(appointment.end).format('HH:mm')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }

        return <div key={hour} className="schedule-slot"></div>;
      });

      return cells;
    });

    return hours.map((hour, index) => (
      <div key={hour} className="schedule-row">
        <div className="schedule-time" style={{ backgroundColor: getBackgroundColor(hour) }}>{hour}</div>
        {schedule.map((cells, roomIndex) => (
          <div key={OperatingRooms[roomIndex]} className="schedule-cell">
            {cells[index]}
          </div>
        ))}
      </div>
    ));
  };

  const getBackgroundColor = (hour) => {
    const hourNum = parseInt(hour.split(':')[0]);
    if (hourNum >= 7 && hourNum < 15) return 'rgba(129, 164, 255, 0.43)';
    if (hourNum >= 15 && hourNum < 21) return 'rgba(109, 255, 19, 0.43)';
    if (hourNum >= 21 || hourNum < 7) return 'rgba(255, 169, 89, 0.43)';
    return 'transparent';
  };

  return (
    <div className="operating-room-schedule">
      <div className="schedule-header">
        <div className="schedule-time-header">Hora</div>
        {OperatingRooms.map(room => (
          <div key={room} className="schedule-room">{`Sala ${room}`}</div>
        ))}
      </div>
      <div className="schedule-body">
        {generateSchedule()}
      </div>
    </div>
  );
};

export default OperatingRoomSchedulePrepro;
