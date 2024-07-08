import React from 'react';
import moment from 'moment';
import './OperatingRoomSchedule.css';

const OperatingRooms = ['A1', 'A2', 'T1', 'T2', '1', '2', '3', '4', '5', '6', 'E', 'H', 'RX'];

const OperatingRoomScheduleAnestesio = ({ date, anesthesiologists, onEventClick }) => {
  const selectedDate = moment(date).format('YYYY-MM-DD');

  const filteredAnesthesiologists = anesthesiologists.filter((anesthesiologist) => {
    return moment(anesthesiologist.start).format('YYYY-MM-DD') === selectedDate;
  });

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
                const startHour = moment(anesthesiologist.start).hour();
                const endHour = moment(anesthesiologist.end).hour();              
                const durationInHours = moment(anesthesiologist.end).diff(anesthesiologist.start, 'hours', true);

                return (
                  <div
                    key={idx}
                    className="appointment-block"
                    style={{
                      top: `${(startHour - index) * 100}%`,
                      height: `${durationInHours * 100}%`,
                    }}
                    onClick={() => onEventClick(anesthesiologist)}
                  >
                    <div className="appointment-info">
                      <p>{anesthesiologist.title}</p>
                      <p>{moment(anesthesiologist.start).format('HH:mm')} - {moment(anesthesiologist.end).format('HH:mm')}</p>
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
