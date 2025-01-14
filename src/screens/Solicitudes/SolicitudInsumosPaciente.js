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
    updatedInsumos[index] = {
      ...updatedInsumos[index],
      cantidad: newQuantity
    };
    setSelectedInsumos(updatedInsumos);
    onAddInsumo(type, updatedInsumos[index], index, true);
  };

  const handleRemoveInsumo = (index) => {
    const updatedInsumos = selectedInsumos.filter((_, i) => i !== index);
    setSelectedInsumos(updatedInsumos);
    onAddInsumo(type, null, index);
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
    medicamentos: [],
  });
  
  // New state for managing insumo selection
  const [currentInsumoTypes, setCurrentInsumoTypes] = useState([]);
  const [showInsumoTypeModal, setShowInsumoTypeModal] = useState(false);

  const insumoTypes = [
    { type: "materialExterno", label: "Material Externo", component: InsumosSelect },
    { type: "materialAdicional", label: "Material Adicional", component: AdicionalSelect },
    { type: "servicios", label: "Servicio", component: InsumosSelect },
    { type: "medicamentos", label: "Medicamento", component: MedicamentoSelect },
    { type: "paquetes", label: "Paquete", component: PaquetesSelect }
  ];


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

  const handleOpenInsumoTypeModal = () => {
    setShowInsumoTypeModal(true);
  };

  const handleSelectInsumoType = (selectedType) => {
    // Evitar tipos duplicados
    if (!currentInsumoTypes.some(item => item.type === selectedType.type)) {
      setCurrentInsumoTypes(prev => [...prev, selectedType]);
    }
    setShowInsumoTypeModal(false);
  };

  const handleCloseInsumoTypeModal = () => {
    setCurrentInsumoTypes(null);
    setShowInsumoTypeModal(false);
  };

  const fetchInsumos = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/insumos/insumos-disponibles`);
      setInsumos(response.data.insumos);
    } catch (error) {
      console.error("Error al obtener insumos:", error);
    }
  };

  const fetchPaqueteInsumos = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/insumos/paquete-insumos`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener paquetes e insumos:", error);
      return [];
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

  const handleRemoveInsumoType = (typeToRemove) => {
    setCurrentInsumoTypes(prev => 
      prev.filter(item => item.type !== typeToRemove)
    );
    // También eliminar los insumos de este tipo
    setSelectedInsumos(prev => ({
      ...prev,
      [typeToRemove]: []
    }));
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
    const processInsumos = (insumos, tipo) => {
      if (!insumos) return [];
      return insumos.map((i) => ({
        tipo_insumo: tipo || 'desconocido',
        id_solicitud: appointmentId,
        insumo_id: i.id_insumo || i.value, // Ahora manejamos ambos casos
        nombre_insumo: i.clave ? `${i.clave} - ${i.descripcion}` : i.label,
        cantidad: i.cantidad,
        disponibilidad: 0,
        estado_insumos: 'Sin solicitud',
        detalle_paquete: null
      }));
    };
  
    const processPaquetes = (paquetes) => {
      if (!paquetes) return [];
    
      return paquetes.flatMap((p) => {
        if (!p.insumos || !Array.isArray(p.insumos)) {
          console.error(`El paquete ${p.label || "desconocido"} no contiene insumos válidos.`);
          return [];
        }
        
        return p.insumos.map((i) => ({
          tipo_insumo: 'paquete',
          id_solicitud: appointmentId,
          insumo_id: i.id_insumo || i.value, // Aseguramos que se use el id_insumo del insumo
          nombre_insumo: i.clave ? `${i.clave} - ${i.descripcion}` : i.label,
          cantidad: i.cantidad || 1,
          disponibilidad: 0,
          estado_insumos: 'Sin solicitud',
          detalle_paquete: p.label 
            ? `${p.label}${p.descripcion ? ` - ${p.descripcion}` : ''}`
            : null
        }));
      });
    };
    
  
    const insumos = [
      ...processInsumos(selectedInsumos.materialAdicional, "material_adicional"),
      ...processInsumos(selectedInsumos.materialExterno, "material_externo"),
      ...processInsumos(selectedInsumos.servicios, "servicio"),
      ...processInsumos(selectedInsumos.medicamentos, "medicamento"),
      ...processPaquetes(selectedInsumos.paquetes)
    ];
  
    if (insumos.length === 0) {
      alert("No se han seleccionado insumos para guardar.");
      return;
    }
  
    try {
      await axios.post(`${baseURL}/api/insumos/solicitudes-insumos/${appointmentId}`, {
        insumos,
        resumen_medico: resumenMedico // Incluimos el resumen médico
      });
      alert("Solicitud guardada con éxito.");
    } catch (error) {
      console.error("Error al guardar solicitud:", error);
      alert("Ocurrió un error al guardar la solicitud.");
    }
  };
  
  const handleAddInsumo = async (type, insumo, removeIndex = null, isQuantityUpdate = false) => {
    if (type === 'paquetes' && insumo) {
      try {
        const paquetesConInsumos = await fetchPaqueteInsumos();
        const paqueteCompleto = paquetesConInsumos.find(
          p => p.paquete_id === insumo.value
        );
  
        if (paqueteCompleto) {
          const insumosDelPaquete = paqueteCompleto.insumos.map(insumo => ({
            value: insumo.insumo_id, // Guardamos el ID como value también
            id_insumo: insumo.insumo_id,
            clave: insumo.clave_insumo,
            descripcion: insumo.descripcion_insumo,
            cantidad: insumo.cantidad_default,
            paquete: {
              id: paqueteCompleto.paquete_id,
              nombre: paqueteCompleto.nombre_paquete,
              descripcion: paqueteCompleto.descripcion_paquete
            }
          }));
  
          setSelectedInsumos(prev => ({
            ...prev,
            [type]: [...prev[type], {
              value: paqueteCompleto.paquete_id,
              id_insumo: paqueteCompleto.paquete_id,
              label: paqueteCompleto.nombre_paquete,
              descripcion: paqueteCompleto.descripcion_paquete,
              insumos: insumosDelPaquete
            }]
          }));
        }
      } catch (error) {
        console.error("Error al cargar los detalles del paquete:", error);
      }
    } else {
      setSelectedInsumos((prev) => {
        const updated = { ...prev };
  
        if (removeIndex !== null && !isQuantityUpdate) {
          updated[type] = updated[type].filter((_, index) => index !== removeIndex);
        } else if (insumo && !isQuantityUpdate) {
          if (!updated[type].some(item => item.value === insumo.value)) {
            updated[type] = [...updated[type], {
              ...insumo,
              id_insumo: insumo.value // Aseguramos que id_insumo siempre esté presente
            }];
          }
        } else if (isQuantityUpdate && insumo) {
          updated[type] = updated[type].map((item, index) => 
            index === removeIndex ? { ...item, cantidad: insumo.cantidad } : item
          );
        }
  
        return updated;
      });
    }
  };
  
  

  const renderSelectedInsumos = (type) => {
    if (type === 'paquetes') {
      return selectedInsumos[type].length === 0 ? (
        <p className="text-gray-500 italic">No hay paquetes seleccionados</p>
      ) : (
        <div className="space-y-4">
          {selectedInsumos[type].map((paquete, paqueteIndex) => (
            <div key={paqueteIndex} className="bg-gray-100 rounded-lg p-4">
              <div className="mb-3">
                <h5 className="text-lg font-semibold">{paquete.label}</h5>
                <p className="text-sm text-gray-600">Insumos incluidos:</p>
              </div>
              <div className="space-y-2">
                {paquete.insumos.map((insumo, insumoIndex) => (
                  <div 
                    key={insumoIndex} 
                    className="flex justify-between items-center bg-white p-2 rounded"
                  >
                    <div>
                      <p className="font-medium">{insumo.clave} - {insumo.descripcion}</p>
                      <p className="text-sm text-gray-600">Cantidad: {insumo.cantidad}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

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
  
  const renderInsumoTypeModal = () => {
    return showInsumoTypeModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-semibold mb-4">Seleccione el tipo de insumo</h2>
          <div className="space-y-2">
            {insumoTypes
              .filter(type => 
                !currentInsumoTypes.some(currentType => currentType.type === type.type)
              )
              .map((item) => (
                <button
                  key={item.type}
                  onClick={() => handleSelectInsumoType(item)}
                  className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                  {item.label}
                </button>
              ))}
            <button
              onClick={() => setShowInsumoTypeModal(false)}
              className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 mt-4"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  };


  if (loading) return <div>Cargando...</div>;

  const CurrentSelect = currentInsumoTypes?.component;

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

<div className="mt-6 flex items-center space-x-4">
          <button
            onClick={handleOpenInsumoTypeModal}
            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700"
          >
            Agregar Insumo
          </button>
        </div>

        {currentInsumoTypes.map((insumoType) => {
          const CurrentSelect = insumoType.component;
          return (
            <SectionWithInsumos
              key={insumoType.type}
              title={`Agregar ${insumoType.label}`}
              type={insumoType.type}
              onAddInsumo={handleAddInsumo}
              SelectComponent={CurrentSelect}
              onRemove={handleRemoveInsumoType}
            />
          );
        })}

      {/* Lista de insumos seleccionados */}
      <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Insumos Seleccionados</h3>
          {Object.keys(selectedInsumos).map((type) => (
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

        {renderInsumoTypeModal()}
      </div>
      </div>
    </Layout>
  );
};

export default SolicitudInsumosPaciente;
