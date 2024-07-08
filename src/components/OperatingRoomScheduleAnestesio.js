import React from 'react';
import moment from 'moment';
import './OperatingRoomSchedule.css';

const OperatingRooms = ['A1', 'A2', 'T1', 'T2', '1', '2', '3', '4', '5', '6', 'E', 'H', 'RX'];

const OperatingRoomScheduleAnestesio = ({ date, anesthesiologists, onEventClick }) => {
  // Filtrar los anestesiólogos para la fecha seleccionada
  const filteredAnesthesiologists = anesthesiologists.filter(anes =>
    moment(anes.start).isSame(date, 'day')
  );

  // Genera las filas y columnas para la tabla de horarios de quirófano
  const generateSchedule = () => {
    const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

    const schedule = OperatingRooms.map(room => {
      const roomAnesthesiologists = filteredAnesthesiologists.filter(anes => anes.operatingRoom === room);

      const cells = hours.map((hour, index) => {
        const startOfHour = moment(date).startOf('day').add(index, 'hours');
        const endOfHour = moment(startOfHour).add(1, 'hour');

        const overlappingAnesthesiologists = roomAnesthesiologists.filter(anes =>
          moment(anes.start).isBefore(endOfHour) && moment(anes.end).isAfter(startOfHour)
        );

        if (overlappingAnesthesiologists.length > 0) {
          return (
            <div key={hour} className="schedule-slot occupied">
              {overlappingAnesthesiologists.map((anesthesiologist, idx) => {
                let startDateTime, endDateTime;
                switch (anesthesiologist.turno) {
                  case 'Matutino':
                    startDateTime = moment(`${anesthesiologist.dia_anestesio}T07:00`).toDate();
                    endDateTime = moment(startDateTime).add(7, 'hours').toDate();
                    break;
                  case 'Vespertino':
                    startDateTime = moment(`${anesthesiologist.dia_anestesio}T14:01`).toDate();
                    endDateTime = moment(startDateTime).add(6, 'hours').toDate();
                    break;
                  case 'Nocturno':
                    startDateTime = moment(`${anesthesiologist.dia_anestesio}T20:01`).toDate();
                    endDateTime = moment(startDateTime).add(10, 'hours').toDate();
                    break;
                  default:
                    startDateTime = moment(anesthesiologist.start).toDate();
                    endDateTime = moment(anesthesiologist.end).toDate();
                    break;
                }

                const durationInHours = moment(endDateTime).diff(startDateTime, 'hours', true);

                return (
                  <div
                    key={idx}
                    className="appointment-block"
                    style={{
                      top: `${(moment(startDateTime).hour() - index) * 100}%`,
                      height: `${durationInHours * 100}%`,
                    }}
                    onClick={() => onEventClick(anesthesiologist)}
                  >
                    <div className="appointment-info">
                      <p>{anesthesiologist.title}</p>
                      <p>{moment(startDateTime).format('HH:mm')} - {moment(endDateTime).format('HH:mm')}</p>
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

  console.log('Fecha seleccionada:', date);
  console.log('Anestesiólogos recibidos:', anesthesiologists);
  console.log('Anestesiólogos filtrados:', filteredAnesthesiologists);

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
