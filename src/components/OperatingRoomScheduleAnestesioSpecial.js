import React from 'react';
import moment from 'moment';
import './OperatingRoomScheduleAnestesioSpecial.css';

const OperatingRoomsSpecial = [
                              'Recup_Matutino', 
                               'Con_Ext_P1_mat', 
                               'Con_Ext_P2_mat', 
                               'Rec_Vespertino', 
                               'Con_Ext_P1_vesp', 
                               'Con_Ext_P2_vesp'
                              ];
                              
                              const roomNameMapping = {
                                'Recup_Matutino': 'Recuperación Matutino',
                                'Con_Ext_P1_mat': 'Consulta Ext Piso 1',
                                'Con_Ext_P2_mat': 'Consulta Ext Piso 2',
                                'Rec_Vespertino': 'Recuperación Vespertino',
                                'Con_Ext_P1_vesp': 'Consulta Ext Piso 1 Vesp',
                                'Con_Ext_P2_vesp': 'Consulta Ext Piso 2 Vesp'
                              };
                              
const OperatingRoomScheduleAnestesioSpecial = ({ date, appointments, onEventClick }) => {
  const filteredAppointments = appointments.filter(app =>
    moment(app.start).isSame(date, 'day') || moment(app.end).isSame(date, 'day')
  );

  const getAppointmentClass = () => {
    return 'default-anesthesiologist';
  };
  

  const generateSchedule = () => {
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hour = (i + 7) % 24; // Inicia desde las 07:00 hasta las 06:00 del día siguiente
      return `${String(hour).padStart(2, '0')}:00`;
    });

    const schedule = OperatingRoomsSpecial.map(room => {
      const roomAppointments = filteredAppointments.filter(app => {
        if (Array.isArray(app.operatingRoom)) {
          return app.operatingRoom.includes(room);
        }
        return app.operatingRoom === room;
      });

      const cells = hours.map((hour, index) => {
        const hourNum = (index + 7) % 24;
        const startOfHour = moment(date).startOf('day').add(hourNum, 'hours');
        const endOfHour = moment(startOfHour).add(1, 'hour');

        const overlappingAppointments = roomAppointments.filter(app =>
          moment(app.start).isBefore(endOfHour) && moment(app.end).isAfter(startOfHour)
        );

        if (overlappingAppointments.length > 0) {
          if (hourNum >= 20 && hourNum < 24) { // Para las horas nocturnas
            return (
              <div key={hour} className="schedule-slot occupied">
                {overlappingAppointments.map((appointment, idx) => {
                  const startMinute = moment(appointment.start).diff(startOfHour, 'minutes');
                  const durationInMinutes = moment(appointment.end).diff(appointment.start, 'minutes');
                  const appointmentClass = getAppointmentClass(appointment.title);
  
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
  
          // Para los turnos matutino y vespertino
          return (
            <div key={hour} className="schedule-slot occupied">
              {overlappingAppointments.map((appointment, idx) => {
                const startMinute = moment(appointment.start).diff(startOfHour, 'minutes');
                const durationInMinutes = moment(appointment.end).diff(appointment.start, 'minutes');
                const appointmentClass = getAppointmentClass(appointment.title);

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
          <div key={OperatingRoomsSpecial[roomIndex]} className="schedule-cell">
            {cells[index]}
          </div>
        ))}
      </div>
    ));
  };

  const getBackgroundColor = (hour) => {
    const hourNum = parseInt(hour.split(':')[0]);
    if (hourNum >= 7 && hourNum < 15) return 'rgba(129, 164, 255, 0.43)'; // Turno de la mañana
    if (hourNum >= 15 && hourNum < 21) return 'rgba(109, 255, 19, 0.43)'; // Turno de la tarde
    if (hourNum >= 21 || hourNum < 7) return 'rgba(255, 169, 89, 0.43)'; // Turno de la noche
    return 'transparent';
  };

  return (
    <div className="operating-room-schedule">
      <div className="schedule-header">
      <div className="schedule-time-header">Hora</div>
        {OperatingRoomsSpecial.map(room => (
          <div key={room} className="schedule-room">{roomNameMapping[room]}</div>
        ))}
      </div>
      <div className="schedule-body">
        {generateSchedule()}
      </div>
    </div>
  );
};

export default OperatingRoomScheduleAnestesioSpecial;
