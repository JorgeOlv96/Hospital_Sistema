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
  const [open, setOpen] = useState(false); // Estado para controlar si la modal de nueva solicitud está abierta
  const [selectedAppointment, setSelectedAppointment] = useState(null); // Estado para almacenar la solicitud seleccionada

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
    setOpen(true); // Abre la modal al hacer clic en el botón "Ver"
  };

  const boxes = [
    {
      id: 1,
      title: 'Pacientes de Hoy',
      value: '10',
      color: ['bg-subMain', 'text-subMain'],
      icon: BiTime,
    },
    {
      id: 2,
      title: 'Pacientes del mes',
      value: '230',
      color: ['bg-orange-500', 'text-orange-500'],
      icon: BsCalendarMonth,
    },
    {
      id: 3,
      title: 'Pacientes del año',
      value: '1,500',
      color: ['bg-green-500', 'text-green-500'],
      icon: MdOutlineCalendarMonth,
    },
  ];

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
          appointmentId={selectedAppointment.id_solicitud} // Pasar el appointmentId
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {boxes.map((box) => (
          <div
            key={box.id}
            className="bg-white flex-btn gap-4 rounded-xl border-[1px] border-border p-5"
          >
            <div className="w-3/4">
              <h2 className="text-sm font-medium">{box.title}</h2>
              <h2 className="text-xl my-6 font-medium">{box.value}</h2>
            </div>
            <div
              className={`w-10 h-10 flex-colo rounded-md text-white text-md ${box.color[0]}`}
            >
              <box.icon />
            </div>
          </div>
        ))}
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
              {solicitudes.map((solicitud) => (
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
                      className="bg-[#001B58] text-white px-4 py-2 rounded"
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
    </Layout>
  );
}

export default Solicitudes;
