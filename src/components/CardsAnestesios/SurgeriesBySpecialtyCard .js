import React, { useEffect, useState, useContext } from 'react';
import { Line } from 'react-chartjs-2';
import { AuthContext } from '../../AuthContext';
import { Chart as ChartJS, Tooltip, Legend, PointElement, LineElement, LinearScale, Title } from 'chart.js';

ChartJS.register(PointElement, LineElement, Tooltip, Legend, LinearScale, Title);

const SurgeriesBySpecialtyCard = () => {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchSurgeriesData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/solicitudes/realizadas`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        let surgeries = await response.json();

        // Filtrar por especialidad si el usuario tiene una asignada
        if (user?.especialidad) {
          surgeries = surgeries.filter(
            surgery => surgery.nombre_especialidad === user.especialidad
          );
        }

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
              label: user?.especialidad 
                ? `Cirugías Realizadas - ${user.especialidad}`
                : 'Cirugías Realizadas por Especialidad',
              data,
              backgroundColor: '#36A2EB',
              borderColor: '#36A2EB',
              tension: 0.2,
              pointRadius: 5,
              pointBackgroundColor: '#FF6384',
              pointBorderColor: '#FF6384',
              pointBorderWidth: 2,
              fill: false,
            },
          ],
          fullNames,
        });
      } catch (error) {
        setError(error.message);
        console.error('Error fetching surgeries data:', error);
      }
    };

    fetchSurgeriesData();
  }, [baseURL, user?.especialidad]); // Agregamos user?.especialidad como dependencia

  if (error) return <div>Error: {error}</div>;
  if (!chartData) return <div>Cargando...</div>;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: user?.especialidad 
            ? 'Cirugías por Periodo'
            : 'Especialidades (por clave)',
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
            return chartData.fullNames[context[0].dataIndex];
          },
          label: (context) => `${context.raw} cirugías`,
        },
      },
    },
  };

  // Título dinámico basado en la especialidad del usuario
  const chartTitle = user?.especialidad 
    ? `Cirugías Realizadas - ${user.especialidad}`
    : 'Cirugías Realizadas por Especialidad';

  return (
    <div className="bg-white rounded-xl border-[1px] border-border p-5 shadow-md card-zoom" style={{ height: '350px' }}>
      <h3 className="text-lg font-medium mb-4">{chartTitle}</h3>
      <div style={{ height: 'calc(100% - 40px)' }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default SurgeriesBySpecialtyCard;