import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../Layout";
import InsumosSelect from "./InsumosSelect";
import { useParams } from "react-router-dom";

const SolicitudInsumosPaciente = () => {
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";
  const { appointmentId } = useParams();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insumos, setInsumos] = useState([]);
  const [paquetes, setPaquetes] = useState([]);
  const [insumosSeleccionados, setInsumosSeleccionados] = useState([]);
  const [paquetesSeleccionados, setPaquetesSeleccionados] = useState([]);
  const [mostrarListaInsumos, setMostrarListaInsumos] = useState(false);
  const [mostrarListaPaquetes, setMostrarListaPaquetes] = useState(false);
  const [insumosAutocompletado, setInsumosAutocompletado] = useState([]);
  const [paquetesAutocompletado, setPaquetesAutocompletado] = useState([]);
  const [insumoBusqueda, setInsumoBusqueda] = useState("");
  const [paqueteBusqueda, setPaqueteBusqueda] = useState("");

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

  const fetchPaquetes = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/insumos/paquetes`);
      setPaquetes(response.data);
    } catch (error) {
      console.error("Error al obtener paquetes:", error);
    }
  };


  const handleAgregarInsumos = () => {
    setMostrarListaInsumos(true);
  };

  const handleAceptarInsumos = (insumos) => {
    const nuevosInsumos = insumos.map((insumo) => ({
      nombre: insumo.label, // Se asegura de extraer el nombre correcto
      id_insumo: insumo.value,
      cantidad: 1,
    }));
    setInsumosSeleccionados((prev) => [...prev, ...nuevosInsumos]);
    setMostrarListaInsumos(false);
  };
  const handleEliminarInsumo = (index) => {
    const updatedInsumos = [...insumosSeleccionados];
    updatedInsumos.splice(index, 1);
    setInsumosSeleccionados(updatedInsumos);
  };

  const handleAgregarPaquetes = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/insumos/paquetes`);
      setPaquetesAutocompletado(response.data);
      setMostrarListaPaquetes(true);
    } catch (error) {
      console.error("Error al obtener paquetes:", error);
    }
  };

  const handleSeleccionarInsumo = (insumo) => {
    setInsumosSeleccionados([...insumosSeleccionados, { ...insumo, cantidad: 1 }]);
    setMostrarListaInsumos(false);
  };

  const handleCantidadInsumo = (index, cantidad) => {
    const updatedInsumos = [...insumosSeleccionados];
    updatedInsumos[index].cantidad = cantidad;
    setInsumosSeleccionados(updatedInsumos);
  };

  const handleCantidadPaquete = (index, cantidad) => {
    const updatedPaquetes = [...paquetesSeleccionados];
    updatedPaquetes[index].cantidad = cantidad;
    setPaquetesSeleccionados(updatedPaquetes);
  };

  const handleSeleccionarPaquete = (paquete) => {
    setPaquetesSeleccionados([...paquetesSeleccionados, { ...paquete, cantidad: 1 }]);
    setMostrarListaPaquetes(false);
  };

  const handleGuardarSolicitud = async () => {
    const nombreInsumos = insumosSeleccionados.map((insumo) => insumo.nombre).join(', ');
    const cantidadesInsumos = insumosSeleccionados.map((insumo) => insumo.cantidad).join(', ');
    const nombrePaquetes = paquetesSeleccionados.map((paquete) => paquete.nombre).join(', ');
    const cantidadesPaquetes = paquetesSeleccionados.map((paquete) => paquete.cantidad).join(', ');

    const datosSolicitud = {
      folio: patientData.folio,
      nombre_insumos: nombreInsumos,
      cantidades_insumos: cantidadesInsumos,
      nombre_paquetes: nombrePaquetes,
      cantidades_paquetes: cantidadesPaquetes,
      estado: 'Sin solicitud'
    };

    try {
      const response = await axios.post(`${baseURL}/api/insumos/solicitudes-insumos`, datosSolicitud);
      alert("Solicitud guardada con éxito");
    } catch (error) {
      console.error("Error al guardar solicitud:", error);
    }
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
        {mostrarListaInsumos && (
  <div className="bg-gray-300 p-6 rounded-lg shadow-lg mt-4">
    <h3 className="text-xl font-semibold mb-4">Seleccionar Insumos</h3>
    <InsumosSelect onSelect={handleAceptarInsumos} />
  </div>
)}

       {/* Lista de insumos seleccionados */}
       <div className="mt-6">
          <h3 className="font-semibold text-lg mb-4">Insumos Seleccionados</h3>
          <ul>
            {insumosSeleccionados.map((insumo, index) => (
              <li
                key={index}
                className="flex items-center justify-between bg-white p-3 rounded-lg shadow-md mb-2"
              >
                <div>
                  <p className="font-semibold">{insumo.nombre}</p>
                  <input
                    type="number"
                    min="1"
                    value={insumo.cantidad}
                    onChange={(e) => handleCantidadInsumo(index, parseInt(e.target.value, 10))}
                    className="mt-2 border p-2 rounded-lg w-20"
                  />
                </div>
                <button
                  onClick={() => handleEliminarInsumo(index)}
                  className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-red-700"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </div>


        <div className="mt-6 flex justify-end">
          <button
            onClick={handleAgregarPaquetes}
            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700"
          >
            Agregar Paquetes
          </button>
        </div>
        {mostrarListaPaquetes && (
          <div className="bg-gray-300 p-6 rounded-lg shadow-lg mt-4">
            <h3 className="text-xl font-semibold mb-4">Seleccionar Paquetes</h3>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar paquete..."
                value={paqueteBusqueda}
                onChange={(e) => setPaqueteBusqueda(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <ul className="mt-2 bg-white p-2 rounded-lg shadow-md">
                {paquetesAutocompletado
                  .filter((paquete) =>
                    paquete.nombre.toLowerCase().includes(paqueteBusqueda.toLowerCase())
                  )
                  .map((paquete, index) => (
                    <li
                      key={paquete.id}
                      className="cursor-pointer hover:bg-gray-200 p-2 rounded"
                      onClick={() => handleSeleccionarPaquete(paquete)}
                    >
                      {paquete.nombre}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleGuardarSolicitud}
            className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-green-700"
          >
            Guardar Solicitud
          </button>
        </div>

  </div>
  </div>
    </Layout>
  );
};

export default SolicitudInsumosPaciente;
