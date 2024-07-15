import React from 'react';
import moment from 'moment';
import './OperatingRoomScheduleAnestesio.css';

const OperatingRooms = ['A1', 'A2', 'T1', 'T2', '1', '2', '3', '4', '5', '6', 'E', 'H', 'RX'];

const OperatingRoomScheduleAnestesio = ({ date, appointments, onEventClick }) => {
  // Filtrar las citas para la fecha seleccionada
  const filteredAppointments = appointments.filter(app =>
    moment(app.start).isSame(date, 'day') || moment(app.end).isSame(date, 'day')
  );

  // Genera las filas y columnas para la tabla de horarios de quirófano
  const generateSchedule = () => {
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hour = i % 12 === 0 ? 12 : i % 12;
      const period = i < 12 ? 'AM' : 'PM';
      return `${hour}:00 ${period}`;
    });

    const rows = OperatingRooms.map((room) => {
      const cells = hours.map((hour, index) => {
        const currentHour = moment(date).set({ hour: index, minute: 0, second: 0, millisecond: 0 });

        // Filtrar las citas que coinciden con la sala de operaciones actual y la hora actual
        const events = filteredAppointments.filter(app =>
          app.operatingRoom === room &&
          moment(app.start).isSameOrBefore(currentHour) &&
          moment(app.end).isAfter(currentHour)
        );

        return (
          <td key={`${room}-${index}`} className="border p-1 text-center">
            {events.map((event, eventIndex) => (
              <div
                key={`${room}-${index}-${eventIndex}`}
                className="bg-blue-500 text-white p-1 cursor-pointer"
                onClick={() => onEventClick(event)}
              >
                {event.title}
              </div>
            ))}
          </td>
        );
      });

      return (
        <tr key={room}>
          <td className="border p-1 text-center bg-gray-200">{room}</td>
          {cells}
        </tr>
      );
    });

    return (
      <tbody>
        {rows}
      </tbody>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-1 bg-gray-200">Sala de Operaciones</th>
            {Array.from({ length: 24 }, (_, i) => (
              <th key={i} className="border p-1 bg-gray-200 text-center">
                {i % 12 === 0 ? 12 : i % 12}:00 {i < 12 ? 'AM' : 'PM'}
              </th>
            ))}
          </tr>
        </thead>
        {generateSchedule()}
      </table>
    </div>
  );
};

export default OperatingRoomScheduleAnestesio;
