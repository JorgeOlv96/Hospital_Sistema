import React, { useState, useEffect } from 'react';
import Layout from '../../Layout';
import { Link } from 'react-router-dom';

function Programarsolicitud() {
  const [pendingAppointments, setPendingAppointments] = useState([]);

  useEffect(() => {
    fetchPendingAppointments();
  }, []);

  const fetchPendingAppointments = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/solicitudes/pendientes');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setPendingAppointments(data); // Actualiza el estado con las solicitudes pendientes obtenidas
    } catch (error) {
      console.error('Error fetching pending appointments:', error);
    }
  };

  return (
    <Layout>
      <div className="overflow-auto" style={{ height: '800px' }}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Folio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre del Paciente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Solicitada
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sala Solicitada
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Especialidad
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pendingAppointments.map((appointment) => (
              <tr key={appointment.folio}>
                <td className="px-6 py-4 whitespace-nowrap">{appointment.folio}</td>
                <td className="px-6 py-4 whitespace-nowrap">{`${appointment.nombre_paciente} ${appointment.ap_paterno} ${appointment.ap_materno}`}</td>
                <td className="px-6 py-4 whitespace-nowrap">{appointment.fecha_solicitud}</td>
                <td className="px-6 py-4 whitespace-nowrap">{appointment.sala_quirofano}</td>
                <td className="px-6 py-4 whitespace-nowrap">{appointment.nombre_especialidad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end mt-4">
        <Link to="/solicitudes/Programarsolicitud" className="btn btn-secondary bg-[#001B58] text-white rounded-lg px-4 py-2">
          Programar
        </Link>
      </div>
    </Layout>
  );
}

export default Programarsolicitud;
