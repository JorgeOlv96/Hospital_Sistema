import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Modal from "./Modal";
import AddAppointmentModal from "../../components/Modals/AddApointmentModal";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function AddAppointmentModalEvaluar({
  closeModal,
  isOpen,
  appointmentId,
}) {
  const [patientData, setPatientData] = useState({});
  const [salasDisponibles, setSalasDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState({});
  const [nombre_especialidad, setNombreEspecialidad] = useState("");
  const [clave_esp, setClaveEspecialidad] = useState("");
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";

  const especialidadToClave = {
    Algología: "ALG",
    Angiología: "ANG",
    "C.Plástica y Reconstructiva": "CPR",
    Cardiología: "CAR",
    "Cirugía de Torax": "CTO",
    "Cirugía Bariatrica": "CBR",
    "Cirugía Cardiaca": "CCA",
    "Cirugía General": "CIG",
    "Cirugía Hepatobiliar": "CHE",
    Coloproctología: "CLP",
    Columna: "COL",
    Endoscopia: "END",
    Gastroenterología: "GAS",
    Hemodinamía: "HEM",
    Imagenología: "IMG",
    Maxilofacial: "MAX",
    Neurocirugía: "NEU",
    Oftalmología: "OFT",
    Oncología: "ONC",
    Orbitología: "OBT",
    Otorrino: "ONG",
    Proctología: "PRC",
    Procuración: "PCU",
    "T. de córnea": "TCO",
    "T. Hepático": "THE",
    "T. Renal": "TRN",
    Transplantes: "TRA",
    "Trauma y Ortopedia": "TYO",
    Urología: "URO",
  };

  const claveToEspecialidad = Object.fromEntries(
    Object.entries(especialidadToClave).map(([key, value]) => [value, key])
  );

  const handleNombreEspecialidadChange = (e) => {
    const selectedNombreEspecialidad = e.target.value;
    setNombreEspecialidad(selectedNombreEspecialidad);
    const correspondingClave =
      especialidadToClave[selectedNombreEspecialidad] ||
      "Seleccionar clave de especialidad";
    setClaveEspecialidad(correspondingClave);
    setPatientData({
      ...patientData,
      nombre_especialidad: selectedNombreEspecialidad,
      clave_esp: correspondingClave,
    });
  };

  const handleClaveEspecialidadChange = (e) => {
    const selectedClaveEspecialidad = e.target.value;
    setClaveEspecialidad(selectedClaveEspecialidad);
    const correspondingNombre =
      claveToEspecialidad[selectedClaveEspecialidad] || "";
    setNombreEspecialidad(correspondingNombre);
    setPatientData({
      ...patientData,
      nombre_especialidad: correspondingNombre,
      clave_esp: selectedClaveEspecialidad,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setPatientData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (isOpen && appointmentId) {
      const fetchAppointmentData = async () => {
        try {
          const response = await fetch(
            `${baseURL}/api/solicitudes/${appointmentId}`
          );
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          setPatientData(data);
          setOriginalData(data); // Guardar datos originales
          setLoading(false);
        } catch (error) {
          console.error("Error fetching appointment data:", error);
          setLoading(false);
        }
      };

      fetchAppointmentData();
    }
  }, [isOpen, appointmentId]);

  useEffect(() => {
    fetchSalasDisponibles();
  }, []);

  const fetchSalasDisponibles = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/salas/salas`);
      const disponibles = response.data.filter((sala) => sala.estado);
      setSalasDisponibles(disponibles);
    } catch (error) {
      console.error("Error fetching salas:", error);
    }
  };

  const handleSaveChanges = async () => {
    try {
      console.log("Datos a enviar:", patientData); // Verifica los datos aquí
      const response = await fetch(
        `${baseURL}/api/solicitudes/actualizarevaluacion/${appointmentId}`,
        {
          method: "PATCH",
          body: JSON.stringify(patientData),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      closeModal();
      window.location.reload();
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  const handleCancelChanges = () => {
    setPatientData(originalData); // Deshacer cambios
    setIsEditing(false);
  };

  const handlePreprogramar = async () => {
    const userConfirmed = window.confirm("¿Estás seguro de que deseas pre-programar esta solicitud? Asegúrate de haber generado el archivo PDF.");
    
    if (userConfirmed) {
      try {
        const response = await fetch(
          `${baseURL}/api/solicitudes/preprogramar/${appointmentId}`,
          {
            method: "PUT",
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        closeModal(); // Cerrar el modal después de preprogramar
        window.location.reload(); // Recargar la página
      } catch (error) {
        console.error("Error al preprogramar la solicitud:", error);
      }
    } else {
      console.log("Preprogramación cancelada por el usuario.");
    }
  };

    // Nueva función para manejar la visualización de la solicitud de insumos
    const handleViewInsumos = () => {
      // Redirigir a la página correspondiente
      navigate(`/solicitudes/solicitud-insumos/${appointmentId}`);
    };
  
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
  
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
  
    return `${day}-${month}-${year}`;
  };
  
  // Función para generar el PDF
 // Función para generar el PDF
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
    doc.text('PROCEDIMIENTO A REALIZAR', pageWidth / 2, getYPosition(6), { align: 'center' });

    printFieldAndValue("Fecha solicitada: ", formatDate(patientData.fecha_solicitada), 40, getYPosition(7));
    printFieldAndValue("Hora solicitada: ", patientData.hora_solicitada, 240, getYPosition(7));
    printFieldAndValue("Turno solicitado: ", patientData.turno_solicitado, 440, getYPosition(7));

    printFieldAndValue("Cirujano responsable: ", `DR(A). ${getValue(patientData.nombre_cirujano)}`, 40, getYPosition(8));

    printFieldAndValue("Tipo de intervención: ", patientData.tipo_intervencion, 40, getYPosition(9));
    printFieldAndValue("Especialidad: ", patientData.nombre_especialidad, 240, getYPosition(9));
    printFieldAndValue("Clave: ", patientData.clave_esp, 440, getYPosition(9));

    printFieldAndValue("Tiempo estimado de cirugía: ", `${getValue(patientData.tiempo_estimado)} Minutos`, 40, getYPosition(10));
    printFieldAndValue("Requiere insumos: ", patientData.req_insumo, pageWidth / 2, getYPosition(10));

    const maxLineHeight = 24; // Altura máxima para dos líneas de texto
    let currentY = getYPosition(11);

    // Procedimiento CIE-9
    printFieldAndValue("Procedimiento CI-E 9: ", patientData.procedimientos_paciente, 40, currentY);
    currentY += maxLineHeight + 10; // Agregar espacio después del CIE-9

    // Diagnóstico y procedimientos
    printFieldAndValue("Diagnóstico y procedimientos a realizar: ", patientData.diagnostico, 40, currentY);
    currentY += maxLineHeight;

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
  

  return (
    <Modal
      ref={modalRef}
      closeModal={closeModal}
      isOpen={isOpen}
      title={"Información completa"}
      width={"max-w-3xl"}
    >
      {loading ? (
        <div className="p-4">
          <img
            src="images/cargando.gif"
            alt="Cargando..."
            className="h-8 w-8 mx-auto"
          />
        </div>
      ) : (
        <div className="p-4">
  <div className="flex justify-between">
    <button
      onClick={() => generateDocument(patientData)}
      className="bg-green-500 text-white text-sm p-4 rounded-lg font-light"
      style={{ marginBottom: "8px" }}
    >
      Imprimir solicitud
    </button>

    <div className="flex space-x-2">
      {isEditing ? (
        <>
          <button
            className="bg-red-500 bg-opacity-20 text-red-500 text-sm p-3 rounded-lg font-light"
            onClick={handleCancelChanges}
          >
            Cancelar
          </button>
          <button
            className="bg-green-500 bg-opacity-20 text-green-500 text-sm p-3 rounded-lg font-light"
            onClick={handleSaveChanges}
          >
            Guardar Cambios
          </button>
        </>
      ) : (
        <button
          className="bg-blue-500 bg-opacity-20 text-blue-500 text-sm p-3 rounded-lg font-light"
          onClick={() => setIsEditing(true)}
        >
          Editar
        </button>
      )}
    </div>
    
    <button
      onClick={handlePreprogramar}
      className="bg-[#06ABC9] bg-opacity-20 text-[#001B58] text-sm p-3 rounded-lg font-light"
      style={{ marginBottom: "8px" }}
    >
      Pre-programar
    </button>


{/*     {patientData.req_insumo === "SI" && (
      <button
        onClick={handleViewInsumos}
        className="bg-[#06ABC9] bg-opacity-20 text-[#001B58] text-sm p-3 rounded-lg font-light"
        style={{ marginBottom: "8px" }}
      >
        Ver solicitud de insumos
      </button>
    )} */}
  </div>

          <div className="mr-4 w-full mb-2">
            <label className="block font-semibold text-gray-700 mb-2">
              Folio:
            </label>
            <p className="bg-gray-200 p-3 rounded-lg">
              {patientData?.folio || "N/A"}
            </p>
          </div>

          <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md">
            <div className="flex mt-4">
              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Apellido paterno:
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="ap_paterno"
                    value={patientData.ap_paterno}
                    onChange={handleChange}
                    className="bg-white p-3 rounded-lg w-full"
                    style={{ maxWidth: "100%", boxSizing: "border-box" }}
                  />
                ) : (
                  <p className="bg-gray-200 p-3 rounded-lg">
                    {patientData?.ap_paterno || "N/A"}
                  </p>
                )}
              </div>

              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Apellido materno:
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="ap_materno"
                    value={patientData.ap_materno}
                    onChange={handleChange}
                    className="bg-white p-3 rounded-lg w-full"
                    style={{ maxWidth: "100%", boxSizing: "border-box" }}
                  />
                ) : (
                  <p className="bg-gray-200 p-3 rounded-lg">
                    {patientData?.ap_materno || "N/A"}
                  </p>
                )}
              </div>

              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Nombre:
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="nombre_paciente"
                    value={patientData.nombre_paciente}
                    onChange={handleChange}
                    className="bg-white p-3 rounded-lg w-full"
                    style={{ maxWidth: "100%", boxSizing: "border-box" }}
                  />
                ) : (
                  <p className="bg-gray-200 p-3 rounded-lg">
                    {patientData?.nombre_paciente || "N/A"}
                  </p>
                )}
              </div>

              <div className="w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Sexo:
                </label>
                {isEditing ? (
                  <select
                    name="sexo"
                    value={patientData.sexo}
                    onChange={handleChange}
                    className="bg-white p-3 rounded-lg"
                  >
                    <option value="">-Seleccionar-</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                ) : (
                  <p className="bg-gray-200 p-3 rounded-lg">
                    {patientData?.sexo}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
            <div className="flex mb-4">
              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Tipo de admisión:
                </label>
                {isEditing ? (
                  <>
                    <select
                      name="tipo_admision"
                      value={patientData.tipo_admision}
                      onChange={handleChange}
                      className="bg-white p-3 rounded-lg w-full"
                      style={{ maxWidth: "100%", boxSizing: "border-box" }}
                    >
                      <option value="">Seleccionar</option>
                      <option value="Cama">Cama</option>
                      <option value="Consulta externa">Consulta externa</option>
                      <option value="UrgenciaS">Urgencia</option>
                    </select>

                    {patientData.tipo_admision === "Cama" && (
                      <div className="mt-4">
                        <label className="block font-semibold text-gray-700 mb-2">
                          Cama:
                        </label>
                        <input
                          type="text"
                          name="cama"
                          value={patientData.cama}
                          onChange={handleChange}
                          className="bg-white p-3 rounded-lg w-full"
                          style={{ maxWidth: "100%", boxSizing: "border-box" }}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <p className="bg-gray-200 p-3 rounded-lg">
                      {patientData?.tipo_admision}
                    </p>

                    {patientData.tipo_admision === "Cama" && (
                      <p className="mt-4 bg-gray-200 p-3 rounded-lg">
                        {patientData?.cama || "No especificada"}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Tipo de intervención:
                </label>
                {isEditing ? (
                  <select
                    name="tipo_intervencion"
                    value={patientData.tipo_intervencion}
                    onChange={handleChange}
                    className="bg-white p-3 rounded-lg w-full"
                    style={{ maxWidth: "100%", boxSizing: "border-box" }}
                  >
                    <option value="">Seleccionar</option>
                    <option value="Cirugía">Cirugía</option>
                    <option value="Procedimiento">Procedimiento</option>
                    <option value="Cirugía ambulatoria">
                      Cirugía ambulatoria
                    </option>
                  </select>
                ) : (
                  <p className="bg-gray-200 p-3 rounded-lg">
                    {patientData?.tipo_intervencion}
                  </p>
                )}
              </div>

              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Especialidad:
                </label>
                {isEditing ? (
                  <select
                    name="nombre_especialidad"
                    value={patientData.nombre_especialidad}
                    onChange={handleNombreEspecialidadChange}
                    className={`border ${
                      patientData.nombre_especialidad
                        ? "bg-[#A8CBD5] border-[#A8CBD5]"
                        : "border-gray-300"
                    } bg-white p-3 rounded-lg w-full`}
                    style={{ maxWidth: "100%", boxSizing: "border-box" }}
                  >
                    <option value="">Seleccionar</option>
                    {Object.keys(especialidadToClave).map((especialidad) => (
                      <option key={especialidad} value={especialidad}>
                        {especialidad}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="bg-gray-200 p-3 rounded-lg">
                    {patientData?.nombre_especialidad}
                  </p>
                )}
              </div>

              <div className="w-full">
                <label
                  htmlFor="clave_esp"
                  className="block font-semibold text-gray-700 mb-2"
                >
                  Cve.:
                </label>
                {isEditing ? (
                  <select
                    id="clave_esp"
                    name="clave_esp"
                    value={patientData.clave_esp}
                    onChange={handleClaveEspecialidadChange}
                    className={`border ${
                      patientData.clave_esp
                        ? "bg-[#A8CBD5] border-[#A8CBD5]"
                        : "border-gray-300"
                    } bg-white p-3 rounded-lg w-full`}
                    style={{ maxWidth: "100%", boxSizing: "border-box" }}
                  >
                    <option value="">Seleccionar</option>
                    {Object.values(especialidadToClave).map((clave) => (
                      <option key={clave} value={clave}>
                        {clave}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="bg-gray-200 p-3 rounded-lg">
                    {patientData?.clave_esp}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
            <div className="flex mb-4">
              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Fecha solicitada:
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    name="fecha_solicitada"
                    value={patientData.fecha_solicitada}
                    onChange={handleChange}
                    className="bg-white p-3 rounded-lg w-full"
                    style={{ maxWidth: "100%", boxSizing: "border-box" }}
                  />
                ) : (
                  <p className="bg-gray-200 p-3 rounded-lg">
                    {patientData?.fecha_solicitada}
                  </p>
                )}
              </div>

              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Hora solicitada:
                </label>
                {isEditing ? (
                  <input
                    type="time"
                    name="hora_solicitada"
                    value={patientData.hora_solicitada}
                    onChange={handleChange}
                    className="bg-white p-3 rounded-lg w-full"
                    style={{ maxWidth: "100%", boxSizing: "border-box" }}
                  />
                ) : (
                  <p className="bg-gray-200 p-3 rounded-lg">
                    {patientData?.hora_solicitada}
                  </p>
                )}
              </div>

              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Turno solicitado:
                </label>
                {isEditing ? (
                  <select
                    name="turno_solicitado"
                    value={patientData.turno_solicitado}
                    onChange={handleChange}
                    className="bg-white p-3 rounded-lg w-full"
                    style={{ maxWidth: "100%", boxSizing: "border-box" }}
                  >
                    <option value="">-Seleccionar-</option>
                    <option value="Matutino">Matutino</option>
                    <option value="Vespertino">Vespertino</option>
                    <option value="Nocturno">Nocturno</option>
                  </select>
                ) : (
                  <p className="bg-gray-200 p-3 rounded-lg">
                    {patientData?.turno_solicitado}
                  </p>
                )}
              </div>

              <div className="w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Sala solicitada:
                </label>
                {isEditing ? (
                  <select
                    id="sala_quirofano"
                    name="sala_quirofano"
                    value={patientData.sala_quirofano || ""}
                    onChange={handleChange}
                    className={`border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                    style={{ maxWidth: "100%", boxSizing: "border-box" }}
                  >
                    <option value="">Seleccionar</option>
                    {salasDisponibles.map((sala) => (
                      <option key={sala.id} value={sala.nombre_sala}>
                        Sala: {sala.nombre_sala}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="bg-gray-200 p-3 rounded-lg">
                    {patientData?.sala_quirofano || "N/A"}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
            <div className="flex mb-4">
              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Cirujano encargado:
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="nombre_cirujano"
                    value={patientData.nombre_cirujano}
                    onChange={handleChange}
                    className="bg-white p-3 rounded-lg"
                  />
                ) : (
                  <p className="bg-gray-200 p-3 rounded-lg">
                    {patientData?.nombre_cirujano || "N/A"}
                  </p>
                )}
              </div>

              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Requiere insumos:
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="req_insumo"
                    value={patientData.req_insumo}
                    onChange={handleChange}
                    className="bg-white p-3 rounded-lg"
                  />
                ) : (
                  <p className="bg-gray-200 p-3 rounded-lg">
                    {patientData?.req_insumo || "N/A"}
                  </p>
                )}
              </div>

              <div className="w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Proc. adicionales:
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="procedimientos_extra"
                    value={patientData.procedimientos_extra}
                    onChange={handleChange}
                    className="bg-white p-3 rounded-lg w-full"
                  />
                ) : (
                  <p className="bg-gray-200 p-3 rounded-lg">
                    {patientData?.procedimientos_extra}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
            <div className="flex mb-4">
              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Procedimientos paciente:
                </label>
                {isEditing ? (
                  <textarea
                    name="procedimientos_paciente"
                    value={patientData.procedimientos_paciente}
                    onChange={handleChange}
                    className="bg-white p-3 rounded-lg w-full"
                  />
                ) : (
                  <p className="bg-gray-200 p-3 rounded-lg">
                    {patientData?.procedimientos_paciente || "N/A"}
                  </p>
                )}
              </div>

              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Diagnóstico:
                </label>
                {isEditing ? (
                  <textarea
                    name="diagnostico"
                    value={patientData.diagnostico || ""}
                    onChange={handleChange}
                    className="bg-white p-3 rounded-lg w-full"
                  />
                ) : (
                  <p className="bg-gray-200 p-3 rounded-lg">
                    {patientData?.diagnostico || "N/A"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default AddAppointmentModalEvaluar;