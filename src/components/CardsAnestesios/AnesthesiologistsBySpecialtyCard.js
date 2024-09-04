import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AnesthesiologistsBySpecialtyCard = () => {
  const [data, setData] = useState({});
  const [error, setError] = useState(null);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";

  const allowedRooms = ['A1', 'A2', 'T1', 'T2', '1', '2', '3', '4', '5', '6', 'E', 'H', 'RX'];
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', 
    '#FFCD56', '#4BC0C0', '#F7464A', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/anestesio/anestesiologos`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const anesthesiologists = await response.json();

        const specialtyCounts = {};
        const today = new Date().toDateString();

        // Inicializar todas las salas con conteo 0
        allowedRooms.forEach(room => {
          specialtyCounts[room] = 0;
        });

        anesthesiologists.forEach(anesthesiologist => {
          const room = anesthesiologist.sala_anestesio;
          const date = new Date(anesthesiologist.dia_anestesio).toDateString();

          if (allowedRooms.includes(room) && date === today) {
            specialtyCounts[room] += 1;
          }
        });

        setData(specialtyCounts);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching anesthesiologists by specialty:', error);
      }
    };

    fetchData();
  }, [baseURL]);

  if (error) return <div>Error: {error}</div>;

  // Configuración de los datos para la gráfica
  const chartData = {
    labels: allowedRooms,
    datasets: [
      {
        label: 'Anestesiólogos Programados',
        data: allowedRooms.map(room => data[room] || 0),
        backgroundColor: colors,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Anestesiólogos Programados por Sala (Hoy)',
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border-[1px] border-border p-5 shadow-md card-zoom">
      <h3 className="text-lg font-medium mb-4">Anestesiólogos Programados por Sala</h3>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default AnesthesiologistsBySpecialtyCard;
