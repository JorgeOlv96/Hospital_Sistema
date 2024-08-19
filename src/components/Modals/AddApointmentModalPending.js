import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Modal from "./Modal";

function AddAppointmentModalPending({
  closeModal,
  isOpen,
  appointmentId,
  onSuspendAppointment,
}) {
  const [patientData, setPatientData] = useState({
    hora_asignada: "",
    turno: "",
    fecha_programada: "",
    sala_quirofano: "",
    nombre_anestesiologo: "",
  });
  const [loading, setLoading] = useState(true);
  const modalRef = useRef(null);
  const [salasDisponibles, setSalasDisponibles] = useState([]);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";

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

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setPatientData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "hora_asignada") {
      const [hours, minutes] = value.split(":").map(Number);
      if (!isNaN(hours)) {
        let turno = "";
        if (hours >= 7 && hours < 14) {
          turno = "Matutino";
        } else if (hours >= 14 && hours < 21) {
          turno = "Vespertino";
        } else {
          turno = "Nocturno";
        }
        setPatientData((prevData) => ({ ...prevData, turno }));
        await fetchAnestesiologo(
          patientData.fecha_programada,
          turno,
          patientData.sala_quirofano
        );
      }
    }

    if (
      name === "fecha_programada" ||
      name === "sala_quirofano" ||
      name === "turno"
    ) {
      await fetchAnestesiologo(
        name === "fecha_programada" ? value : patientData.fecha_programada,
        name === "turno" ? value : patientData.turno,
        name === "sala_quirofano" ? value : patientData.sala_quirofano
      );
    }
  };

  const fetchAnestesiologo = async (
    fecha_programada,
    turno,
    sala_quirofano
  ) => {
    if (!fecha_programada || !turno || !sala_quirofano) return;

    try {
      const response = await fetch(
        `${baseURL}/api/anestesio/anestesiologo?fecha_programada=${fecha_programada}&turno=${turno}&sala_quirofano=${sala_quirofano}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setPatientData((prevData) => ({
        ...prevData,
        nombre_anestesiologo: data.nombre || "",
      }));
    } catch (error) {
      console.error("Error fetching anestesiologo:", error);
    }
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
        } catch (error) {
          console.error("Error fetching appointment data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchAppointmentData();
    }
  }, [isOpen, appointmentId]);

  const handleProgramAppointment = async () => {
    try {
      const { fecha_programada, hora_asignada, turno, nombre_anestesiologo } =
        patientData;
      const response = await fetch(
        `${baseURL}/api/solicitudes/programar/${appointmentId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            fecha_programada,
            hora_asignada,
            turno,
            nombre_anestesiologo,
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
        `${baseURL}/api/solicitudes/actualizar/${appointmentId}`,
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
  const formatFechaSolicitada = (fecha) => {
    if (!fecha) return "";
    const [year, month, day] = fecha.split("-");
    return `${day}-${month}-${year}`;
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
              onClick={handleProgramAppointment}
              className="bg-[#001B58] bg-opacity-20 text-[#001B58] text-sm p-4 rounded-lg font-light"
              style={{ marginBottom: "8px" }}
            >
              Programar cita
            </button>
          </div>

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
                  Fecha solicitada:
                </label>
                <input
                  type="text"
                  name="fecha_programada"
                  value={formatFechaSolicitada(patientData.fecha_solicitada)}
                  className="bg-gray-200 p-3 rounded-lg w-full"
                  readOnly
                />
              </div>

              <div className="w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Hora solicitada:
                </label>
                <input
                  type="text"
                  name="hora_asignada"
                  value={patientData.hora_solicitada || ""}
                  className="bg-gray-200 p-3 rounded-lg w-full"
                  readOnly
                />
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
                  Turno asignado:
                </label>
                <select
                  name="turno"
                  value={patientData.turno || ""}
                  onChange={handleChange}
                  className="bg-white p-3 rounded-lg w-full"
                >
                  <option value="">-- Seleccione el turno --</option>
                  <option value="Matutino">Matutino</option>
                  <option value="Vespertino">Vespertino</option>
                  <option value="Nocturno">Nocturno</option>
                  <option value="Especial">Especial</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
            <div className="flex  mb-4">
              <div className="mr-4 w-full">
                <label
                  htmlFor="sala_quirofano"
                  className="block font-semibold text-black mb-1"
                >
                  Sala asignada:
                </label>
                <select
                  id="sala_quirofano"
                  name="sala_quirofano"
                  value={patientData.sala_quirofano || ""}
                  onChange={handleChange}
                  className="bg-white p-3 rounded-lg w-full"
                >
                  <option value="">Seleccionar</option>
                  {salasDisponibles.map((sala) => (
                    <option key={sala.id} value={sala.nombre_sala}>
                      {sala.nombre_sala}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Anestesiólogo asignado:
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
                  Cantidad de procedimietos adicionales
                </label>
                <p className="bg-gray-200 p-3 rounded-lg">
                  {patientData?.procedimientos_extra}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default AddAppointmentModalPending;
