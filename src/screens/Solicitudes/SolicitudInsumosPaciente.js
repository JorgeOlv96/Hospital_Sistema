import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Layout from "../../Layout";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../AuthContext";

const SolicitudInsumosPaciente = () => {
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";
  const { appointmentId } = useParams();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insumos, setInsumos] = useState([]);
  const [mostrarInsumos, setMostrarInsumos] = useState(false);
  const [insumosSeleccionados, setInsumosSeleccionados] = useState([]);

  useEffect(() => {
    const fetchAppointmentData = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/solicitudes/${appointmentId}`);
        setPatientData(response.data);
      } catch (error) {
        console.error("Error fetching appointment data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointmentData();
  }, [appointmentId, baseURL]);

  const fetchInsumos = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/insumos/insumos-disponibles`);
      setInsumos(response.data.insumos);
    } catch (error) {
      console.error("Error al obtener insumos:", error);
    }
  };

  const handleAgregarInsumos = () => {
    fetchInsumos(); // Cargar insumos al hacer clic en "Agregar Insumos"
    setMostrarInsumos(true);
  };

  const handleSeleccionarInsumo = (insumo) => {
    setInsumosSeleccionados([...insumosSeleccionados, insumo]);
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <Layout>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Solicitud de Insumos para Paciente</h2>

        {/* Información del paciente */}
        <div className="bg-gray-400 p-6 rounded-lg shadow-lg mb-4">
  <div className="grid grid-cols-2 gap-4 mb-4">
    <div className="w-full">
      <label className="block font-semibold text-gray-700 mb-2">Folio:</label>
      <p className="bg-white p-3 rounded-lg">{patientData?.folio || "N/A"}</p>
    </div>
    <div className="w-full">
      <label className="block font-semibold text-gray-700 mb-2">Teléfono de contacto:</label>
      <p className="bg-white p-3 rounded-lg">{patientData?.tel_contacto || "N/A"}</p>
    </div>
  </div>

  <div className="flex flex-wrap bg-gray-200 p-4 rounded-lg shadow-md mb-4">
    <div className="w-1/2 mb-2">
      <label className="block font-semibold text-gray-700 mb-2">Apellido paterno:</label>
      <p className="bg-white p-3 rounded-lg">{patientData?.ap_paterno || "N/A"}</p>
    </div>
    <div className="w-1/2 mb-2">
      <label className="block font-semibold text-gray-700 mb-2">Apellido materno:</label>
      <p className="bg-white p-3 rounded-lg">{patientData?.ap_materno || "N/A"}</p>
    </div>
    <div className="w-1/2 mb-2">
      <label className="block font-semibold text-gray-700 mb-2">Nombre:</label>
      <p className="bg-white p-3 rounded-lg">{patientData?.nombre_paciente || "N/A"}</p>
    </div>
    <div className="w-1/2 mb-2">
      <label className="block font-semibold text-gray-700 mb-2">Sexo:</label>
      <p className="bg-white p-3 rounded-lg">{patientData?.sexo || "N/A"}</p>
    </div>
  </div>

  <div className="flex flex-wrap bg-gray-50 p-4 rounded-lg shadow-md mb-4">
    <div className="w-1/3 mb-2">
      <label className="block font-semibold text-gray-700 mb-2">Tipo de admisión:</label>
      <p className="bg-white p-3 rounded-lg">{patientData?.tipo_admision || "N/A"}</p>
    </div>
    <div className="w-1/3 mb-2">
      <label className="block font-semibold text-gray-700 mb-2">Tipo de intervención:</label>
      <p className="bg-white p-3 rounded-lg">{patientData?.tipo_intervencion || "N/A"}</p>
    </div>
    <div className="w-1/3 mb-2">
      <label className="block font-semibold text-gray-700 mb-2">Especialidad:</label>
      <p className="bg-white p-3 rounded-lg">{patientData?.nombre_especialidad || "N/A"}</p>
    </div>
  </div>

  <div className="flex flex-wrap bg-gray-50 p-4 rounded-lg shadow-md mb-4">
    <div className="w-1/2 mb-2">
      <label className="block font-semibold text-gray-700 mb-2">Fecha solicitada:</label>
      <p className="bg-white p-3 rounded-lg">{patientData?.fecha_solicitada || "N/A"}</p>
    </div>
    <div className="w-1/2 mb-2">
      <label className="block font-semibold text-gray-700 mb-2">Hora solicitada:</label>
      <p className="bg-white p-3 rounded-lg">{patientData?.hora_solicitada || "N/A"}</p>
    </div>
  </div>

  <div className="flex flex-wrap bg-gray-50 p-4 rounded-lg shadow-md mb-4">
    <div className="w-1/2 mb-2">
      <label className="block font-semibold text-gray-700 mb-2">Tiempo estimado de cirugía:</label>
      <p className="bg-white p-3 rounded-lg">{patientData?.tiempo_estimado || "N/A"}</p>
    </div>
    <div className="w-1/2 mb-2">
      <label className="block font-semibold text-gray-700 mb-2">Turno solicitado:</label>
      <p className="bg-white p-3 rounded-lg">{patientData?.turno_solicitado || "N/A"}</p>
    </div>
  </div>

  <div className="flex flex-wrap bg-gray-50 p-4 rounded-lg shadow-md mb-4">
    <div className="w-1/2 mb-2">
      <label className="block font-semibold text-gray-700 mb-2">Sala solicitada:</label>
      <p className="bg-white p-3 rounded-lg">{patientData?.sala_quirofano || "N/A"}</p>
    </div>
    <div className="w-1/2 mb-2">
      <label className="block font-semibold text-gray-700 mb-2">Procedimientos que se realizarán al paciente:</label>
      <p className="bg-white p-3 rounded-lg">{patientData?.procedimientos_paciente || "N/A"}</p>
    </div>
  </div>

  <div className="flex flex-wrap bg-gray-50 p-4 rounded-lg shadow-md mb-4">
    <div className="w-full">
      <label className="block font-semibold text-gray-700 mb-2">Cirujano encargado:</label>
      <p className="bg-white p-3 rounded-lg">{patientData?.nombre_cirujano || "N/A"}</p>
    </div>
  </div>

  <div className="mt-6 flex justify-end">
          <button
            onClick={handleAgregarInsumos}
            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700"
          >
            Agregar Insumos
          </button>
        </div>
        {mostrarInsumos && (
          <div className="bg-gray-300 p-6 rounded-lg shadow-lg mt-4">
            <h3 className="text-xl font-semibold mb-4">Seleccionar Insumos</h3>
            <ul className="space-y-2">
              {insumos.map((insumo) => (
                <li key={insumo.id} className="flex justify-between items-center">
                  <span>{insumo.nombre}</span>
                  <button
                    onClick={() => handleSeleccionarInsumo(insumo)}
                    className="bg-green-500 text-white px-3 py-1 rounded-lg"
                  >
                    Seleccionar
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <h4 className="text-lg font-semibold">Insumos Seleccionados:</h4>
              <ul className="list-disc ml-5">
                {insumosSeleccionados.map((insumo, index) => (
                  <li key={index}>{insumo.nombre}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

  </div>
  </div>
    </Layout>
  );
};

export default SolicitudInsumosPaciente;

