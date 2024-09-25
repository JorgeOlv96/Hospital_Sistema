import React, { useState, useEffect, useRef } from "react";
import Modal from "./Modal";
import axios from "axios";
import PatientMedicineServiceModal from "./PatientMedicineServiceModal";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";

function AddAppointmentModal({
  closeModal,
  isOpen,
  appointmentId,
  onDeleteAppointment,
}) {
  const [open, setOpen] = useState(false);
  const [patientData, setPatientData] = useState({});
  const [loading, setLoading] = useState(true);
  const modalRef = useRef(null);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";

  const [reload] = useState(1);

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
          setLoading(false);
        } catch (error) {
          console.error("Error fetching appointment data:", error);
          setLoading(false);
        }
      };

      fetchAppointmentData();
    }
  }, [isOpen, appointmentId, reload]);

  const handleDelete = async () => {
    const confirmation = window.confirm(
      "¿Estás seguro de que deseas eliminar esta solicitud?"
    );
    if (confirmation) {
      try {
        const response = await axios.put(
          `${baseURL}/api/solicitudes/delete/${appointmentId}`
        );
        if (response.status === 200) {
          onDeleteAppointment(appointmentId); // Notificar al componente padre que la solicitud ha sido eliminada
          closeModal(); // Cerrar el modal
          window.location.reload();
        } else {
          console.error("Unexpected response:", response);
        }
      } catch (error) {
        console.error("Error deleting appointment:", error.message);
        // Puedes mostrar una notificación al usuario si es necesario
      }
    }
  };

  // Función para generar el documento
  const generateDocument = async () => {
    try {
      // Cargar la plantilla docx como arrayBuffer
      const response = await fetch("/plantilla.docx");
      const arrayBuffer = await response.arrayBuffer();
      const zip = new PizZip(arrayBuffer);

      // Cargar los datos en el template
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // Reemplazar los campos de la plantilla con los datos de la consulta
      doc.render({
        folio: patientData.folio || "N/A",
        nombre_cirujano: patientData.nombre_cirujano || "N/A",
        fecha_solicitud: patientData.fecha_solicitud || "N/A",
        curp: patientData.curp || "N/A",
        no_expediente: patientData.no_expediente || "N/A",
        tel_contacto: patientData.tel_contacto || "N/A",
        ap_paterno: patientData.ap_paterno || "N/A",
        ap_materno: patientData.ap_materno || "N/A",
        nombre_paciente: patientData.nombre_paciente || "N/A",
        fecha_nacimiento: patientData.fecha_nacimiento || "N/A",
        edad: patientData.edad || "N/A",
        sexo: patientData.sexo || "N/A",
        sala_quirofano: patientData.sala_quirofano || "N/A",
        nombre_especialidad: patientData.nombre_especialidad || "N/A",
        clave_esp: patientData.clave_esp || "N/A",
        tipo_intervencion: patientData.tipo_intervencion || "N/A",
        tipo_admision: patientData.tipo_admision || "N/A",
        cama: patientData.cama || "N/A",
        fecha_solicitada: patientData.fecha_solicitada || "N/A",
        hora_solicitada: patientData.hora_solicitada || "N/A",
        turno_solicitado: patientData.turno_solicitado || "N/A",
        tiempo_estimado: patientData.tiempo_estimado || "N/A",
        procedimientos_paciente: patientData.procedimientos_paciente || "N/A",
        procedimientos_extra: patientData.procedimientos_extra || "N/A",
        req_insumo: patientData.req_insumo,
        diagnostico: patientData.diagnostico || "N/A",
      });

      // Generar el archivo .docx
      const output = doc.getZip().generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      // Descargar el archivo como .docx
      saveAs(output, `Solicitud_${patientData.folio}.docx`);
    } catch (error) {
      console.error("Error generating document:", error);
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
      {open && (
        <PatientMedicineServiceModal
          closeModal={() => setOpen(!open)}
          isOpen={open}
          patient={true}
          patientData={patientData}
        />
      )}

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
              onClick={closeModal}
              className="bg-blue-500 bg-opacity-20 text-blue-500 text-sm p-4 rounded-lg font-light"
              style={{ marginBottom: "8px" }}
            >
              Cerrar
            </button>

            {patientData?.estado_solicitud === "Pendiente" && (
              <button
                onClick={handleDelete}
                className="bg-red-500 bg-opacity-20 text-red-500 text-sm p-4 rounded-lg font-light"
              >
                Eliminar solicitud
              </button>
            )}
            <button
              onClick={generateDocument}
              className="bg-green-500 text-white text-sm p-4 rounded-lg font-light"
            >
              Imprimir Solicitud
            </button>
          </div>

          <div className="mr-4 w-full mb-2">
            <label className="block font-semibold text-gray-700 mb-2">
              Folio:
            </label>
            <p className="bg-gray-200 p-3 rounded-lg">
              {patientData?.folio || "N/A"}
            </p>
          </div>

          {/* Agrega aquí el nuevo campo "Elaborado por" */}
          <div className="mr-4 w-full mb-2">
            <label className="block font-semibold text-gray-700 mb-2">
             Teléfono de contacto:
            </label>
            <p className="bg-gray-200 p-3 rounded-lg">
              {patientData?.tel_contacto || "N/A"}
            </p>
          </div>

          <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md">
            <div className="flex mt-4">
              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Apellido paterno:
                </label>
                <p className="bg-gray-200 p-3 rounded-lg">
                  {patientData?.ap_paterno || "N/A"}
                </p>
              </div>

              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Apellido materno:
                </label>
                <p className="bg-gray-200 p-3 rounded-lg">
                  {patientData?.ap_materno || "N/A"}
                </p>
              </div>

              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Nombre:
                </label>
                <p className="bg-gray-200 p-3 rounded-lg">
                  {patientData?.nombre_paciente || "N/A"}
                </p>
              </div>

              <div className="w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Sexo:
                </label>
                <p className="bg-gray-200 p-3 rounded-lg">
                  {patientData?.sexo || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
            <div className="flex mb-4">
              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Tipo de admisión:
                </label>
                <p className="bg-gray-200 p-3 rounded-lg">
                  {patientData?.tipo_admision || "N/A"}
                </p>
              </div>

              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Tipo de intervención:
                </label>
                <p className="bg-gray-200 p-3 rounded-lg">
                  {patientData?.tipo_intervencion || "N/A"}
                </p>
              </div>

              <div className="w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Especialidad:
                </label>
                <p className="bg-gray-200 p-3 rounded-lg">
                  {patientData?.nombre_especialidad || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
            <div className="flex mb-4">
              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Fecha solicitada:
                </label>
                <p className="bg-gray-200 p-3 rounded-lg">
                  {patientData?.fecha_solicitada || "N/A"}
                </p>
              </div>

              <div className="w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Hora solicitada:
                </label>
                <p className="bg-gray-200 p-3 rounded-lg">
                  {patientData?.hora_solicitada || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
            <div className="flex mb-4">
              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Tiempo estimado de cirugía:
                </label>
                <p className="bg-gray-200 p-3 rounded-lg">
                  {patientData?.tiempo_estimado || "N/A"}
                </p>
              </div>

              <div className="w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Turno solicitado:
                </label>
                <p className="bg-gray-200 p-3 rounded-lg">
                  {patientData?.turno_solicitado || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
            <div className="flex mb-4">
              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Sala solicitada:
                </label>
                <p className="bg-gray-200 p-3 rounded-lg">
                  {patientData?.sala_quirofano || "N/A"}
                </p>
              </div>

              <div className="w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Procedimientos que se realizarán al paciente:
                </label>
                <p className="bg-gray-200 p-3 rounded-lg">
                  {patientData?.procedimientos_paciente || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
            <div className="flex mb-4">
              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Cirujano encargado:
                </label>
                <p className="bg-gray-200 p-3 rounded-lg">
                  {patientData?.nombre_cirujano || "N/A"}
                </p>
              </div>

              <div className="w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Requiere insumos:
                </label>
                <p className="bg-gray-200 p-3 rounded-lg">
                  {patientData?.req_insumo}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default AddAppointmentModal;
