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

const SuspensionReasonsChart = () => {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);
  const [isPieChart, setIsPieChart] = useState(true); // Estado para controlar el tipo de gráfico
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
          '#4CAF50', '#2196F3', '#FFEB3B', '#FF5722', '#9C27B0',
          '#00BCD4', '#CDDC39', '#E91E63', '#3F51B5', '#FF9800'
        ];

        setChartData({
          labels,
          datasets: [
            {
              label: 'Número de Suspensiones',
              data,
              backgroundColor: backgroundColors,
              borderColor: backgroundColors.map(color => '#FFFFFF'),
              borderWidth: 2,
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
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            return chartData.fullReasons[context[0].label];
          },
          label: (context) => `Suspensiones: ${context.raw}`,
        },
      },
    },
  };

  const toggleChartType = () => {
    setIsPieChart(!isPieChart); // Cambia entre gráfica de pastel y barras
  };

  return (
    <div 
      className="bg-white rounded-xl border-[1px] border-border p-5 shadow-md card-zoom" 
      style={{ height: '600px', width: '100%', overflow: 'hidden' }} // Ajuste de overflow
    >
      <h3 className="text-lg font-medium mb-4">Top 10 Motivos de Suspensión</h3>
      <button
        className="mb-4 px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm" // Estilo más discreto
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
                x: { title: { display: true, text: 'Motivos' } },
                y: { title: { display: true, text: 'Número de Suspensiones' } },
              },
            }} 
          />
        )}
      </div>
    </div>
  );
};

export default SuspensionReasonsChart;
