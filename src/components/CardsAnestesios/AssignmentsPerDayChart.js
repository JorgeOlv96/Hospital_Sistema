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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/anestesio/anestesiologos`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const anesthesiologists = await response.json();

        const assignmentsPerDay = {};
        anesthesiologists.forEach(anesthesiologist => {
          const date = anesthesiologist.dia_anestesio;
          assignmentsPerDay[date] = (assignmentsPerDay[date] || 0) + 1;
        });

        setData({
          dates: Object.keys(assignmentsPerDay),
          counts: Object.values(assignmentsPerDay),
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
    <div className="bg-white rounded-xl border-[1px] border-border p-5 shadow-md">
      <h3 className="text-lg font-medium mb-4">Asignaciones por Día</h3>
      <Line data={chartData} />
    </div>
  );
};

export default AssignmentsPerDayChart;
