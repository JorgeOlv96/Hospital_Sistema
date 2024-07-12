import React, { useEffect, useState } from 'react';
import moment from 'moment';
import './OperatingRoomScheduleAnestesio.css';

const OperatingRooms = ['A1', 'A2', 'T1', 'T2', '1', '2', '3', '4', '5', '6', 'E', 'H', 'RX'];

const OperatingRoomScheduleAnestesio = ({ date, anesthesiologists, onEventClick }) => {
  const [filteredAnesthesiologists, setFilteredAnesthesiologists] = useState([]);

  useEffect(() => {
    const filtered = anesthesiologists.filter(anesthesiologist =>
      moment(anesthesiologist.start).isSame(date, 'day')
    );
    setFilteredAnesthesiologists(filtered);
  }, [anesthesiologists, date]);

  const generateSchedule = () => {
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hour = (i + 7) % 24;
      return `${String(hour).padStart(2, '0')}:00`;
    });

    return hours.map((hour, index) => (
      <div key={hour} className="schedule-row">
        <div className="schedule-time">{hour}</div>
        {OperatingRooms.map(room => {
          const roomAnesthesiologists = filteredAnesthesiologists.filter(anes =>
            anes.operatingRoom === room
          );

          const startOfHour = moment(date).startOf('day').add(index + 7, 'hours');
          const endOfHour = moment(startOfHour).add(1, 'hour');

          const overlappingAnesthesiologists = roomAnesthesiologists.filter(anes =>
            moment(anes.start).isBefore(endOfHour) && moment(anes.end).isAfter(startOfHour)
          );

          if (overlappingAnesthesiologists.length > 0) {
            return (
              <div key={room} className="schedule-cell">
                <div key={hour} className="schedule-slot occupied">
                  {overlappingAnesthesiologists.map((anesthesiologist, idx) => {
                    const startMinute = moment(anesthesiologist.start).diff(startOfHour, 'minutes');
                    const durationInMinutes = moment(anesthesiologist.end).diff(anesthesiologist.start, 'minutes');

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
                          <p>{moment(anesthesiologist.start).format('HH:mm')} - {moment(anesthesiologist.end).format('HH:mm')}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          return <div key={room} className="schedule-cell"><div className="schedule-slot"></div></div>;
        })}
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

// Añadir la propiedad title para cumplir con las expectativas de react-big-calendar
OperatingRoomScheduleAnestesio.title = 'Quirófanos';

export default OperatingRoomScheduleAnestesio;
