import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../Layout";
import { useParams, useNavigate } from "react-router-dom";
import { Check, X, Trash2 } from "lucide-react";
import jsPDF from 'jspdf';
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
  onAddSelectedInsumos,
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
            <div className="flex space-x-4">
              <div className="flex-grow">
                <InsumosSelect 
                  onSelect={handleInsumosSelect} 
                  selectedInsumos={selectedInsumos} 
                />
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
            {selectedInsumos.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Insumos Seleccionados:</h4>
                <div className="space-y-2">
                  {selectedInsumos.map((insumo, index) => (
                    <div key={index} className="bg-white p-2 rounded">
                      {insumo.nombre}
                    </div>
                  ))}
                </div>
              </div>
            )}
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
        console.log("Datos separados:", datosSeparados);
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

        let datosActualizados = {};

        materialTypeMap.forEach((tipo, index) => {
            const nombres = insumoStates[index].map((i) => i.nombre).join(",");
            const cantidades = insumoStates[index].map((i) => i.cantidad).join(",");
            const disponibilidades = insumoStates[index].map((i) => (i.disponible ? "1" : "0")).join(",");

            if (nombres) {
                datosActualizados[tipo] = nombres;
                datosActualizados[cantidadTypeMap[index]] = cantidades;
                datosActualizados[`disponibilidad_${tipo}`] = disponibilidades;
            }
        });

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

  const generateDocument = async (patientData) => {
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
      doc.text('Solicitud, Registro y Autorización de Intervención Quirúrgica', pageWidth / 2, 40, { align: 'center' });
      doc.text('Nuevo Hospital General de Querétaro', pageWidth / 2, 60, { align: 'center' });
  
      // Autorización del Paciente
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Autorización del Paciente:', 40, 100);
  
      const autorizacionTexto = 'Autorizo a los médicos de la presente unidad médica a cargo de los servicios de salud del estado de Querétaro, para que efectúen los tratamientos e intervenciones quirúrgicas necesarias para el alivio y/o curación de mi padecimiento, en inteligencia de que conozco los beneficios, riesgos y posibles complicaciones a los que estoy sujeto (a) por medio del procedimiento quirúrgico y anestésico a cual seré sometido(a).';
      
      doc.text(autorizacionTexto, 40, 120, { maxWidth: pageWidth - 80, align: 'justify' });
  
      // Nombre y firma del paciente
      const nombreCompleto = `${getValue(patientData.ap_paterno)} ${getValue(patientData.ap_materno)} ${getValue(patientData.nombre_paciente)}`;
      doc.text(nombreCompleto, 40, 205);
      doc.line(40, 210, pageWidth / 2 - 20, 210);
      doc.text('Nombre del paciente o representante legal', 40, 225);
  
      doc.line(pageWidth / 2 + 20, 210, pageWidth - 40, 210);
      doc.text('Firma del paciente o representante legal', pageWidth / 2 + 20, 225);
  
      // Línea divisoria
      doc.setLineWidth(1.5);
      doc.line(40, 245, pageWidth - 40, 245);
  
      // Datos del Paciente
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('DATOS DEL PACIENTE', pageWidth / 2, 275, { align: 'center' });
  
      // Función para calcular la posición Y
      const getYPosition = (index) => 305 + (index * 30);
  
      // Ajustando las posiciones de los campos
      printFieldAndValue("Folio de Solicitud: ", patientData.folio, 40, getYPosition(0));
      printFieldAndValue("Fecha de recibo de solicitud: ", formatDate(patientData.fecha_solicitud), 300, getYPosition(0)); // Movido hacia la izquierda
  
      printFieldAndValue("CURP: ", patientData.curp, 40, getYPosition(1));
      printFieldAndValue("No. de Expediente: ", patientData.no_expediente, 220, getYPosition(1)); // Movido hacia la izquierda
      printFieldAndValue("Teléfono de contacto: ", patientData.tel_contacto, 400, getYPosition(1)); // Movido hacia la izquierda
  
      printFieldAndValue("Nombre del paciente: ", nombreCompleto, 40, getYPosition(2));
      printFieldAndValue("Fecha de nacimiento: ", formatDate(patientData.fecha_nacimiento), 400, getYPosition(2));
  
      printFieldAndValue("Edad: ", patientData.edad, 40, getYPosition(3));
      printFieldAndValue("Sexo: ", patientData.sexo, pageWidth / 2, getYPosition(3));
  
      // Sala, Procedencia, Cama (ajustando posiciones)
      let nextX = 40;
      printFieldAndValue("Sala solicitada: ", `Sala ${getValue(patientData.sala_quirofano)}`, nextX, getYPosition(4));
      nextX = adjustPosition(`Sala solicitada: Sala ${getValue(patientData.sala_quirofano)}`, nextX, getYPosition(4), 200);
      
      const tipoAdmision = getValue(patientData.tipo_admision);
      printFieldAndValue("Procedencia del paciente: ", tipoAdmision === 'CONSULTA EXTERNA' ? 'C.E.' : tipoAdmision, nextX, getYPosition(4));
      nextX = adjustPosition(`Procedencia del paciente: ${tipoAdmision === 'CONSULTA EXTERNA' ? 'C.E.' : tipoAdmision}`, nextX, getYPosition(4), 200);
      
      printFieldAndValue("Cama: ", patientData.cama, nextX, getYPosition(4));
  
      // Segunda línea divisoria
      doc.setLineWidth(1.5);
      doc.line(40, getYPosition(5), pageWidth - 40, getYPosition(5));
  
      // Procedimiento a realizar
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('MATERIALES REQUERIDOS', pageWidth / 2, 450, { align: 'center' });
  
      const materiales = [
        { tipo: 'Adicional', items: patientData.material_adicional },
        { tipo: 'Externo', items: patientData.material_externo },
        { tipo: 'Paquetes', items: patientData.nombre_paquete },
        { tipo: 'Servicios', items: patientData.servicios },
        { tipo: 'Medicamentos', items: patientData.medicamentos },
      ];
  
      let currentY = 470;
      const marginX = 40;
      const lineHeight = 14;
      const maxTextWidth = pageWidth - 2 * marginX;
  
      for (const material of materiales) {
        if (currentY + lineHeight > pageHeight - 60) {
          doc.addPage();
          currentY = 40;
        }
  
        doc.setFont('Helvetica', 'bold');
        doc.text(`${material.tipo}:`, marginX, currentY);
        currentY += lineHeight;
  
        doc.setFont('Helvetica', 'normal');
        if (Array.isArray(material.items)) {
          for (const item of material.items) {
            const materialText = `${getValue(item.nombre)} - ${getValue(item.cantidad)}`;
            const splitText = doc.splitTextToSize(materialText, maxTextWidth);
        
            for (const line of splitText) {
              if (currentY + lineHeight > pageHeight - 60) {
                doc.addPage();
                currentY = 40;
              }
              doc.text(line, marginX, currentY);
              currentY += lineHeight;
            }
          }
        } else {
          doc.text('No hay materiales disponibles.', marginX, currentY);
          currentY += lineHeight;
        }
  
        currentY += 10; // Espaciado entre secciones de materiales
      }
  
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
      const cirujanoX = 40; // Posición X de la etiqueta
      const cirujanoY = pageHeight - 40; // Posición Y
      doc.text(cirujanoLabel, cirujanoX, cirujanoY);
  
      // Calcular la posición para la línea
      const cirujanoLineX = cirujanoX + doc.getStringUnitWidth(cirujanoLabel) * doc.internal.getFontSize() / doc.internal.scaleFactor + 10; // Agregar un poco de espacio
      doc.line(cirujanoLineX, pageHeight - 35, cirujanoLineX + 100, pageHeight - 35); // Ajustar longitud de la línea
  
      // Firma y sello
      const firmaLabel = 'Firma y sello:';
      const firmaX = pageWidth / 2; // Posición X de la etiqueta para firma
      doc.text(firmaLabel, firmaX, cirujanoY);
  
      // Calcular la posición para la línea de firma
      const firmaLineX = firmaX + doc.getStringUnitWidth(firmaLabel) * doc.internal.getFontSize() / doc.internal.scaleFactor + 10; // Agregar un poco de espacio
      doc.line(firmaLineX, pageHeight - 35, firmaLineX + 100, pageHeight - 35); // Ajustar longitud de la línea
  
      // Guardar el PDF
      doc.save(`Solicitud_${getValue(patientData.folio)}.pdf`);
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