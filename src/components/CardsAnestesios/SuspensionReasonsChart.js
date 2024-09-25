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
            // Tomar las cinco palabras siguientes al guion
            const motivoPartes = motivo.split(' - ');
            if (motivoPartes.length > 1) {
              const palabrasPosteriores = motivoPartes[1].split(' ').slice(0, 5).join(' ');
              acc[palabrasPosteriores] = (acc[palabrasPosteriores] || 0) + 1;
            }
          }
          return acc;
        }, {});

        // Ordenar por las razones más comunes y obtener los 10 primeros
        const sortedReasons = Object.entries(reasonCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10);

        // Formatear los datos para la gráfica
        const labels = sortedReasons.map(([reason]) => reason);
        const data = sortedReasons.map(([_, count]) => count);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Número de Suspensiones',
              data,
              backgroundColor: '#FFA959',
              borderColor: '#FF8850',
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
  }, [baseURL]);

  if (error) return <div>Error: {error}</div>;
  if (!chartData) return <div>Cargando...</div>;

  const chartOptions = {
    responsive: true,
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
    <div className="bg-white rounded-xl border-[1px] border-border p-5 shadow-md card-zoom">
      <h3 className="text-lg font-medium mb-4">Top 10 Motivos de Suspensión</h3>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default SuspensionReasonsChart;
