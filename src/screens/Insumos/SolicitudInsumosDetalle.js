import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../Layout";
import $ from 'jquery';
import { useParams, useNavigate } from "react-router-dom";
import { Check, X, Trash2, Package } from "lucide-react";
import jsPDF from 'jspdf';
import { Alert } from "../../components/ui/alert";
import InsumosSelect from "../Solicitudes/InsumosSelect";
import AdicionalSelect from "../Solicitudes/MedicamentoSelect";
import PaquetesSelect from "../Solicitudes/PaqueteSelect";

const PatientInfoBlock = ({ solicitudData,  onCommentChange  }) => {
  const [showResumen, setShowResumen] = React.useState(false);
  const [comentarios, setComentarios] = React.useState('');

  const patientData = Array.isArray(solicitudData) ? solicitudData[0] : solicitudData;

  return (
    <div className="mb-6">
      {/* Información del paciente */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-lg mb-6">
  <h3 className="text-xl font-semibold mb-4">Información del Paciente</h3>
  <div className="grid grid-cols-3 gap-4">
    <div className="w-full">
      <label className="block font-semibold text-gray-700 mb-2">Folio:</label>
      <p className="bg-white p-3 rounded-lg">{patientData?.folio || "N/A"}</p>
    </div>
    <div className="w-full">
      <label className="block font-semibold text-gray-700 mb-2">Nombre:</label>
      <p className="bg-white p-3 rounded-lg">
        {`${patientData?.nombre_paciente || ""} ${patientData?.ap_paterno || ""} ${patientData?.ap_materno || ""}`}
      </p>
    </div>
    <div className="w-full">
      <label className="block font-semibold text-gray-700 mb-2">Sexo:</label>
      <p className="bg-white p-3 rounded-lg">{patientData?.sexo || "N/A"}</p>
    </div>
    <div className="w-full">
      <label className="block font-semibold text-gray-700 mb-2">Tipo de Admisión:</label>
      <p className="bg-white p-3 rounded-lg">{patientData?.tipo_admision || "N/A"}</p>
    </div>
    <div className="w-full">
      <label className="block font-semibold text-gray-700 mb-2">Tipo de Intervención:</label>
      <p className="bg-white p-3 rounded-lg">{patientData?.tipo_intervencion || "N/A"}</p>
    </div>
    <div className="w-full">
      <label className="block font-semibold text-gray-700 mb-2">Especialidad:</label>
      <p className="bg-white p-3 rounded-lg">{patientData?.nombre_especialidad || "N/A"}</p>
    </div>
    <div className="w-full">
      <label className="block font-semibold text-gray-700 mb-2">Fecha Solicitada:</label>
      <p className="bg-white p-3 rounded-lg">{patientData?.fecha_solicitada || "N/A"}</p>
    </div>
    <div className="w-full">
      <label className="block font-semibold text-gray-700 mb-2">Hora Solicitada:</label>
      <p className="bg-white p-3 rounded-lg">{patientData?.hora_solicitada || "N/A"}</p>
    </div>
    <div className="w-full">
      <label className="block font-semibold text-gray-700 mb-2">Sala/Quirófano:</label>
      <p className="bg-white p-3 rounded-lg">{patientData?.sala_quirofano || "N/A"}</p>
    </div>
    <div className="w-full">
      <label className="block font-semibold text-gray-700 mb-2">Cirujano:</label>
      <p className="bg-white p-3 rounded-lg">{patientData?.nombre_cirujano || "N/A"}</p>
    </div>
    <div className="w-full">
      <label className="block font-semibold text-gray-700 mb-2">Estado:</label>
      <p className="bg-white p-3 rounded-lg">{patientData?.estado_insumos || "N/A"}</p>
    </div>
  </div>

  {/* Procedimiento principal en un solo "renglón" */}
  <div className="mt-4">
    <label className="block font-semibold text-gray-700 mb-2">Procedimiento principal planeado (CIE-9):</label>
    <textarea
      className="bg-white p-3 rounded-lg w-full cursor-default"
      readOnly
      rows={2}
      value={patientData?.procedimientos_paciente || "N/A"}
    ></textarea>
  </div>

  {/* Diagnóstico en un solo "renglón" */}
  <div className="mt-4">
    <label className="block font-semibold text-gray-700 mb-2">Diagnóstico:</label>
    <textarea
      className="bg-white p-3 rounded-lg w-full cursor-default"
      readOnly
      rows={2}
      value={patientData?.diagnostico || "N/A"}
    ></textarea>
  </div>
</div>


      <div className="bg-gray-50 p-6 rounded-lg shadow-lg mb-6">
        <button
          onClick={() => setShowResumen(!showResumen)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          {showResumen ? "Ocultar Resumen Médico" : "Mostrar Resumen Médico"}
        </button>

        {showResumen && (
          <div className="mt-4">
            <label className="block font-semibold text-gray-700 mb-2">Resumen médico:</label>
            <textarea
              className="bg-gray-200 p-3 rounded-lg w-full"
              value={patientData?.resumen_medico || "N/A"}
              readOnly
              rows={5}
            />
          </div>
        )}
      </div>

    <div className="bg-gray-50 p-6 rounded-lg shadow-lg">
      <label className="block font-semibold text-gray-700 mb-2">Comentarios adicionales:</label>
      <textarea
        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        rows={3}
        placeholder="Agregar comentarios sobre los insumos..."
        value={comentarios}
        onChange={onCommentChange}
      />
    </div>
    </div>
  );
};

const PackageInsumosModal = ({ packageName, packageInsumos, onClose }) => {
  if (!packageInsumos) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold">Insumos del Paquete: {packageName}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {packageInsumos.length > 0 ? (
          <div className="space-y-4">
            {packageInsumos.map((insumo, index) => (
              <div 
                key={index} 
                className="bg-gray-100 p-4 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-lg">{insumo.id}</p>
                  <p className="text-sm text-gray-600">Insumo: {insumo.nombre_insumo}</p>
                </div>
                <div className="font-semibold text-blue-600 text-lg">
                  Cantidad: {insumo.cantidad}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No se encontraron insumos para este paquete.</p>
        )}
      </div>
    </div>
  );
};

const InsumoBlock = ({
  insumos = [],
  handleCantidadChange,
  handleAgregarInsumo,
  toggleDisponibilidad,
  handleEliminarInsumo,
  title,
  showPackageInfo = false,
  packageInsumos = null,
  packageName = "",
  tipo_insumo // Nuevo prop para identificar el tipo de insumo
}) => {
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showAddInsumo, setShowAddInsumo] = useState(false);

  const handleInsumoSelect = (selectedInsumo) => {
    const nuevoInsumo = {
      id: selectedInsumo.value, // Cambiar id por value
      nombre: `${selectedInsumo.clave} - ${selectedInsumo.descripcion}`, // Construir el nombre con clave y descripción
      cantidad: 1,
      disponible: true
    };
    
    handleAgregarInsumo(tipo_insumo, nuevoInsumo);
    setShowAddInsumo(false);
  };

  const renderSelectComponent = () => {
    switch (tipo_insumo) {
      case 'material_adicional':
        return <AdicionalSelect onSelect={handleInsumoSelect} />;
      case 'material_externo':
      case 'servicios':
        return <InsumosSelect onSelect={handleInsumoSelect} />;
      case 'paquete':
        return <PaquetesSelect onSelect={handleInsumoSelect} />;
      case 'medicamentos':
        return <AdicionalSelect onSelect={handleInsumoSelect} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-lg mb-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="space-y-4">
          {insumos.map((insumo) => (
            <div
              key={insumo.id}
              className="flex items-center space-x-4 bg-white p-3 rounded-lg"
            >
              <span className="flex-grow">{insumo.nombre}</span>
              <input
                type="number"
                value={insumo.cantidad}
                onChange={(e) => handleCantidadChange(insumo.id, e.target.value)}
                min="1"
                className="w-24 p-2 border rounded"
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleDisponibilidad(insumo.id, true)}
                  className={`p-2 rounded ${
                    insumo.disponible ? "bg-green-100 border border-green-500" : "bg-gray-200"
                  }`}
                >
                  <Check className="text-green-600" />
                </button>
                <button
                  onClick={() => toggleDisponibilidad(insumo.id, false)}
                  className={`p-2 rounded ${
                    !insumo.disponible ? "bg-red-100 border border-red-500" : "bg-gray-200"
                  }`}
                >
                  <X className="text-red-600" />
                </button>
                <button
                  onClick={() => handleEliminarInsumo(insumo.id)}
                  className="p-2 rounded bg-red-100 hover:bg-red-200"
                >
                  <Trash2 className="text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setShowAddInsumo(!showAddInsumo)}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {showAddInsumo ? "Cancelar" : "Agregar insumo adicional"}
      </button>

      {/* Componente de selección cuando showAddInsumo es true */}
      {showAddInsumo && (
        <div className="mt-4">
          {renderSelectComponent()}
        </div>
      )}

      {showPackageInfo && packageName && (
        <div className="mb-4 bg-blue-50 p-4 rounded-lg flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold flex items-center">
              <Package className="mr-2 text-blue-600" />
              Paquete Seleccionado: {packageName}
            </h4>
          </div>
          {packageInsumos && (
            <button
              onClick={() => setShowPackageModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm flex items-center"
            >
              Ver Insumos del Paquete
            </button>
          )}
        </div>
      )}

      {showPackageModal && (
        <PackageInsumosModal
          packageName={packageName}
          packageInsumos={packageInsumos}
          onClose={() => setShowPackageModal(false)}
        />
      )}
    </div>
  );
};

const PackageBlock = ({ 
  packageData,
  onInsumoCantidadChange,
  onInsumoDisponibilidadChange,
  onInsumoEliminar
}) => {
  const [showInsumos, setShowInsumos] = useState(false);
  const [showAddInsumo, setShowAddInsumo] = useState(false);

  const handleInsumoSelect = (selectedInsumo) => {
    const nuevoInsumo = {
      id: selectedInsumo.value,
      nombre: `${selectedInsumo.clave} - ${selectedInsumo.descripcion}`,
      cantidad_default: 1,
      disponible: true
    };
    const paqueteActualizado = {
      ...packageData,
      insumos: [...packageData.insumos, nuevoInsumo]
    };
    onInsumoCantidadChange(packageData.id, nuevoInsumo.id, 1);
    setShowAddInsumo(false);
  };

  // Función para cambiar la disponibilidad de todos los insumos del paquete
  const handleChangeAllDisponibilidad = (disponible) => {
    packageData.insumos.forEach((insumo) => {
      onInsumoDisponibilidadChange(packageData.id, insumo.id, disponible);
    });
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-lg mb-6">
      <div className="mb-4 bg-blue-50 p-4 rounded-lg flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold flex items-center">
            <Package className="mr-2 text-blue-600" />
            Paquete: {packageData.nombre}
          </h4>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowInsumos(!showInsumos)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
          >
            {showInsumos ? "Ocultar Insumos" : "Ver Insumos"}
          </button>
          {/* Botón para marcar todos los insumos como disponibles */}
          <button
            onClick={() => handleChangeAllDisponibilidad(true)}
            className="p-2 rounded bg-green-100 hover:bg-green-200 border border-green-500"
          >
            <Check className="text-green-600" />
          </button>
          {/* Botón para marcar todos los insumos como no disponibles */}
          <button
            onClick={() => handleChangeAllDisponibilidad(false)}
            className="p-2 rounded bg-red-100 hover:bg-red-200 border border-red-500"
          >
            <X className="text-red-600" />
          </button>
          
        </div>
      </div>

      {showInsumos && packageData.insumos.map((insumo) => (
  <div
    key={insumo.id}
    className="flex items-center space-x-4 bg-white p-3 rounded-lg mb-2"
  >
    <span className="flex-grow">{insumo.nombre}</span>
    <input
      type="number"
      value={insumo.cantidad_default}
      onChange={(e) => onInsumoCantidadChange(packageData.id, insumo.id, e.target.value)}
      min="1"
      className="w-24 p-2 border rounded"
    />
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onInsumoDisponibilidadChange(packageData.id, insumo.id, true)}
        className={`p-2 rounded ${insumo.disponible ? "bg-green-100 border border-green-500" : "bg-gray-200"}`}
      >
        <Check className="text-green-600" />
      </button>
      <button
        onClick={() => onInsumoDisponibilidadChange(packageData.id, insumo.id, false)}
        className={`p-2 rounded ${!insumo.disponible ? "bg-red-100 border border-red-500" : "bg-gray-200"}`}
      >
        <X className="text-red-600" />
      </button>
      <button
        onClick={() => onInsumoEliminar(packageData.id, insumo.id)}
        className="p-2 rounded bg-red-100 hover:bg-red-200"
      >
        <Trash2 className="text-red-600" />
      </button>
    </div>
  </div>
))}
      <button
        onClick={() => setShowAddInsumo(!showAddInsumo)}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {showAddInsumo ? "Cancelar" : "Agregar insumo al paquete"}
      </button>

      {showAddInsumo && (
        <div className="mt-4">
          <InsumosSelect onSelect={handleInsumoSelect} />
        </div>
      )}
    </div>
  );
};


const SolicitudInsumosDetalle = () => {
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [solicitudData, setSolicitudData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  const [insumos, setInsumos] = useState({});
  const [paquetes, setPaquetes] = useState({});
  const [selectedInsumos, setSelectedInsumos] = useState([]);
  const [paquetesInsumos, setPaquetesInsumos] = useState({});
  const [insumosEliminados, setInsumosEliminados] = useState([]);
  const [nuevosInsumos, setNuevosInsumos] = useState([]);

  const handleCommentChange = (value) => {
    setSolicitudData(prev => ({
      ...prev,
      comentarios_insumos: value
    }));
  };

  const handleAgregarInsumo = (tipo, nuevoInsumo) => {
    setInsumos(prev => ({
      ...prev,
      [tipo]: [...(prev[tipo] || []), nuevoInsumo]
    }));
  };


  const materialTypes = [
    'material_adicional', 
    'material_externo', 
    'servicios', 
    'paquete', 
    'medicamentos'
  ];

  const [insumoStates, setInsumoStates] = useState(
    materialTypes.map(() => [])
  );

  const procesarDatosInsumos = (data) => {
    const insumosAgrupados = data.reduce((acc, item) => {
      const tipo = item.tipo_insumo;
      if (!acc[tipo]) {
        acc[tipo] = [];
      }
      
      acc[tipo].push({
        id: item.insumo_id,
        nombre: item.nombre_insumo,
        cantidad: item.cantidad,
        disponible: item.disponibilidad === 1
      });
      
      return acc;
    }, {});

    return insumosAgrupados;
  };

  const separarInsumos = (data) => {
    const tiposInsumos = {
      material_adicional: [],
      material_externo: [],
      servicios: [],
      paquete: [],
      medicamentos: [],
    };
  
    Object.keys(tiposInsumos).forEach((tipo) => {
      // Usa un mapeo específico para los campos de paquetes
      const nombreField = tipo === 'paquete' ? 'nombre_paquete' : tipo;
      const cantidadField = tipo === 'paquete' ? 'cantidad_paquete' : `cantidad_${tipo}`;
  
      // Verifica si el campo existe y no está vacío
      if (data[nombreField]) {
        // Para paquetes, usa split solo si hay múltiples paquetes
        const nombres = (data[nombreField].includes(',') 
          ? data[nombreField].split(",") 
          : [data[nombreField]])
          .filter(nombre => nombre.trim() !== "");
        
        const cantidades = data[cantidadField]
          ? (data[cantidadField].includes(',') 
              ? data[cantidadField].split(",") 
              : [data[cantidadField]])
            .filter(cantidad => cantidad.trim() !== "")
          : [];
        
        tiposInsumos[tipo] = nombres.map((nombre, index) => ({
          id: index,
          nombre: nombre.trim(),
          cantidad: parseInt(cantidades[index] || "1") || 1,
          disponible: true,
        }));
      }
    });
  
    return tiposInsumos;
  };
  
  const [insumosPorTipo, setInsumosPorTipo] = useState({
    material_adicional: [],
    material_externo: [],
    servicios: [],
    paquete: [],
    medicamentos: []
  });
  
  useEffect(() => {
    const fetchSolicitudData = async () => {
      if (!appointmentId) {
        setLoading(false);
        return;
      }
  
      try {
        setLoading(true);
        const response = await axios.get(`${baseURL}/api/insumos/solicitudes-insumos/${appointmentId}`);
        
        console.log('Datos recibidos:', response.data);
  
        if (!response.data || response.data.length === 0) {
          setMensaje({ tipo: "error", texto: "No se encontraron datos" });
          setLoading(false);
          return;
        }
  
        // Agrupar los insumos por paquete
        const paquetes = {};
        const otrosInsumos = {};
      
        response.data.forEach(item => {
          const tipo = item.tipo_insumo?.toLowerCase() || 'otros';
          
          if (item.tipo_insumo === 'paquete') {
            const paqueteId = item.detalle_paquete;
            if (!paquetes[paqueteId]) {
              paquetes[paqueteId] = {
                id: paqueteId,
                nombre: item.detalle_paquete,
                insumos: []
              };
            }       
            paquetes[paqueteId].insumos.push({
              id: item.insumo_id,
              nombre: item.nombre_insumo,
              cantidad: parseInt(item.cantidad) || 1,
              disponible: item.disponibilidad === 1,
              cantidad_default: parseInt(item.cantidad_default) || 1
            });        
          } else {
            if (!otrosInsumos[tipo]) otrosInsumos[tipo] = [];
            otrosInsumos[tipo].push({
              id: item.insumo_id,
              nombre: item.nombre_insumo,
              cantidad: parseInt(item.cantidad) || 1,
              disponible: item.disponibilidad === 1
            });
          }
        });
  
        setSolicitudData(response.data[0]);
        setInsumos(otrosInsumos);
        setPaquetesInsumos(paquetes);
        setLoading(false);
  
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        setMensaje({ tipo: "error", texto: "Error al cargar los datos" });
        setLoading(false);
      }
    };
  
    fetchSolicitudData();
  }, [appointmentId]);

  const handleCantidadChange = (tipo, id, nuevaCantidad) => {
    setInsumos(prev => ({
      ...prev,
      [tipo]: prev[tipo].map(insumo => 
        insumo.id === id ? { ...insumo, cantidad: parseInt(nuevaCantidad) || 0 } : insumo
      )
    }));
  };

  const toggleDisponibilidad = (tipo, id, value) => {
    setInsumos(prev => ({
      ...prev,
      [tipo]: prev[tipo].map(insumo => 
        insumo.id === id ? { ...insumo, disponible: value } : insumo
      )
    }));
  };

  const handleEliminarInsumo = (tipo, id) => {
    setInsumosEliminados(prev => [...prev, { tipo, id }]);
    setInsumos(prev => ({
      ...prev,
      [tipo]: prev[tipo].filter(insumo => insumo.id !== id)
    }));
  };
  
  const handlePaqueteInsumoCantidad = (paqueteId, insumoId, nuevaCantidad) => {
    setPaquetesInsumos(prev => ({
      ...prev,
      [paqueteId]: {
        ...prev[paqueteId],
        insumos: prev[paqueteId].insumos.map(insumo => 
          insumo.id === insumoId 
            ? { ...insumo, cantidad_default: parseInt(nuevaCantidad) || 0 }
            : insumo
        )
      }
    }));
  };
  
  const handlePaqueteInsumoDisponibilidad = (paqueteId, insumoId, disponible) => {
    setPaquetesInsumos(prev => ({
      ...prev,
      [paqueteId]: {
        ...prev[paqueteId],
        insumos: prev[paqueteId].insumos.map(insumo => 
          insumo.id === insumoId 
            ? { ...insumo, disponible }
            : insumo
        )
      }
    }));
  };
  
  const handlePaqueteInsumoEliminar = (paqueteId, insumoId) => {
    setPaquetesInsumos(prev => ({
      ...prev,
      [paqueteId]: {
        ...prev[paqueteId],
        insumos: prev[paqueteId].insumos.filter(insumo => insumo.id !== insumoId)
      }
    }));
    setInsumosEliminados(prev => [...prev, { 
      tipo: 'paquete', 
      id: insumoId,
      paquete_id: paqueteId 
    }]);
  };
  
  useEffect(() => {
    if (solicitudData) {
      const datosSeparados = separarInsumos(solicitudData);
      setInsumoStates(Object.values(datosSeparados));
    }
  }, [solicitudData]);
  

  const createHandler = (index, handlerType) => {
    const handlers = {
      cantidad: (id, nuevaCantidad) => {
        const newInsumoStates = [...insumoStates];
        newInsumoStates[index] = newInsumoStates[index].map(
          (insumo) => (insumo.id === id ? { ...insumo, cantidad: parseInt(nuevaCantidad) || 0 } : insumo)
        );
        setInsumoStates(newInsumoStates);
      },
      eliminar: (id) => {
        const newInsumoStates = [...insumoStates];
        newInsumoStates[index] = newInsumoStates[index].filter((insumo) => insumo.id !== id);
        setInsumoStates(newInsumoStates);
      },
      disponibilidad: (id) => {
        const newInsumoStates = [...insumoStates];
        newInsumoStates[index] = newInsumoStates[index].map(
          (insumo) => (insumo.id === id ? { ...insumo, disponible: !insumo.disponible } : insumo)
        );
        setInsumoStates(newInsumoStates);
      }
    };
    return handlers[handlerType];
  };

  const guardarTodosCambios = async () => {
    try {
      // Preparar los datos de insumos
      const datosActualizados = {
        comentarios_insumos: solicitudData?.comentarios_insumos || '', // Agregamos los comentarios
        insumos: [
          // Insumos nuevos
          ...Object.entries(insumos).flatMap(([tipo, insumosArray]) =>
            insumosArray
              .filter(insumo => !insumo.existente)
              .map(insumo => ({
                operacion: 'insertar',
                id_solicitud: appointmentId,
                insumo_id: insumo.id,
                tipo_insumo: tipo,
                cantidad: insumo.cantidad,
                disponibilidad: insumo.disponible ? 1 : 0
              }))
          ),
          // Insumos existentes
          ...Object.entries(insumos).flatMap(([tipo, insumosArray]) =>
            insumosArray
              .filter(insumo => insumo.existente)
              .map(insumo => ({
                operacion: 'actualizar',
                id_solicitud: appointmentId,
                insumo_id: insumo.id,
                tipo_insumo: tipo,
                cantidad: insumo.cantidad,
                disponibilidad: insumo.disponible ? 1 : 0
              }))
          ),
          // Insumos de paquetes
          ...Object.entries(paquetesInsumos).flatMap(([paqueteId, paquete]) => 
            paquete.insumos.map(insumo => ({
              operacion: 'actualizar',
              id_solicitud: appointmentId,
              insumo_id: insumo.id,
              tipo_insumo: 'paquete',
              detalle_paquete: paqueteId,
              cantidad: insumo.cantidad_default || insumo.cantidad,
              disponibilidad: insumo.disponible ? 1 : 0
            }))
          ),
          // Insumos eliminados
          ...insumosEliminados.map(insumo => ({
            operacion: 'eliminar',
            id_solicitud: appointmentId,
            insumo_id: insumo.id,
            tipo_insumo: insumo.tipo,
            detalle_paquete: insumo.paquete_id || null
          }))
        ]
      };

      const response = await axios.patch(
        `${baseURL}/api/insumos/insumos-disponibles/${appointmentId}`, 
        datosActualizados
      );
      
      if(response.data.message) {
        setMensaje({ tipo: "success", texto: "Cambios guardados exitosamente" });
        navigate(-1);
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      setMensaje({
        tipo: "error",
        texto: "Error al guardar los cambios: " + (error.response?.data?.error || error.message)
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
  
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
  
    return `${day}-${month}-${year}`;
  };

  const generateDocument = async (solicitudData) => {
    try {
      const doc = new jsPDF('p', 'pt', 'letter');
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
  
      // Cargar la imagen
      const imageUrl = "/seseq.png"; // Ruta de la imagen
  
      // Cargar la imagen
      const img = await doc.addImage(imageUrl, 'PNG', 20, 20, 80, (100 / 130) * 50); // Ajustando el ancho a 80px
  
      // Función auxiliar para manejar valores nulos o indefinidos y convertir a string
      const getValue = (value) => (value != null && value !== undefined) ? String(value) : "N/A";
  
      // Función para dar formato a fechas
      const formatDate = (date) => {
        if (!date) return 'N/A';
        const formattedDate = new Date(date);
        return formattedDate.toLocaleDateString('es-MX');
      };

      // Función para ajustar la posición de los campos
      const adjustPosition = (text, startX, y, maxWidth) => {
        const textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        return startX + Math.min(textWidth, maxWidth) + 20;
      };
  
      // Función para imprimir campo y valor
      const printFieldAndValue = (field, value, x, y) => {
        doc.setFont('Helvetica', 'bold');
        doc.text(field, x, y);
        const fieldWidth = doc.getStringUnitWidth(field) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        doc.setFont('Helvetica', 'normal');
        const stringValue = getValue(value);
        doc.text(stringValue, x + fieldWidth + 5, y);
        doc.line(x + fieldWidth + 5, y + 2, x + fieldWidth + 5 + doc.getStringUnitWidth(stringValue) * doc.internal.getFontSize() / doc.internal.scaleFactor, y + 2);
      };
  
      // Encabezado
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Trazabilidad de Insumos y Servicios para la Salud', pageWidth / 2, 40, { align: 'center' });
      doc.text('Nuevo Hospital General de Querétaro', pageWidth / 2, 60, { align: 'center' });
  
      // Nombre y firma del paciente
      const nombreCompleto = `${getValue(solicitudData.ap_paterno)} ${getValue(solicitudData.ap_materno)} ${getValue(solicitudData.nombre_paciente)}`;
  
      // Línea divisoria
      doc.setLineWidth(1.5);
      doc.line(40, 100, pageWidth - 40, 100);
  
      // Datos del Paciente
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('DATOS DEL PACIENTE', pageWidth / 2, 135, { align: 'center' });
  
      // Función para calcular la posición Y
      const getYPosition = (index) => 160 + (index * 30);
  
      // Ajustando las posiciones de los campos
      printFieldAndValue("Folio de Solicitud: ", solicitudData.folio, 40, getYPosition(0));
      printFieldAndValue("Fecha de recibo de solicitud: ", formatDate(solicitudData.fecha_solicitud), 300, getYPosition(0));
  
      printFieldAndValue("CURP: ", solicitudData.curp, 40, getYPosition(1));
      printFieldAndValue("No. de Expediente: ", solicitudData.no_expediente, 220, getYPosition(1));
      printFieldAndValue("Teléfono de contacto: ", solicitudData.tel_contacto, 400, getYPosition(1));
  
      printFieldAndValue("Nombre del paciente: ", nombreCompleto, 40, getYPosition(2));
      printFieldAndValue("Fecha de nacimiento: ", formatDate(solicitudData.fecha_nacimiento), 400, getYPosition(2));
  
      printFieldAndValue("Edad: ", solicitudData.edad, 40, getYPosition(3));
      printFieldAndValue("Sexo: ", solicitudData.sexo, pageWidth / 2, getYPosition(3));
  
      let nextX = 40;
      printFieldAndValue("Sala solicitada: ", `Sala ${getValue(solicitudData.sala_quirofano)}`, nextX, getYPosition(4));
      nextX = adjustPosition(`Sala solicitada: Sala ${getValue(solicitudData.sala_quirofano)}`, nextX, getYPosition(4), 200);
      
      const tipoAdmision = getValue(solicitudData.tipo_admision);
      printFieldAndValue("Procedencia del paciente: ", tipoAdmision === 'CONSULTA EXTERNA' ? 'C.E.' : tipoAdmision, nextX, getYPosition(4));
      nextX = adjustPosition(`Procedencia del paciente: ${tipoAdmision === 'CONSULTA EXTERNA' ? 'C.E.' : tipoAdmision}`, nextX, getYPosition(4), 200);
      
      printFieldAndValue("Cama: ", solicitudData.cama, nextX, getYPosition(4));
      
      const procedimientoPaciente = getValue(solicitudData.procedimientos_paciente);
      const maxWidth = pageWidth - 120; // Reducir el ancho máximo para asegurar márgenes
      const splitProcedimiento = doc.splitTextToSize(procedimientoPaciente, maxWidth);
      printFieldAndValue("Procedimiento CIE-9: ", "", 40, getYPosition(5));
      splitProcedimiento.forEach((line, index) => {
          doc.text(line, 
              40 + doc.getStringUnitWidth("Procedimiento CIE-9: ") * doc.internal.getFontSize() / doc.internal.scaleFactor + 10, 
              getYPosition(5) + (index * 15)
          );
      });
      
      // Diagnóstico con manejo de texto largo
      const diagnosticoPaciente = getValue(solicitudData.diagnostico);
      const splitDiagnostico = doc.splitTextToSize(diagnosticoPaciente, maxWidth);
      const diagnosticoPosY = getYPosition(5) + (splitProcedimiento.length * 15);
      printFieldAndValue("Diagnóstico: ", "", 40, diagnosticoPosY);
      splitDiagnostico.forEach((line, index) => {
          doc.text(line, 
              40 + doc.getStringUnitWidth("Diagnóstico: ") * doc.internal.getFontSize() / doc.internal.scaleFactor + 10, 
              diagnosticoPosY + (index * 15)
          );
      });

            // Resumen médico con manejo de texto largo
      const resumenMedico = getValue(solicitudData.comentarios_insumos);
      const splitResumenMedico = doc.splitTextToSize(resumenMedico, maxWidth);
      const resumenPosY = diagnosticoPosY + (splitDiagnostico.length * 15);
      printFieldAndValue("Comentarios adicionales: ", "", 40, resumenPosY);
      splitResumenMedico.forEach((line, index) => {
          doc.text(line, 
              40 + doc.getStringUnitWidth("Comentarios adicionales: ") * doc.internal.getFontSize() / doc.internal.scaleFactor + 10, 
              resumenPosY + (index * 15)
          );
      });
      // Ajustar la posición de la segunda línea divisoria
      const nuevaSeccionY = resumenPosY + (splitResumenMedico.length * 15) + 20;
      doc.setLineWidth(1.5);
      doc.line(40, nuevaSeccionY, pageWidth - 40, nuevaSeccionY);
      // Preparación de materiales con el nuevo formato de tabla
      const materialesSecciones = [
        { 
          tipo: 'Material Adicional', 
          items: insumos['material_adicional'] || [],
        },
        { 
          tipo: 'Material Externo', 
          items: insumos['material_externo'] || [],
        },
        { 
          tipo: 'Paquetes', 
          items: Object.values(paquetesInsumos).flatMap(paquete => ({
            id: paquete.id,
            nombre: paquete.nombre,
            insumos: paquete.insumos
          }))
        },
        { 
          tipo: 'Servicios', 
          items: insumos['servicios'] || [],
        },
        { 
          tipo: 'Medicamentos', 
          items: insumos['medicamentos'] || [],
        }
      ];
      

      // Impresión de Materiales con tabla
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
// Modificar la línea que establece la posición de "MATERIALES REQUERIDOS"
doc.text('MATERIALES REQUERIDOS', pageWidth / 2, nuevaSeccionY + 15, { align: 'center' });

      // Configuración de la tabla
      const marginX = 40;
      const tableTop = nuevaSeccionY + 30;
      const columnWidths = [100, 320, 60]; // Anchos de columnas: Clave, Descripción, Cantidad
      const rowHeight = 20;
      const tableHeaders = ['Clave', 'Descripción', 'Cantidad'];

      // Función para dibujar encabezados de tabla
      const drawTableHeaders = (y) => {
        doc.setFillColor(240, 240, 240); // Color de fondo gris claro
        doc.rect(marginX, y, columnWidths[0], rowHeight, 'F');
        doc.rect(marginX + columnWidths[0], y, columnWidths[1], rowHeight, 'F');
        doc.rect(marginX + columnWidths[0] + columnWidths[1], y, columnWidths[2], rowHeight, 'F');
        
        doc.setFont('Helvetica', 'bold');
        tableHeaders.forEach((header, index) => {
          doc.text(
            header, 
            marginX + columnWidths.slice(0, index).reduce((a, b) => a + b, 0) + 5, 
            y + 15
          );
        });
      };

      // Función para dibujar fila de tabla
// Función para dibujar fila de tabla
const drawTableRow = (y, clave, descripcion, cantidad, doc, marginX, columnWidths, rowHeight) => {
  // Convertir todos los valores a string y manejar valores nulos/undefined
  const claveStr = String(clave || 'N/A');
  const descripcionStr = String(descripcion || 'N/A');
  const cantidadStr = String(cantidad || '1');
  
  doc.setFont('Helvetica', 'normal');
  
  // Ajuste de texto para descripción
  const maxWidth = columnWidths[1] - 10;
  const splitDescription = doc.splitTextToSize(descripcionStr, maxWidth);
  const descriptionHeight = splitDescription.length * 12;
  const dynamicRowHeight = Math.max(rowHeight, descriptionHeight + 10);
  
  // Dibujar rectángulos
  doc.rect(marginX, y, columnWidths[0], dynamicRowHeight);
  doc.rect(marginX + columnWidths[0], y, columnWidths[1], dynamicRowHeight);
  doc.rect(marginX + columnWidths[0] + columnWidths[1], y, columnWidths[2], dynamicRowHeight);
  
  // Texto de la clave
  doc.text(claveStr, marginX + 5, y + 15);
  
  // Descripción con múltiples líneas
  splitDescription.forEach((line, index) => {
    doc.text(line, marginX + columnWidths[0] + 5, y + 15 + (index * 12));
  });
  
  // Cantidad centrada
  doc.text(cantidadStr, marginX + columnWidths[0] + columnWidths[1] + 5, y + (dynamicRowHeight / 2) + 5);
  
  return dynamicRowHeight;
};

let currentY = tableTop;
let pageNum = 1;

materialesSecciones.forEach(seccion => {
  if (seccion.items && seccion.items.length > 0) {
    if (currentY + 40 > pageHeight - 150) {
      doc.addPage();
      currentY = 40;
      pageNum++;
    }
    
    doc.setFont('Helvetica', 'bold');
    doc.text(`${seccion.tipo}:`, marginX, currentY);
    currentY += 20;

    if (seccion.tipo === 'Paquetes') {
      // Manejar cada paquete individualmente
      seccion.items.forEach(paquete => {
        // Verificar espacio para el título del paquete
        if (currentY + 40 > pageHeight - 150) {
          doc.addPage();
          currentY = 40;
          pageNum++;
        }

        // Imprimir el detalle del paquete
        doc.setFont('Helvetica', 'bold');
        doc.text(`Detalle Paquete: ${paquete.nombre}`, marginX, currentY);
        currentY += 20;

        // Dibujar encabezados de tabla para este paquete
        drawTableHeaders(currentY);
        currentY += rowHeight;

        // Procesar cada insumo del paquete
        paquete.insumos.forEach(insumo => {
          // Verificar si necesitamos una nueva página
          if (currentY + 30 > pageHeight - 150) {
            doc.addPage();
            currentY = 40;
            pageNum++;
            // Repetir el título del paquete en la nueva página
            doc.setFont('Helvetica', 'bold');
            doc.text(`Detalle Paquete: ${paquete.nombre} (continuación)`, marginX, currentY);
            currentY += 20;
            drawTableHeaders(currentY);
            currentY += rowHeight;
          }

          // Separar clave y descripción
          let clave = 'N/A';
          let descripcion = String(insumo.nombre || '');
          
          // Buscar el patrón "clave - descripción"
          const match = descripcion.match(/^(.*?)\s*-\s*(.*)$/);
          if (match) {
            clave = match[1].trim();
            descripcion = match[2].trim();
          }

          const dynamicRowHeight = drawTableRow(
            currentY,
            clave,
            descripcion,
            String(insumo.cantidad || '1'),
            doc,
            marginX,
            columnWidths,
            rowHeight
          );
          currentY += dynamicRowHeight + 5;
        });

        // Agregar espacio entre paquetes
        currentY += 20;
      });
    } else {
      // Código existente para otras secciones
      drawTableHeaders(currentY);
      currentY += rowHeight;

      seccion.items.forEach(item => {
        if (currentY + 30 > pageHeight - 150) {
          doc.addPage();
          currentY = 40;
          pageNum++;
          drawTableHeaders(currentY);
          currentY += rowHeight;
        }

        let clave = 'N/A';
        let descripcion = String(item.nombre || '');
        
        const match = descripcion.match(/^(.*?)\s*-\s*(.*)$/);
        if (match) {
          clave = match[1].trim();
          descripcion = match[2].trim();
        }

        const dynamicRowHeight = drawTableRow(
          currentY,
          clave,
          descripcion,
          String(item.cantidad || '1'),
          doc,
          marginX,
          columnWidths,
          rowHeight
        );
        currentY += dynamicRowHeight + 5;
      });
    }
    currentY += 10;
  }
});

      // Asegurar que hay suficiente espacio antes de la línea divisoria final
      const minSpaceBeforeLine = 30;
      if (pageHeight - 80 - currentY < minSpaceBeforeLine) {
        currentY = pageHeight - 80 - minSpaceBeforeLine;
      }

      const espacioNecesario = 180;
      if (currentY + espacioNecesario > pageHeight - 200) {
        doc.addPage();
        currentY = 40;
      }

      // Línea divisoria final
      doc.setLineWidth(1.5);
      doc.line(40, pageHeight - 180, pageWidth - 40, pageHeight - 180);

      // Configuración de cajas
      const boxPadding = 10;
      const boxHeight = 100;
      const boxWidth = 200;
      
      // Posicionamiento del texto y líneas
      const boxY = pageHeight - 150;
      const textY = boxY + boxHeight - 30;
      const lineY = textY + 15;
      
      // Cirujano responsable
      doc.setFont('Helvetica', 'bold');
      const cirujanoLabel = 'Cirujano responsable:';
      const cirujanoX = 40;
      
      // Dibujar cuadro para cirujano
      doc.rect(cirujanoX, boxY, boxWidth, boxHeight);
      doc.text(cirujanoLabel, cirujanoX + boxPadding, textY);
      doc.line(
        cirujanoX + boxPadding, 
        lineY, 
        cirujanoX + boxWidth - boxPadding, 
        lineY
      );

      // Firma y sello
      const firmaLabel = 'Firma y sello:';
      const firmaX = pageWidth - boxWidth - 40;
      
      // Dibujar cuadro para firma
      doc.rect(firmaX, boxY, boxWidth, boxHeight);
      doc.text(firmaLabel, firmaX + boxPadding, textY);
      doc.line(
        firmaX + boxPadding, 
        lineY, 
        firmaX + boxWidth - boxPadding, 
        lineY
      );

      // Guardar el PDF
      doc.save(`Solicitud_${getValue(solicitudData.folio)}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  // Añade esta función junto a tus otras funciones
  const generateMedicalSummaryPDF = (patientData) => {
  if (!patientData || !patientData.resumen_medico) return;

  // Crear nuevo documento PDF
  const doc = new jsPDF();
  
  // Configurar fuente
  doc.setFont("helvetica");
  doc.setFontSize(10);

  // Configurar márgenes y ancho disponible (en mm)
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const textWidth = pageWidth - (2 * margin);

  // Dividir el texto respetando saltos de línea originales
  const lines = patientData.resumen_medico.split('\n');

  // Posición inicial Y
  let y = margin;

  lines.forEach(line => {
    // Dividir cada línea según el ancho disponible
    const splitLine = doc.splitTextToSize(line, textWidth);
    
    // Verificar si necesitamos una nueva página
    if (y + (splitLine.length * 5) > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }

    // Agregar cada parte de la línea dividida
    splitLine.forEach(text => {
      doc.text(text, margin, y, { align: 'justify' });
      y += 5; // Espacio entre líneas
    });

    // Añadir un espacio adicional después de cada salto de línea original
    y += 2;
  });

  // Guardar el PDF
  doc.save(`resumen_medico_${solicitudData.folio || 'sin_folio'}.pdf`);
};

const tiposInsumo = {
  material_adicional: "Material Adicional",
  material_externo: "Material Externo",
  servicios: "Servicios",
  paquete: "Paquetes",
  medicamentos: "Medicamentos"
};

  if (loading) return <div>Cargando...</div>;

  const activeMaterialTypes = materialTypes.filter((materialType, index) => 
    insumoStates[index].length > 0
  );

  return (
    <Layout>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Detalle de Solicitud de Insumos</h2>

        <button
            onClick={() => generateDocument(solicitudData)}
            className="bg-green-500 text-white text-sm p-4 rounded-lg font-light mr-4" // Agregado margen derecho
            style={{ marginBottom: "8px" }}
          >
            Imprimir solicitud
          </button>

          <button
            onClick={() => generateMedicalSummaryPDF(solicitudData)}
            className="bg-blue-500 text-white text-sm p-4 rounded-lg font-light mt-2" // Agregado margen superior
          >
            Imprimir resumen médico
          </button>


        {mensaje.texto && <Alert className={`mb-4 ${mensaje.tipo === "error" ? "bg-red-100" : "bg-green-100"}`}>{mensaje.texto}</Alert>}
        
        {solicitudData && <PatientInfoBlock 
          solicitudData={solicitudData} 
          onCommentChange={handleCommentChange} 
        />}
      {/* Primero renderizar los insumos normales */}
      {Object.entries(insumos).map(([tipo, insumosArray]) => (
          tipo !== 'paquete' && (
            <InsumoBlock
              key={`insumo-${tipo}`}
              title={tiposInsumo[tipo]}
              insumos={insumosArray}
              handleCantidadChange={(id, cantidad) => handleCantidadChange(tipo, id, cantidad)}
              toggleDisponibilidad={(id, value) => toggleDisponibilidad(tipo, id, value)}
              handleEliminarInsumo={(id) => handleEliminarInsumo(tipo, id)}
              tipo_insumo={tipo}
              handleAgregarInsumo={handleAgregarInsumo}
            />
          )
        ))}
{/* Luego renderizar los paquetes */}
{Object.values(paquetesInsumos).map(paquete => (
  <PackageBlock
    key={`package-${paquete.id}`}
    packageData={paquete}
    onInsumoCantidadChange={handlePaqueteInsumoCantidad}
    onInsumoDisponibilidadChange={handlePaqueteInsumoDisponibilidad}
    onInsumoEliminar={handlePaqueteInsumoEliminar}
  />
))}

<div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg">
          <div className="container mx-auto flex justify-end">
            <button
              onClick={guardarTodosCambios}
              className="px-8 py-3 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SolicitudInsumosDetalle;