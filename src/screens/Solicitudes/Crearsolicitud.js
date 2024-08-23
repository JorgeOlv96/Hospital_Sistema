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
  const [isLoading, setIsLoading] = useState(false);

  const [isFieldTouched, setIsFieldTouched] = useState({
    fecha_nacimiento: false,
    curp: false,
    clave_esp: false,
    nombre_especialidad: false,
    ap_paterno: false,
    ap_materno: false,
    nombre_paciente: false,
    edad: false,
    sexo: false,
    no_expediente: false,
    tipo_intervencion: false,
    fecha_solicitada: false,
    hora_solicitada: false,
    tiempo_estimado: false,
    turno_solicitado: false,
    sala_quirofano: false,
    nombre_cirujano: false,
    req_insumo: false,
    estado_solicitud: "Pendiente",
    procedimientos_paciente: false,
    procedimientos_extra: false,
    diagnostico: false,
  });

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
    fecha_solicitud: "",
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
    cama: "NA",
    fecha_solicitada: "",
    hora_solicitada: "",
    tiempo_estimado: "",
    turno_solicitado: "",
    sala_quirofano: "",
    nombre_cirujano: "",
    req_insumo: "",
    estado_solicitud: "Pendiente",
    procedimientos_paciente: null, // Inicializa con null o un valor por defecto
    procedimientos_extra: "",
    diagnostico: "",
    elaborado_por: "",
  });

  // Función para obtener la fecha actual en el formato adecuado (YYYY-MM-DD)
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

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    // Actualizar el estado del formulario
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    // Marcar el campo como tocado
    setIsFieldTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validación de fecha de nacimiento
    if (name === "fecha_nacimiento") {
      const today = new Date().toISOString().split("T")[0]; // Fecha actual en formato YYYY-MM-DD
      if (value > today) {
        setIsFechaNacimientoValid(false);
        setFormData((prevFormData) => ({
          ...prevFormData,
          edad: "", // Limpiar edad si la fecha es inválida
          cama:
            name === "tipo_admision" && value !== "Cama"
              ? "NA"
              : prevFormData.cama,
        }));
      } else {
        setIsFechaNacimientoValid(true);
        const age = calculateAge(value);
        setFormData((prevFormData) => ({
          ...prevFormData,
          edad: age,
        }));
      }
    }
  };

  useEffect(() => {
    if (formData.fecha_solicitada) {
      const selectedDate = new Date(formData.fecha_solicitada);
      const dayOfWeek = selectedDate.getDay(); // 1 = Lunes, 5 = Viernes

      if (dayOfWeek === 5 || dayOfWeek === 6) {
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
      const dayOfWeek = selectedDate.getDay(); // 1 = Lunes, 5 = Viernes

      if (
        dayOfWeek !== 5 &&
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
      const disponibles = response.data.filter((sala) => sala.estado);
      setSalasDisponibles(disponibles);
    } catch (error) {
      console.error("Error fetching salas:", error);
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

    // Validar cama solo si tipo de admisión es "Cama"
    if (formData.tipo_admision === "Cama" && !formData.cama) {
      newErrors.cama =
        "Este campo es obligatorio cuando se selecciona 'Cama' en tipo de admisión.";
    }

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
      // Verificar si la sala seleccionada está activa
      const selectedSala = salasDisponibles.find(
        (sala) => sala.nombre_sala === formData.sala_quirofano
      );
      if (!selectedSala || !selectedSala.estado) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          sala_quirofano: "La sala seleccionada no está activa.",
        }));
        return;
      }

      try {
        setIsLoading(true); // Iniciar el estado de carga

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
          setIsLoading(false); // Detener el estado de carga en caso de conflicto
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
        setIsLoading(false); // Detener el estado de carga después de enviar la solicitud
        navigate("/solicitudes");
      } catch (error) {
        console.error("Error en la solicitud:", error);
        setIsLoading(false); // Detener el estado de carga en caso de error
      }
    } else {
      console.log("Formulario inválido");
    }
  };

  const getTurnColor = (turno_anestesio) => {
    switch (turno_anestesio) {
      case "Matutino":
        return "#81a4ff"; // color matutino sólido
      case "Vespertino":
        return "#7acb49"; // color vespertino sólido
      case "Nocturno":
        return "#ffa959"; // color nocturno sólido
      default:
        return "#FFFFFF"; // color predeterminado
    }
  };

  return (
    <Layout>
      <div
        data-aos="fade-right"
        data-aos-duration="1000"
        data-aos-delay="100"
        data-aos-offset="200"
      >
        <div className="flex flex-col gap-4 mb-6">
          <h1 className="text-xl font-semibold">Crear solicitud</h1>

          {/* Mostrar el mensaje de error si hay conflicto */}
          {errors.solicitud_conflicto && (
            <div
              className="bg-red-100 border border-red-500 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <strong className="font-bold">:(</strong>
              <span className="block sm:inline">
                {" "}
                {errors.solicitud_conflicto}
              </span>
            </div>
          )}

          {isLoading && (
            <p className="flex items-center text-blue-700 font-bold text-xl mt-4 bg-blue-100 p-4 rounded-lg shadow-lg border border-blue-200 animate-pulse">
              <svg
                className="w-6 h-6 mr-2 text-blue-500 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 0115.97-1.3 4 4 0 00-5.88 4.08A4 4 0 004 12z"
                />
              </svg>
              Guardando solicitud...
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <div class="flex flex-col p-4 bg-[#557996] rounded-lg ">
              <div class="flex mb-4">
                <div class="w-full mr-4">
                  <label
                    for="fecha_solicitud"
                    class="block font-semibold text-white mb-1"
                  >
                    Fecha de recibo de solicitud:
                  </label>
                  <input
                    type="date"
                    id="fecha_solicitud"
                    name="fecha_solicitud"
                    value={formData.fecha_solicitud}
                    onChange={handleInputChange}
                    className={`border rounded-lg px-3 py-2 w-full ${
                      formData.fecha_solicitud
                        ? "bg-[#A8CBD5] border-[#A8CBD5]"
                        : "border-gray-300"
                    } focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58]`}
                  />
                </div>
                <div className="mr-4" style={{ width: "97.7%" }}>
                  <label
                    htmlFor="curp"
                    className="block font-semibold text-white mb-1"
                  >
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
                    className={`border rounded-lg px-3 py-2 w-full ${
                      formData.curp
                        ? "bg-[#A8CBD5] border-[#A8CBD5]"
                        : "border-gray-300"
                    } focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58]`}
                  />
                </div>
              </div>

              <div class="flex mb-4">
                <div className="w-full mr-4">
                  <label
                    htmlFor="ap_paterno"
                    className="block font-semibold text-white mb-1"
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
                    onBlur={() =>
                      setIsFieldTouched((prev) => ({
                        ...prev,
                        ap_paterno: true,
                      }))
                    }
                    className={`border ${
                      formData.ap_paterno
                        ? "bg-[#A8CBD5] border-[#A8CBD5]"
                        : "border-gray-300"
                    } rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                  />
                  {errors.ap_paterno && (
                    <p className="text-red-500">{errors.ap_paterno}</p>
                  )}
                </div>

                <div className="w-full mr-4">
                  <label
                    htmlFor="ap_materno"
                    className="block font-semibold text-white mb-1"
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
                    onBlur={() =>
                      setIsFieldTouched((prev) => ({
                        ...prev,
                        ap_materno: true,
                      }))
                    }
                    className={`border ${
                      formData.ap_materno
                        ? "bg-[#A8CBD5] border-[#A8CBD5]"
                        : "border-gray-300"
                    } rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                  />
                  {errors.ap_materno && (
                    <p className="text-red-500">{errors.ap_materno}</p>
                  )}
                </div>

                <div className="w-full mr-4">
                  <label
                    htmlFor="nombre_paciente"
                    className="block font-semibold text-white mb-1"
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
                    onBlur={() =>
                      setIsFieldTouched((prev) => ({
                        ...prev,
                        nombre_paciente: true,
                      }))
                    }
                    className={`border ${
                      formData.nombre_paciente
                        ? "bg-[#A8CBD5] border-[#A8CBD5]"
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
                    onBlur={() =>
                      setIsFieldTouched((prev) => ({
                        ...prev,
                        no_expediente: true,
                      }))
                    }
                    className={`border ${
                      formData.no_expediente
                        ? "bg-[#A8CBD5] border-[#A8CBD5]"
                        : "border-gray-300"
                    } rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#001B58] focus:border-[#001B58] w-full`}
                  />
                </div>

                <div className="mr-4" style={{ width: "43%" }}>
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
                    onBlur={() =>
                      setIsFieldTouched((prev) => ({
                        ...prev,
                        sala_quirofano: true,
                      }))
                    }
                    className={`border ${
                      formData.sala_quirofano
                        ? "bg-[#A8CBD5] border-[#A8CBD5]"
                        : "border-gray-300"
                    } rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                  >
                    <option value="">Seleccionar</option>
                    {salasDisponibles
                      .filter((sala) => sala.estado)
                      .map((sala) => (
                        <option key={sala.id} value={sala.nombre_sala}>
                          {`Sala ${sala.nombre_sala}`}
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
                    onBlur={() =>
                      setIsFieldTouched((prev) => ({
                        ...prev,
                        fecha_nacimiento: true,
                      }))
                    }
                    className={`border ${
                      formData.fecha_nacimiento
                        ? "bg-[#A8CBD5] border-[#A8CBD5]"
                        : ""
                    } rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-[#001B58] focus:border-[#001B58] mt-2 ${
                      isFechaNacimientoValid ? "" : ""
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
                    id="edad"
                    name="edad"
                    value={formData.edad}
                    readOnly // Hacer que el campo sea solo lectura, ya que la edad se calcula automáticamente
                    onFocus={() =>
                      setIsFieldTouched((prev) => ({ ...prev, edad: true }))
                    }
                    className={`border ${
                      formData.edad
                        ? "bg-[#A8CBD5] border-[#A8CBD5]"
                        : "border-gray-300"
                    } rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-[#001B58] focus:border-[#001B58] mt-2`}
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
                    className={`border ${
                      formData.sexo
                        ? "bg-[#A8CBD5] border-[#A8CBD5]"
                        : "border-gray-300"
                    } rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2`}
                  >
                    <option value="">Seleccionar</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                  {errors.sexo && <p className="text-red-500">{errors.sexo}</p>}
                </div>

                <div className="mr-4" style={{ width: "96.5%" }}>
                  <label
                    htmlFor="nombre_cirujano"
                    className="block font-semibold text-white mb-3"
                  >
                    Cirujano responsable:
                  </label>
                  <input
                    placeholder="Nombre del cirujano"
                    type="text"
                    id="nombre_cirujano"
                    name="nombre_cirujano"
                    value={formData.nombre_cirujano}
                    onChange={handleInputChange}
                    className={`border ${
                      formData.nombre_cirujano
                        ? "bg-[#A8CBD5] border-[#A8CBD5]"
                        : "border-gray-300"
                    } rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                  />
                  {errors.nombre_cirujano && (
                    <p className="text-red-500">{errors.nombre_cirujano}</p>
                  )}
                </div>
              </div>

              <div className="flex mb-4">
                <div className="w-full mr-4">
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
                      formData.tipo_admision
                        ? "bg-[#A8CBD5] border-[#A8CBD5]"
                        : "border-gray-300"
                    } rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                  >
                    <option value="">Seleccionar</option>
                    <option value="Cama">Cama</option>
                    <option value="Consulta externa">Consulta externa</option>
                    <option value="Urgencias">Urgencias</option>
                  </select>
                  {errors.tipo_admision && (
                    <p className="text-red-500">{errors.tipo_admision}</p>
                  )}
                </div>

                <div className="mr-4 w-full">
                  {formData.tipo_admision === "Cama" ? (
                    <div className="w-full">
                      <label
                        htmlFor="cama"
                        className="block font-semibold text-white mb-1"
                      >
                        Cama:
                      </label>
                      <input
                        type="text"
                        id="cama"
                        name="cama"
                        value={formData.cama}
                        onChange={handleInputChange}
                        className={`border ${
                          formData.cama
                            ? "bg-[#A8CBD5] border-[#A8CBD5]"
                            : "border-gray-300"
                        } rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                      />
                    </div>
                  ) : (
                    <div className="block font-semibold text-white mb-1">
                      <label className="block font-semibold text-white mb-1">
                        Cama:
                      </label>
                      <div className="w-full h-[40px] bg-[#4c687e] rounded-lg"></div>
                    </div>
                  )}
                </div>

                <div className="w-full mr-4">
                  <label
                    htmlFor="tipo_intervencion"
                    className="block font-semibold text-white mb-1"
                  >
                    Tipo de interv. quirúrgica planeada:
                  </label>
                  <select
                    id="tipo_intervencion"
                    name="tipo_intervencion"
                    value={formData.tipo_intervencion}
                    onChange={handleInputChange}
                    className={`border ${
                      formData.tipo_intervencion
                        ? "bg-[#A8CBD5] border-[#A8CBD5]"
                        : "border-gray-300"
                    } rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                  >
                    <option value="">Seleccionar</option>
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

                <div className="mr-4" style={{ width: "49%" }}>
                  <label
                    htmlFor="nombre_especialidad"
                    className="block font-semibold text-white mb-1"
                  >
                    Especialidad:
                  </label>
                  <select
                    id="nombre_especialidad"
                    name="nombre_especialidad"
                    value={formData.nombre_especialidad}
                    onChange={handleNombreEspecialidadChange}
                    className={`border ${
                      formData.nombre_especialidad
                        ? "bg-[#A8CBD5] border-[#A8CBD5]"
                        : "border-gray-300"
                    } rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                  >
                    <option value="">Seleccionar</option>
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

                <div className="mr-4" style={{ width: "43%" }}>
                  <label
                    htmlFor="clave_esp"
                    className="block font-semibold text-white mb-1"
                  >
                    Cve. de esp.:
                  </label>
                  <select
                    id="clave_esp"
                    name="clave_esp"
                    value={formData.clave_esp}
                    onChange={handleClaveEspecialidadChange}
                    className={`border ${
                      formData.clave_esp
                        ? "bg-[#A8CBD5] border-[#A8CBD5]"
                        : "border-gray-300"
                    } rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  >
                    <option value="">Seleccionar</option>
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
                      formData.hora_solicitada
                        ? "bg-[#A8CBD5] border-[#A8CBD5]"
                        : "border-gray-300"
                    } rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
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
                      formData.fecha_solicitada
                        ? "bg-[#A8CBD5] border-[#A8CBD5]"
                        : "border-gray-300"
                    } rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
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
                      formData.tiempo_estimado
                        ? "bg-[#A8CBD5] border-[#A8CBD5]"
                        : "border-gray-300"
                    } rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {errors.tiempo_estimado && (
                    <p className="text-red-500">{errors.tiempo_estimado}</p>
                  )}
                </div>

                <div className="mr-4" style={{ width: "96.5%" }}>
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
                    } rounded-lg px-3 py-2 focus:ring-2 w-full`}
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
                    Procedimiento (CIE-9):
                  </label>
                  <ProcedureSelect
                    id="procedimientos_paciente"
                    name="procedimientos_paciente"
                    value={formData.procedimientos_paciente}
                    onChange={handleProcedureChange}
                  />
                  {errors.procedimientos_paciente && (
                    <p className="text-red-500">{errors.procedimientos_paciente}</p>
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
                    className={`border ${
                      formData.procedimientos_extra
                        ? "bg-[#A8CBD5] border-[#A8CBD5]"
                        : "border-gray-300"
                    } rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  >
                    <option value=""> Seleccionar </option>
                    {[...Array(11)].map((_, i) => (
                      <option key={i + 0} value={i + 0}>
                        {i + 0}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mr-4" style={{ width: "14.7%" }}>
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
                    className={`border ${
                      formData.req_insumo
                        ? "bg-[#A8CBD5] border-[#A8CBD5]"
                        : "border-gray-300"
                    } rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
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
                    Diagnóstico y procedimiento a realizar
                  </label>
                  <textarea
                    placeholder="Diagnóstico del paciente"
                    id="diagnostico"
                    name="diagnostico"
                    rows="4"
                    value={formData.diagnostico}
                    onChange={handleInputChange}
                    className={`border ${
                      formData.diagnostico
                        ? "bg-[#A8CBD5] border-[#A8CBD5]"
                        : "border-gray-300"
                    } rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
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
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default CrearSolicitud;
