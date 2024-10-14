import React, { useEffect, useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const SolicitudesPendientesPorEspecialidadCard = () => {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);
  const [isPieChart, setIsPieChart] = useState(true);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";

  useEffect(() => {
    const fetchSolicitudesData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/solicitudes`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const solicitudes = await response.json();

        // Filtrar las solicitudes con estado "Pendiente"
        const solicitudesPendientes = solicitudes.filter(solicitud => 
          solicitud.estado_solicitud === 'Pendiente'
        );

        // Contar solicitudes por especialidad
        const specialtyCounts = solicitudesPendientes.reduce((acc, solicitud) => {
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

        // Ordenar las especialidades por el número de solicitudes
        const sortedSpecialties = Object.entries(specialtyCounts)
          .sort((a, b) => b[1].count - a[1].count);

        // Preparar etiquetas y datos para la gráfica
        const labels = sortedSpecialties.map(([_, { clave }]) => clave);
        const data = sortedSpecialties.map(([_, { count }]) => count);
        const fullNames = sortedSpecialties.map(([name]) => name);

        const backgroundColors = [
          '#4CAF50', '#2196F3', '#FFEB3B', '#FF5722', '#9C27B0',
          '#00BCD4', '#CDDC39', '#E91E63', '#3F51B5', '#FF9800',
          '#009688', '#FFC107', '#795548', '#607D8B', '#8BC34A',
          '#F44336', '#03A9F4', '#673AB7', '#FFEB3B', '#FF5722',
          '#9C27B0', '#00BCD4', '#CDDC39', '#E91E63', '#3F51B5',
          '#FF9800', '#009688', '#FFC107', '#795548'
        ];

        setChartData({
          labels,
          datasets: [
            {
              label: 'Solicitudes Pendientes',
              data,
              backgroundColor: backgroundColors,
              borderColor: backgroundColors.map(() => '#FFFFFF'),
              borderWidth: 2,
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
    const intervalId = setInterval(fetchSolicitudesData, 30000);

    return () => clearInterval(intervalId);
  }, [baseURL]);

  if (error) return <div>Error: {error}</div>;
  if (!chartData) return <div>Cargando...</div>;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            return chartData.fullNames[context[0].dataIndex];
          },
          label: (context) => `Solicitudes: ${context.raw}`,
        },
      },
    },
  };

  const toggleChartType = () => {
    setIsPieChart(!isPieChart);
  };

  return (
    <div 
      className="bg-white rounded-xl border-[1px] border-border p-5 shadow-md card-zoom" 
      style={{ height: '600px', width: '100%', overflow: 'hidden' }}
    >
      <h3 className="text-lg font-medium mb-4">Especialidades con Solicitudes Pendientes</h3>
      <button
        className="mb-4 px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm"
        onClick={toggleChartType}
      >
        {isPieChart ? 'Ver como Barras' : 'Ver como Pastel'}
      </button>
      <div style={{ height: '450px', overflow: 'hidden' }}>
        {isPieChart ? (
          <Pie data={chartData} options={chartOptions} />
        ) : (
          <Bar 
            data={chartData} 
            options={{
              ...chartOptions,
              scales: {
                x: { title: { display: true, text: 'Especialidades' } },
                y: { title: { display: true, text: 'Número de Solicitudes Pendientes' } },
              },
            }} 
          />
        )}
      </div>
    </div>
  );
};

export default SolicitudesPendientesPorEspecialidadCard;