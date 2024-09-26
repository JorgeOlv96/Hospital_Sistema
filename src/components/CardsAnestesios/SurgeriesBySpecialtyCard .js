import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SurgeriesBySpecialtyCard = () => {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";

  useEffect(() => {
    const fetchSurgeriesData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/solicitudes/realizadas`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const surgeries = await response.json();

        // Agrupar las cirugías por especialidad y contar las ocurrencias
        const specialtyCounts = surgeries.reduce((acc, surgery) => {
          const specialty = surgery.nombre_especialidad;
          if (specialty) {
            acc[specialty] = (acc[specialty] || 0) + 1;
          }
          return acc;
        }, {});

        // Ordenar las especialidades por el número de cirugías realizadas
        const sortedSpecialties = Object.entries(specialtyCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10); // Tomar las 10 especialidades con más cirugías

        const labels = sortedSpecialties.map(([specialty]) => specialty);
        const data = sortedSpecialties.map(([_, count]) => count);

        // Colores dinámicos para las barras
        const backgroundColors = [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', 
          '#FFCD56', '#4BC0C0', '#F7464A', '#46BFBD'
        ];

        setChartData({
          labels,
          datasets: [
            {
              label: 'Cirugías Realizadas',
              data,
              backgroundColor: backgroundColors,
              borderColor: backgroundColors.map(color => color.replace('FF', 'AA')),
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        setError(error.message);
        console.error('Error fetching surgeries data:', error);
      }
    };

    fetchSurgeriesData();
  }, [baseURL]);

  if (error) return <div>Error: {error}</div>;
  if (!chartData) return <div>Cargando...</div>;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Cirugías Realizadas por Especialidad',
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw} cirugías`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border-[1px] border-border p-5 shadow-md card-zoom" style={{ height: '350px' }}>
      <h3 className="text-lg font-medium mb-4">Cirugías Realizadas por Especialidad</h3>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default SurgeriesBySpecialtyCard;
