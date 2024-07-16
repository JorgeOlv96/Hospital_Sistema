import React, { useState, useEffect, useRef } from "react";
import Modal from "./Modal";

function AddAppointmentModalEnfermeria({ closeModal, isOpen, appointmentId }) {
  const [patientData, setPatientData] = useState({
    hora_asignada: "",
    turno: "",
    fecha_programada: "",
    nombre_anestesiologo: "",
    procedimientos_extra: [],
  });
  const [loading, setLoading] = useState(true);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen && appointmentId) {
      const fetchAppointmentData = async () => {
        try {
          const response = await fetch(
            `http://localhost:4000/api/solicitudes/${appointmentId}`
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
  }, [isOpen, appointmentId]);

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
          <div className="mr-4 w-full">
            <label className="block font-semibold text-gray-700 mb-2">
              Folio:
            </label>
            <p className="bg-gray-200 p-3 rounded-lg cursor-default">
              {patientData?.folio || "N/A"}
            </p>
          </div>

          <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md">
            <div className="flex mt-4">
              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Apellido paterno:
                </label>
                <p className="bg-gray-200 p-3 rounded-lg cursor-default">
                  {patientData?.ap_paterno || "N/A"}
                </p>
              </div>

              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Apellido materno:
                </label>
                <p className="bg-gray-200 p-3 rounded-lg cursor-default">
                  {patientData?.ap_materno || "N/A"}
                </p>
              </div>

              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Nombre:
                </label>
                <p className="bg-gray-200 p-3 rounded-lg cursor-default">
                  {patientData?.nombre_paciente || "N/A"}
                </p>
              </div>

              <div className="w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Sexo:
                </label>
                <p className="bg-gray-200 p-3 rounded-lg cursor-default">
                  {patientData?.sexo || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
            <div className="flex mb-4">
              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Fecha asignada:
                </label>
                <input
                  type="date"
                  name="fecha_programada"
                  value={patientData.fecha_programada || ""}
                  className="bg-gray-200 p-3 rounded-lg w-full cursor-default"
                  readOnly
                />
              </div>

              <div className="w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Hora asignada:
                </label>
                <input
                  type="time"
                  name="hora_asignada"
                  value={patientData.hora_asignada || ""}
                  className="bg-gray-200 p-3 rounded-lg w-full cursor-default"
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
            <div className="flex mb-4">
              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Tiempo estimado de cirugía:
                </label>
                <input
                  type="text"
                  name="tiempo_estimado"
                  value={patientData.tiempo_estimado || ""}
                  className="bg-gray-200 p-3 rounded-lg w-full cursor-default"
                  readOnly
                />
              </div>

              <div className="w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Turno asignado:
                </label>
                <input
                  type="text"
                  name="turno"
                  value={patientData.turno || ""}
                  className="bg-gray-200 p-3 rounded-lg w-full cursor-default"
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
            <div className="flex mb-4">
              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Quirófano asignado:
                </label>
                <input
                  type="text"
                  name="sala_quirofano"
                  value={patientData.sala_quirofano || ""}
                  className="bg-gray-200 p-3 rounded-lg w-full cursor-default"
                  readOnly
                />
              </div>

              <div className="w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Nombre del anestesiólogo:
                </label>
                <input
                  type="text"
                  name="nombre_anestesiologo"
                  value={patientData.nombre_anestesiologo || ""}
                  className="bg-gray-200 p-3 rounded-lg w-full cursor-default"
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
            <div className="flex mb-4">
              <div className="w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Diagnóstico:
                </label>
                <input
                  type="text"
                  name="diagnostico"
                  value={patientData.diagnostico || ""}
                  className="bg-gray-200 p-3 rounded-lg w-full cursor-default"
                  readOnly
                />
              </div>
            </div>

            <div className="flex mb-4">
              <div className="w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Procedimiento(s) a realizar:
                </label>
                <textarea
                  name="procedimientos"
                  value={patientData.procedimientos_paciente || ""}
                  className="bg-gray-200 p-3 rounded-lg w-full cursor-default"
                  readOnly
                />
              </div>
            </div>

          </div>

          <div className="flex justify-end mt-4">
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2"
              onClick={closeModal}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default AddAppointmentModalEnfermeria;
