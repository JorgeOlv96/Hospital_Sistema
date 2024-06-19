import React, { useState, useEffect } from 'react';
import Layout from '../Layout';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import axios from 'axios';
import './Appointments.css';

const localizer = momentLocalizer(moment);

const Appointments = () => {
  const [events, setEvents] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    // Fetch pending requests from the backend
    axios.get('http://localhost:4000/api/solicitudes/pendientes')
      .then(response => setRequests(response.data))
      .catch(error => console.error('Error fetching requests:', error));
  }, []);

  const moveRequestToCalendar = (request, start, end) => {
    const newEvent = {
      title: request.folio, // Use folio as title
      start,
      end,
      id: request.id,
    };
    setEvents((prevEvents) => [...prevEvents, newEvent]);
    setRequests((prevRequests) => prevRequests.filter((r) => r.id !== request.id));
  };

  return (
    <Layout>
      <DndProvider backend={HTML5Backend}>
        <div className="appointments-container">
          <div className="requests-list">
            <h3>Solicitudes Pendientes</h3>
            <div className="requests-scroll">
              {requests.map(request => (
                <DraggableRequest key={request.id} request={request} />
              ))}
            </div>
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
      className="request-item"
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {request.folio}
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

    const calendarWidth = calendarBounds.width;
    const calendarDays = calendar.querySelectorAll('.rbc-day-slot');
    const pixelsPerDay = calendarWidth / calendarDays.length;
    const offsetX = clientOffset.x - calendarBounds.left;
    const dayIndex = Math.floor(offsetX / pixelsPerDay);

    if (calendarDays.length) {
      startTime.setDate(startTime.getDate() + dayIndex);
      endTime.setDate(endTime.getDate() + dayIndex);
    }
  }

  return { start: startTime, end: endTime };
};

export default Appointments;
