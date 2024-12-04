import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../Layout";
import { useParams, useNavigate } from "react-router-dom";
import { Check, X, Trash2 } from "lucide-react";
import { Alert } from "../../components/ui/alert";
import InsumosSelect from "../Solicitudes/InsumosSelect";

const PatientInfoBlock = ({ solicitudData }) => (
  <div className="bg-gray-50 p-6 rounded-lg shadow-lg mb-6">
    <div className="grid grid-cols-3 gap-4">
      <div className="w-full">
        <label className="block font-semibold text-gray-700 mb-2">Folio:</label>
        <p className="bg-white p-3 rounded-lg">{solicitudData.folio || "N/A"}</p>
      </div>
      <div className="w-full">
        <label className="block font-semibold text-gray-700 mb-2">Estado:</label>
        <p className="bg-white p-3 rounded-lg">{solicitudData.estado_insumos || "N/A"}</p>
      </div>
      <div className="w-full">
        <label className="block font-semibold text-gray-700 mb-2">Resumen Médico:</label>
        <p className="bg-white p-3 rounded-lg h-full">{solicitudData.resumen_medico || "N/A"}</p>
      </div>
    </div>
  </div>
);

const InsumoBlock = ({
  solicitudData,
  materialType,
  insumos,
  setInsumos,
  handleCantidadChange,
  toggleDisponibilidad,
  handleEliminarInsumo,
  handleInsumosSelect,
  selectedInsumos,
}) => {
  const materialTypeMap = {
    'material_adicional': { 
      title: 'Material Adicional', 
      nombreField: 'material_adicional',
      cantidadField: 'cantidad_adicional'
    },
    'material_externo': { 
      title: 'Material Externo', 
      nombreField: 'material_externo',
      cantidadField: 'cantidad_externo'
    },
    'servicios': { 
      title: 'Servicios', 
      nombreField: 'servicios',
      cantidadField: 'cantidad_servicios'
    },
    'paquetes': { 
      title: 'Paquetes', 
      nombreField: 'nombre_paquete',
      cantidadField: 'cantidad_paquete'
    },
    'medicamentos': { 
      title: 'Medicamentos', 
      nombreField: 'medicamentos',
      cantidadField: 'cantidad_medicamento'
    }
  };

  const currentType = materialTypeMap[materialType];

  useEffect(() => {
    if (solicitudData && solicitudData[currentType.nombreField]) {
      const nombres = solicitudData[currentType.nombreField]
        .split(",")
        .filter(nombre => nombre.trim() !== "");
      const cantidades = solicitudData[currentType.cantidadField]
        ? solicitudData[currentType.cantidadField].split(",").filter(cantidad => cantidad.trim() !== "")
        : [];
      
      const insumosIniciales = nombres.map((nombre, index) => ({
        id: index,
        nombre: nombre.trim(),
        cantidad: parseInt(cantidades[index] || "0") || 0,
        disponible: true,
      }));
  
      if (insumosIniciales.length > 0) {
        setInsumos(insumosIniciales);
      }
    }
  }, [solicitudData, materialType]);
  
  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-lg mb-6">
      {solicitudData ? (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Lista de {currentType.title}</h3>
            <div className="space-y-4">
              {insumos.map((insumo) => (
                <div key={insumo.id} className="flex items-center space-x-4 bg-white p-3 rounded-lg">
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
                      onClick={() => toggleDisponibilidad(insumo.id)}
                      className={`p-2 rounded ${insumo.disponible ? "bg-green-100" : "bg-red-100"}`}
                    >
                      {insumo.disponible ? <Check className="text-green-600" /> : <X className="text-red-600" />}
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

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Agregar Nuevos {currentType.title}</h3>
            <InsumosSelect onSelect={handleInsumosSelect} selectedInsumos={selectedInsumos} />
          </div>
        </>
      ) : (
        <p>No se encontró información para esta solicitud.</p>
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
  const [selectedInsumos, setSelectedInsumos] = useState([]);

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

  const separarInsumos = (data) => {
    const tiposInsumos = {
      material_adicional: [],
      material_externo: [],
      servicios: [],
      paquetes: [],
      medicamentos: [],
    };
  
    Object.keys(tiposInsumos).forEach((tipo) => {
      if (data[tipo]) {
        const nombres = data[tipo].split(",").filter((nombre) => nombre.trim() !== "");
        const cantidades = data[`cantidad_${tipo}`]?.split(",") || [];
        tiposInsumos[tipo] = nombres.map((nombre, index) => ({
          id: index,
          nombre: nombre.trim(),
          cantidad: parseInt(cantidades[index] || "0") || 0,
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
        setSolicitudData(null);
        const response = await axios.get(`${baseURL}/api/insumos/solicitudes-insumos/${appointmentId}`);
        const datosSeparados = separarInsumos(response.data);
        setSolicitudData(response.data);
        setInsumoStates(Object.values(datosSeparados));
      } catch (error) {
        console.error("Error fetching solicitud data:", error);
        setMensaje({ tipo: "error", texto: "Error al cargar los datos" });
      } finally {
        setLoading(false);
      }
    };
  
    fetchSolicitudData();
  }, [appointmentId, baseURL]);
  
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
      const materialTypeMap = [
        'material_adicional',
        'material_externo',
        'servicios',
        'paquetes',
        'medicamentos'
      ];
      const cantidadTypeMap = [
        'cantidad_adicional',
        'cantidad_externo',
        'cantidad_servicios',
        'cantidad_paquete',
        'cantidad_medicamento'
      ];

      const datosActualizados = {};

      materialTypeMap.forEach((tipo, index) => {
        datosActualizados[tipo] = insumoStates[index].map((i) => i.nombre).join(",");
        datosActualizados[cantidadTypeMap[index]] = insumoStates[index].map((i) => i.cantidad).join(",");
        datosActualizados[`disponibilidad_${tipo}`] = insumoStates[index].map((i) => (i.disponible ? "1" : "0")).join(",");
      });

      const response = await axios.patch(`${baseURL}/api/insumos/solicitudes-insumos/${appointmentId}`, datosActualizados);

      setSolicitudData((prev) => ({ ...prev, ...response.data.datos }));
      setMensaje({ tipo: "success", texto: "Cambios guardados exitosamente" });
      
      // Navegar a la página anterior después de guardar
      navigate(-1);
    } catch (error) {
      console.error("Error guardando cambios:", error);
      setMensaje({ tipo: "error", texto: "Error al guardar los cambios" });
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <Layout>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Detalle de Solicitud de Insumos</h2>
        {mensaje.texto && <Alert className={`mb-4 ${mensaje.tipo === "error" ? "bg-red-100" : "bg-green-100"}`}>{mensaje.texto}</Alert>}
        
        {solicitudData && <PatientInfoBlock solicitudData={solicitudData} />}
        
        {materialTypes.map((materialType, index) => (
          <InsumoBlock
            key={materialType}
            solicitudData={solicitudData}
            materialType={materialType}
            insumos={insumoStates[index]}
            setInsumos={(newInsumos) => {
              const newInsumoStates = [...insumoStates];
              newInsumoStates[index] = newInsumos;
              setInsumoStates(newInsumoStates);
            }}
            handleCantidadChange={createHandler(index, 'cantidad')}
            toggleDisponibilidad={createHandler(index, 'disponibilidad')}
            handleEliminarInsumo={createHandler(index, 'eliminar')}
            handleInsumosSelect={setSelectedInsumos}
            selectedInsumos={selectedInsumos}
          />
        ))}

        {/* Botón de Guardar Cambios al final de la página */}
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