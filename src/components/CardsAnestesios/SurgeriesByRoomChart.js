import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Title
);

const SurgeriesByRoomChart = () => {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";

  const rooms = ["A1", "A2", "T1", "T2", "1", "2", "3", "4", "5", "6", "E", "H", "RX"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/solicitudes/programadas`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const surgeries = await response.json();

        // Obtener la fecha actual y el inicio de la semana
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        // Inicializar el conteo de cirugías para todas las salas
        const roomCounts = rooms.reduce((acc, room) => {
          acc[room] = 0;
          return acc;
        }, {});

        // Contar las cirugías de la semana actual por sala
        surgeries.forEach(surgery => {
          const surgeryDate = new Date(surgery.fecha_programada);
          if (surgeryDate >= startOfWeek && surgeryDate <= endOfWeek) {
            if (rooms.includes(surgery.sala_quirofano)) {
              roomCounts[surgery.sala_quirofano]++;
            }
          }
        });

        // Preparar los datos para el gráfico
        const counts = rooms.map(room => roomCounts[room]);

        setChartData({
          labels: rooms,
          datasets: [{
            label: 'Cirugías Programadas',
            data: counts,
            backgroundColor: rooms.map(() => `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`),
            borderColor: 'rgba(0, 0, 0, 0.1)',
            borderWidth: 1,
          }]
        });
      } catch (error) {
        setError(error.message);
        console.error('Error fetching surgeries by room:', error);
      }
    };

    fetchData();
    // Actualizar cada 30 segundos para datos en tiempo real
    const intervalId = setInterval(fetchData, 30000);

    return () => clearInterval(intervalId);
  }, [baseURL]);

  if (error) return <div>Error: {error}</div>;
  if (!chartData) return <div>Cargando...</div>;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
      },
      title: {
        display: true,
        text: 'Cirugías Programadas por Sala esta Semana',
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw} cirugías`,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border-[1px] border-border p-5 shadow-md card-zoom" style={{ height: '350px' }}>
      <Pie data={chartData} options={chartOptions} />
    </div>
  );
};

export default SurgeriesByRoomChart;
