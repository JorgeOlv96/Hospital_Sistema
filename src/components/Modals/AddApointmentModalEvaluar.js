import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Modal from "./Modal";
import AddAppointmentModal from "../../components/Modals/AddApointmentModal";

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
          <div className="flex justify-between">
            <button
              onClick={handlePreprogramar}
              className="bg-[#06ABC9] bg-opacity-20 text-[#001B58] text-sm p-3 rounded-lg font-light"
              style={{ marginBottom: "8px" }}
            >
              Pre-programar
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
