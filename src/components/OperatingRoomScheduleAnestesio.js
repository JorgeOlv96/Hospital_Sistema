import React from 'react';
import moment from 'moment';
import './OperatingRoomScheduleAnestesio.css';

const OperatingRooms = ['A1', 'A2', 'T1', 'T2', '1', '2', '3', '4', '5', '6', 'E', 'H', 'RX'];

const OperatingRoomScheduleAnestesio = ({ date, anesthesiologists, onEventClick }) => {
  // Filtrar los anestesiólogos para la fecha seleccionada
  const filteredAnesthesiologists = anesthesiologists.filter(anesthesiologist =>
    moment(anesthesiologist.start).isSame(date, 'day') || moment(anesthesiologist.end).isSame(date, 'day')
  );

  // Generar las filas y columnas para la tabla de horarios de quirófano
  const generateSchedule = () => {
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hour = (i + 7) % 24;
      return `${String(hour).padStart(2, '0')}:00`;
    });

    const schedule = OperatingRooms.map(room => {
      const roomAnesthesiologists = filteredAnesthesiologists.filter(anes =>
        anes.operatingRoom === room
      );

      const cells = hours.map((hour, index) => {
        const startOfHour = moment(date).startOf('day').add(index + 7, 'hours');
        const endOfHour = moment(startOfHour).add(1, 'hour');

        const overlappingAnesthesiologists = roomAnesthesiologists.filter(anes =>
          moment(anes.hora_inicio).isBefore(endOfHour) && moment(anes.hora_fin).isAfter(startOfHour)
        );

        if (overlappingAnesthesiologists.length > 0) {
          return (
            <div key={hour} className="schedule-slot occupied">
              {overlappingAnesthesiologists.map((anesthesiologist, idx) => {
                const startMinute = moment(anesthesiologist.hora_inicio).diff(startOfHour, 'minutes');
                const durationInMinutes = moment(anesthesiologist.hora_fin).diff(anesthesiologist.hora_inicio, 'minutes');

                return (
                  <div
                    key={idx}
                    className="anesthesiologist-block"
                    style={{
                      top: `${(startMinute / 60) * 100}%`,
                      height: `${(durationInMinutes / 60) * 100}%`,
                    }}
                    onClick={() => onEventClick(anesthesiologist)}
                  >
                    <div className="anesthesiologist-info">
                      <p>{anesthesiologist.title}</p>
                      <p>{moment(anesthesiologist.hora_inicio).format('HH:mm')} - {moment(anesthesiologist.hora_fin).format('HH:mm')}</p>
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
        <div className="schedule-time">{hour}</div>
        {schedule.map((cells, roomIndex) => (
          <div key={OperatingRooms[roomIndex]} className="schedule-cell">
            {cells[index]}
          </div>
        ))}
      </div>
    ));
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

export default OperatingRoomScheduleAnestesio;
