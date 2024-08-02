import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Modal from "./Modal";
import AddAppointmentModal from "../../components/Modals/AddApointmentModal";

function AddAppointmentModalEvaluar({
  closeModal,
  isOpen,
  appointmentId,
  onSuspendAppointment,
}) {
  const [patientData, setPatientData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState({});
  const modalRef = useRef(null);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";

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

  const handleSaveChanges = async () => {
    try {
      console.log("Datos a enviar:", patientData);
      console.log("ID de la solicitud:", appointmentId); // Verificar el appointmentId

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
      closeModal(); // Cerrar el modal después de guardar los cambios
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
      window.location.reload();
    } catch (error) {
      console.error("Error preprogramar appointment:", error);
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
          <div className="mr-4 w-full">
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
                  <input
                    type="text"
                    name="sexo"
                    value={patientData.sexo}
                    onChange={handleChange}
                    className="bg-white p-3 rounded-lg w-full"
                    style={{ maxWidth: "100%", boxSizing: "border-box" }}
                  />
                ) : (
                  <p className="bg-gray-200 p-3 rounded-lg">
                    {patientData?.sexo || "N/A"}
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
                  <select
                    name="tipo_admision"
                    value={patientData.tipo_admision}
                    onChange={handleChange}
                    className="bg-white p-3 rounded-lg"
                  >
                    <option value="">-Seleccionar-</option>
                    <option value="Cama">Cama</option>
                    <option value="Consulta externa">Consulta externa</option>
                    <option value="UrgenciaS">Urgencia</option>
                  </select>
                ) : (
                  <p className="bg-gray-200 p-3 rounded-lg">
                    {patientData?.tipo_admision || "N/A"}
                  </p>
                )}
              </div>

              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Tipo de intervención:
                </label>
                {isEditing ? (
                  <select
                    type="text"
                    name="tipo_intervencion"
                    value={patientData.tipo_intervencion}
                    onChange={handleChange}
                    className="bg-white p-3 rounded-lg"
                  >
                    <option value="">-Seleccionar-</option>
                    <option value="Cirugía">Cirugia</option>
                    <option value="Procedimiento">Procedimiento</option>
                    <option value="Cirugía ambulatoria">
                      Cirugia ambulatoria
                    </option>
                  </select>
                ) : (
                  <p className="bg-gray-200 p-3 rounded-lg">
                    {patientData?.tipo_intervencion || "N/A"}
                  </p>
                )}
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
                {isEditing ? (
                  <input
                    type="date"
                    name="fecha_solicitada"
                    value={patientData.fecha_solicitada}
                    onChange={handleChange}
                    className="bg-white p-3 rounded-lg"
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
                    className="bg-white p-3 rounded-lg"
                  />
                ) : (
                  <p className="bg-gray-200 p-3 rounded-lg">
                    {patientData?.hora_solicitada}
                  </p>
                )}
              </div>

              <div className="w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Diagnóstico:
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="diagnostico"
                    value={patientData.diagnostico}
                    onChange={handleChange}
                    className="bg-white p-3 rounded-lg"
                  />
                ) : (
                  <p className="bg-gray-200 p-3 rounded-lg">
                    {patientData?.diagnostico}
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
                  Sala solicitada:
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="sala_quirofano"
                    value={patientData.sala_quirofano}
                    onChange={handleChange}
                    className="bg-white p-3 rounded-lg"
                  />
                ) : (
                  <p className="bg-gray-200 p-3 rounded-lg">
                    {patientData?.sala_quirofano || "N/A"}
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
            </div>
          </div>

          <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
            <div className="flex mb-4">
              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Procedimientos paciente:
                </label>
                <p className="bg-gray-200 p-3 rounded-lg">
                  {patientData?.procedimientos_paciente || "N/A"}
                </p>
              </div>
              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Procedimientos extra:
                </label>
                {isEditing ? (
                  <textarea
                    name="procedimientos_extra"
                    value={patientData.procedimientos_extra || ""}
                    onChange={handleChange}
                    className="bg-white p-3 rounded-lg w-full"
                  />
                ) : (
                  <p className="bg-gray-200 p-3 rounded-lg">
                    {patientData?.procedimientos_extra || "N/A"}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <button
              onClick={handlePreprogramar}
              className="bg-[#06ABC9] bg-opacity-20 text-[#001B58] text-sm p-4 rounded-lg font-light"
              style={{ marginBottom: "8px" }}
            >
              Pre-programar
            </button>

            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button
                      className="bg-red-500 bg-opacity-20 text-red-500 text-sm p-4 rounded-lg font-light"
                      onClick={handleCancelChanges}
                    >
                      Cancelar
                    </button>
                    <button
                      className="bg-green-500 bg-opacity-20 text-green-500 text-sm p-4 rounded-lg font-light"
                      onClick={handleSaveChanges}
                    >
                      Guardar Cambios
                    </button>
                </>
              ) : (
                <>
                  <button
                    className="bg-blue-500 bg-opacity-20 text-blue-500 text-sm p-4 rounded-lg font-light"
                    onClick={() => setIsEditing(true)}
                  >
                    Editar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default AddAppointmentModalEvaluar;
