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

        const reasonCounts = {};
        const fullReasons = {};

        suspensionData.forEach(solicitud => {
          let motivo = solicitud.motivo_suspension;
          if (motivo) {
            const motivoPartes = motivo.split(' - ');
            if (motivoPartes.length > 1) {
              const palabrasPosteriores = motivoPartes[1].split(' ').slice(0, 6).join(' ');
              reasonCounts[palabrasPosteriores] = (reasonCounts[palabrasPosteriores] || 0) + 1;
              fullReasons[palabrasPosteriores] = motivo;
            }
          }
        });

        const sortedReasons = Object.entries(reasonCounts)
          .filter(([reason]) => reason.trim() !== '')
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10);

        const labels = sortedReasons.map(([reason]) => reason);
        const data = sortedReasons.map(([_, count]) => count);

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
              borderColor: backgroundColors.map(color => color.replace('FF', 'AA')),
              borderWidth: 1,
            },
          ],
          fullReasons, // Agregamos los motivos completos aquí
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
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Ocultar la leyenda ya que no es necesaria
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            // Mostrar el motivo completo en el título del tooltip
            return chartData.fullReasons[context[0].label];
          },
          label: (context) => `Suspensiones: ${context.raw}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
      x: {
        ticks: {
          callback: function(value) {
            // Mostrar solo las primeras 6 palabras en el eje X
            const label = this.getLabelForValue(value);
            return label.split(' ').slice(0, 6).join(' ');
          },
          maxRotation: 20,
          minRotation: 20,
        },
      },
    },
  };

  return (
    <div 
      className="bg-white rounded-xl border-[1px] border-border p-5 shadow-md card-zoom" 
      style={{ height: '600px', width: '100%' }}
    >
      <h3 className="text-lg font-medium mb-4">Top 10 Motivos de Suspensión</h3>
      <div style={{ height: '500px' }}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default SuspensionReasonsChart;