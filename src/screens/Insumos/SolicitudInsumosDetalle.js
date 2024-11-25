import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../Layout";
import { useParams } from "react-router-dom";
import { Check, X, Trash2 } from "lucide-react";
import { Alert } from "../../components/ui/alert";
import InsumosSelect from "../Solicitudes/InsumosSelect";

const SolicitudInsumosDetalle = () => {
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";
  const { appointmentId } = useParams();
  const [solicitudData, setSolicitudData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insumos, setInsumos] = useState([]);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  const [selectedInsumos, setSelectedInsumos] = useState([]);

  useEffect(() => {
    const fetchSolicitudData = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/insumos/solicitudes-insumos/${appointmentId}`);
        
        // Agregar console.log para verificar la respuesta del endpoint
        console.log("Datos del endpoint:", response.data);
    
        setSolicitudData(response.data);
    
        // Convertir los strings de insumos a un array de objetos
        if (response.data.nombre_insumos && response.data.cantidades_insumos) {
          const nombres = response.data.nombre_insumos.split(',');
          const cantidades = response.data.cantidades_insumos.split(',');
          const insumosIniciales = nombres.map((nombre, index) => ({
            id: index,
            nombre: nombre.trim(),
            cantidad: parseInt(cantidades[index]) || 0,
            disponible: true,
          }));
          setInsumos(insumosIniciales);
        }
      } catch (error) {
        console.error("Error fetching solicitud data:", error);
        setMensaje({ tipo: "error", texto: "Error al cargar los datos" });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSolicitudData();
    
  }, [appointmentId, baseURL])


  const handleInsumosSelect = (selectedOptions) => {
    const nuevosInsumos = selectedOptions.map(option => ({
      id: option.value,
      nombre: option.label,
      cantidad: 1, // Cantidad por defecto
      disponible: true
    }));
    
    // Agregar solo los insumos que no existen ya en la lista
    const insumosActualizados = [
      ...insumos,
      ...nuevosInsumos.filter(nuevo => 
        !insumos.some(existente => existente.id === nuevo.id)
      )
    ];
    
    setInsumos(insumosActualizados);
    setSelectedInsumos(selectedOptions);
  };

  const handleEliminarInsumo = (id) => {
    setInsumos(insumos.filter(insumo => insumo.id !== id));
    setSelectedInsumos(selectedInsumos.filter(option => option.value !== id));
  };

  const toggleDisponibilidad = (id) => {
    setInsumos(insumos.map(insumo => 
      insumo.id === id ? { ...insumo, disponible: !insumo.disponible } : insumo
    ));
  };

  const handleCantidadChange = (id, nuevaCantidad) => {
    setInsumos(insumos.map(insumo => 
      insumo.id === id ? { ...insumo, cantidad: parseInt(nuevaCantidad) || 0 } : insumo
    ));
  };

  const handleGuardarCambios = async () => {
    try {
      // Convertir el array de objetos de vuelta a strings separados por comas
      const datosActualizados = {
        nombre_insumos: insumos.map(i => i.nombre).join(','),
        cantidades_insumos: insumos.map(i => i.cantidad).join(','),
        disponibilidad: insumos.map(i => i.disponible ? '1' : '0').join(',')
      };
  
      const response = await axios.patch(
        `${baseURL}/api/insumos/solicitudes-insumos/${appointmentId}`,
        datosActualizados
      );
  
      // Actualizar el estado con la respuesta
      setSolicitudData(prev => ({
        ...prev,
        ...response.data.datos
      }));
  
      setMensaje({ tipo: "success", texto: "Cambios guardados exitosamente" });
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

        {mensaje.texto && (
          <Alert className={`mb-4 ${mensaje.tipo === 'error' ? 'bg-red-100' : 'bg-green-100'}`}>
            {mensaje.texto}
          </Alert>
        )}

        <div className="bg-gray-50 p-6 rounded-lg shadow-lg">
          {solicitudData ? (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="w-full">
                  <label className="block font-semibold text-gray-700 mb-2">Folio:</label>
                  <p className="bg-white p-3 rounded-lg">{solicitudData.folio || "N/A"}</p>
                </div>
                <div className="w-full">
                  <label className="block font-semibold text-gray-700 mb-2">Estado:</label>
                  <p className="bg-white p-3 rounded-lg">{solicitudData.estado || "N/A"}</p>
                </div>
              </div>

              <div className="mb-6">
  <h3 className="text-lg font-semibold mb-4">Material Adicional</h3>
  <div className="space-y-4">
    {insumos.map((insumo) => (
      <div key={insumo.id} className="flex items-center space-x-4 bg-white p-3 rounded-lg">
        <span className="flex-grow">{insumo.material_adicional}</span>
        <input
          type="number"
          value={insumo.cantidad_adicional}
          onChange={(e) => handleCantidadChange(insumo.id, e.target.value, 'cantidad_adicional')}
          min="1"
          className="w-24 p-2 border rounded"
        />
      </div>
    ))}
  </div>
</div>

<div className="mb-6">
  <h3 className="text-lg font-semibold mb-4">Material Externo</h3>
  <div className="space-y-4">
    {insumos.map((insumo) => (
      <div key={insumo.id} className="flex items-center space-x-4 bg-white p-3 rounded-lg">
        <span className="flex-grow">{insumo.material_externo}</span>
        <input
          type="number"
          value={insumo.cantidad_externo}
          onChange={(e) => handleCantidadChange(insumo.id, e.target.value, 'cantidad_externo')}
          min="1"
          className="w-24 p-2 border rounded"
        />
      </div>
    ))}
  </div>
</div>

<div className="mb-6">
  <h3 className="text-lg font-semibold mb-4">Servicios</h3>
  <div className="space-y-4">
    {insumos.map((insumo) => (
      <div key={insumo.id} className="flex items-center space-x-4 bg-white p-3 rounded-lg">
        <span className="flex-grow">{insumo.servicios}</span>
        <input
          type="number"
          value={insumo.cantidad_servicios}
          onChange={(e) => handleCantidadChange(insumo.id, e.target.value, 'cantidad_servicios')}
          min="1"
          className="w-24 p-2 border rounded"
        />
      </div>
    ))}
  </div>
</div>

<div className="mb-6">
  <h3 className="text-lg font-semibold mb-4">Paquete</h3>
  <div className="space-y-4">
    {insumos.map((insumo) => (
      <div key={insumo.id} className="flex items-center space-x-4 bg-white p-3 rounded-lg">
        <span className="flex-grow">{insumo.nombre_paquete}</span>
        <input
          type="number"
          value={insumo.cantidad_paquete}
          onChange={(e) => handleCantidadChange(insumo.id, e.target.value, 'cantidad_paquete')}
          min="1"
          className="w-24 p-2 border rounded"
        />
      </div>
    ))}
  </div>
</div>


              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Agregar Nuevos Insumos</h3>
                <InsumosSelect
                  onSelect={handleInsumosSelect}
                  selectedInsumos={selectedInsumos}
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleGuardarCambios}
                  className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Guardar Cambios
                </button>
              </div>
            </>
          ) : (
            <p>No se encontró información para esta solicitud.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SolicitudInsumosDetalle;