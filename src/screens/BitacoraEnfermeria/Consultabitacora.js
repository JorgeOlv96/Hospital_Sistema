import React, { useState, useEffect } from "react";
import Layout from "../../Layout";
import { Link } from "react-router-dom";
import ProcedureSelect from "../../screens/Solicitudes/ProcedureSelect";
import AsyncSelect from "react-select/async";

function Consultabitacora({ appointmentId }) {
  const [isFechaNacimientoValid, setIsFechaNacimientoValid] = useState(true);

  const especialidadToClave = {
    Algología: "ALG",
    Angiología: "ANG",
    "C.Plástica y Reconstructiva": "CPR",
    Cardiología: "CAR",
    "Cirigía de Torax": "CTO",
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

  const [errors, setErrors] = useState({});
  const [nombre_especialidad, setNombreEspecialidad] = useState("");
  const [clave_esp, setClaveEspecialidad] = useState("");
  const [patientData, setPatientData] = useState({
  });

  // Función para obtener la fecha actual en el formato adecuado (YYYY-MM-DD)
  function obtenerFechaActual() {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, "0");
    const day = String(hoy.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/solicitudes/${appointmentId}`
        );
        if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          setPatientData(data);
        } catch (error) {
        console.error("Error fetching solicitudes:", error);
      }
    };

    fetchSolicitudes();
  }, [appointmentId]);

  const fetchActiveSurgeons = async (inputValue) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/cirujanos/activos?search=${inputValue}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data.map((surgeons) => ({
        label: surgeons.nombre_completo,
        value: surgeons.nombre_completo,
      }));
    } catch (error) {
      console.error("Error fetching active surgeons:", error);
      return [];
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    // Actualizar el estado del formulario
    setPatientData((prevpatientData) => ({
      ...prevpatientData,
      [name]: value,
    }));

    // Validación de fecha de nacimiento
    if (name === "fecha_nacimiento") {
      const today = new Date().toISOString().split("T")[0]; // Fecha actual en formato YYYY-MM-DD
      if (value > today) {
        setIsFechaNacimientoValid(false);
      } else {
        setIsFechaNacimientoValid(true);
      }
    }
  };

  useEffect(() => {
    if (patientData.fecha_solicitada) {
      const selectedDate = new Date(patientData.fecha_solicitada);
      const dayOfWeek = selectedDate.getDay();

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        setPatientData((prevpatientData) => ({
          ...prevpatientData,
          turno_solicitado: "Especial",
        }));
      } else if (patientData.hora_solicitada) {
        const [hours] = (patientData.hora_solicitada || "")
          .split(":")
          .map(Number);
        if (!isNaN(hours) && hours >= 7 && hours < 14) {
          setPatientData((prevpatientData) => ({
            ...prevpatientData,
            turno_solicitado: "Matutino",
          }));
        } else if (!isNaN(hours) && hours >= 14 && hours < 21) {
          setPatientData((prevpatientData) => ({
            ...prevpatientData,
            turno_solicitado: "Vespertino",
          }));
        } else {
          setPatientData((prevpatientData) => ({
            ...prevpatientData,
            turno_solicitado: "Nocturno",
          }));
        }
      }
    }
  }, [patientData.fecha_solicitada, patientData.hora_solicitada]);

  useEffect(() => {
    if (patientData.hora_solicitada) {
      const selectedDate = new Date(patientData.fecha_solicitada);
      const dayOfWeek = selectedDate.getDay(); // 0 = Domingo, 6 = Sábado

      if (
        dayOfWeek !== 0 &&
        dayOfWeek !== 6 &&
        patientData.turno_solicitado !== "Especial"
      ) {
        const [hours] = patientData.hora_solicitada.split(":").map(Number);
        if (!isNaN(hours) && hours >= 7 && hours < 14) {
          setPatientData((prevpatientData) => ({
            ...prevpatientData,
            turno_solicitado: "Matutino",
          }));
        } else if (!isNaN(hours) && hours >= 14 && hours < 21) {
          setPatientData((prevpatientData) => ({
            ...prevpatientData,
            turno_solicitado: "Vespertino",
          }));
        } else {
          setPatientData((prevpatientData) => ({
            ...prevpatientData,
            turno_solicitado: "Nocturno",
          }));
        }
      }
    }
  }, [patientData.hora_solicitada]);

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

  const handleProcedureChange = (selectedOption) => {
    setPatientData({
      ...patientData,
      procedimientos_paciente: selectedOption ? selectedOption.value : "",
    });
  };

  const handleSelectChange = (selectedOption) => {
    setPatientData((prevpatientData) => ({
      ...prevpatientData,
      nombre_cirujano: selectedOption ? selectedOption.value : "",
    }));
  };



  return (
    <Layout>
      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-xl font-semibold">Consulta Paciente</h1>
       
        <div className="flex my-4 space-x-4">
          <div>
            <Link
              to="/bitacora/Bitaenfermeria"
              className="bg-[#365b77] hover:bg-[#7498b6]  text-white py-2 px-4 rounded inline-flex items-center"
            >
              <span style={{ display: "inline-flex", alignItems: "center" }}>
                <span>&lt;</span>
                <span style={{ marginLeft: "5px" }}>Regresar a bitácora</span>
              </span>
            </Link>
          </div>
        </div>

        <div class="flex flex-col p-4 bg-[#557996] rounded-lg ">
          <div class="flex mb-4">
            <div class="w-full mr-4">
              <label
                for="fecha_solicitud"
                class="block font-semibold text-white mb-1"
              >
                Fecha de solicitud:
              </label>
              <input
                type="date"
                id="fecha_solicitud"
                name="fecha_solicitud"
                value={patientData.fecha_solicitud}
                readOnly
                className={`border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-gray-300`}
                />
                
              </div>
                <div class="w-full">
                  <label for="curp" class="block font-semibold text-white mb-1">
                CURP del paciente:
              </label>

              <input
                type="text"
                id="curp"
                name="curp"
                placeholder="Curp del paciente"
                value={patientData.curp}
                onChange={handleInputChange}
                maxLength={18}
                className={`border "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
              />
            </div>
          </div>

          <div class="flex mb-4">
            
            <div class="w-full mr-4">
            <label
                for="ap_paterno"
                class="block font-semibold text-white mb-1"
              >
                Apellido materno:
               </label>
              <p className="bg-gray-200 p-2 rounded-lg cursor-default">
                {patientData?.ap_paterno || "N/A"}
              </p>
            </div>
            
            <div class="w-full mr-4">
              <label
                for="ap_materno"
                class="block font-semibold text-white mb-1"
              >
                Apellido materno:
               </label>
              <p className="bg-gray-200 p-2 rounded-lg cursor-default">
                {patientData?.ap_materno || "N/A"}
              </p>
            </div>

            <div class="w-full mr-4">
              <label
                for="nombre_paciente"
                class="block font-semibold text-white mb-1"
              >
                Nombre:
              </label>
              <input
                placeholder="Nombre del paciente"
                type="text"
                id="nombre_paciente"
                name="nombre_paciente"
                value={patientData.nombre_paciente}
                onChange={handleInputChange}
                className={`border ${errors.nombre_paciente ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                />
                {errors.nombre_paciente && <p className="text-red-500">{errors.nombre_paciente}</p>}
              </div>

            <div className="mr-4 w-full">
              <label
                htmlFor="no_expediente"
                className="block font-semibold text-white mb-1"
              >
                Número de expediente
              </label>
              <input
               placeholder="Expediente de paciente"
                type="text"
                id="no_expediente"
                name="no_expediente"
                value={patientData.no_expediente}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-[#001B58] focus:border-[#001B58]"
              />
            </div>

            <div className="mr-4" style={{ width: "50%" }}>
              <label
                htmlFor="sala_quirofano"
                className="block font-semibold text-white mb-1"
              >
                Sala solicitada:
              </label>
              <select
                type="text"
                id="sala_quirofano"
                name="sala_quirofano"
                value={patientData.sala_quirofano}
                onChange={handleInputChange}
                className={`border ${errors.nombre_paciente ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                
              >
                <option value=""> Seleccionar </option>
                <option value="A1">SALA A1</option>
                <option value="A2">SALA A2</option>
                <option value="T1">SALA T1</option>
                <option value="T2">SALA T2</option>
                <option value="1">SALA 1</option>
                <option value="2">SALA 2</option>
                <option value="3">SALA 3</option>
                <option value="4">SALA 4</option>
                <option value="5">SALA 5</option>
                <option value="6">SALA 6</option>
                <option value="E">SALA E</option>
                <option value="H">SALA H</option>
                <option value="RX">SALA RX</option>
              </select>
                {errors.nombre_paciente && <p className="text-red-500">{errors.nombre_paciente}</p>}
            </div>
          </div>

          <div className="flex mb-4">
            <div className="mr-4 w-full">
              <label
                htmlFor="fecha_nacimiento"
                className="block font-semibold text-white mb-1"
              >
                Fecha de nacimiento:
              </label>
              <input
                type="date"
                id="fecha_nacimiento"
                name="fecha_nacimiento"
                value={patientData.fecha_nacimiento}
                onChange={handleInputChange}
                className={`border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2 ${
                  isFechaNacimientoValid
                    ? "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    : "border-red-500 focus:ring-red-500 focus:border-red-500"
                }`}
              />
              {!isFechaNacimientoValid && (
                <p className="text-red-500 mt-1">
                  La fecha de nacimiento no puede ser en el futuro.
                </p>
              )}
            </div>

            <div className="mr-4 w-full">
              <label
                htmlFor="edad"
                className="block font-semibold text-white mb-1"
              >
                Edad
              </label>
              <input
              placeholder="Edad de paciente"
                type="int"
                id="edad"
                name="edad"
                value={patientData.edad}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2"
              />
            </div>

            <div className="mr-4 w-full" style={{ width: "100%" }}>
              <label
                htmlFor="sexo"
                className="block font-semibold text-white mb-1"
              >
                Sexo:
              </label>
              <select
                id="sexo"
                name="sexo"
                value={patientData.sexo}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2"
              >
                <option value=""> Seleccionar </option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
              {errors.sexo && <p className="text-red-500">{errors.sexo}</p>}
            </div>

            <div className="w-full" style={{ width: "105%" }}>
              <label
                htmlFor="id_cirujano"
                className="block font-semibold text-white mb-1"
              >
                Cirujano encargado:
              </label>
              <AsyncSelect
                loadOptions={fetchActiveSurgeons}
                onChange={handleSelectChange}
                placeholder="Nombre del cirujano"
                className={` ${errors.nombre_cirujano ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                />
                {errors.nombre_cirujano && <p className="text-red-500">{errors.nombre_cirujano}</p>}
              </div>
          </div>

          <div className="flex mb-4">
            <div className="mr-4 w-full">
              <label
                htmlFor="tipo_admision"
                className="block font-semibold text-white mb-1"
              >
                Procedencia del paciente:
              </label>
              <select
                id="tipo_admision"
                name="tipo_admision"
                value={patientData.tipo_admision}
                onChange={handleInputChange}
                className={`border ${errors.ap_paterno ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                >
                <option value=""> Seleccionar </option>
                <option value="Cama">Cama</option>
                <option value="Consulta externa">Consulta externa</option>
                <option value="UrgenciaS">Urgencias</option>
              </select>
                {errors.ap_materno && <p className="text-red-500">{errors.ap_materno}</p>}
              </div>

            <div className="mr-4 w-full">
              <label
                htmlFor="tipo_intervencion"
                className="block font-semibold text-white mb-1"
              >
                Tipo de intervención quirúrgica planeada:
              </label>
              <select
                id="tipo_intervencion"
                name="tipo_intervencion"
                value={patientData.tipo_intervencion}
                onChange={handleInputChange}
                className={`border ${errors.tipo_intervencion ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                >
                <option value=""> Seleccionar </option>
                <option value="Cirugía">Cirugía</option>
                <option value="Procedimiento">Procedimiento</option>
                <option value="Cirugía ambulatoria">Cirugía ambulatoria</option>
              </select>
              {errors.tipo_intervencion && <p className="text-red-500">{errors.tipo_intervencion}</p>}
            </div>

            <div className="mr-4 w-full">
              <label
                htmlFor="nombre_especialidad"
                className="block font-semibold text-white mb-1"
              >
                Especialidad:
              </label>
              <select
                id="nombre_especialidad"
                name="nombre_especialidad"
                value={nombre_especialidad}
                onChange={handleNombreEspecialidadChange}
                className={`border ${errors.nombre_especialidad ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                >
                <option value=""> Seleccionar </option>
                {Object.keys(especialidadToClave).map((especialidad) => (
                  <option key={especialidad} value={especialidad}>
                    {especialidad}
                  </option>
                ))}
              </select>
              {errors.nombre_especialidad && <p className="text-red-500">{errors.nombre_especialidad}</p>}
              </div>

            <div className="w-full">
              <label
                htmlFor="clave_esp"
                className="block font-semibold text-white mb-1"
              >
                Clave de especialidad:
              </label>
              <select
                id="clave_esp"
                name="clave_esp"
                value={clave_esp}
                onChange={handleClaveEspecialidadChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value=""> Seleccionar </option>
                {Object.values(especialidadToClave).map((clave) => (
                  <option key={clave} value={clave}>
                    {clave}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex mb-4">
            <div className="mr-4 w-full">
              <label
                htmlFor="hora_solicitada"
                className="block font-semibold text-white mb-1"
              >
                Hora solicitada:
              </label>
              <input
                type="time"
                id="hora_solicitada"
                name="hora_solicitada"
                value={patientData.hora_solicitada}
                onChange={handleInputChange}
                className={`border ${errors.hora_solicitada ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                />
                {errors.hora_solicitada && <p className="text-red-500">{errors.hora_solicitada}</p>}
              </div>

            <div className="mr-4 w-full">
              <label
                htmlFor="fecha_solicitada"
                className="block font-semibold text-white mb-1"
              >
                Fecha solicitada:
              </label>
              <input
                type="date"
                id="fecha_solicitada"
                name="fecha_solicitada"
                value={patientData.fecha_solicitada}
                onChange={handleInputChange}
                className={`border ${errors.fecha_solicitada ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                />
                {errors.fecha_solicitada && <p className="text-red-500">{errors.fecha_solicitada}</p>}
              </div>

            <div className="mr-4 w-full">
              <label
                htmlFor="tiempo_estimado"
                className="block font-semibold text-white mb-1"
              >
                Tiempo estimado de cirugía:
              </label>
              <input
              placeholder="Minutos"
                type="int"
                id="tiempo_estimado"
                name="tiempo_estimado"
                value={patientData.tiempo_estimado}
                onChange={handleInputChange}
                className={`border ${errors.tiempo_estimado ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                />
                {errors.tiempo_estimado && <p className="text-red-500">{errors.tiempo_estimado}</p>}
              </div>

            <div className="w-full">
              <label
                htmlFor="turno_solicitado"
                className="block font-semibold text-white mb-1"
              >
                Turno solicitado:
              </label>
              <select
                id="turno_solicitado"
                name="turno_solicitado"
                value={patientData.turno_solicitado}
                onChange={handleInputChange}
                className={`border ${errors.turno_solicitado ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                >
                <option value=""> Seleccionar </option>
                <option value="Matutino">Matutino</option>
                <option value="Vespertino">Vespertino</option>
                <option value="Nocturno">Nocturno</option>
                <option value="Especial">Especial</option>
              </select>
              {errors.turno_solicitado && <p className="text-red-500">{errors.turno_solicitado}</p>}
            </div>
          </div>

          <div className="flex mb-4">
            <div className="mr-4 w-full">
              <label
                htmlFor="procedimientos_paciente"
                className="block font-semibold text-white mb-1"
              >
                Procedimientos del paciente:
              </label>
              <ProcedureSelect onChange={handleProcedureChange} />
              {errors.procedimientos_paciente && <p className="text-red-500">{errors.procedimientos_paciente}</p>}
            </div>

            <div className="mr-4" style={{ width: "15%" }}>
              <label
                htmlFor="se_preveen"
                className="block font-semibold text-white mb-1"
              >
                Se preveén: (más)
              </label>
              <select
                id="procedimientos_extra"
                name="procedimientos_extra"
                value={patientData.procedimientos_extra}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value=""> Seleccionar </option>
                {[...Array(99)].map((_, i) => (
                  <option key={i+0} value={i+0}>
                    {i+0}
                  </option>
                ))}
              </select>
            </div>

            <div className="mr-4" style={{ width: "14%" }}>
              <label
                htmlFor="req_insumo"
                className="block font-semibold text-white mb-1"
              >
                Insumos:
              </label>
              <select
                id="req_insumo"
                name="req_insumo"
                value={patientData.req_insumo}
                onChange={handleInputChange}
                className={` ${errors.req_insumo ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                >
                <option value="">Seleccionar</option>
                <option value="Si">Si</option>
                <option value="No">No</option>
              </select>
              {errors.req_insumo && <p className="text-red-500">{errors.req_insumo}</p>}
              </div>
          </div>

          <div className="flex mb-4">
            <div className="mr-4" style={{ width: "50%" }}>
              <label
                htmlFor="diagnostico_paciente"
                className="block font-semibold text-white mb-1"
              >
                Diagnóstico del paciente
              </label>
              <textarea
                placeholder="Diagnóstico del paciente"
                id="diagnostico"
                name="diagnostico"
                rows="4"
                value={patientData.diagnostico}
                onChange={handleInputChange}
                className={`border ${errors.diagnostico? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                >
              </textarea>
              {errors.diagnostico && <p className="text-red-500">{errors.diagnostico}</p>}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Consultabitacora;
