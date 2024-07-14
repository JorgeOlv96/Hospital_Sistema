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
  const [searchField, setSearchField] = useState('nombre_paciente');
  const [filterState, setFilterState] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/solicitudes');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Fetched solicitudes:', data); // Agregar este log
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

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/solicitudes/${appointmentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Error deleting appointment');
      }
      // Actualizar la lista de solicitudes después de eliminar
      const updatedSolicitudes = solicitudes.filter((solicitud) => solicitud.id_solicitud !== appointmentId);
      setSolicitudes(updatedSolicitudes);
      // Cerrar el modal después de eliminar
      setOpen(false);
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const filteredSolicitudes = useMemo(() => {
    return solicitudes
      .filter((solicitud) => {
        const fieldValue = solicitud[searchField];

        if (typeof fieldValue === 'string') {
          return fieldValue.toLowerCase().includes(searchTerm.toLowerCase());
        } else if (typeof fieldValue === 'number') {
          return fieldValue.toString().includes(searchTerm.toLowerCase());
        } else {
          return false;
        }
      })
      .filter((solicitud) => {
        if (filterState === 'all') return true;
        return solicitud.estado_solicitud.toLowerCase() === filterState;
      })
      .filter((solicitud) => {
        const solicitudDate = new Date(solicitud.fecha_solicitud);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (start && solicitudDate < start) return false;
        if (end && solicitudDate > end) return false;
        return true;
      });
  }, [solicitudes, searchTerm, searchField, filterState, startDate, endDate]);

  const sortedSolicitudes = useMemo(() => {
    let sorted = [...filteredSolicitudes];
    if (sortBy) {
      sorted.sort((a, b) => {
        const factor = sortOrder === 'asc' ? 1 : -1;
        if (typeof a[sortBy] === 'string') {
          return factor * a[sortBy].localeCompare(b[sortBy]);
        } else {
          return factor * (a[sortBy] - b[sortBy]);
        }
      });
    }
    return sorted;
  }, [filteredSolicitudes, sortBy, sortOrder]);

  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;

  const getEstadoColor = (estado) => {
    switch (estado.toLowerCase()) {
      case 'programada':
        return 'bg-green-400';
      case 'realizada':
        return 'bg-blue-400';
      case 'suspendida':
        return 'bg-yellow-400';
      case 'pendiente':
        return 'bg-red-400';
      case 'Pre-programada':
          return 'bg-red-400';  
      default:
        return '';
    }
  };

  const getEstadoColorStyle = (estado) => {
    switch (estado.toLowerCase()) {
      case 'programada':
        return { backgroundColor: '#68D391' }; // Verde claro
      case 'realizada':
        return { backgroundColor: '#63B3ED' }; // Azul claro
      case 'suspendida':
        return { backgroundColor: '#F6E05E' }; // Amarillo
      case 'pendiente':
        return { backgroundColor: '#FC8181' }; // Rojo claro
      case 'pre-programada':
        return { backgroundColor: '#F7BAEC' }; // Rosa claro
      default:
        // Aquí puedes manejar el caso por defecto
      
        return {};
    }
  };

  const estadoButtonClasses = (estado) => {
    return `px-3 py-2 border border-gray-300 rounded-md ${filterState === estado ? 'text-white' : ''}`;
  };

  return (
    <Layout>
      <h1 className="text-xl font-semibold">Solicitudes</h1>
      <div className="my-4">
        <Link to="./Crearsolicitud" className="btn btn-sm btn-secondary p-2 bg-[#365b77] hover:bg-[#7498b6] text-white rounded-lg">
          Nueva Solicitud
        </Link>
      </div>

      {open && selectedAppointment && (
        <AddAppointmentModal
          datas={solicitudes}
          isOpen={open}
          closeModal={handleModal}
          onDeleteAppointment={handleDeleteAppointment}
          appointmentId={selectedAppointment.id_solicitud}
        />
      )}

      <div className="flex flex-col space-y-4 mt-4">

  {/* Filtros de búsqueda */}
  <div className="mt-8">
  <div className="text-left">
    <div className="flex items-center justify-center mb-4">
      <div className="flex items-center space-x-4">
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

        <div className="flex items-center space-x-2">
          <label> Por fecha De:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <label>A:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>
  </div>
</div>


  {/* Lista de Solicitudes */}
      <div className="mt-8">
      <div className="text-left">
  <div className="flex items-center justify-center">
    <div className="flex space-x-2">
      <button
        className={`px-4 py-2 rounded-lg ${estadoButtonClasses('all')}`}
        style={filterState === 'all' ? { backgroundColor: '#4A5568', color: '#fff' } : { backgroundColor: '#CBD5E0' }}
        onClick={() => setFilterState('all')}
      >
        Todas las solicitudes
      </button>
      <button
        className={`px-4 py-2 rounded-lg ${estadoButtonClasses('programada')}`}
        style={filterState === 'programada' ? { ...getEstadoColorStyle('programada'), opacity: 0.9 } : { ...getEstadoColorStyle('programada'), opacity: 0.7 }}
        onClick={() => setFilterState('programada')}
      >
        Programada
      </button>
      <button
        className={`px-4 py-2 rounded-lg ${estadoButtonClasses('realizada')}`}
        style={filterState === 'realizada' ? { ...getEstadoColorStyle('realizada'), opacity: 0.9 } : { ...getEstadoColorStyle('realizada'), opacity: 0.7 }}
        onClick={() => setFilterState('realizada')}
      >
        Realizada
      </button>
      <button
        className={`px-4 py-2 rounded-lg ${estadoButtonClasses('suspendida')}`}
        style={filterState === 'suspendida' ? { ...getEstadoColorStyle('suspendida'), opacity: 0.9 } : { ...getEstadoColorStyle('suspendida'), opacity: 0.7 }}
        onClick={() => setFilterState('suspendida')}
      >
        Suspendida
      </button>
      <button
        className={`px-4 py-2 rounded-lg ${estadoButtonClasses('pendiente')}`}
        style={filterState === 'pendiente' ? { ...getEstadoColorStyle('pendiente'), opacity: 0.9 } : { ...getEstadoColorStyle('pendiente'), opacity: 0.7 }}
        onClick={() => setFilterState('pendiente')}
      >
        Pendiente
      </button>
      <button
        className={`px-4 py-2 rounded-lg ${estadoButtonClasses('pre-programada')}`}
        style={filterState === 'pre-programada' ? { ...getEstadoColorStyle('pre-programada'), opacity: 0.9 } : { ...getEstadoColorStyle('pre-programada'), opacity: 0.7 }}
        onClick={() => setFilterState('pre-programada')}
      >
        Pre-programadas
      </button>
 
 
    </div>
  </div>

  <div className="flex items-center justify-center mt-4 mb-4">
      <p className="text-lg font-semibold">Lista de Solicitudes</p>
    </div>

</div>


    <div className="overflow-x-auto">
      <table className="min-w-full shadow-md rounded-lg overflow-hidden">
        <thead className="bg-[#365b77] text-white">
          <tr>
            <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('id_solicitud')}>
              ID <span>{sortBy === 'id_solicitud' && (sortOrder === 'asc' ? '▲' : '▼')}</span>
            </th>
            <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('folio')}>
              Folio <span>{sortBy === 'folio' && (sortOrder === 'asc' ? '▲' : '▼')}</span>
            </th>
            <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('nombre_paciente')}>
              Nombre <span>{sortBy === 'nombre_paciente' && (sortOrder === 'asc' ? '▲' : '▼')}</span>
            </th>
            <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('nombre_especialidad')}>
              Especialidad <span>{sortBy === 'nombre_especialidad' && (sortOrder === 'asc' ? '▲' : '▼')}</span>
            </th>
            <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('fecha_solicitud')}>
              Fecha <span>{sortBy === 'fecha_solicitud' && (sortOrder === 'asc' ? '▲' : '▼')}</span>
            </th>
            <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('estado_solicitud')}>
              Estado <span>{sortBy === 'estado_solicitud' && (sortOrder === 'asc' ? '▲' : '▼')}</span>
            </th>
            <th className="px-4 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
  {sortedSolicitudes.slice(startIndex, endIndex).map((solicitud) => {
    const formattedDate = new Date(solicitud.fecha_solicitud).toLocaleDateString();
    return (
      <tr key={solicitud.id_solicitud} className="bg-blue-50 hover:bg-[#7498b6]">
        <td className="border px-4 py-2">{solicitud.id_solicitud}</td>
        <td className="border px-4 py-2">{solicitud.folio}</td>
        <td className="border px-4 py-2">{solicitud.nombre_paciente} {solicitud.ap_paterno} {solicitud.ap_materno}</td>
        <td className="border px-4 py-2">{solicitud.nombre_especialidad}</td>
        <td className="border px-4 py-2">{formattedDate}</td>
        <td  className={`inline-block px-1 py-1 rounded-lg ${getEstadoColor(solicitud.estado_solicitud)}`} 
    style={getEstadoColorStyle(solicitud.estado_solicitud)}>
    {solicitud.estado_solicitud}
        </td>
        <td className="border px-4 py-2">
          <button
            onClick={() => handleViewModal(solicitud)}
            className="bg-[#365b77] text-white px-4 py-2 rounded-md hover:bg-[#7498b6]"
          >
            Ver
          </button>
        </td>
      </tr>
    );
  })}
</tbody>

      </table>
    </div>
  </div>

  {/* Paginación */}
  <div className="flex justify-center mt-4">
    <button onClick={() => setPage(page - 1)} disabled={page === 1} className="bg-[#365b77] hover:bg-[#7498b6] text-white font-bold py-2 px-4 rounded-l">
      Anterior
    </button>
    <span className="mx-4">Página {page}</span>
    <button onClick={() => setPage(page + 1)} disabled={endIndex >= sortedSolicitudes.length} className="bg-[#365b77] hover:bg-[#7498b6] text-white font-bold py-2 px-4 rounded-r">
      Siguiente
    </button>
  </div>

</div>

      </Layout>
    );
  }
  
  export default Solicitudes;
  
