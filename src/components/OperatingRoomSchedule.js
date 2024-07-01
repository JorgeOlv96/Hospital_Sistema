import React from 'react';
import moment from 'moment';
import './OperatingRoomSchedule.css';

const OperatingRooms = ['A1', 'A2', 'T1', 'T2', '1', '2', '3', '4', '5', '6', 'E', 'H', 'RX'];

const OperatingRoomSchedule = ({ date, appointments }) => {
  // Filtrar las citas para la fecha seleccionada
  const filteredAppointments = appointments.filter(app =>
    moment(app.start).isSame(date, 'day')
  );

  // Genera las filas y columnas para la tabla de horarios de quirófano
  const generateSchedule = () => {
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

    return hours.map(hour => (
      <div key={hour} className="schedule-row">
        <div className="schedule-time">{hour}</div>
        {OperatingRooms.map(room => {
          const appointment = filteredAppointments.find(app => 
            app.operatingRoom === room && 
            moment(app.start).format('HH:mm') === hour
          );
          if (appointment) {
            const durationInHours = moment(appointment.end).diff(appointment.start, 'hours');
            return (
              <div key={room} className="schedule-slot occupied" style={{ height: `${durationInHours * 100}%` }}>
                <div className="appointment-info">
                  <p>{appointment.title}</p>
                  <p>{moment(appointment.start).format('HH:mm')} - {moment(appointment.end).format('HH:mm')}</p>
                </div>
              </div>
            );
          }
          return <div key={room} className="schedule-slot"></div>;
        })}
      </div>
    ));
  };

  return (
    <div className="operating-room-schedule">
      <div className="schedule-header">
        <div className="schedule-time">Hora</div>
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

export default OperatingRoomSchedule;
