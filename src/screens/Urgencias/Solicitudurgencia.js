import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../../Layout";
import Modal from "../../components/Modals/Modal";
import { MultiSelect } from "react-multi-select-component";
import AsyncSelect from "react-select/async";
import ProcedureSelect from "../Solicitudes/ProcedureSelect";

const SolicitudUrgencia = () => {
  const options = [
    { label: "General", value: "general" },
    { label: "TIVA", value: "tiva" },
    { label: "Regional", value: "regional" },
    { label: "USG", value: "usg" },
    { label: "Local", value: "local" },
    { label: "Sedación", value: "sedacion" },
  ];

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

  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [nombre_especialidad, setNombreEspecialidad] = useState("");
  const [clave_esp, setClaveEspecialidad] = useState("");
  const [procedimientoExtra, setProcedimientoExtra] = useState("");
  const [selected, setSelected] = useState([]);
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
    tipo_intervencion: "",
    fecha_solicitada: "",
    turno_solicitado: "",
    sala_quirofano: "",
    nombre_cirujano: "",
    req_insumo: "",
    estado_solicitud: "Urgencia",
    procedimientos_paciente: "",
    diagnostico: "",
    hora_entrada: "",
    hora_incision: "",
    hora_cierre: "",
    hora_salida: "",
    egreso: "",
    enf_quirurgica: "",
    enf_circulante: "",
    tipo_anestesia: [],
    nuevos_procedimientos_extra: [],
  });
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || 'http://localhost:4000';

  // Función para obtener la fecha actual en el formato adecuado (YYYY-MM-DD)
  function obtenerFechaActual() {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, "0");
    const day = String(hoy.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const fetchActiveSurgeons = async (inputValue) => {
    try {
      const response = await fetch(`${baseURL}/api/cirujanos/activos?search=${inputValue}`
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

  const fetchActiveNurses = async (inputValue) => {
    try {
      const response = await fetch(`${baseURL}/api/enfermeras/activos?search=${inputValue}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data.map((enfermeras) => ({
        label: enfermeras.nombre_completo,
        value: enfermeras.nombre_completo,
      }));
    } catch (error) {
      console.error("Error fetching active nurses:", error);
      return [];
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    if (name === "fecha_nacimiento") {
      const today = new Date().toISOString().split("T")[0];
      if (value > today) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          fecha_nacimiento: "Fecha de nacimiento no puede ser en el futuro",
        }));
      } else {
        setErrors((prevErrors) => {
          const { fecha_nacimiento, ...rest } = prevErrors;
          return rest;
        });
      }
    }
  };

  const handleNombreEspecialidadChange = (e) => {
    const selectedNombreEspecialidad = e.target.value;
    setNombreEspecialidad(selectedNombreEspecialidad);
    const correspondingClave =
      especialidadToClave[selectedNombreEspecialidad] || "";
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

  const handleNurseChange = (selectedOption, fieldName) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [fieldName]: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleAnestesioChange = (selectedOption) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      nombre_anestesiologo: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleAnesthesiaChange = (selectedOptions) => {
    if (!Array.isArray(selectedOptions)) return;
    setSelected(selectedOptions);

    const values = selectedOptions.map((option) => option.value);
    setFormData((prevFormData) => ({
      ...prevFormData,
      tipo_anestesia: values,
    }));
  };

  const agregarProcedimiento = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      nuevos_procedimientos_extra: Array.isArray(
        prevFormData.nuevos_procedimientos_extra
      )
        ? [...prevFormData.nuevos_procedimientos_extra, procedimientoExtra]
        : [procedimientoExtra],
    }));
    setProcedimientoExtra("");
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (!formData[key] && key !== "nuevos_procedimientos_extra") {
        newErrors[key] = "Campo requerido";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Submitting formData:", formData);
    if (validateForm()) {
      try {
        console.log("Datos enviados:", formData); // <-- Aquí se agregaron los datos enviados
        const response = await fetch(`${baseURL}/api/solicitudes/urgencias`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );

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
      console.log("Formulario inválido", errors); // <-- Aquí se muestra el error en la consola
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-xl font-semibold">Crear solicitud Urgente</h1>
        <div className="flex my-4 justify-between">
          <Link
            to="/bitacora/Bitaenfermeria"
            className="bg-[#365b77] hover:bg-[#7498b6] text-white py-2 px-4 rounded inline-flex items-center"
          >
            <span style={{ display: "inline-flex", alignItems: "center" }}>
              <span>&lt;</span>
              <span style={{ marginLeft: "5px" }}>Regresar a bitácora</span>
            </span>
          </Link>
        </div>

        <div class="flex flex-col p-4 bg-[#CB7E7E] rounded-lg ">
          <div class="flex mb-4">
            <div class="w-full mr-4">
              <label
                for="fecha_solicitud"
                class="block font-semibold text-white mb-1"
              >
                Fecha de solicitud:
              </label>
              <input
                type="text"
                id="fecha_solicitud"
                name="fecha_solicitud"
                value={formData.fecha_solicitud}
                className={`"border-[#C59494]"} rounded-lg px-3 py-2 w-full bg-[#DBB7B7] cursor-default`}
              />
            </div>

            <div className="w-full mr-4">
              <label
                htmlFor="id_cirujano"
                className="block font-semibold text-white mb-1"
              >
                Cirujano encargado
              </label>
              <div className="relative w-full">
                <AsyncSelect
                  loadOptions={fetchActiveSurgeons}
                  onChange={handleSelectChange}
                  placeholder="Nombre"
                  className={`rounded-lg focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full ${
                    errors.nombre_cirujano
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  styles={{
                    container: (provided) => ({
                      ...provided,
                      width: "100%",
                      minWidth: "0",
                    }),
                    control: (provided) => ({
                      ...provided,
                      borderColor: errors.nombre_cirujano
                        ? "#F56565"
                        : "#CBD5E0",
                      boxShadow: "none",
                      borderRadius: "0.5rem",
                      width: "100%",
                    }),
                    menu: (provided) => ({
                      ...provided,
                      width: "100%",
                    }),
                  }}
                />
                {errors.nombre_cirujano && (
                  <p className="text-red-500 mt-1">{errors.nombre_cirujano}</p>
                )}
              </div>
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
                placeholder="Ap. paterno Pte."
                type="text"
                id="ap_paterno"
                name="ap_paterno"
                value={formData.ap_paterno}
                onChange={handleInputChange}
                className={`"border-[#C59494]"} rounded-lg px-3 py-2 w-full bg-white`}
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
                placeholder="Apellido materno Pte."
                type="text"
                id="ap_materno"
                name="ap_materno"
                value={formData.ap_materno}
                onChange={handleInputChange}
                className={`"border-[#C59494]"} rounded-lg px-3 py-2 w-full bg-white`}
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
                placeholder="Nombre del Pte."
                type="text"
                id="nombre_paciente"
                name="nombre_paciente"
                value={formData.nombre_paciente}
                onChange={handleInputChange}
                className={`"border-[#C59494]"} rounded-lg px-3 py-2 w-full bg-white`}
              />
            </div>

            <div className="mr-4 w-full">
              <label
                htmlFor="edad"
                className="block font-semibold text-white mb-1"
              >
                Edad
              </label>
              <input
                placeholder="Edad de Pte."
                type="int"
                id="edad"
                name="edad"
                value={formData.edad}
                onChange={handleInputChange}
                className={`"border-[#C59494]"} rounded-lg px-3 py-2 w-full bg-white`}
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
                  errors.nombre_paciente ? "border-red-500" : "border-gray-300"
                } rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
              >
                <option value=""> Seleccionar </option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
              {errors.sexo && <p className="text-red-500">{errors.sexo}</p>}
            </div>

            <div className="mr-4" style={{ width: "75%" }}>
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
                className={`border ${
                  errors.nombre_paciente ? "border-red-500" : "border-gray-300"
                } rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
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
              {errors.nombre_paciente && (
                <p className="text-red-500">{errors.nombre_paciente}</p>
              )}
            </div>
          </div>

          <div class="flex mb-4">
            <div class="w-full mr-4">
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
                className={`"border-[#C59494]"} rounded-lg px-3 py-2 w-full bg-white`}
              />
            </div>

            <div class="w-full mr-4">
              <label
                htmlFor="tipo_intervencion"
                className="block font-semibold text-white mb-1"
              >
                Tipo de intervención:
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
                <option value="Cirugía ambulatoria">Cirugía ambulatoria</option>
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

            <div className="mr-4 w-full">
              <label
                htmlFor="clave_esp"
                className="block font-semibold text-white mb-1"
              >
                Clave
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

            <div className="mr-4 w-full">
              <label
                htmlFor="turno_solicitado"
                className="block font-semibold text-white mb-1"
              >
                Turno
              </label>
              <select
                id="turno_solicitado"
                name="turno_solicitado"
                value={formData.turno_solicitado}
                onChange={handleInputChange}
                className={`border ${
                  errors.turno_solicitado ? "border-red-500" : "border-gray-300"
                } rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
              >
                <option value=""> Seleccionar </option>
                <option value="Matutino">Matutino</option>
                <option value="Vespertino">Vespertino</option>
                <option value="Nocturno">Nocturno</option>
                <option value="Especial">Especial</option>
              </select>
              {errors.turno_solicitado && (
                <p className="text-red-500">{errors.turno_solicitado}</p>
              )}
            </div>

            <div className="mr-4" style={{ width: "75%" }}>
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
            <div className="w-full mr-4">
              <label
                htmlFor="fecha_solicitada"
                className="block font-semibold text-white mb-1"
              >
                Fecha de urgencia:
              </label>
              <input
                type="date"
                id="fecha_solicitada"
                name="fecha_solicitada"
                value={formData.fecha_solicitada}
                onChange={handleInputChange}
                className="border-[#C59494] rounded-lg px-3 py-2 w-full bg-white"
              />
            </div>

            <div className="w-full mr-4">
              <label
                htmlFor="id_cirujano"
                className="block font-semibold text-white mb-1"
              >
                Anestesiólogo:
              </label>
              <div className="relative w-full">
                <AsyncSelect
                  loadOptions={fetchActiveSurgeons}
                  onChange={handleAnestesioChange}
                  placeholder="Nombre"
                  className={`rounded-lg focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58]`}
                  styles={{
                    container: (provided) => ({
                      ...provided,
                      width: "100%", // Ajusta el ancho del contenedor
                      minWidth: "0", // Asegura que el ancho se ajuste correctamente
                    }),
                    control: (provided) => ({
                      ...provided,
                      borderColor: errors.nombre_cirujano
                        ? "#F56565"
                        : "#CBD5E0",
                      boxShadow: "none",
                      borderRadius: "0.5rem",
                      width: "100%", // Ajusta el ancho del control
                    }),
                    menu: (provided) => ({
                      ...provided,
                      width: "100%", // Ajusta el ancho del menú desplegable
                    }),
                  }}
                />
                {errors.nombre_cirujano && (
                  <p className="text-red-500 mt-1">{errors.nombre_cirujano}</p>
                )}
              </div>
            </div>

            <div className="w-full mr-4">
              <label
                htmlFor="enfermera_quirurgica"
                className="block font-semibold text-white mb-1"
              >
                Enf. Quirúrgica:
              </label>
              <div className="relative w-full">
                <AsyncSelect
                  loadOptions={fetchActiveNurses}
                  onChange={(selectedOption) =>
                    handleNurseChange(selectedOption, "enf_quirurgica")
                  }
                  placeholder="Enf. Quirúrgica"
                  className="rounded-lg focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58]"
                  styles={{
                    container: (provided) => ({
                      ...provided,
                      width: "100%", // Ajusta el ancho del contenedor
                      minWidth: "0", // Asegura que el ancho se ajuste correctamente
                    }),
                    control: (provided) => ({
                      ...provided,
                      borderColor: "#CBD5E0",
                      boxShadow: "none",
                      borderRadius: "0.5rem",
                      width: "100%", // Ajusta el ancho del control
                    }),
                    menu: (provided) => ({
                      ...provided,
                      width: "100%", // Ajusta el ancho del menú desplegable
                    }),
                  }}
                />
              </div>
            </div>

            <div className="w-full mr-4">
              <label
                htmlFor="enfermera_circulante"
                className="block font-semibold text-white mb-1"
              >
                Enf. Circulante:
              </label>
              <div className="relative w-full">
                <AsyncSelect
                  loadOptions={fetchActiveNurses}
                  onChange={(selectedOption) =>
                    handleNurseChange(selectedOption, "enf_circulante")
                  }
                  placeholder="Enf. Circulante"
                  className="rounded-lg focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58]"
                  styles={{
                    container: (provided) => ({
                      ...provided,
                      width: "100%", // Ajusta el ancho del contenedor
                      minWidth: "0", // Asegura que el ancho se ajuste correctamente
                    }),
                    control: (provided) => ({
                      ...provided,
                      borderColor: "#CBD5E0",
                      boxShadow: "none",
                      borderRadius: "0.5rem",
                      width: "100%", // Ajusta el ancho del control
                    }),
                    menu: (provided) => ({
                      ...provided,
                      width: "100%", // Ajusta el ancho del menú desplegable
                    }),
                  }}
                />
              </div>
            </div>

            <div className="w-full mr-4">
              <label
                htmlFor="hora_solicitada"
                className="block font-semibold text-white mb-1"
              >
                Hora de cirugía:
              </label>
              <input
                type="time"
                id="hora_asignada"
                name="hora_asignada"
                value={formData.hora_asignada}
                onChange={handleInputChange}
                className="border-[#C59494] rounded-lg px-3 py-2 w-full bg-white"
              />
            </div>

            <div className="w-full mr-4" style={{ width: "75%" }}>
              <label
                htmlFor="hora_entrada"
                className="block font-semibold text-white mb-1"
              >
                Entrada quirófano:
              </label>
              <input
                placeholder="Minutos"
                type="time"
                id="hora_entrada"
                name="hora_entrada"
                value={formData.hora_entrada || ""}
                onChange={handleInputChange}
                className="border-[#C59494] rounded-lg px-3 py-2 w-full bg-white"
              />
            </div>
          </div>

          <div className="flex mb-4">
            <div className="w-full mr-4">
              <label
                htmlFor="tipo_anestesia"
                className="block font-semibold text-white mb-1"
              >
                Tipo Anestesia:
              </label>
              <MultiSelect
                options={options}
                value={selected}
                onChange={handleAnesthesiaChange}
                labelledBy="Seleccionar tipo de anestesia"
                overrideStrings={{
                  allItemsAreSelected: "Todo seleccionado",
                  clearSearch: "Limpiar búsqueda",
                  noOptions: "Sin opciones",
                  search: "Buscar",
                  selectAll: "Seleccionar todo",
                  selectSomeItems: "Seleccionar",
                }}
                className="border border-[#C59494] rounded-lg w-full bg-white text-[#333333] cursor-pointer text-sm"
                style={{ minHeight: "auto" }}
              />
            </div>

            <div className="w-full mr-4">
              <label
                htmlFor="tiempo_estimado"
                className="block font-semibold text-white mb-1"
              >
                Hora inicio Anes:
              </label>
              <input
                placeholder="Minutos"
                type="time"
                id="hi_anestesia"
                name="hi_anestesia"
                value={formData.hi_anestesia || ""}
                onChange={handleInputChange}
                className={`rounded-lg px-3 py-2 w-full bg-white`}
              />
            </div>

            <div className="mr-4 w-full">
              <label
                htmlFor="tiempo_estimado"
                className="block font-semibold text-white mb-1"
              >
                Hr Incisión:
              </label>
              <input
                placeholder="Minutos"
                type="time"
                id="hora_incision"
                name="hora_incision"
                value={formData.hora_incision || ""}
                onChange={handleInputChange}
                className={`"border-white"} rounded-lg px-3 py-2 w-full bg-white`}
              />
            </div>

            <div className="mr-4 w-full">
            <label
                htmlFor="tiempo_estimado"
                className="block font-semibold text-white mb-1"
              >
                Hora termino Anes:
              </label>
              <input
                placeholder="Minutos"
                type="time"
                id="ht_anestesia"
                name="ht_anestesia"
                value={formData.ht_anestesia || ""}
                onChange={handleInputChange}
                className={`rounded-lg px-3 py-2 w-full bg-white`}
              />
            </div>

            <div className="mr-4" style={{ width: "50%" }}>
              <label
                htmlFor="tiempo_estimado"
                className="block font-semibold text-white mb-1"
              >
                Hr Cierre:
              </label>
              <input
                placeholder="Minutos"
                type="time"
                id="hora_cierre"
                name="hora_cierre"
                value={formData.hora_cierre || ""}
                onChange={handleInputChange}
                className={`"border-white"} rounded-lg px-3 py-2 w-full bg-white`}
              />
            </div>
            <div className="w-full mr-4" style={{ width: "90%" }}>
              <label
                htmlFor="tiempo_estimado"
                className="block font-semibold text-white mb-1"
              >
                Salida paciente:
              </label>
              <input
                placeholder="Minutos"
                type="time"
                id="hora_salida"
                name="hora_salida"
                value={formData.hora_salida || ""}
                onChange={handleInputChange}
                className={`"border-white"} rounded-lg px-3 py-2 w-full bg-white`}
              />
            </div>
            <div className="mr-4 w-full" style={{ width: "116%" }}>
              <label
                htmlFor="procedimientos_paciente"
                className="block font-semibold text-white mb-1"
              >
                Egresa a:
              </label>
              <input
                type="text"
                id="egreso"
                name="egreso"
                value={formData.egreso || ""}
                onChange={handleInputChange}
                className={`"border-white"} rounded-lg px-3 py-2 w-full bg-white`}
              ></input>
            </div>
          </div>
          <div className="mr-4 w-full">
            <label
              htmlFor="procedimientos_paciente"
              className="block font-semibold text-white mb-1"
            >
              Procedimientos del paciente:
            </label>
            <ProcedureSelect onChange={handleProcedureChange} />
            {errors.procedimientos_paciente && (
              <p className="text-red-500">{errors.procedimientos_paciente}</p>
            )}
          </div>
          <div>
            {Array.isArray(formData.nuevos_procedimientos_extra) &&
              formData.nuevos_procedimientos_extra.map(
                (procedimiento, index) => (
                  <div key={index} className="flex mb-4">
                    <div className="mr-4 w-full">
                      <label
                        htmlFor={`procedimiento_${index}`}
                        className="block font-semibold text-white mb-1"
                      >
                        Procedimiento del paciente:
                      </label>
                      <input
                        id={`procedimiento_${index}`}
                        name={`procedimiento_${index}`}
                        value={procedimiento || ""}
                        className="rounded-lg px-3 py-2 w-full bg-white"
                      ></input>
                    </div>
                  </div>
                )
              )}
            <div className="flex mb-4">
              <div className="mr-4 w-full">
                <label
                  htmlFor="procedimiento_extra"
                  className="block font-semibold text-white mb-1"
                >
                  Agregar procedimiento:
                </label>
                <input
                  id="procedimiento_extra"
                  name="procedimiento_extra"
                  value={procedimientoExtra}
                  onChange={(e) => setProcedimientoExtra(e.target.value)}
                  className="rounded-lg px-3 py-2 w-full bg-white"
                ></input>
              </div>
              <div className="mr-4" style={{ width: "12%" }}>
                <label
                  htmlFor="agregar_procedimiento"
                  className="block font-semibold text-white mb-1"
                >
                  Agregar más
                </label>
                <button
                  id="agregar_procedimiento"
                  name="agregar_procedimiento"
                  className="border-[#D5A8A8] rounded-lg px-3 py-2 w-full bg-[#D5A8A8] text-white cursor-pointer"
                  onClick={agregarProcedimiento}
                >
                  +
                </button>
              </div>
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
                className={`"border-[#C59494]"} rounded-lg px-3 py-2 w-full bg-white`}
              ></textarea>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <button
            onClick={handleSubmit}
            className="bg-[#365b77] text-white px-4 py-2 rounded"
          >
            Guardar
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default SolicitudUrgencia;
