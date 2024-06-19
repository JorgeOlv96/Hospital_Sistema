import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { useDrop } from 'react-dnd';
import './Appointments.css';

const localizer = momentLocalizer(moment);

const CalendarContainer = ({ events, setEvents, moveRequestToCalendar }) => {
  const [, drop] = useDrop(() => ({
    accept: 'request',
    drop: (item, monitor) => {
      const { request } = item;
      const calendarElement = document.querySelector('.rbc-calendar');
      const { start, end } = getDroppedTimeRange(monitor.getClientOffset(), calendarElement);

      moveRequestToCalendar(request, start, end);
    },
  }));

  const getDroppedTimeRange = (clientOffset, calendarElement) => {
    const calendarBounds = calendarElement.getBoundingClientRect();
    const pixelsPerMinute = calendarBounds.height / (24 * 60); // Assuming 24-hour day

    const offsetX = clientOffset.x - calendarBounds.left;
    const offsetY = clientOffset.y - calendarBounds.top;

    const minutesFromStart = Math.round(offsetY / pixelsPerMinute);
    const start = new Date();
    start.setHours(0, minutesFromStart, 0, 0);

    const end = new Date(start);
    end.setHours(start.getHours() + 1); // Default duration of 1 hour

    return { start, end };
  };

  return (
    <div className="calendar-container" ref={drop}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        selectable
        resizable
        onEventResize={(data) => {
          const { start, end } = data;

          setEvents((prevEvents) => {
            const index = prevEvents.findIndex((event) => event.start === data.event.start);
            const updatedEvent = { ...prevEvents[index], start, end };
            const updatedEvents = [...prevEvents];
            updatedEvents.splice(index, 1, updatedEvent);
            return updatedEvents;
          });
        }}
        onEventDrop={(data) => {
          const { start, end, event } = data;

          setEvents((prevEvents) => {
            const index = prevEvents.findIndex((evt) => evt.title === event.title);
            const updatedEvent = { ...prevEvents[index], start, end };
            const updatedEvents = [...prevEvents];
            updatedEvents.splice(index, 1, updatedEvent);
            return updatedEvents;
          });
        }}
        onSelectSlot={({ start, end }) => {
          const title = window.prompt('New Event name');
          if (title) {
            setEvents([...events, { start, end, title }]);
          }
        }}
        draggableAccessor={() => true}
      />
    </div>
  );
};

export default CalendarContainer;
