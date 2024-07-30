import React, { useState, useEffect, useRef } from "react";
import Modal from "./Modal";

function AddAppointmentModalProgramado({
  closeModal,
  isOpen,
  appointmentId,
  onSuspendAppointment,
}) {
  const [patientData, setPatientData] = useState({
    hora_asignada: "",
    turno: "",
    fecha_programada: "",
    nombre_anestesiologo: "",
  });
  const [loading, setLoading] = useState(true);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendDetail, setSuspendDetail] = useState("");
  const [suspendDetailOptions, setSuspendDetailOptions] = useState([]);
  const [error, setError] = useState("");
  const modalRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatientData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "hora_asignada") {
      const [hours, minutes] = value.split(":").map(Number);
      if (!isNaN(hours)) {
        if (hours >= 7 && hours < 14) {
          setPatientData((prevData) => ({ ...prevData, turno: "Matutino" }));
        } else if (hours >= 14 && hours < 21) {
          setPatientData((prevData) => ({ ...prevData, turno: "Vespertino" }));
        } else {
          setPatientData((prevData) => ({ ...prevData, turno: "Nocturno" }));
        }
      }
    }
  };

  useEffect(() => {
    if (isOpen && appointmentId) {
      const fetchAppointmentData = async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_APP_BACK_SSQ}/solicitudes/${appointmentId}`
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

  const fetchSuspendDetailOptions = async (category) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_APP_BACK_SSQ}/solicitudes/motivos-suspension?category=${category}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      // Assuming data is an array of objects with a 'motivo' property
      const options = data.map(option => option.motivo); // Extracting 'motivo' from each object
      setSuspendDetailOptions(options);
    } catch (error) {
      console.error("Error fetching suspend detail options:", error);
    }
  };
  

  const handleSuspendReasonChange = (e) => {
    const selectedReason = e.target.value;
    setSuspendReason(selectedReason);
    if (selectedReason) {
      fetchSuspendDetailOptions(selectedReason.toLowerCase());
    } else {
      setSuspendDetailOptions([]);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const {
        fecha_programada,
        hora_asignada,
        turno,
        nombre_anestesiologo,
        tiempo_estimado,
        sala_quirofano,
      } = patientData;

      const response = await fetch(
        `${process.env.REACT_APP_APP_BACK_SSQ}/solicitudes/actualizar/${appointmentId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            fecha_programada,
            hora_asignada,
            turno,
            nombre_anestesiologo,
            tiempo_estimado,
            sala_quirofano,
          }),
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

  const handleSuspend = () => {
    setSuspendModalOpen(true);
  };

  const handleSuspendSubmit = async () => {
    if (!suspendReason || !suspendDetail) {
      setError("Por favor, selecciona un motivo y un detalle de suspensión.");
      return;
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_APP_BACK_SSQ}/solicitudes/suspender/${appointmentId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            suspendReason,
            suspendDetail,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      setSuspendModalOpen(false);
      closeModal(); // Cerrar el modal después de eliminar
      // Recargar la página después de eliminar
      window.location.reload();
    } catch (error) {
      console.error("Error suspending appointment:", error);
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
                  Fecha asignada:
                </label>
                <input
                  type="date"
                  name="fecha_programada"
                  value={patientData.fecha_programada || ""}
                  onChange={handleChange}
                  className="bg-white p-3 rounded-lg w-full"
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
                  onChange={handleChange}
                  className="bg-white p-3 rounded-lg w-full"
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
                  onChange={handleChange}
                  className="bg-white p-3 rounded-lg w-full"
                />
              </div>

              <div className="w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Sala de quirófano:
                </label>
                <input
                  type="text"
                  name="sala_quirofano"
                  value={patientData.sala_quirofano || ""}
                  onChange={handleChange}
                  className="bg-white p-3 rounded-lg w-full"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
            <div className="flex mb-4">
              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Turno:
                </label>
                <input
                  type="text"
                  name="turno"
                  value={patientData.turno || ""}
                  onChange={handleChange}
                  readOnly
                  className="bg-gray-200 p-3 rounded-lg w-full"
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
                  onChange={handleChange}
                  className="bg-white p-3 rounded-lg w-full"
                />
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
          
          <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
            <div className="flex mb-4">
              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Procedimiento principal contemplado:
                </label>
                <p className="bg-gray-200 p-3 rounded-lg">
                  {patientData?.procedimientos_paciente || "N/A"}
                </p>
              </div>

              <div className="w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Procedimientos adicionales: 
                </label>
                <p className="bg-gray-200 p-3 rounded-lg">
                  {patientData?.procedimientos_extra}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={handleSuspend}
              className="bg-red-600 bg-opacity-5 text-red-600 text-sm p-4 rounded-lg font-light mr-4"
              style={{ marginBottom: "8px" }}
            >
              Suspender cita
            </button>
            <button
              onClick={handleSaveChanges}
              className="bg-[#83e9aa] bg-opacity-20 text-green-500 text-sm p-4 rounded-lg font-light"
              style={{ marginBottom: "8px" }}
            >
              Guardar cambios
            </button>
            <button
              onClick={closeModal}
              className="bg-[#001B58] bg-opacity-20 text-[#001B58] text-sm p-4 rounded-lg font-light"
              style={{ marginBottom: "8px" }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {suspendModalOpen && (
        <Modal
          closeModal={() => setSuspendModalOpen(false)}
          isOpen={suspendModalOpen}
          title={"Suspender Cita"}
          width={"max-w-lg"}
        >
          <div className="p-4">
          <div className="flex flex-col">
              <label className="block font-semibold text-gray-700 mb-2">
                Motivo de suspensión:
              </label>
              <select
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={suspendReason}
                onChange={handleSuspendReasonChange}
              >
                <option value="">Selecciona una categoría</option>
                <option value="Paciente">Paciente</option>
                <option value="Administrativas">Administrativas</option>
                <option value="Apoyo_clinico">Apoyo Clínico</option>
                <option value="Team_quirurgico">Team Quirúrgico</option>
                <option value="Infraestructura">Infraestructura</option>
                <option value="Tiempo_quirurgico">Tiempo Quirúrgico</option>
                <option value="Emergencias">Emergencias</option>
                <option value="Gremiales">Gremiales</option>
              </select>
            </div>
            <div className="flex flex-col mt-4">
              <label className="block font-semibold text-gray-700 mb-2">
                Detalle:
              </label>
              <select
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={suspendDetail}
                onChange={(e) => setSuspendDetail(e.target.value)}
              >
                <option value="">Selecciona un detalle</option>
                {suspendDetailOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            {error && (
              <div className="mt-4 text-red-600">
                {error}
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setSuspendModalOpen(false)}
                className="bg-[#001B58] bg-opacity-20 text-[#001B58] text-sm p-4 rounded-lg font-light mr-2"
              >
                Cancelar
              </button>
              <button
                onClick={handleSuspendSubmit}
                className="bg-red-600 bg-opacity-5 text-red-600 text-sm p-4 rounded-lg font-light ml-2"
              >
                Suspender
              </button>
            </div>

          </div>
        </Modal>
      )}
    </Modal>
  );
}

export default AddAppointmentModalProgramado;
