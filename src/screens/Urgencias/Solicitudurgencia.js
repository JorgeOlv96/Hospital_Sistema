import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "../../Layout";
import Modal from "../../components/Modals/Modal";
import { MultiSelect } from "react-multi-select-component";
import AsyncSelect from "react-select/async";

const Solicitudurgencia = () => {
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

  const { id } = useParams();
  const [errors, setErrors] = useState({});
  const [nombre_especialidad, setNombreEspecialidad] = useState("");
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

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendDetail, setSuspendDetail] = useState("");
  const [suspendDetailOptions, setSuspendDetailOptions] = useState([]);
  const [error, setError] = useState("");
  const [procedimientoExtra, setProcedimientoExtra] = useState("");
  const [clave_esp, setClaveEspecialidad] = useState("");
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const fetchAppointmentData = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/solicitudes/${id}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setFormData(data);
        setSelected(
          data.tipo_anestesia.map((type) =>
            options.find((opt) => opt.value === type)
          )
        );
        setLoading(false);
      } catch (error) {
        console.error("Error fetching appointment data:", error);
        setLoading(false);
      }
    };

    fetchAppointmentData();
  }, [id]);

  const fetchSuspendDetailOptions = async (category) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/solicitudes/motivos-suspension?category=${category}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      const options = data.map((option) => option.motivo);
      setSuspendDetailOptions(options);
    } catch (error) {
      console.error("Error fetching suspend detail options:", error);
    }
  };

  const handleSave = async () => {
    try {
      const {
        nuevos_procedimientos_extra,
        hora_entrada,
        hora_incision,
        hora_cierre,
        hora_salida,
        egreso,
        enf_quirurgica,
        enf_circulante,
        hi_anestesia,
        tipo_anestesia,
        ht_anestesia,
      } = formData;
      const response = await fetch(
        `http://localhost:4000/api/solicitudes/bitacoraenf/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            nuevos_procedimientos_extra: JSON.stringify(
              nuevos_procedimientos_extra
            ),
            hora_entrada,
            hora_incision,
            hora_cierre,
            hora_salida,
            egreso,
            enf_quirurgica,
            enf_circulante,
            hi_anestesia,
            tipo_anestesia,
            ht_anestesia,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      navigate("/bitacora/Bitaenfermeria");
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Actualizar el estado del formulario
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

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

  const handleInputChange = (selectedOptions) => {
    if (!Array.isArray(selectedOptions)) return;
    setSelected(selectedOptions);

    const values = selectedOptions.map((option) => option.value);
    setFormData((prevFormData) => ({
      ...prevFormData,
      tipo_anestesia: values,
    }));

    // Actualizar el estado del formulario
    setFormData((prevFormData) => ({
      ...prevFormData,
      tipo_anestesia: values, // Usando el mismo campo para actualizar el formulario
    }));
  };

  const handleSelectChange = (selectedOption) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      nombre_cirujano: selectedOption ? selectedOption.value : "",
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
    setProcedimientoExtra(""); // Limpiar el campo después de agregar
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
                type="date"
                id="fecha_solicitud"
                name="fecha_solicitud"
                value={formData.fecha_solicitud}
                onChange={handleInputChange}
                className={`"border-[#C59494]"} rounded-lg px-3 py-2 w-full bg-[#DBB7B7]`}
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
                className={`border "border-red-500" : "border-red-500"} rounded-lg px-3 py-2 focus:ring-2 w-full`}
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
                value={formData.ap_paterno || "N/A"}
                className={`"border-[#C59494]"} rounded-lg px-3 py-2 w-full bg-[#DBB7B7] cursor-default`}
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
                placeholder="Apellido materno paciente"
                type="text"
                id="ap_materno"
                name="ap_materno"
                value={formData.ap_materno || "N/A"}
                className={`"border-[#C59494]"} rounded-lg px-3 py-2 w-full bg-[#DBB7B7] cursor-default`}
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
                placeholder="Nombre del paciente"
                type="text"
                id="nombre_paciente"
                name="nombre_paciente"
                value={formData.nombre_paciente || "N/A"}
                className={`"border-[#C59494]"} rounded-lg px-3 py-2 w-full bg-[#DBB7B7] cursor-default`}
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
                placeholder="Expediente de paciente"
                type="text"
                id="no_expediente"
                name="no_expediente"
                value={formData.no_expediente || "N/A"}
                className={`"border-[#C59494]"} rounded-lg px-3 py-2 w-full bg-[#DBB7B7] cursor-default`}
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
                placeholder="Edad de paciente"
                type="int"
                id="edad"
                name="edad"
                value={formData.edad || "N/A"}
                className={`"border-[#C59494]"} rounded-lg px-3 py-2 w-full bg-[#DBB7B7] cursor-default`}
              />
            </div>

            <div className="mr-4 w-full" style={{ width: "100%" }}>
              <label
                htmlFor="sexo"
                className="block font-semibold text-white mb-1"
              >
                Sexo:
              </label>
              <input
                id="sexo"
                name="sexo"
                value={formData.sexo || "N/A"}
                className={`"border-[#C59494]"} rounded-lg px-3 py-2 w-full bg-[#DBB7B7] cursor-default`}
              ></input>
            </div>

            <div className="mr-4" style={{ width: "75%" }}>
              <label
                htmlFor="sala_quirofano"
                className="block font-semibold text-white mb-1"
              >
                Sala:
              </label>
              <input
                type="text"
                id="sala_quirofano"
                name="sala_quirofano"
                value={formData.sala_quirofano || "N/A"}
                className={`"border-[#C59494]"} rounded-lg px-3 py-2 w-full bg-[#DBB7B7] cursor-default`}
              ></input>
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
                type="text"
                id="fecha_nacimiento"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento || "N/A"}
                className={`"border-[#C59494]"} rounded-lg px-3 py-2 w-full bg-[#DBB7B7] cursor-default`}
              />
            </div>

            <div className="mr-4 w-full">
              <label
                htmlFor="tipo_intervencion"
                className="block font-semibold text-white mb-1"
              >
                Intervención planeada:
              </label>
              <input
                id="tipo_intervencion"
                name="tipo_intervencion"
                value={formData.tipo_intervencion || "N/A"}
                className={`"border-[#C59494]"} rounded-lg px-3 py-2 w-full bg-[#DBB7B7] cursor-default`}
              ></input>
            </div>

            <div className="mr-4 w-full">
              <label
                htmlFor="nombre_especialidad"
                className="block font-semibold text-white mb-1"
              >
                Especialidad:
              </label>
              <input
                id="nombre_especialidad"
                name="nombre_especialidad"
                value={formData.nombre_especialidad || "N/A"}
                className={`"border-[#C59494]"} rounded-lg px-3 py-2 w-full bg-[#DBB7B7] cursor-default`}
              ></input>
            </div>

            <div className="mr-4 w-full">
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

            <div className="mr-4 w-full">
              <label
                htmlFor="turno_solicitado"
                className="block font-semibold text-white mb-1"
              >
                Turno solicitado:
              </label>
              <input
                id="turno_solicitado"
                name="turno_solicitado"
                value={formData.turno_solicitado || "N/A"}
                className={`"border-[#C59494]"} rounded-lg px-3 py-2 w-full bg-[#DBB7B7] cursor-default`}
              ></input>
            </div>

            <div className="mr-4 w-full">
              <label
                htmlFor="tiempo_estimado"
                className="block font-semibold text-white mb-1"
              >
                Tiempo est. de cirugía:
              </label>
              <input
                placeholder="Minutos"
                type="int"
                id="tiempo_estimado"
                name="tiempo_estimado"
                value={formData.tiempo_estimado || "N/A"}
                className={`"border-[#C59494]"} rounded-lg px-3 py-2 w-full bg-[#DBB7B7] cursor-default`}
              />
            </div>

            <div className="mr-4" style={{ width: "75%" }}>
              <label
                htmlFor="req_insumo"
                className="block font-semibold text-white mb-1"
              >
                Insumos:
              </label>
              <input
                id="req_insumo"
                name="req_insumo"
                value={formData.req_insumo || "N/A"}
                className={`"border-[#C59494]"} rounded-lg px-3 py-2 w-full bg-[#DBB7B7] cursor-default`}
              ></input>
            </div>
          </div>

          <div class="flex mb-4">
            <div class="w-full mr-4">
              <label
                htmlFor="fecha_solicitada"
                className="block font-semibold text-white mb-1"
              >
                Fecha de cirugía:
              </label>
              <input
                type="text"
                id="fecha_solicitada"
                name="fecha_solicitada"
                value={formData.fecha_programada || "N/A"}
                className={`"border-[#C59494]"} rounded-lg px-3 py-2 w-full bg-[#DBB7B7] cursor-default`}
              />
            </div>

            <div class="w-full mr-4">
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
                value={formData.hora_asignada || "N/A"}
                className={`"border-[#C59494]"} rounded-lg px-3 py-2 w-full bg-[#DBB7B7] cursor-default`}
              />
            </div>

            <div className="mr-4 w-full">
              <label
                htmlFor="tiempo_estimado"
                className="block font-semibold text-white mb-1"
              >
                Anestesiólogo:
              </label>
              <input
                id="procedimientos_paciente"
                name="procedimientos_paciente"
                value={formData.nombre_anestesiologo || "N/A"}
                className={`"border-[#C59494]"} rounded-lg px-3 py-2 w-full bg-[#DBB7B7] cursor-default`}
              ></input>
            </div>

            <div className="mr-4 w-full">
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
                onChange={handleChange}
                className={`rounded-lg px-3 py-2 w-full bg-white`}
              />
            </div>

            <div className="mr-4 w-full">
              <label
                htmlFor="tipo_anestesia"
                className="block font-semibold text-white mb-1"
              >
                Tipo Anes:
              </label>
              <MultiSelect
                options={options}
                value={selected}
                onChange={handleInputChange}
                labelledBy="Seleccionar tipo de anestesia"
                overrideStrings={{
                  allItemsAreSelected: "Todo seleccionado",
                  clearSearch: "Limpiar búsqueda",
                  noOptions: "Sin opciones",
                  search: "Buscar",
                  selectAll: "Seleccionar todo",
                  selectSomeItems: "Seleccionar",
                }}
                className="border border-[#C59494] rounded-lg w-full bg-[#DBB7B7] text-[#333333] cursor-pointer text-sm"
                style={{ minHeight: "auto" }}
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
                onChange={handleChange}
                className={`rounded-lg px-3 py-2 w-full bg-white`}
              />
            </div>

            <div className="mr-4" style={{ width: "75%" }}>
              <label
                htmlFor="req_insumo"
                className="block font-semibold text-white mb-1"
              >
                Estado
              </label>
              <input
                id="req_insumo"
                name="req_insumo"
                value={formData.estado_solicitud || "N/A"}
                className={`"border-[#C59494]"} rounded-lg px-3 py-2 w-full bg-[#DBB7B7] cursor-default`}
              ></input>
            </div>
          </div>

          <div class="flex mb-4">
            <div
              className="w-full"
              style={{ marginLeft: "-10px", width: "110%" }}
            >
              <label
                htmlFor="id_cirujano"
                className="block font-semibold text-white mb-1"
                style={{ marginLeft: "10px" }} // Ajusta el margen izquierdo aquí
              >
                Enf. Quirúrgica:
              </label>
              <AsyncSelect
                loadOptions={fetchActiveSurgeons}
                onChange={handleSelectChange}
                placeholder="Nombre"
                className={` ${
                  errors.nombre_cirujano ? "border-red-500" : "border-gray-300"
                } rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
              />
              {errors.nombre_cirujano && (
                <p className="text-red-500">{errors.nombre_cirujano}</p>
              )}
            </div>

            <div
              className="w-full"
              style={{ marginLeft: "-10px", width: "115%" }}
            >
              <label
                htmlFor="id_cirujano"
                className="block font-semibold text-white mb-1"
                style={{ marginLeft: "10px" }} // Ajusta el margen izquierdo aquí
              >
                Enf. Circulante:
              </label>
              <AsyncSelect
                loadOptions={fetchActiveSurgeons}
                onChange={handleSelectChange}
                placeholder="Nombre"
                className={` ${
                  errors.nombre_cirujano ? "border-red-500" : "border-gray-300"
                } rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
              />
              {errors.nombre_cirujano && (
                <p className="text-red-500">{errors.nombre_cirujano}</p>
              )}
            </div>

            <div class="w-full mr-4">
              <label
                htmlFor="procedimientos_paciente"
                className="block font-semibold text-white mb-1"
              >
                Hora entr. cirugía:
              </label>
              <input
                placeholder="Minutos"
                type="time"
                id="hora_entrada"
                name="hora_entrada"
                value={formData.hora_entrada || ""}
                onChange={handleChange}
                className={`"border-white"} rounded-lg px-3 py-2 w-full bg-white cursor-default`}
              />
            </div>

            <div class="w-full mr-4">
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
                onChange={handleChange}
                className={`"border-white"} rounded-lg px-3 py-2 w-full bg-white cursor-default`}
              ></input>
            </div>

            <div class="w-full mr-4">
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
                onChange={handleChange}
                className={`"border-white"} rounded-lg px-3 py-2 w-full bg-white`}
              />
            </div>

            <div className="mr-4 w-full">
              <label
                htmlFor="tiempo_estimado"
                className="block font-semibold text-white mb-1"
              >
                Hora salida paciente:
              </label>
              <input
                placeholder="Minutos"
                type="time"
                id="hora_salida"
                name="hora_salida"
                value={formData.hora_salida || ""}
                onChange={handleChange}
                className={`"border-white"} rounded-lg px-3 py-2 w-full bg-white cursor-default`}
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
                onChange={handleChange}
                className={`"border-white"} rounded-lg px-3 py-2 w-full bg-white`}
              />
            </div>
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
                  className="border-[#C59494] rounded-lg px-3 py-2 w-full bg-[#DBB7B7] text-white cursor-pointer"
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
                value={formData.diagnostico || "N/A"}
                className={`"border-[#C59494]"} rounded-lg px-3 py-2 w-full bg-[#DBB7B7] cursor-default`}
              ></textarea>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <button
            onClick={handleSave}
            className="bg-[#365b77] text-white px-4 py-2 rounded"
          >
            Guardar
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Solicitudurgencia;
