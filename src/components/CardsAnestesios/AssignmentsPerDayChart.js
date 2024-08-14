import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registrar los componentes de Chart.js necesarios
ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const AssignmentsPerDayChart = () => {
  const [data, setData] = useState({ dates: [], counts: [] });
  const [error, setError] = useState(null);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";

  // Función para obtener el lunes de la semana actual
  const getStartOfWeek = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  // Función para generar un array con las fechas de la semana actual
  const getDatesForCurrentWeek = (startOfWeek) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/anestesio/anestesiologos`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const anesthesiologists = await response.json();

        // Obtener el lunes de la semana actual
        const today = new Date();
        const startOfWeek = getStartOfWeek(new Date(today));
        const datesOfWeek = getDatesForCurrentWeek(startOfWeek);

        // Inicializar un objeto para las asignaciones con todos los días de la semana actual
        const assignmentsPerDay = {};
        datesOfWeek.forEach(date => {
          assignmentsPerDay[date] = 0;
        });

        // Contar las asignaciones por día
        anesthesiologists.forEach(anesthesiologist => {
          const date = new Date(anesthesiologist.dia_anestesio).toISOString().split('T')[0];
          if (assignmentsPerDay.hasOwnProperty(date)) {
            assignmentsPerDay[date] += 1;
          }
        });

        setData({
          dates: datesOfWeek,
          counts: datesOfWeek.map(date => assignmentsPerDay[date]),
        });
      } catch (error) {
        setError(error.message);
        console.error('Error fetching assignments per day:', error);
      }
    };

    fetchData();
  }, [baseURL]);

  if (error) return <div>Error: {error}</div>;

  const chartData = {
    labels: data.dates,
    datasets: [
      {
        label: 'Asignaciones por Día',
        data: data.counts,
        fill: false,
        backgroundColor: '#365b77',
        borderColor: '#7498b6',
      },
    ],
  };

  return (
    <div className="bg-white rounded-xl border-[1px] border-border p-5 shadow-md card-zoom">
      <h3 className="text-lg font-medium mb-4">Asignaciones por Día</h3>
      <Line data={chartData} />
    </div>
  );
};

export default AssignmentsPerDayChart;
