import React, { useEffect, useState, useContext } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { AuthContext } from '../../AuthContext';
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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";
  const { user } = useContext(AuthContext);

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Generar array de años (desde 2020 hasta el año actual)
  const years = Array.from(
    { length: new Date().getFullYear() - 2024 + 1 },
    (_, i) => 2024 + i
  );

  useEffect(() => {
    const fetchSolicitudesData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/solicitudes`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const solicitudes = await response.json();

        // Filtrar por mes seleccionado y estado pendiente
        let solicitudesFiltradas = solicitudes.filter(solicitud => {
          const fechaSolicitud = new Date(solicitud.fecha_solicitud);
          return (
            solicitud.estado_solicitud === 'Pendiente' &&
            fechaSolicitud.getMonth() === selectedMonth &&
            fechaSolicitud.getFullYear() === selectedYear
          );
        });

        // Filtrar por especialidad si el usuario tiene una asignada
        if (user?.especialidad) {
          solicitudesFiltradas = solicitudesFiltradas.filter(solicitud =>
            solicitud.nombre_especialidad === user.especialidad
          );
        }

        const specialtyCounts = solicitudesFiltradas.reduce((acc, solicitud) => {
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
          .sort((a, b) => b[1].count - a[1].count);

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
              backgroundColor: backgroundColors.slice(0, data.length),
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
  }, [baseURL, user?.especialidad, selectedMonth, selectedYear]);

  if (error) return <div>Error: {error}</div>;
  if (!chartData) return <div>Cargando...</div>;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: !isPieChart,
        position: 'bottom',
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

  const ColorLegend = () => (
    <div className="text-sm overflow-y-auto" style={{ maxHeight: '400px' }}>
      {chartData.fullNames.map((name, index) => (
        <div key={index} className="flex items-center mb-2">
          <div
            className="w-4 h-4 mr-2 flex-shrink-0"
            style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
          ></div>
          <span className="truncate" title={name}>{name}</span>
        </div>
      ))}
    </div>
  );

  const chartTitle = user?.especialidad
    ? `Solicitudes Pendientes - ${user.especialidad} - ${months[selectedMonth]} ${selectedYear}`
    : `Especialidades con Solicitudes Pendientes - ${months[selectedMonth]} ${selectedYear}`;

  return (
    <div className="bg-white rounded-xl border-[1px] border-border p-5 shadow-md card-zoom">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">{chartTitle}</h3>
        <div className="flex gap-4">
          <select
            className="px-3 py-1 border rounded-md text-sm"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {months.map((month, index) => (
              <option key={index} value={index}>{month}</option>
            ))}
          </select>
          <select
            className="px-3 py-1 border rounded-md text-sm"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm"
            onClick={toggleChartType}
          >
            {isPieChart ? 'Ver como Barras' : 'Ver como Pastel'}
          </button>
        </div>
      </div>
      <div className={`flex ${isPieChart ? 'flex-row' : 'flex-col'}`}>
        <div className={isPieChart ? 'w-3/4 pr-4' : 'w-full'} style={{ height: '400px' }}>
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
        {isPieChart && (
          <div className="w-1/4 pl-4 border-l">
            <h4 className="text-sm font-medium mb-2">Leyenda</h4>
            <ColorLegend />
          </div>
        )}
      </div>
    </div>
  );
};

export default SolicitudesPendientesPorEspecialidadCard;