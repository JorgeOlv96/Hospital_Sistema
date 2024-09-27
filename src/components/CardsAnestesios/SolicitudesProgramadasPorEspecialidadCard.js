import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SolicitudesProgramadasPorEspecialidadCard = () => {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";

  useEffect(() => {
    const fetchSolicitudesData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/solicitudes/programadas`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const solicitudes = await response.json();

        // Obtener la fecha actual en formato YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];

        // Filtrar las solicitudes para el día actual
        const solicitudesHoy = solicitudes.filter(solicitud => 
          solicitud.fecha_programada && solicitud.fecha_programada.startsWith(today)
        );

        const specialtyCounts = solicitudesHoy.reduce((acc, solicitud) => {
          const specialty = solicitud.nombre_especialidad;
          const clave = solicitud.clave_esp;
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
              label: 'Solicitudes Programadas',
              data,
              backgroundColor: backgroundColors,
              borderColor: backgroundColors.map(color => color.replace('FF', 'AA')),
              borderWidth: 1,
            },
          ],
          fullNames,
        });
      } catch (error) {
        setError(error.message);
        console.error('Error fetching solicitudes data:', error);
      }
    };

    fetchSolicitudesData();
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
            return chartData.fullNames[context[0].dataIndex];
          },
          label: (context) => `${context.raw} solicitudes`,
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
      <h3 className="text-lg font-medium mb-4">Solicitudes Programadas por Especialidad (Hoy)</h3>
      <div style={{ height: 'calc(100% - 40px)' }}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default SolicitudesProgramadasPorEspecialidadCard;