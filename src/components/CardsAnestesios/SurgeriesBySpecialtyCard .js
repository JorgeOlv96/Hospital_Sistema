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

        const specialtyCounts = surgeries.reduce((acc, surgery) => {
          const specialty = surgery.nombre_especialidad;
          const clave = surgery.clave_esp;
          if (specialty && clave) {
            if (!acc[specialty]) {
              acc[specialty] = { count: 0, clave };
            }
            acc[specialty].count += 1;
          }
          return acc;
        }, {});

        const sortedSpecialties = Object.entries(specialtyCounts)
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, 10);

        const labels = sortedSpecialties.map(([_, { clave }]) => clave);
        const data = sortedSpecialties.map(([_, { count }]) => count);
        const fullNames = sortedSpecialties.map(([name]) => name);

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
          fullNames, // Añadimos los nombres completos para usarlos en el tooltip
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
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            // Muestra el nombre completo de la especialidad en el título del tooltip
            return chartData.fullNames[context[0].dataIndex];
          },
          label: (context) => `${context.raw} cirugías`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
      x: {
        ticks: {
          maxRotation: 0,
          minRotation: 0,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border-[1px] border-border p-5 shadow-md card-zoom" style={{ height: '350px' }}>
      <h3 className="text-lg font-medium mb-4">Cirugías Realizadas por Especialidad</h3>
      <div style={{ height: 'calc(100% - 40px)' }}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default SurgeriesBySpecialtyCard;