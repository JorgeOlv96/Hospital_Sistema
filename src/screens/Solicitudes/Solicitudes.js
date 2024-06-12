import React, { useState, useEffect } from 'react';
import Layout from '../../Layout';
import { sortsDatas } from '../../components/Datas';
import { Link, useNavigate } from 'react-router-dom';
import { BiTime } from 'react-icons/bi';
import { BsCalendarMonth } from 'react-icons/bs';
import { MdOutlineCalendarMonth } from 'react-icons/md';
import AddAppointmentModal from '../../components/Modals/AddApointmentModal';

function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/solicitudes');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setSolicitudes(data);
      } catch (error) {
        console.error('Error fetching solicitudes:', error);
      }
    };

    fetchSolicitudes();
  }, []);

  const handleModal = () => {
    setOpen(!open);
  };

  const handleViewModal = (solicitud) => {
    setSelectedAppointment(solicitud);
    setOpen(true);
  };

  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const solicitudesToShow = solicitudes.slice(startIndex, endIndex);

  return (
    <Layout>
      <h1 className="text-xl font-semibold">Solicitudes</h1>
      <div className="my-4">
        <Link to="./Crearsolicitud" className="btn btn-sm btn-secondary p-2 bg-[#001B58] text-white rounded-lg">
          Nueva Solicitud
        </Link>
      </div>

      {open && selectedAppointment && (
        <AddAppointmentModal
          datas={solicitudes}
          isOpen={open}
          closeModal={handleModal}
          appointmentId={selectedAppointment.id_solicitud}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {/* Boxes */}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Lista de Solicitudes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Folio</th>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Especialidad</th>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudesToShow.map((solicitud) => (
                <tr key={solicitud.id_solicitud}>
                  <td className="border px-4 py-2">{solicitud.id_solicitud}</td>
                  <td className="border px-4 py-2">{solicitud.folio}</td>
                  <td className="border px-4 py-2">{solicitud.nombre_paciente} {solicitud.ap_paterno} {solicitud.ap_materno}</td>
                  <td className="border px-4 py-2">{solicitud.nombre_especialidad}</td>
                  <td className="border px-4 py-2">{new Date(solicitud.fecha_solicitud).toLocaleDateString()}</td>
                  <td className="border px-4 py-2">{solicitud.estado_solicitud}</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => handleViewModal(solicitud)}
                      className="bg-[#001B58] text-white px-4 py-2 rounded-md hover:bg-blue-800"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <button onClick={() => setPage(page - 1)} disabled={page === 1} className="bg-[#001B58] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-l">
          Anterior
        </button>
        <span className="mx-4">Página {page}</span>
        <button onClick={() => setPage(page + 1)} disabled={endIndex >= solicitudes.length} className="bg-[#001B58] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r">
          Siguiente
        </button>
      </div>
    </Layout>
  );
}

export default Solicitudes;
