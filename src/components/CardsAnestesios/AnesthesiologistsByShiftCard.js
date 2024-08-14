import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registrar los componentes de Chart.js necesarios
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const AnesthesiologistsByShiftChart = () => {
  const [data, setData] = useState({ matutino: 0, vespertino: 0, nocturno: 0 });
  const [error, setError] = useState(null);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/anestesio/anestesiologos`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const anesthesiologists = await response.json();

        const counts = {
          matutino: 0,
          vespertino: 0,
          nocturno: 0,
        };

        if (Array.isArray(anesthesiologists)) {
          anesthesiologists.forEach(anesthesiologist => {
            if (anesthesiologist.turno_anestesio === 'Matutino') counts.matutino++;
            if (anesthesiologist.turno_anestesio === 'Vespertino') counts.vespertino++;
            if (anesthesiologist.turno_anestesio === 'Nocturno') counts.nocturno++;
          });
        } else {
          console.error('Unexpected data format:', anesthesiologists);
        }

        setData(counts);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching anesthesiologists by shift:', error);
      }
    };

    fetchData();
  }, [baseURL]);

  if (error) return <div>Error: {error}</div>;

  const chartData = {
    labels: ['Matutino', 'Vespertino', 'Nocturno'],
    datasets: [
      {
        label: 'Número de Anestesiólogos',
        data: [data.matutino, data.vespertino, data.nocturno],
        backgroundColor: ['#81A4FF', '#6DFF13', '#FFA959'],
        borderColor: '#',
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw}`,
        },
      },
    },
    animation: {
      duration: 1000, // Duración de la animación en milisegundos
      easing: 'easeInOutBounce', // Tipo de animación
    },
  };

  return (
    <div className="bg-white rounded-xl border-[1px] border-border p-5 shadow-md card-zoom">
      <h3 className="text-lg font-medium mb-4">Anestesiólogos por Turno</h3>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default AnesthesiologistsByShiftChart;
