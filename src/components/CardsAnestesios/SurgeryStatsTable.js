import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../AuthContext';
import axios from 'axios';
import { ChevronDown, ChevronUp } from 'lucide-react';

const SurgeryStatsTable = () => {
  const [statsData, setStatsData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("realizadas");
  const [showUrgencias, setShowUrgencias] = useState(false);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/solicitudes`);
        const surgeries = response.data;

        // Filtrar cirugías por la fecha seleccionada
        const filteredSurgeries = surgeries.filter(surgery => {
          const surgeryDate = new Date(surgery.fecha_programada).toISOString().split('T')[0];
          return surgeryDate === selectedDate;
        });

        // Calcular estadísticas
        const stats = {
          // Nueva estadística para el total de solicitudes (excluyendo urgencias)
          totalSolicitudes: filteredSurgeries.filter(s => s.estado_solicitud !== "Urgencia").length,
          programadas: filteredSurgeries.filter(s => s.estado_solicitud === "Programada").length,
          suspendidas: filteredSurgeries.filter(s => s.estado_solicitud === "Suspendida").length,
          realizadas: filteredSurgeries.filter(s => s.estado_solicitud === "Realizada").length,
          realizadasTM: filteredSurgeries.filter(s => 
            s.estado_solicitud === "Realizada" && s.turno === "Matutino"
          ).length,
          realizadasTV: filteredSurgeries.filter(s => 
            s.estado_solicitud === "Realizada" && s.turno === "Vespertino"
          ).length,
          realizadasTN: filteredSurgeries.filter(s => 
            s.estado_solicitud === "Realizada" && s.turno === "Nocturno"
          ).length,
          editables: filteredSurgeries.filter(s => s.estado_solicitud === "Editable").length,
          editablesTM: filteredSurgeries.filter(s => 
            s.estado_solicitud === "Editable" && s.turno === "Matutino"
          ).length,
          editablesTV: filteredSurgeries.filter(s => 
            s.estado_solicitud === "Editable" && s.turno === "Vespertino"
          ).length,
          editablesTN: filteredSurgeries.filter(s => 
            s.estado_solicitud === "Editable" && s.turno === "Nocturno"
          ).length,
          total24h: filteredSurgeries.filter(s => s.estado_solicitud === "Realizada").length,
          ambulatorias: filteredSurgeries.filter(s => 
            s.tipo_intervencion === "Cirugia Ambulatoria"
          ).length,
          noAmbulatorias: filteredSurgeries.filter(s => 
            s.tipo_intervencion !== "Cirugia Ambulatoria"
          ).length,
          // Nuevas estadísticas para urgencias
          urgencias: filteredSurgeries.filter(s => s.estado_solicitud === "Urgencia").length,
          urgenciasTM: filteredSurgeries.filter(s => 
            s.estado_solicitud === "Urgencia" && s.turno_solicitado === "Matutino"
          ).length,
          urgenciasTV: filteredSurgeries.filter(s => 
            s.estado_solicitud === "Urgencia" && s.turno_solicitado === "Vespertino"
          ).length,
          urgenciasTN: filteredSurgeries.filter(s => 
            s.estado_solicitud === "Urgencia" && s.turno_solicitado === "Nocturno"
          ).length,
        };

        setStatsData(stats);
      } catch (error) {
        setError('Error al cargar los datos: ' + error.message);
        console.error('Error al obtener estadísticas de cirugías:', error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 30000);

    return () => clearInterval(intervalId);
  }, [baseURL, selectedDate]);

  if (user?.rol_user !== 6 && user?.rol_user !== 7) {
    return null;
  }

  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!statsData) return <div className="text-gray-500">Cargando...</div>;

  return (
    <div className="bg-white rounded-xl border-[1px] border-border p-5 shadow-md card-zoom">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Estadísticas de Cirugías</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Seleccionar fecha:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded-md p-2"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 border">Solicitudes Totales</th>
              <th className="px-4 py-2 border">CX Programadas</th>
              <th className="px-4 py-2 border">CX Suspendidas</th>
              <th className="px-4 py-2 border">CX Realizadas</th>
              <th className="px-4 py-2 border">CX Editada Parcial</th>
              <th className="px-4 py-2 border text-center" colSpan="3">
                {viewMode === "realizadas" ? "CX Realizadas por Turno" : "CX Editables por Turno"}
                <button
                  onClick={() => setViewMode(viewMode === "realizadas" ? "editables" : "realizadas")}
                  className="ml-2 text-blue-600"
                >
                  ⇅
                </button>
              </th>
              <th className="px-4 py-2 border">Total CX en 24h</th>
              <th className="px-4 py-2 border">CX Ambulatorias</th>
              <th className="px-4 py-2 border">CX No Ambulatorias</th>
            </tr>
            <tr>
              <th className="px-4 py-2 border"></th>
              <th className="px-4 py-2 border"></th>
              <th className="px-4 py-2 border"></th>
              <th className="px-4 py-2 border"></th>
              <th className="px-4 py-2 border"></th>
              <th className="px-4 py-2 border bg-blue-50">TM</th>
              <th className="px-4 py-2 border bg-orange-50">TV</th>
              <th className="px-4 py-2 border bg-gray-100">TN</th>
              <th className="px-4 py-2 border"></th>
              <th className="px-4 py-2 border"></th>
              <th className="px-4 py-2 border"></th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-center hover:bg-gray-50">
              <td className="px-4 py-2 border font-medium">{statsData.totalSolicitudes}</td>
              <td className="px-4 py-2 border font-medium">{statsData.programadas}</td>
              <td className="px-4 py-2 border font-medium">{statsData.suspendidas}</td>
              <td className="px-4 py-2 border font-medium">{statsData.realizadas}</td>
              <td className="px-4 py-2 border font-medium">{statsData.editables}</td>
              <td className="px-4 py-2 border font-medium bg-blue-50">
                {viewMode === "realizadas" ? statsData.realizadasTM : statsData.editablesTM}
              </td>
              <td className="px-4 py-2 border font-medium bg-orange-50">
                {viewMode === "realizadas" ? statsData.realizadasTV : statsData.editablesTV}
              </td>
              <td className="px-4 py-2 border font-medium bg-gray-100">
                {viewMode === "realizadas" ? statsData.realizadasTN : statsData.editablesTN}
              </td>
              <td className="px-4 py-2 border font-medium">{statsData.total24h}</td>
              <td className="px-4 py-2 border font-medium">{statsData.ambulatorias}</td>
              <td className="px-4 py-2 border font-medium">{statsData.noAmbulatorias}</td>
            </tr>
            {/* Fila plegable de urgencias */}
            <tr 
              className="text-center hover:bg-gray-50 cursor-pointer bg-yellow-50"
              onClick={() => setShowUrgencias(!showUrgencias)}
            >
              <td colSpan="5" className="px-4 py-2 border font-medium text-left">
                <div className="flex items-center gap-2">
                  {showUrgencias ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  Total de Urgencias: {statsData.urgencias}
                </div>
              </td>
              <td className={`px-4 py-2 border font-medium ${showUrgencias ? '' : 'hidden'}`}>
                {statsData.urgenciasTM}
              </td>
              <td className={`px-4 py-2 border font-medium ${showUrgencias ? '' : 'hidden'}`}>
                {statsData.urgenciasTV}
              </td>
              <td className={`px-4 py-2 border font-medium ${showUrgencias ? '' : 'hidden'}`}>
                {statsData.urgenciasTN}
              </td>
              <td colSpan="3" className="px-4 py-2 border"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SurgeryStatsTable;