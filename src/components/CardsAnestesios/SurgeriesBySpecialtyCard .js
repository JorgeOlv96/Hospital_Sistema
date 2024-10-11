import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, Tooltip, Legend, PointElement, LineElement, LinearScale, Title } from 'chart.js';

ChartJS.register(PointElement, LineElement, Tooltip, Legend, LinearScale, Title);

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

        setChartData({
          labels,
          datasets: [
            {
              label: 'Cirugías Realizadas por Especialidad',
              data,
              backgroundColor: '#36A2EB',
              borderColor: '#36A2EB',
              tension: 0.2, // Suaviza las líneas
              pointRadius: 5, // Tamaño de los puntos
              pointBackgroundColor: '#FF6384',
              pointBorderColor: '#FF6384',
              pointBorderWidth: 2,
              fill: false, // Desactiva el relleno bajo la línea
            },
          ],
          fullNames, // Nombres completos para los tooltips
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
    scales: {
      x: {
        title: {
          display: true,
          text: 'Especialidades (por clave)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Número de Cirugías',
        },
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            // Muestra el nombre completo de la especialidad en el tooltip
            return chartData.fullNames[context[0].dataIndex];
          },
          label: (context) => `${context.raw} cirugías`,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border-[1px] border-border p-5 shadow-md card-zoom" style={{ height: '350px' }}>
      <h3 className="text-lg font-medium mb-4">Cirugías Realizadas por Especialidad</h3>
      <div style={{ height: 'calc(100% - 40px)' }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default SurgeriesBySpecialtyCard;
