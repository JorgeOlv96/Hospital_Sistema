import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';

function AnesthesiologistsCalendar() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/anesthesiologists/agenda');
        setEvents(response.data); // Assume [{ date: '...', event: '...' }, ...]
      } catch (error) {
        console.error('Error fetching agenda:', error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="bg-white rounded-xl border-[1px] border-border p-5 shadow-md">
      <h2 className="text-lg font-semibold">Anesthesiologists' Agenda</h2>
      <Calendar
        // You can customize the calendar to show events here
        // For simplicity, this is a basic example
      />
    </div>
  );
}

export default AnesthesiologistsCalendar;
