import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../../Layout';
import { Link } from 'react-router-dom';
import AddAppointmentModal from '../../components/Modals/AddApointmentModal';

function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('nombre_paciente'); // Campo inicial de búsqueda

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

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredSolicitudes = useMemo(() => {
    return solicitudes.filter((solicitud) =>
      solicitud[searchField].toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [solicitudes, searchTerm, searchField]);

  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;

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

      <div className="flex items-center space-x-4 mt-4">
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md w-64"
        />
        <select
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="id_solicitud">ID</option>
          <option value="folio">Folio</option>
          <option value="nombre_paciente">Nombre</option>
          <option value="nombre_especialidad">Especialidad</option>
          <option value="fecha_solicitud">Fecha</option>
          <option value="estado_solicitud">Estado</option>
        </select>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Lista de Solicitudes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('id_solicitud')}>
                  ID <span>{sortBy === 'id_solicitud' && (sortOrder === 'asc' ? '▲' : '▼')}</span>
                </th>
                <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('folio')}>
                  Folio <span>{sortBy === 'folio' && (sortOrder === 'asc' ? '▲' : '▼')}</span>
                </th>
                <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('nombre_paciente')}>
                  Nombre <span>{sortBy === 'nombre_paciente' && (sortOrder === 'asc' ? '▲' : '▼')}</span>
                </th>
                <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('nombre_especialidad')}>
                  Especialidad <span>{sortBy === 'nombre_especialidad' && (sortOrder === 'asc' ? '▲' : '▼')}</span>
                </th>
                <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('fecha_solicitud')}>
                  Fecha <span>{sortBy === 'fecha_solicitud' && (sortOrder === 'asc' ? '▲' : '▼')}</span>
                </th>
                <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('estado_solicitud')}>
                  Estado <span>{sortBy === 'estado_solicitud' && (sortOrder === 'asc' ? '▲' : '▼')}</span>
                </th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSolicitudes.slice(startIndex, endIndex).map((solicitud) => (
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
        <button onClick={() => setPage(page + 1)} disabled={endIndex >= filteredSolicitudes.length} className="bg-[#001B58] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r">
          Siguiente
        </button>
      </div>
    </Layout>
  );
}

export default Solicitudes;

