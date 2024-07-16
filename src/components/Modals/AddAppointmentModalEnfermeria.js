import React, { useState, useEffect, useRef } from "react";
import Modal from "./Modal";

function AddAppointmentModalEnfermeria({ closeModal, isOpen, appointmentId }) {
  const [patientData, setPatientData] = useState({
    hora_asignada: "",
    turno: "",
    fecha_programada: "",
    nombre_anestesiologo: "",
    procedimientos_extra: [],
    hi_principal: "",
    hf_principal: "",
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
          setPatientData({
            ...data,
            procedimientos_extra: data.procedimientos_extra
              ? data.procedimientos_extra.map(() => ({
                  hi_extra: "",
                  hf_extra: "",
                }))
              : [],
          });
          setLoading(false);
        } catch (error) {
          console.error("Error fetching appointment data:", error);
          setLoading(false);
        }
      };

      fetchAppointmentData();
    }
  }, [isOpen, appointmentId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleProcedimientoExtraChange = (index, e) => {
    const { name, value } = e.target;
    setPatientData((prevData) => {
      const procedimientos_extra = [...prevData.procedimientos_extra];
      procedimientos_extra[index][name] = value;
      return {
        ...prevData,
        procedimientos_extra,
      };
    });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/solicitudes/enfermeria/${appointmentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(patientData),
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("Appointment updated successfully:", data);
      closeModal();
    } catch (error) {
      console.error("Error updating appointment:", error);
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
              <div className="w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Procedimiento principal:
                </label>
                <input
                  type="text"
                  name="procedimiento_principal"
                  value={patientData.procedimientos_paciente || ""}
                  className="bg-gray-200 p-3 rounded-lg w-full cursor-default"
                  readOnly
                />
              </div>
            </div>
            <div className="flex mb-4">
              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Hora de inicio:
                </label>
                <input
                  type="time"
                  name="hi_principal"
                  value={patientData.hi_principal}
                  className="bg-white p-3 rounded-lg w-full"
                  onChange={handleInputChange}
                />
              </div>
              <div className="w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Hora de fin:
                </label>
                <input
                  type="time"
                  name="hf_principal"
                  value={patientData.hf_principal}
                  className="bg-white p-3 rounded-lg w-full"
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {patientData.procedimientos_extra.length > 0 && (
            <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
              <h3 className="font-semibold text-gray-700 mb-4">
                Procedimientos adicionales:
              </h3>
              {patientData.procedimientos_extra.map((_, index) => (
                <div className="flex mb-4" key={index}>
                  <div className="w-full mr-4">
                    <label className="block font-semibold text-gray-700 mb-2">
                      Procedimiento extra {index + 1} - Hora de inicio:
                    </label>
                    <input
                      type="time"
                      name="hi_extra"
                      value={patientData.procedimientos_extra[index].hi_extra || ""}
                      className="bg-gray-200 p-3 rounded-lg w-full"
                      onChange={(e) => handleProcedimientoExtraChange(index, e)}
                    />
                  </div>
                  <div className="w-full">
                    <label className="block font-semibold text-gray-700 mb-2">
                      Hora de fin:
                    </label>
                    <input
                      type="time"
                      name="hf_extra"
                      value={patientData.procedimientos_extra[index].hf_extra || ""}
                      className="bg-gray-200 p-3 rounded-lg w-full"
                      onChange={(e) => handleProcedimientoExtraChange(index, e)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end mt-4">
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2"
              onClick={closeModal}
            >
              Cerrar
            </button>
            <button
              type="button"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              onClick={handleSave}
            >
              Guardar
            </button>
          </div>
        </div>
    </Modal>
  );
}

export default AddAppointmentModalEnfermeria;
