import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../Layout";
import { useNavigate } from "react-router-dom";
import ProcedureSelect from "./ProcedureSelect";
import AsyncSelect from "react-select/async";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function CrearSolicitud() {
  const [selectedSolicitud] = useState(null);
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

  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";
  const [errors, setErrors] = useState({});
  const [nombre_especialidad, setNombreEspecialidad] = useState("");
  const [salasDisponibles, setSalasDisponibles] = useState([]);
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
    procedimientos_extra: "",
    diagnostico: "",
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
        const response = await fetch(`${baseURL}/api/solicitudes`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
      } catch (error) {
        console.error("Error fetching solicitudes:", error);
      }
    };

    fetchSolicitudes();
  }, []);

  const fetchActiveSurgeons = async (inputValue) => {
    try {
      const response = await fetch(
        `${baseURL}/cirujanos/activos?search=${inputValue}`
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
        const [hours] = (formData.hora_solicitada || "").split(":").map(Number);
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
        const [hours] = formData.hora_solicitada.split(":").map(Number);
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

  useEffect(() => {
    fetchSalasDisponibles();
  }, []);

  const fetchSalasDisponibles = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/salas/salas`);
      const disponibles = response.data.filter(sala => sala.estado);
      setSalasDisponibles(disponibles);
    } catch (error) {
      console.error('Error fetching salas:', error);
    }
  };

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
      procedimientos_paciente: selectedOption ? selectedOption.value : "",
    });
  };

  const handleSelectChange = (selectedOption) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      nombre_cirujano: selectedOption ? selectedOption.value : "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (!formData[key]) {
        newErrors[key] = "Campo requerido";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
        try {
            // Verificar si ya existe una solicitud con la misma fecha, hora, sala y tiempo estimado
            const checkResponse = await fetch(`${baseURL}/api/solicitudes/check`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fecha_solicitada: formData.fecha_solicitada,
                    hora_solicitada: formData.hora_solicitada,
                    sala_quirofano: formData.sala_quirofano,
                    tiempo_estimado: formData.tiempo_estimado,
                }),
            });

            if (!checkResponse.ok) {
                throw new Error("Network response was not ok");
            }

            const checkData = await checkResponse.json();

            if (checkData.exists) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    solicitud_conflicto:
                        "Ya existe una solicitud para la misma fecha, hora y sala!.",
                }));
                return;
            }

            // Enviar la solicitud a la API si no existe conflicto
            const response = await fetch(`${baseURL}/api/solicitudes`, {
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
            console.log("Formulario válido y enviado:", formData);
            navigate("/solicitudes");
        } catch (error) {
            console.error("Error en la solicitud:", error);
        }
    } else {
        console.log("Formulario inválido");
    }
};


  
  const getTurnColor = (turno_anestesio) => {
    switch (turno_anestesio) {
      case "Matutino":
        return "rgba(129, 164, 255, 0.43)";
      case "Vespertino":
        return "rgba(109, 255, 19, 0.43)";
      case "Nocturno":
        return "rgba(255, 169, 89, 0.43)";
      default:
        return "#FFFFFF"; // color predeterminado
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-xl font-semibold">Crear solicitud</h1>

         {/* Mostrar el mensaje de error si hay conflicto */}
          {errors.solicitud_conflicto && (
              <div className="bg-red-100 border border-red-500 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <strong className="font-bold">:(</strong>
                  <span className="block sm:inline"> {errors.solicitud_conflicto}</span>
              </div>
          )}


        <form onSubmit={handleSubmit}>
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
                  value={formData.fecha_solicitud}
                  onChange={handleInputChange}
                  readOnly
                  className={`"border-[#A8CBD5]"} rounded-lg px-3 py-2 w-full bg-[#A8CBD5]`}
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
                  value={formData.curp}
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
                  Apellido paterno:
                </label>
                <input
                  placeholder="Apellido paterno paciente"
                  type="text"
                  id="ap_paterno"
                  name="ap_paterno"
                  value={formData.ap_paterno}
                  onChange={handleInputChange}
                  className={`border ${
                    errors.ap_paterno ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                />
                {errors.ap_paterno && (
                  <p className="text-red-500">{errors.ap_paterno}</p>
                )}
              </div>
              <div class="w-full mr-4">
                <label
                  for="ap_materno"
                  class="block font-semibold text-white mb-1"
                >
                  Apellido materno:
                </label>
                <input
                  placeholder="Apellido materno paciente"
                  type="text"
                  id="ap_materno"
                  name="ap_materno"
                  value={formData.ap_materno}
                  onChange={handleInputChange}
                  className={`border ${
                    errors.ap_materno ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                />
                {errors.ap_materno && (
                  <p className="text-red-500">{errors.ap_materno}</p>
                )}
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
                  value={formData.nombre_paciente}
                  onChange={handleInputChange}
                  className={`border ${
                    errors.nombre_paciente
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                />
                {errors.nombre_paciente && (
                  <p className="text-red-500">{errors.nombre_paciente}</p>
                )}
              </div>

              <div className="mr-4" style={{ width: "49%" }}>
                <label
                  htmlFor="no_expediente"
                  className="block font-semibold text-white mb-1"
                >
                  No. de expediente
                </label>
                <input
                  placeholder="No. de expediente"
                  type="text"
                  id="no_expediente"
                  name="no_expediente"
                  value={formData.no_expediente}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-[#001B58] focus:border-[#001B58]"
                />
              </div>

              <div className="mr-4" style={{ width: "41%" }}>
      <label
        htmlFor="sala_quirofano"
        className="block font-semibold text-white mb-1"
      >
        Sala solicitada:
      </label>
      <select
        id="sala_quirofano"
        name="sala_quirofano"
        value={formData.sala_quirofano}
        onChange={handleInputChange}
        className={`border ${
          errors.sala_quirofano ? "border-red-500" : "border-gray-300"
        } rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
      >
        <option value="">Seleccionar</option>
        {salasDisponibles.map((sala) => (
          <option key={sala.id} value={sala.id}>
            {sala.nombre_sala}
          </option>
        ))}
      </select>
      {errors.sala_quirofano && (
        <p className="text-red-500">{errors.sala_quirofano}</p>
      )}
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
                  value={formData.fecha_nacimiento}
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
                  value={formData.edad}
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
                  value={formData.sexo}
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

              <div className="w-full" style={{ width: "100%" }}>
                <label
                  htmlFor="id_cirujano"
                  className="block font-semibold text-white mb-3"
                >
                  Cirujano encargado:
                </label>
                <input
                  placeholder="Nombre del cirujano"
                  type="text"
                  id="nombre_cirujano"
                  name="nombre_cirujano"
                  value={formData.nombre_cirujano}
                  onChange={handleInputChange}
                  className={`border ${
                    errors.nombre_paciente
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                />
                {errors.nombre_cirujano && (
                  <p className="text-red-500">{errors.nombre_cirujano}</p>
                )}
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
                  value={formData.tipo_admision}
                  onChange={handleInputChange}
                  className={`border ${
                    errors.ap_paterno ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                >
                  <option value=""> Seleccionar </option>
                  <option value="Cama">Cama</option>
                  <option value="Consulta externa">Consulta externa</option>
                  <option value="UrgenciaS">Urgencias</option>
                </select>
                {errors.ap_materno && (
                  <p className="text-red-500">{errors.ap_materno}</p>
                )}
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
                  className={`border ${
                    errors.tipo_intervencion
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                >
                  <option value=""> Seleccionar </option>
                  <option value="Cirugía">Cirugía</option>
                  <option value="Procedimiento">Procedimiento</option>
                  <option value="Cirugía ambulatoria">
                    Cirugía ambulatoria
                  </option>
                </select>
                {errors.tipo_intervencion && (
                  <p className="text-red-500">{errors.tipo_intervencion}</p>
                )}
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
                  className={`border ${
                    errors.nombre_especialidad
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                >
                  <option value=""> Seleccionar </option>
                  {Object.keys(especialidadToClave).map((especialidad) => (
                    <option key={especialidad} value={especialidad}>
                      {especialidad}
                    </option>
                  ))}
                </select>
                {errors.nombre_especialidad && (
                  <p className="text-red-500">{errors.nombre_especialidad}</p>
                )}
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
                  value={formData.hora_solicitada}
                  onChange={handleInputChange}
                  className={`border ${
                    errors.hora_solicitada
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                />
                {errors.hora_solicitada && (
                  <p className="text-red-500">{errors.hora_solicitada}</p>
                )}
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
                  className={`border ${
                    errors.fecha_solicitada
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                />
                {errors.fecha_solicitada && (
                  <p className="text-red-500">{errors.fecha_solicitada}</p>
                )}
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
                  value={formData.tiempo_estimado}
                  onChange={handleInputChange}
                  className={`border ${
                    errors.tiempo_estimado
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                />
                {errors.tiempo_estimado && (
                  <p className="text-red-500">{errors.tiempo_estimado}</p>
                )}
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
                  className={` ${
                    errors.turno_solicitado
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                  style={{
                    backgroundColor: getTurnColor(formData.turno_solicitado),
                  }}
                >
                  <option value="">Seleccionar</option>
                  <option value="Matutino">Matutino</option>
                  <option value="Vespertino">Vespertino</option>
                  <option value="Nocturno">Nocturno</option>
                  <option value="Especial">Especial</option>
                </select>
                {errors.turno_solicitado && (
                  <p className="text-red-500">{errors.turno_solicitado}</p>
                )}
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
                {errors.procedimientos_paciente && (
                  <p className="text-red-500">
                    {errors.procedimientos_paciente}
                  </p>
                )}
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
                  value={formData.procedimientos_extra}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value=""> Seleccionar </option>
                  {[...Array(99)].map((_, i) => (
                    <option key={i + 0} value={i + 0}>
                      {i + 0}
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
                  value={formData.req_insumo}
                  onChange={handleInputChange}
                  className={` ${
                    errors.req_insumo ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                >
                  <option value="">Seleccionar</option>
                  <option value="Si">Si</option>
                  <option value="No">No</option>
                </select>
                {errors.req_insumo && (
                  <p className="text-red-500">{errors.req_insumo}</p>
                )}
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
                  value={formData.diagnostico}
                  onChange={handleInputChange}
                  className={`border ${
                    errors.diagnostico ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                ></textarea>
                {errors.diagnostico && (
                  <p className="text-red-500">{errors.diagnostico}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <button
              type="submit"
              className="bg-[#365b77] text-white px-4 py-2 rounded"
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default CrearSolicitud;
