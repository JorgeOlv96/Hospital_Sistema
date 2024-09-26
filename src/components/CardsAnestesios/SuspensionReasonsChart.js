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

const SuspensionReasonsChart = () => {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || 'http://localhost:4000';

  useEffect(() => {
    const fetchSuspensionReasons = async () => {
      try {
        const response = await fetch(`${baseURL}/api/solicitudes/suspendidas`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const suspensionData = await response.json();

        // Agrupar los motivos de suspensión y contar las ocurrencias
        const reasonCounts = suspensionData.reduce((acc, solicitud) => {
          let motivo = solicitud.motivo_suspension;
          if (motivo) {
            const motivoPartes = motivo.split(' - ');
            if (motivoPartes.length > 1) {
              const palabrasPosteriores = motivoPartes[1].split(' ').slice(0, 6).join(' ');
              acc[palabrasPosteriores] = (acc[palabrasPosteriores] || 0) + 1;
            }
          }
          return acc;
        }, {});

        // Filtrar motivos vacíos y ordenar por las razones más comunes
        const sortedReasons = Object.entries(reasonCounts)
          .filter(([reason]) => reason.trim() !== '') // Eliminar columnas sin descripción
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10); // Obtener los 10 primeros o menos si no hay suficientes

        // Verificar que no haya columnas vacías y solo usar los datos válidos
        const labels = sortedReasons.map(([reason]) => reason);
        const data = sortedReasons.map(([_, count]) => count);

        // Colores dinámicos para las barras
        const backgroundColors = [
          '#FFA959', '#FF8850', '#FF6F47', '#FF5640', '#FF3D38', 
          '#FF2431', '#FF0A29', '#E50025', '#CC001F', '#B2001A'
        ];

        setChartData({
          labels,
          datasets: [
            {
              label: 'Número de Suspensiones',
              data,
              backgroundColor: backgroundColors,
              borderColor: backgroundColors.map(color => color.replace('FF', 'AA')), // Colores de borde más oscuros
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        setError(error.message);
        console.error('Error fetching suspension reasons:', error);
      }
    };

    fetchSuspensionReasons(); 
    const intervalId = setInterval(fetchSuspensionReasons, 30000); 

    return () => clearInterval(intervalId);
  }, [baseURL]);

  if (error) return <div>Error: {error}</div>;
  if (!chartData) return <div>Cargando...</div>;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Permite ajustar la altura personalizada
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
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div 
      className="bg-white rounded-xl border-[1px] border-border p-5 shadow-md card-zoom" 
      style={{ height: '600px', width: '100%' }} // Ajuste del tamaño del contenedor
    >
      <h3 className="text-lg font-medium mb-4">Top 10 Motivos de Suspensión</h3>
      <div style={{ height: '500px' }}> {/* Ajuste del espacio para el gráfico */}
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default SuspensionReasonsChart;
