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

const PatientInfoBlock = ({ solicitudData }) => {
  // Verificamos que tengamos datos antes de intentar acceder a ellos
  if (!solicitudData || solicitudData.length === 0) return null;
  
  const patientData = solicitudData[0];
  
  const infoFields = [
    { label: "Folio", value: patientData?.folio },
    { label: "Nombre", value: `${patientData?.nombre_paciente} ${patientData?.ap_paterno} ${patientData?.ap_materno}` },
    { label: "Sexo", value: patientData?.sexo },
    { label: "Tipo Admisión", value: patientData?.tipo_admision },
    { label: "Tipo Intervención", value: patientData?.tipo_intervencion },
    { label: "Especialidad", value: patientData?.nombre_especialidad },
    { label: "Fecha", value: patientData?.fecha_solicitada },
    { label: "Hora", value: patientData?.hora_solicitada },
    { label: "Sala/Quirófano", value: patientData?.sala_quirofano },
    { label: "Cirujano", value: patientData?.nombre_cirujano },
    { label: "Estado", value: patientData?.estado_insumos },
    { label: "Resumen Médico", value: patientData?.resumen_medico }
  ];

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-lg mb-6">
      <div className="grid grid-cols-3 gap-4">
        {infoFields.map((field, index) => (
          <div key={index} className="w-full">
            <label className="block font-semibold text-gray-700 mb-2">{field.label}:</label>
            <p className="bg-white p-3 rounded-lg">{field.value || "N/A"}</p>
          </div>
        ))}
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
                  <p className="font-medium text-lg">{insumo.descripcion_insumo}</p>
                  <p className="text-sm text-gray-600">Clave: {insumo.clave_insumo}</p>
                </div>
                <div className="font-semibold text-blue-600 text-lg">
                  Cantidad: {insumo.cantidad_default}
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
  toggleDisponibilidad,
  handleEliminarInsumo,
  title,
  showPackageInfo = false,
  packageInsumos = null,
  packageName = "",
}) => {
  const [showPackageModal, setShowPackageModal] = useState(false);

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


const SolicitudInsumosDetalle = () => {
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [solicitudData, setSolicitudData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  const [insumos, setInsumos] = useState({});
  const [packageInsumos, setPackageInsumos] = useState(null);

  const materialTypes = [
    'material_adicional', 
    'material_externo', 
    'servicios', 
    'paquetes', 
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
      paquetes: [],
      medicamentos: [],
    };
  
    Object.keys(tiposInsumos).forEach((tipo) => {
      // Usa un mapeo específico para los campos de paquetes
      const nombreField = tipo === 'paquetes' ? 'nombre_paquete' : tipo;
      const cantidadField = tipo === 'paquetes' ? 'cantidad_paquete' : `cantidad_${tipo}`;
  
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
  

  useEffect(() => {
    const fetchSolicitudData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseURL}/api/insumos/solicitudes-insumos/${appointmentId}`);
        
        // Agrupamos los insumos por tipo
        const insumosAgrupados = response.data.reduce((acc, item) => {
          if (!acc[item.tipo_insumo]) {
            acc[item.tipo_insumo] = [];
          }
          acc[item.tipo_insumo].push({
            id: item.insumo_id,
            nombre: item.nombre_insumo,
            cantidad: item.cantidad,
            disponible: item.disponibilidad === 1
          });
          return acc;
        }, {});

        setSolicitudData(response.data);
        setInsumos(insumosAgrupados);

        // Si hay paquetes, obtener sus insumos
        const paquete = response.data.find(item => item.tipo_insumo === 'paquetes');
        if (paquete) {
          const paqueteResponse = await axios.get(
            `${baseURL}/api/insumos/paquete-insumos?nombre_paquete=${encodeURIComponent(paquete.nombre_insumo)}`
          );
          setPackageInsumos(paqueteResponse.data[0]?.insumos || null);
        }
      } catch (error) {
        console.error("Error fetching solicitud data:", error);
        setMensaje({ tipo: "error", texto: "Error al cargar los datos" });
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitudData();
  }, [appointmentId, baseURL]);

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
    setInsumos(prev => ({
      ...prev,
      [tipo]: prev[tipo].filter(insumo => insumo.id !== id)
    }));
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
      // Preparar los datos para enviar al backend
      const datosActualizados = Object.entries(insumos).map(([tipo, insumosArray]) => 
        insumosArray.map(insumo => ({
          id_solicitud: appointmentId,
          tipo_insumo: tipo,
          insumo_id: insumo.id,
          nombre_insumo: insumo.nombre,
          cantidad: insumo.cantidad,
          disponibilidad: insumo.disponible ? 1 : 0
        }))
      ).flat();

      await axios.patch(`${baseURL}/api/insumos/insumos-disponibles/${appointmentId}`, datosActualizados);
      setMensaje({ tipo: "success", texto: "Cambios guardados exitosamente" });
      navigate(-1);
    } catch (error) {
      console.error("Error guardando cambios:", error);
      setMensaje({ tipo: "error", texto: "Error al guardar los cambios" });
    }
  };


  if (loading) return <div>Cargando...</div>;

  const tiposInsumo = {
    material_adicional: "Material Adicional",
    material_externo: "Material Externo",
    servicios: "Servicios",
    paquetes: "Paquetes",
    medicamentos: "Medicamentos"
  };

  return (
    <Layout>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Detalle de Solicitud de Insumos</h2>
        
        {mensaje.texto && (
          <Alert className={`mb-4 ${mensaje.tipo === "error" ? "bg-red-100" : "bg-green-100"}`}>
            {mensaje.texto}
          </Alert>
        )}
        
        {solicitudData && <PatientInfoBlock solicitudData={solicitudData} />}
        
        {Object.entries(insumos).map(([tipo, insumosArray]) => (
          <InsumoBlock
            key={tipo}
            title={tiposInsumo[tipo]}
            insumos={insumosArray}
            handleCantidadChange={(id, cantidad) => handleCantidadChange(tipo, id, cantidad)}
            toggleDisponibilidad={(id, value) => toggleDisponibilidad(tipo, id, value)}
            handleEliminarInsumo={(id) => handleEliminarInsumo(tipo, id)}
            showPackageInfo={tipo === 'paquetes'}
            packageInsumos={tipo === 'paquetes' ? packageInsumos : null}
            packageName={tipo === 'paquetes' && insumosArray[0]?.nombre}
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