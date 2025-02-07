import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Modal from "./Modal";

function AddAppointmentModalPending({
  closeModal,
  isOpen,
  appointmentId,
  onSuspendAppointment,
  onDeleteAppointment,
}) {
  const [patientData, setPatientData] = useState({
    hora_asignada: "",
    turno: "",
    tiempo_estimado: "",
    fecha_programada: "",
    sala_quirofano: "",
    nombre_anestesiologo: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(true);
  const modalRef = useRef(null);
  const [nombre_especialidad, setNombreEspecialidad] = useState("");
  const [clave_esp, setClaveEspecialidad] = useState("");
  const [salasDisponibles, setSalasDisponibles] = useState([]);
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

  const handleSaveEdit = async () => {
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
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  const handleCancelChanges = () => {
    setPatientData(originalData); // Deshacer cambios
    setIsEditing(false);
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setPatientData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "hora_asignada" || name === "fecha_programada") {
      const horaAsignada = name === "hora_asignada" ? value : patientData.hora_asignada;
      const fechaProgramada = name === "fecha_programada" ? value : patientData.fecha_programada;
    
      if (horaAsignada && fechaProgramada) {
        const [hours, minutes] = horaAsignada.split(":").map(Number);
        const [year, month, day] = fechaProgramada.split('-').map(Number);
        const fecha = new Date(Date.UTC(year, month - 1, day));
        const diaSemana = fecha.getUTCDay();
    
        console.log('Fecha UTC:', fecha.toISOString());
        console.log('Día de la semana UTC:', diaSemana);
        
        let turno = "";
        if (diaSemana === 6 || diaSemana === 0) { // 6 = Sábado, 0 = Domingo
          if (hours >= 7 && hours < 19) {
            turno = "Especial Diurno";
          } else {
            turno = "Especial Nocturno";
          }
        } else {
          if (hours >= 7 && hours < 14) {
            turno = "Matutino";
          } else if (hours >= 14 && hours < 21) {
            turno = "Vespertino";
          } else {
            turno = "Nocturno";
          }
        }
    
        setPatientData((prevData) => ({ ...prevData, turno }));
        await fetchAnestesiologo(
          fechaProgramada,
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
      const { fecha_programada, hora_asignada, turno, sala_quirofano, nombre_anestesiologo } =
        patientData;
      const response = await fetch(
        `${baseURL}/api/solicitudes/programar/${appointmentId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            fecha_programada,
            hora_asignada,
            turno,
            sala_quirofano,
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
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

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
            src="/images/cargando.gif"
            alt="Cargando..."
            className="h-8 w-8 mx-auto"
          />
        </div>
      ) : (
        <div className="p-4">
          <div className="flex justify-between">
            <button
              onClick={handleProgramAppointment}
              className="bg-green-500 bg-opacity-20 text-green-500 text-sm p-3 rounded-lg font-light"
              style={{ marginBottom: "8px" }}
            >
              Programar cita
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 bg-opacity-20 text-red-500 text-sm p-3 rounded-lg font-light"
            >
              Eliminar solicitud
            </button>
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button
                    className="bg-green-500 bg-opacity-20 text-green-500 text-sm p-4 rounded-lg font-light"
                    onClick={handleSaveEdit}
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
                    {formatFechaSolicitada(patientData?.fecha_solicitada)}
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
                <label className="block font-semibold text-gray-700 mb-2">
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

              <div className="mr-4 w-full">
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

              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  T. est. de cirugía:
                </label>
                <input
                  type="text"
                  name="tiempo_estimado"
                  placeholder="Minutos"
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
                  <option value="Especial Diurno">Especial Diurno</option>
                  <option value="Especial Nocturno">Especial Nocturno</option>
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

              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Anestesio. asignado:
                </label>
                <input
                  type="text"
                  name="nombre_anestesiologo"
                  value={patientData.nombre_anestesiologo || ""}
                  onChange={handleChange}
                  className="bg-white p-3 rounded-lg w-full"
                />
              </div>

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
                    className="bg-white p-3 rounded-lg w-full"
                  />
                ) : (
                  <p className="bg-gray-200 p-3 rounded-lg">
                    {patientData?.nombre_cirujano || "N/A"}
                  </p>
                )}
              </div>

              <div className="w-full">
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
                  Procedimiento principal contemplado:
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

export default AddAppointmentModalPending;
