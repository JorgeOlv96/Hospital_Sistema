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
        <label className="block font-semibold text-gray-700 mb-2">Resumen médico:</label>
        <p className="bg-white p-3 rounded-lg">{solicitudData.resumen_medico || "N/A"}</p>
      </div>
    </div>
  </div>
);

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
  solicitudData,
  materialType,
  insumos,
  setInsumos,
  handleCantidadChange,
  toggleDisponibilidad,
  handleEliminarInsumo,
  handleInsumosSelect,
  selectedInsumos,
  onAddSelectedInsumos,
  packageInsumos,
}) => {
  const [showPackageModal, setShowPackageModal] = useState(false);

  const materialTypeMap = {
    material_adicional: {
      title: "Material Adicional",
      nombreField: "material_adicional",
      cantidadField: "cantidad_adicional",
      component: AdicionalSelect, // Componente específico para material adicional
    },
    material_externo: {
      title: "Material Externo",
      nombreField: "material_externo",
      cantidadField: "cantidad_externo",
      component: InsumosSelect, // Componente específico para material externo
    },
    servicios: {
      title: "Servicios",
      nombreField: "servicios",
      cantidadField: "cantidad_servicios",
      component: InsumosSelect, // Componente específico para servicios
    },
    paquetes: {
      title: "Paquetes",
      nombreField: "nombre_paquete",
      cantidadField: "cantidad_paquete",
      component: PaquetesSelect, // Componente específico para paquetes
    },
  };

  const currentType = materialTypeMap[materialType];
  const SelectComponent = currentType?.component || null; 

  useEffect(() => {
    if (solicitudData && solicitudData[currentType.nombreField]) {
      const nombres = solicitudData[currentType.nombreField]
        .split(",")
        .filter((nombre) => nombre.trim() !== "");
      const cantidades = solicitudData[currentType.cantidadField]
        ? solicitudData[currentType.cantidadField]
            .split(",")
            .filter((cantidad) => cantidad.trim() !== "")
        : [];
      const disponibilidades = solicitudData[`disponibilidad_${materialType}`]
        ? solicitudData[`disponibilidad_${materialType}`]
            .split(",")
            .filter((disp) => disp.trim() !== "")
        : [];
  
      const insumosIniciales = nombres.map((nombre, index) => ({
        id: index,
        nombre: nombre.trim(),
        cantidad: parseInt(cantidades[index] || "0") || 0,
        disponible: disponibilidades[index] === "1", // true si es 1, false si es 0 o no definido
      }));
  
      // Si no hay insumos en la solicitud, inicializar con disponibilidad en false (0)
      const insumosConDefault = insumosIniciales.length > 0
        ? insumosIniciales
        : nombres.map((nombre, index) => ({
            id: index,
            nombre: nombre.trim(),
            cantidad: parseInt(cantidades[index] || "0") || 0,
            disponible: false, // Por default, todos no disponibles
          }));
  
      setInsumos(insumosConDefault);
    }
  }, [solicitudData, materialType]);
  

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-lg mb-6">
      {solicitudData ? (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">
              Lista de {currentType.title}
            </h3>
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
                    onChange={(e) =>
                      handleCantidadChange(insumo.id, e.target.value)
                    }
                    min="1"
                    className="w-24 p-2 border rounded"
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleDisponibilidad(insumo.id, true)}
                      className={`p-2 rounded ${
                        insumo.disponible
                          ? "bg-green-100 border border-green-500"
                          : "bg-gray-200"
                      }`}
                    >
                      <Check className="text-green-600" />
                    </button>
                    <button
                      onClick={() => toggleDisponibilidad(insumo.id, false)}
                      className={`p-2 rounded ${
                        !insumo.disponible
                          ? "bg-red-100 border border-red-500"
                          : "bg-gray-200"
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

          {materialType === "paquetes" && solicitudData.nombre_paquete && (
            <div className="mb-4 bg-blue-50 p-4 rounded-lg flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold flex items-center">
                  <Package className="mr-2 text-blue-600" />
                  Paquete Seleccionado: {solicitudData.nombre_paquete}
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
              packageName={solicitudData.nombre_paquete}
              packageInsumos={packageInsumos}
              onClose={() => setShowPackageModal(false)}
            />
          )}

<div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">
              Agregar Nuevos {currentType.title}
            </h3>
            <div className="flex space-x-4">
              <div className="flex-grow">
                {SelectComponent && (
                  <SelectComponent
                    onSelect={handleInsumosSelect}
                    selectedInsumos={selectedInsumos}
                  />
                )}
              </div>
              {selectedInsumos.length > 0 && (
                <button
                  onClick={onAddSelectedInsumos}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Agregar Seleccionados
                </button>
              )}
            </div>
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
        setSolicitudData(null);
        const response = await axios.get(`${baseURL}/api/insumos/solicitudes-insumos/${appointmentId}`);
        
        const datosSeparados = separarInsumos(response.data);
        
        setSolicitudData(response.data);
        setInsumoStates(Object.values(datosSeparados));

        // Fetch package insumos if a package is selected
        if (response.data.nombre_paquete) {
          const paqueteInsumosResponse = await axios.get(
            `${baseURL}/api/insumos/paquete-insumos?nombre_paquete=${encodeURIComponent(response.data.nombre_paquete)}`
          );
          
          // Assuming the backend returns the insumos for the specific package
          // If the endpoint works differently, adjust this accordingly
          setPackageInsumos(paqueteInsumosResponse.data[0]?.insumos || null);
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

        let datosActualizados = {};

        materialTypeMap.forEach((tipo, index) => {
            const nombres = insumoStates[index].map((i) => i.nombre).join(",");
            const cantidades = insumoStates[index].map((i) => i.cantidad).join(",");
            const disponibilidades = insumoStates[index].map((i) => (i.disponible ? "1" : "0")).join(",");

            // Modificación: Si hay nombres, usa los datos de insumoStates
            if (nombres) {
                datosActualizados[tipo] = nombres;
                datosActualizados[cantidadTypeMap[index]] = cantidades;
                datosActualizados[`disponibilidad_${tipo}`] = disponibilidades;
            } 
            // Modificación: Si no hay nombres, usa los datos originales de solicitudData
            else if (solicitudData[tipo]) {
                datosActualizados[tipo] = solicitudData[tipo];
                datosActualizados[cantidadTypeMap[index]] = solicitudData[cantidadTypeMap[index]];
                // Asume que necesitas manejar la disponibilidad de alguna manera
                datosActualizados[`disponibilidad_${tipo}`] = solicitudData[`disponibilidad_${tipo}`] || '';
            }
        });

        // Asegúrate de incluir los paquetes explícitamente
        if (solicitudData.nombre_paquete) {
            datosActualizados.nombre_paquete = solicitudData.nombre_paquete;
            datosActualizados.cantidad_paquete = solicitudData.cantidad_paquete;
            datosActualizados.disponibilidad_paquete = solicitudData.disponibilidad_paquete;
        }

        // Log para verificar los datos después del filtro
        console.log("Datos enviados al backend después del filtro:", datosActualizados);

        const response = await axios.patch(`${baseURL}/api/insumos/insumos-disponibles/${appointmentId}`, datosActualizados);

        setSolicitudData((prev) => ({ ...prev, ...response.data.datos }));
        setMensaje({ tipo: "success", texto: "Cambios guardados exitosamente" });

        navigate(-1); // Navegar a la página anterior
    } catch (error) {
        console.error("Error guardando cambios:", error);
        setMensaje({ tipo: "error", texto: "Error al guardar los cambios" });
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

      const fetchPackageInsumos = (nombrePaquete) => {
        try {
          // Usar una llamada síncrona con jQuery.ajax
          const response = $.ajax({
            url: `${baseURL}/api/insumos/paquete-insumos`,
            data: { nombre_paquete: nombrePaquete },
            method: 'GET',
            async: false // Importante: llamada síncrona
          });

          // Procesar la respuesta
          const paqueteInsumos = response.responseJSON;
          return paqueteInsumos[0] || null;
        } catch (error) {
          console.error('Error al obtener insumos del paquete:', error);
          return null;
        }
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
  
      const splitMaterialInfo = (materialString) => {
        if (!materialString) return [];
        return materialString.split(',').map(item => {
          item = item.trim();
          // Buscar un espacio seguido de un guion
          const separatorMatch = item.match(/\s+-\s+/);
          
          if (separatorMatch) {
            // Si encuentra el patrón de espacio-guion-espacio, separa en consecuencia
            const [clave, descripcion] = item.split(/\s+-\s+/);
            return {
              clave: clave.trim(),
              descripcion: descripcion.trim()
            };
          } else {
            // Si no encuentra el patrón, considera todo como descripción
            return {
              clave: 'N/A',
              descripcion: item
            };
          }
        });
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
      const resumenMedico = getValue(solicitudData.resumen_medico);
      const splitResumenMedico = doc.splitTextToSize(resumenMedico, maxWidth);
      const resumenPosY = diagnosticoPosY + (splitDiagnostico.length * 15);
      printFieldAndValue("Resumen médico: ", "", 40, resumenPosY);
      splitResumenMedico.forEach((line, index) => {
          doc.text(line, 
              40 + doc.getStringUnitWidth("Resumen médico: ") * doc.internal.getFontSize() / doc.internal.scaleFactor + 10, 
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
          items: splitMaterialInfo(solicitudData.material_adicional),
          cantidades: solicitudData.cantidad_adicional ? solicitudData.cantidad_adicional.split(',').map(c => c.trim()) : []
        },
        { 
          tipo: 'Material Externo', 
          items: splitMaterialInfo(solicitudData.material_externo),
          cantidades: solicitudData.cantidad_externo ? solicitudData.cantidad_externo.split(',').map(c => c.trim()) : []
        },
          { 
            tipo: 'Paquetes', 
            items: splitMaterialInfo(solicitudData.nombre_paquete).flatMap(paquete => {
              // Buscar los insumos del paquete
              const paqueteConInsumos = fetchPackageInsumos(paquete.descripcion);
              
              // Si se encuentran los insumos, expandir a múltiples filas
              if (paqueteConInsumos && paqueteConInsumos.insumos) {
                return paqueteConInsumos.insumos.map(insumo => ({
                  clave: paquete.descripcion, // Nombre del paquete en la columna de clave
                  descripcion: `${insumo.clave_insumo} - ${insumo.descripcion_insumo}`,
                  cantidad: String(insumo.cantidad_default || '1') // Asegurar que sea un string
                }));
              }
              
              // Si no hay insumos, devolver el paquete original
              return [{
                clave: paquete.descripcion,
                descripcion: 'Sin insumos definidos',
                cantidad: '1' // Asegurar que sea un string
              }];
            }),
            cantidades: [] // Las cantidades ahora están incluidas en cada insumo
          },
        { 
          tipo: 'Servicios', 
          items: splitMaterialInfo(solicitudData.servicios),
          cantidades: solicitudData.cantidad_servicios ? solicitudData.cantidad_servicios.split(',').map(c => c.trim()) : []
        },
        { 
          tipo: 'Medicamentos', 
          items: splitMaterialInfo(solicitudData.medicamentos),
          cantidades: solicitudData.cantidad_medicamento ? solicitudData.cantidad_medicamento.split(',').map(c => c.trim()) : []
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
  // Convertir cantidad a string explícitamente
  cantidad = String(cantidad || '1');
  
  doc.setFont('Helvetica', 'normal');
  
  // Ajuste de texto para descripción con cálculo de altura
  const maxWidth = columnWidths[1] - 10; // Margen interno
  const splitDescription = doc.splitTextToSize(descripcion || 'N/A', maxWidth);
  const descriptionHeight = splitDescription.length * 12;
  const dynamicRowHeight = Math.max(rowHeight, descriptionHeight + 10);
  
  // Dibujar rectángulos de las celdas con altura dinámica
  doc.rect(marginX, y, columnWidths[0], dynamicRowHeight);
  doc.rect(marginX + columnWidths[0], y, columnWidths[1], dynamicRowHeight);
  doc.rect(marginX + columnWidths[0] + columnWidths[1], y, columnWidths[2], dynamicRowHeight);
  
  // Texto de la clave
  doc.text(clave || 'N/A', marginX + 5, y + 15);
  
  // Dibujar descripción con múltiples líneas si es necesario
  splitDescription.forEach((line, index) => {
    doc.text(line, marginX + columnWidths[0] + 5, y + 15 + (index * 12));
  });
  
  // Cantidad centrada verticalmente
  doc.text(cantidad, marginX + columnWidths[0] + columnWidths[1] + 5, y + (dynamicRowHeight / 2) + 5);
  
  return dynamicRowHeight;
};

let currentY = tableTop;
let pageNum = 1;

materialesSecciones.forEach(seccion => {
  if (seccion.items.length > 0) {
    // Agregar encabezado de sección con verificación de espacio
    if (currentY + 40 > pageHeight - 150) { // Dejar espacio para firmas y pie de página
      doc.addPage();
      currentY = 40;
      pageNum++;
    }
    doc.setFont('Helvetica', 'bold');
    doc.text(`${seccion.tipo}:`, marginX, currentY);
    currentY += 20;

    // Dibujar encabezados de tabla
    drawTableHeaders(currentY);
    currentY += rowHeight;

    // Dibujar filas
    seccion.items.forEach((item) => {
      // Verificación de espacio más estricta
      if (currentY + 30 > pageHeight - 150) { // Dejar espacio para firmas
        doc.addPage();
        currentY = 40;
        pageNum++;
        drawTableHeaders(currentY);
        currentY += rowHeight;
      }

      const dynamicRowHeight = drawTableRow(
        currentY, 
        item.clave, 
        item.descripcion, 
        item.cantidad, // Ahora ya es un string
        doc,
        marginX,
        columnWidths,
        rowHeight
      );
      
      currentY += dynamicRowHeight + 5;
    });

    // Espacio entre secciones
    currentY += 10;
  }
});


      // Asegurar que hay suficiente espacio antes de la línea divisoria final
      const minSpaceBeforeLine = 30;
      if (pageHeight - 80 - currentY < minSpaceBeforeLine) {
        currentY = pageHeight - 80 - minSpaceBeforeLine;
      }

      // Línea divisoria final
      doc.setLineWidth(1.5);
      doc.line(40, pageHeight - 80, pageWidth - 40, pageHeight - 80);

      // Cirujano responsable
      doc.setFont('Helvetica', 'bold');
      const cirujanoLabel = 'Cirujano responsable:';
      const cirujanoX = 40;
      const cirujanoY = pageHeight - 40;
      doc.text(cirujanoLabel, cirujanoX, cirujanoY);

      // Calcular la posición para la línea
      const cirujanoLineX = cirujanoX + doc.getStringUnitWidth(cirujanoLabel) * doc.internal.getFontSize() / doc.internal.scaleFactor + 10;
      doc.line(cirujanoLineX, pageHeight - 35, cirujanoLineX + 100, pageHeight - 35);

      // Firma y sello
      const firmaLabel = 'Firma y sello:';
      const firmaX = pageWidth / 2;
      doc.text(firmaLabel, firmaX, cirujanoY);

      // Calcular la posición para la línea de firma
      const firmaLineX = firmaX + doc.getStringUnitWidth(firmaLabel) * doc.internal.getFontSize() / doc.internal.scaleFactor + 10;
      doc.line(firmaLineX, pageHeight - 35, firmaLineX + 100, pageHeight - 35);

      // Guardar el PDF
      doc.save(`Solicitud_${getValue(solicitudData.folio)}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
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
          className="bg-green-500 text-white text-sm p-4 rounded-lg font-light"
          style={{ marginBottom: "8px" }}
        >
          Imprimir solicitud
        </button>

        {mensaje.texto && <Alert className={`mb-4 ${mensaje.tipo === "error" ? "bg-red-100" : "bg-green-100"}`}>{mensaje.texto}</Alert>}
        
        {solicitudData && <PatientInfoBlock solicitudData={solicitudData} />}
        
        {activeMaterialTypes.map((materialType, index) => {
          const originalIndex = materialTypes.indexOf(materialType);
          return (
            <InsumoBlock
              key={materialType}
              solicitudData={solicitudData}
              materialType={materialType}
              insumos={insumoStates[originalIndex]}
              setInsumos={(newInsumos) => {
                const newInsumoStates = [...insumoStates];
                newInsumoStates[originalIndex] = newInsumos;
                setInsumoStates(newInsumoStates);
              }}
              handleCantidadChange={createHandler(originalIndex, 'cantidad')}
              toggleDisponibilidad={createHandler(originalIndex, 'disponibilidad')}
              handleEliminarInsumo={createHandler(originalIndex, 'eliminar')}
              handleInsumosSelect={setSelectedInsumos}
              selectedInsumos={selectedInsumos}
              packageInsumos={materialType === 'paquetes' ? packageInsumos : null}
            />
          );
        })}

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