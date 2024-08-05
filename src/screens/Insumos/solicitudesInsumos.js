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
    const [currentPage, setCurrentPage] = useState(0);
    const [sortConfig, setSortConfig] = useState({ key: 'fecha_solicitada', direction: 'asc' });
    const itemsPerPage = 10;

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

                // Ordenar los datos por fecha_solicitada más próxima al inicio
                const sortedData = filteredData.sort((a, b) => new Date(a.fecha_solicitada) - new Date(b.fecha_solicitada));

                setSolicitudes(sortedData);
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

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        
        const sortedSolicitudes = [...solicitudes].sort((a, b) => {
            if (direction === 'asc') {
                return a[key] > b[key] ? 1 : -1;
            } else {
                return a[key] < b[key] ? 1 : -1;
            }
        });
        setSolicitudes(sortedSolicitudes);
    };

    const paginatedSolicitudes = solicitudes.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    const totalPages = Math.ceil(solicitudes.length / itemsPerPage);

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
                            <th onClick={() => handleSort('folio')} className="p-2 cursor-pointer">Folio</th>
                            <th onClick={() => handleSort('nombre_paciente')} className="p-2 cursor-pointer">Nombre</th>
                            <th onClick={() => handleSort('nombre_especialidad')} className="p-2 cursor-pointer">Especialidad</th>
                            <th onClick={() => handleSort('fecha_solicitada')} className="p-2 cursor-pointer">Fecha</th>
                            <th onClick={() => handleSort('estado_solicitud')} className="p-2 cursor-pointer">Estado</th>
                            <th className="p-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="block md:table-row-group">
                        {paginatedSolicitudes.map((solicitud) => (
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
                <div className="flex justify-between mt-4">
                    <button 
                        disabled={currentPage === 0} 
                        onClick={() => setCurrentPage(currentPage - 1)} 
                        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                        Anterior
                    </button>
                    <button 
                        disabled={currentPage >= totalPages - 1} 
                        onClick={() => setCurrentPage(currentPage + 1)} 
                        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                        Siguiente
                    </button>
                </div>
            </div>
            <ToastContainer />
        </Layout>
    );
}

export default SolicitudesInsumos;
