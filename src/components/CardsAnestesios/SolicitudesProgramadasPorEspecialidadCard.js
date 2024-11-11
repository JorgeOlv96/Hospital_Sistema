import React, { useEffect, useState, useContext } from 'react';
import { Pie } from 'react-chartjs-2';
import { AuthContext } from '../../AuthContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const SolicitudesProgramadasPorEspecialidadCard = () => {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchSolicitudesData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/solicitudes/programadas`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        let solicitudes = await response.json();

        // Obtener la fecha actual en formato YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];

        // Filtrar las solicitudes para el día actual
        let solicitudesHoy = solicitudes.filter(solicitud => 
          solicitud.fecha_programada && solicitud.fecha_programada.startsWith(today)
        );

        // Filtrar por especialidad si el usuario tiene una asignada
        if (user?.especialidad) {
          solicitudesHoy = solicitudesHoy.filter(
            solicitud => solicitud.nombre_especialidad === user.especialidad
          );
        }

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
              label: user?.especialidad 
                ? `Solicitudes de ${user.especialidad}`
                : 'Solicitudes Programadas',
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
    
    // Actualizar cada minuto para mantener los datos del día actual
    const intervalId = setInterval(fetchSolicitudesData, 60000);
    return () => clearInterval(intervalId);
  }, [baseURL, user?.especialidad]); // Agregamos user?.especialidad como dependencia

  if (error) return <div>Error: {error}</div>;
  if (!chartData) return <div>Cargando...</div>;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
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
  };

  // Título dinámico basado en la especialidad del usuario
  const chartTitle = user?.especialidad 
    ? `Solicitudes Programadas - ${user.especialidad} (Hoy)`
    : 'Solicitudes Programadas por Especialidad (Hoy)';

  return (
    <div className="bg-white rounded-xl border-[1px] border-border p-5 shadow-md card-zoom" style={{ height: '350px' }}>
      <h3 className="text-lg font-medium mb-4">{chartTitle}</h3>
      <div style={{ height: 'calc(100% - 40px)' }}>
        <Pie data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default SolicitudesProgramadasPorEspecialidadCard;