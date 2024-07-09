import React, { useState, useEffect } from "react";
import Layout from "../../Layout";
import { useNavigate } from "react-router-dom";
import ProcedureSelect from './ProcedureSelect';
import AsyncSelect from 'react-select/async';

function CrearSolicitud() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [horaSolicitada, setHoraSolicitada] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [turnoCalculado, setTurnoCalculado] = useState("");
  const [isFechaNacimientoValid, setIsFechaNacimientoValid] = useState(true);

  const navigate = useNavigate();

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

  const [nombre_especialidad, setNombreEspecialidad] = useState("");
  const [clave_esp, setClaveEspecialidad] = useState("");
  const [formData, setFormData] = useState({
    fecha_solicitud: obtenerFechaActual(),
    clave_esp: "",
    nombre_especialidad: "",
    curp: "",
    ap_paterno: "",
    ap_materno: "",
    nombre_paciente: "",
    fecha_nacimiento: "",
    edad: "",
    sexo: "",
    no_expediente: "",
    tipo_intervencion: "",
    fecha_solicitada: "",
    hora_solicitada: "",
    tiempo_estimado: "",
    turno_solicitado: "",
    sala_quirofano: "",
    nombre_cirujano: "",
    req_insumo: "",
    estado_solicitud: "Pendiente",
    procedimientos_paciente: "",
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
        const response = await fetch("http://localhost:4000/api/solicitudes");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setSolicitudes(data);
      } catch (error) {
        console.error("Error fetching solicitudes:", error);
      }
    };

    fetchSolicitudes();
  }, []);

  const fetchActiveSurgeons = async (inputValue) => {
    try {
      const response = await fetch(`http://localhost:4000/api/cirujanos/activos?search=${inputValue}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data.map((surgeons) => ({
        label: surgeons.nombre_completo,
        value: surgeons.nombre_completo
      }));
    } catch (error) {
      console.error("Error fetching active surgeons:", error);
      return [];
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    // Actualizar el estado del formulario
    setFormData((prevFormData) => ({
      ...prevFormData,
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
    if (formData.fecha_solicitada) {
      const selectedDate = new Date(formData.fecha_solicitada);
      const dayOfWeek = selectedDate.getDay(); // 0 = Domingo, 6 = Sábado

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          turno_solicitado: "Especial",
        }));
      } else if (formData.hora_solicitada) {
        const [hours, minutes] = (formData.hora_solicitada || "")
          .split(":")
          .map(Number);
        if (!isNaN(hours) && hours >= 7 && hours < 14) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            turno_solicitado: "Matutino",
          }));
        } else if (!isNaN(hours) && hours >= 14 && hours < 21) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            turno_solicitado: "Vespertino",
          }));
        } else {
          setFormData((prevFormData) => ({
            ...prevFormData,
            turno_solicitado: "Nocturno",
          }));
        }
      }
    }
  }, [formData.fecha_solicitada, formData.hora_solicitada]);

  useEffect(() => {
    if (formData.hora_solicitada) {
      const selectedDate = new Date(formData.fecha_solicitada);
      const dayOfWeek = selectedDate.getDay(); // 0 = Domingo, 6 = Sábado

      if (
        dayOfWeek !== 0 &&
        dayOfWeek !== 6 &&
        formData.turno_solicitado !== "Especial"
      ) {
        const [hours, minutes] = formData.hora_solicitada
          .split(":")
          .map(Number);
        if (!isNaN(hours) && hours >= 7 && hours < 14) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            turno_solicitado: "Matutino",
          }));
        } else if (!isNaN(hours) && hours >= 14 && hours < 21) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            turno_solicitado: "Vespertino",
          }));
        } else {
          setFormData((prevFormData) => ({
            ...prevFormData,
            turno_solicitado: "Nocturno",
          }));
        }
      }
    }
  }, [formData.hora_solicitada]);

  const handleNombreEspecialidadChange = (e) => {
    const selectedNombreEspecialidad = e.target.value;
    setNombreEspecialidad(selectedNombreEspecialidad);
    const correspondingClave =
      especialidadToClave[selectedNombreEspecialidad] ||
      "Seleccionar clave de especialidad";
    setClaveEspecialidad(correspondingClave);
    setFormData({
      ...formData,
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
    setFormData({
      ...formData,
      nombre_especialidad: correspondingNombre,
      clave_esp: selectedClaveEspecialidad,
    });
  };

  const handleProcedureChange = (selectedOption) => {
    setFormData({
      ...formData,
      procedimientos_paciente: selectedOption ? selectedOption.value : ""
    });
  };

  const handleSelectChange = (selectedOption) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      nombre_cirujano: selectedOption ? selectedOption.value : ""
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedFormData = {
      ...formData,
      insumos: formData.insumos || "N/A",
      curp: formData.curp || "N/A",
      fecha_nacimiento: formData.fecha_nacimiento || "1900-01-01", // Fecha predeterminada válida
      edad: formData.edad || "N/A",
      no_expediente: formData.no_expediente || "N/A",
      // Añadir aquí otros campos opcionales si es necesario
    };

    // Log the formData to inspect its structure
    console.log("Submitting formData:", formData);

    try {
      const response = await fetch("http://localhost:4000/api/solicitudes", {
        method: selectedSolicitud ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Solicitud guardada:", data);
      navigate("/solicitudes");
    } catch (error) {
      console.error("Error saving solicitud:", error);
    }
  };

  // Validación y formateo de la hora solicitada
  const handleHoraSolicitadaChange = (event) => {
    let input = event.target.value;

    // Solo permitir caracteres numéricos y ':'
    input = input.replace(/[^0-9:]/g, "");

    // Autoformato básico de HH:mm
    if (input.length === 2 && !input.includes(":")) {
      input = `${input}:`;
    }

    // Asegurarse de que el input no sea mayor a 5 caracteres (HH:mm)
    if (input.length > 5) {
      setIsValid(false);
      return;
    }

    // Validar hora y minutos
    const [hours, minutes] = input.split(":").map(Number);
    const hoursValid = (hours >= 0 && hours <= 23) || isNaN(hours);
    const minutesValid = (minutes >= 0 && minutes <= 59) || isNaN(minutes);

    // Actualizar estado y validación
    setHoraSolicitada(input);
    setIsValid(hoursValid && minutesValid);

    // Calcular turno basado en la hora ingresada
    if (hours >= 7 && hours < 14) {
      setTurnoCalculado("Matutino");
    } else if (hours >= 14 && hours < 21) {
      setTurnoCalculado("Vespertino");
    } else if (hours >= 21 || hours < 7) {
      setTurnoCalculado("Nocturno");
    } else {
      setTurnoCalculado("Especial");
    }
  };

  return (
    <Layout>
      <form onSubmit={handleSubmit}>
        <div class="flex flex-col p-4 bg-[#304678] rounded-lg  mb-4">
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
                value={formData.fecha_solicitud}
                onChange={handleInputChange}
                readOnly
                class="border border-gray-200 rounded-lg px-3 py-2 w-full bg-gray-300"
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
                value={formData.curp}
                onChange={handleInputChange}
                maxLength={18}
                class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full"
              />
            </div>
          </div>
        </div>

        <div class="flex flex-col p-4 bg-[#304678] rounded-lg mb-4">
          <div class="flex mb-4">
            <div class="w-full mr-4">
              <label
                for="ap_paterno"
                class="block font-semibold text-white mb-1"
              >
                Apellido paterno:
              </label>
              <input
                type="text"
                id="ap_paterno"
                name="ap_paterno"
                value={formData.ap_paterno}
                onChange={handleInputChange}
                class="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-[#001B58] focus:border-[#001B58]"
              />
            </div>
            <div class="w-full mr-4">
              <label
                for="ap_materno"
                class="block font-semibold text-white mb-1"
              >
                Apellido materno:
              </label>
              <input
                type="text"
                id="ap_materno"
                name="ap_materno"
                value={formData.ap_materno}
                onChange={handleInputChange}
                class="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-[#001B58] focus:border-[#001B58]"
              />
            </div>

            <div class="w-full mr-4">
              <label
                for="nombre_paciente"
                class="block font-semibold text-white mb-1"
              >
                Nombre:
              </label>
              <input
                type="text"
                id="nombre_paciente"
                name="nombre_paciente"
                value={formData.nombre_paciente}
                onChange={handleInputChange}
                class="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-[#001B58] focus:border-[#001B58]"
              />
            </div>

            <div className="mr-4 w-full">
              <label
                htmlFor="no_expediente"
                className="block font-semibold text-white mb-1"
              >
                Número de expediente
              </label>
              <input
                type="text"
                id="no_expediente"
                name="no_expediente"
                value={formData.no_expediente}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-[#001B58] focus:border-[#001B58]"
              />
            </div>

            <div className="mr-4 w-full">
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
                value={formData.sala_quirofano}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Seleccione la sala --</option>
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="T1">T1</option>
                <option value="T2">T2</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="E">E</option>
                <option value="H">H</option>
                <option value="RX">RX</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col p-4 bg-[#304678] rounded-lg mb-4">
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
                value={formData.fecha_nacimiento}
                onChange={handleInputChange}
                className={`border rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 ${
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
                type="int"
                id="edad"
                name="edad"
                value={formData.edad}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="mr-4 w-full">
              <label
                htmlFor="sexo"
                className="block font-semibold text-white mb-1"
              >
                Sexo:
              </label>
              <select
                id="sexo"
                name="sexo"
                value={formData.sexo}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Sexo del paciente --</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="w-full">
              <label
                htmlFor="nombre_cirujano"
                className="block font-semibold text-white mb-1"
              >
                Cirujano encargado:
              </label>
              <AsyncSelect
                loadOptions={fetchActiveSurgeons}
                onChange={handleSelectChange}
                placeholder="Nombre del cirujano"
                className="mt-1 block w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col p-4 bg-[#304678] rounded-lg mb-4">
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
                value={formData.tipo_admision}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Seleccione una opción --</option>
                <option value="Cama">Cama</option>
                <option value="Consulta externa">Consulta externa</option>
                <option value="UrgenciaS">Urgencias</option>
              </select>
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
                value={formData.tipo_intervencion}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">
                  -- Seleccione el tipo de intervención --
                </option>
                <option value="Cirugía">Cirugía</option>
                <option value="Procedimiento">Procedimiento</option>
                <option value="Cirugía ambulatoria">Cirugía ambulatoria</option>
              </select>
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
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Seleccionar especialidad --</option>
                {Object.keys(especialidadToClave).map((especialidad) => (
                  <option key={especialidad} value={especialidad}>
                    {especialidad}
                  </option>
                ))}
              </select>
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
                <option value="">
                  -- Seleccionar clave de especialidad --
                </option>
                {Object.values(especialidadToClave).map((clave) => (
                  <option key={clave} value={clave}>
                    {clave}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col p-4 bg-[#304678] rounded-lg mb-4">
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
                value={formData.hora_solicitada}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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
                value={formData.fecha_solicitada}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="mr-4 w-full">
              <label
                htmlFor="tiempo_estimado"
                className="block font-semibold text-white mb-1"
              >
                Tiempo estimado de cirugía: (Min)
              </label>
              <input
                type="int"
                id="tiempo_estimado"
                name="tiempo_estimado"
                value={formData.tiempo_estimado}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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
                value={formData.turno_solicitado}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

        <div className="flex flex-col p-4 bg-[#304678] rounded-lg mb-4">
          <div className="flex mb-4">
          <div className="mr-4 w-full">
        <label htmlFor="procedimientos_paciente" className="block font-semibold text-white mb-1">
          Procedimientos del paciente:
        </label>
        <ProcedureSelect onChange={handleProcedureChange} />
      </div>

            <div className="mr-4 w-1/2">
              <label
                htmlFor="req_insumo"
                className="block font-semibold text-white mb-1"
              >
                Requiere insumos:
              </label>
              <select
                id="req_insumo"
                name="req_insumo"
                value={formData.req_insumo}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Seleccione una opción --</option>
                <option value="Si">Si</option>
                <option value="No">No</option>
              </select>
            </div>

            <div className="mr-4 w-1/2">
              <label
                for="estado_solicitud"
                className="block font-semibold text-white mb-1"
              >
                Estado de solicitud
              </label>
              <input
                type="text"
                id="estado_solicitud"
                name="estado_solicitud"
                value={formData.estado_solicitud}
                readOnly // Hacer que el campo sea de solo lectura
                className="border border-red-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 bg-red-300"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <button
            type="submit"
            className="bg-[#001B58] text-white px-4 py-2 rounded"
          >
            Enviar
          </button>
        </div>
      </form>
    </Layout>
  );
}

export default CrearSolicitud;