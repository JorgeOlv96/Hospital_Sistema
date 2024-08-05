import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../Layout";
import AddAppointmentModalInsumos from "../../components/Modals/AddApointmentModalInsumos";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function SolicitudesInsumos() {
    const [solicitudes, setSolicitudes] = useState([]);
    const [open, setOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";

    useEffect(() => {
        const fetchSolicitudes = async () => {
            try {
                const response = await axios.get(`${baseURL}/api/solicitudes`);
                if (response.status !== 200) {
                    throw new Error("Network response was not ok");
                }
                const data = response.data;

                console.log("Data received from API:", data); // Verificar los datos recibidos

                const filteredData = data.filter(
                    (solicitud) =>
                        solicitud.estado_solicitud === "Pendiente" &&
                        solicitud.req_insumo &&
                        solicitud.req_insumo.trim().toLowerCase() === "si"
                );

                console.log("Filtered Data:", filteredData); // Verificar los datos filtrados

                setSolicitudes(filteredData);
            } catch (error) {
                console.error("Error fetching solicitudes:", error);
                toast.error("Error fetching solicitudes");
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

    return (
        <Layout>
        {open && selectedAppointment && (
            <AddAppointmentModalInsumos
              datas={solicitudes}
              isOpen={open}
              closeModal={handleModal}
              appointmentId={selectedAppointment.id_solicitud}
            />
          )}

            <div className="flex flex-col gap-4 mb-6">
                <h1 className="text-xl font-semibold">Solicitudes Insumos</h1>
                <table className="min-w-full divide-y divide-white-200">
                    <thead className="bg-[#365b77] text-white">
                        <tr className="border border-gray-300 md:border-none block md:table-row absolute -top-full md:top-auto -left-full md:left-auto md:relative">
                            <th className="bg-dark-blue p-2 text-white font-bold md:border md:border-gray-300 text-left block md:table-cell">Folio</th>
                            <th className="bg-dark-blue p-2 text-white font-bold md:border md:border-gray-300 text-left block md:table-cell">Nombre</th>
                            <th className="bg-dark-blue p-2 text-white font-bold md:border md:border-gray-300 text-left block md:table-cell">Especialidad</th>
                            <th className="bg-dark-blue p-2 text-white font-bold md:border md:border-gray-300 text-left block md:table-cell">Fecha</th>
                            <th className="bg-dark-blue p-2 text-white font-bold md:border md:border-gray-300 text-left block md:table-cell">Estado</th>
                            <th className="bg-dark-blue p-2 text-white font-bold md:border md:border-gray-300 text-left block md:table-cell">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="block md:table-row-group">
                        {solicitudes.map((solicitud) => (
                            <tr key={solicitud.id_solicitud} className="bg-white border border-gray-300 md:border-none block md:table-row">
                                <td className="p-2 md:border md:border-gray-300 text-left block md:table-cell">{solicitud.folio}</td>
                                <td className="p-2 md:border md:border-gray-300 text-left block md:table-cell">{solicitud.nombre_paciente} {solicitud.ap_paterno} {solicitud.ap_materno}</td>
                                <td className="p-2 md:border md:border-gray-300 text-left block md:table-cell">{solicitud.nombre_especialidad}</td>
                                <td className="p-2 md:border md:border-gray-300 text-left block md:table-cell">{solicitud.fecha_solicitada}</td>
                                <td className="p-2 md:border md:border-gray-300 text-left block md:table-cell">{solicitud.estado_solicitud}</td>
                                <td className="p-2 md:border md:border-gray-300 text-left block md:table-cell">
                                <button
                                    onClick={() => handleViewModal(solicitud)}
                                    className="bg-[#365b77] text-white px-4 py-2 rounded-md hover:bg-[#7498b6]"
                                  >
                                    Ver
                                  </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ToastContainer />
        </Layout>
    );
}

export default SolicitudesInsumos;
