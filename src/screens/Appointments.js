// Appointments.js

import React, { useState } from 'react';
import Layout from '../Layout';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './Appointments.css';

const localizer = momentLocalizer(moment);

const Appointments = () => {
  const [events, setEvents] = useState([]);
  const [requests, setRequests] = useState([
    { id: 1, title: 'Solicitud 1' },
    { id: 2, title: 'Solicitud 2' },
  ]);

  const moveRequestToCalendar = (request, start, end) => {
    const newEvent = {
      title: request.title,
      start,
      end,
      id: request.id,
    };
    setEvents([...events, newEvent]);
    setRequests(requests.filter(r => r.id !== request.id));
  };

  return (
    <Layout>
      <DndProvider backend={HTML5Backend}>
        <div className="appointments-container">
          <div className="requests-list">
            <h3>Solicitudes Pendientes</h3>
            {requests.map(request => (
              <DraggableRequest key={request.id} request={request} />
            ))}
          </div>
          <CalendarContainer
            events={events}
            setEvents={setEvents}
            moveRequestToCalendar={moveRequestToCalendar}
          />
        </div>
      </DndProvider>
    </Layout>
  );
};

const DraggableRequest = ({ request }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'request',
    item: { request },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        padding: '8px',
        margin: '4px',
        backgroundColor: 'lightgrey',
        cursor: 'move',
      }}
    >
      {request.title}
    </div>
  );
};

const CalendarContainer = ({ events, setEvents, moveRequestToCalendar }) => {
  const [, drop] = useDrop(() => ({
    accept: 'request',
    drop: (item, monitor) => {
      const { request } = item;
      const calendar = document.querySelector('.rbc-calendar');
      const { start, end } = getDroppedTimeRange(monitor.getClientOffset(), calendar);

      moveRequestToCalendar(request, start, end);
    },
  }));

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

const getDroppedTimeRange = (clientOffset, calendar) => {
  const calendarBounds = calendar.getBoundingClientRect();
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Default duration of 1 hour

  if (clientOffset) {
    const calendarHeight = calendarBounds.height;
    const hoursInDay = 24;
    const pixelsPerHour = calendarHeight / hoursInDay;

    const offsetY = clientOffset.y - calendarBounds.top;
    const hour = Math.floor(offsetY / pixelsPerHour);

    startTime.setHours(hour);
    endTime.setHours(hour + 1);
  }

  return { start: startTime, end: endTime };
};

export default Appointments;
