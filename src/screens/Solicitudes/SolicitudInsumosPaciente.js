import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../Layout";
import InsumosSelect from "./InsumosSelect";
import MedicamentoSelect from "./MedicamentoSelect";
import AdicionalSelect from "./AdicionalSelect";
import PaquetesSelect from "./PaqueteSelect";
import { useParams } from "react-router-dom";

const SectionWithInsumos = ({ title, type, onAddInsumo, SelectComponent }) => {
  const [selectedInsumos, setSelectedInsumos] = useState([]);

  const handleSelectInsumo = (insumo) => {
    if (insumo && !selectedInsumos.find((item) => item.value === insumo.value)) {
      const nuevoInsumo = { ...insumo, cantidad: 1 };
      setSelectedInsumos((prev) => [...prev, nuevoInsumo]);
      onAddInsumo(type, nuevoInsumo);
    }
  };

  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedInsumos = [...selectedInsumos];
    updatedInsumos[index].cantidad = newQuantity;
    setSelectedInsumos(updatedInsumos);
    onAddInsumo(type, updatedInsumos[index]);
  };

  const handleRemoveInsumo = (index) => {
    const updatedInsumos = selectedInsumos.filter((_, i) => i !== index);
    setSelectedInsumos(updatedInsumos);
    onAddInsumo(type, null, index); // Indicar que se eliminó un insumo
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <SelectComponent onSelect={handleSelectInsumo} />

      {selectedInsumos.length > 0 && (
        <div className="mt-4 space-y-4">
          {selectedInsumos.map((insumo, index) => (
            <div
              key={insumo.value || index}
              className="flex items-center justify-between border rounded-lg p-2 bg-gray-100"
            >
              <div>
                <p className="font-medium">{insumo.label}</p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min={1}
                  value={insumo.cantidad}
                  onChange={(e) =>
                    handleQuantityChange(index, Number(e.target.value))
                  }
                  className="border rounded p-1 w-16 text-center"
                />
                <button
                  className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                  onClick={() => handleRemoveInsumo(index)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


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
  const [resumenMedico, setResumenMedico] = useState("");
  const [selectedInsumos, setSelectedInsumos] = useState({
    materialAdicional: [],
    materialExterno: [],
    servicios: [],
    paquetes: [],
    medicanentos: [],
  });



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
    const datosSolicitud = {
      material_adicional: selectedInsumos.materialAdicional.map(i => `${i.clave} - ${i.descripcion}`).join(", "),
      cantidad_adicional: selectedInsumos.materialAdicional.map(i => i.cantidad).join(", "),
      material_externo: selectedInsumos.materialExterno.map(i => `${i.clave} - ${i.descripcion}`).join(", "),
      cantidad_externo: selectedInsumos.materialExterno.map(i => i.cantidad).join(", "),
      servicios: selectedInsumos.servicios.map(i => `${i.clave} - ${i.descripcion}`).join(", "),
      cantidad_servicios: selectedInsumos.servicios.map(i => i.cantidad).join(", "),
      nombre_paquete: selectedInsumos.paquetes.map(i => `${i.clave} - ${i.descripcion}`).join(", "),
      cantidad_paquete: selectedInsumos.paquetes.map(i => i.cantidad).join(", "),
      medicamentos: selectedInsumos.medicanentos.map(i => `${i.clave} - ${i.descripcion}`).join(", "),
      cantidad_medicamento: selectedInsumos.medicanentos.map(i => i.cantidad).join(", "),
      resumen_medico: resumenMedico,
      estado_insumos: "Sin solicitud"
    };

    try {
      await axios.patch(
        `${baseURL}/api/insumos/solicitudes-insumos/${appointmentId}`,
        datosSolicitud
      );
      alert("Solicitud guardada con éxito.");
    } catch (error) {
      console.error("Error al guardar solicitud:", error);
      alert("Ocurrió un error al guardar la solicitud.");
    }
  };


// Actualizar la función handleAddInsumo
const handleAddInsumo = (type, insumo, removeIndex = null) => {
  setSelectedInsumos((prev) => {
    const updated = { ...prev };

    if (removeIndex !== null) {
      updated[type] = updated[type].filter((_, index) => index !== removeIndex);
    } else if (insumo) {
      updated[type] = [...updated[type], insumo];
    }

    return updated;
  });
};

  const renderSelectedInsumos = (type) => {
    return selectedInsumos[type].length === 0 ? (
      <p className="text-gray-500 italic">No hay insumos seleccionados</p>
    ) : (
      <div className="space-y-2">
        {selectedInsumos[type].map((insumo, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
            <div>
              <p className="font-medium">{insumo.clave} - {insumo.descripcion}</p>
              <p className="text-sm text-gray-600">Cantidad: {insumo.cantidad}</p>
            </div>
            <button
              onClick={() => handleEliminarInsumo(type, index)}
              className="text-red-600 hover:text-red-800 px-2 py-1"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    );
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

  <div className="w-full mb-4">
  <label htmlFor="resumenMedico" className="block font-semibold text-gray-700 mb-2">
    Resumen Médico:
  </label>
  <textarea
    id="resumenMedico"
    value={resumenMedico}
    onChange={(e) => setResumenMedico(e.target.value)}
    className="w-full p-3 border rounded-lg bg-white"
    placeholder="Escribe el resumen médico aquí..."
    rows="4"
  ></textarea>
</div>

  <div className="grid grid-cols-2 gap-4 mb-6">
  <SectionWithInsumos
    title="Material Adicional"
    type="materialAdicional"
    onAddInsumo={handleAddInsumo}
    SelectComponent={AdicionalSelect}
  />
  <SectionWithInsumos
    title="Material Externo"
    type="materialExterno"
    onAddInsumo={handleAddInsumo}
    SelectComponent={InsumosSelect}
  />
</div>

{/* Lista de insumos seleccionados */}
<div className="grid grid-cols-2 gap-4 mb-6">
  <SectionWithInsumos
    title="Servicios"
    type="servicios"
    onAddInsumo={handleAddInsumo}
    SelectComponent={InsumosSelect}
  />
  <SectionWithInsumos
    title="Paquetes"
    type="paquetes"
    onAddInsumo={handleAddInsumo}
    SelectComponent={PaquetesSelect}
  />
</div>

{/* Último div con margen superior agregado */}
<div className="grid grid-cols-2 gap-4 mt-6">
  <SectionWithInsumos
    title="Medicamentos"
    type="medicamentos"
    onAddInsumo={handleAddInsumo}
    SelectComponent={MedicamentoSelect}
  />
</div>

      {/* Lista de insumos seleccionados */}
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Insumos Seleccionados</h3>
          {["materialAdicional", "materialExterno", "servicios", "paquetes"].map((type) => (
            <div key={type} className="mb-4">
              <h4 className="font-semibold text-gray-700 capitalize">
                {type.replace(/([A-Z])/g, " $1")}
              </h4>
              {renderSelectedInsumos(type)}
            </div>
          ))}
        </div>


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
