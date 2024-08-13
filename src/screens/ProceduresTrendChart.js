import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registrar los componentes de Chart.js necesarios
ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const ProceduresTrendChart = () => {
  // Datos simulados
  const data = {
    dates: ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05'],
    proceduresCount: [10, 15, 7, 20, 25],
  };

  const chartData = {
    labels: data.dates,
    datasets: [
      {
        label: 'Procedimientos',
        data: data.proceduresCount,
        fill: false,
        backgroundColor: '#365b77',
        borderColor: '#7498b6',
      },
    ],
  };

  return (
    <div className="bg-white rounded-xl border-[1px] border-border p-5 shadow-md">
      <h3 className="text-lg font-medium mb-4">Tendencia de Procedimientos</h3>
      <Line data={chartData} />
    </div>
  );
};

export default ProceduresTrendChart;
