import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../../Layout";
import Modal from "../../components/Modals/Modal";
import { MultiSelect } from "react-multi-select-component";
import AsyncSelect from "react-select/async";
import PersonalSelect from "../Solicitudes/PersonalSelect";
import ProcedureSelect from "../Solicitudes/ProcedureSelect";

const Consultabitacora = () => {
  const options = [
    { label: "General", value: "general" },
    { label: "TIVA", value: "tiva" },
    { label: "Regional", value: "regional" },
    { label: "USG", value: "usg" },
    { label: "Local", value: "local" },
    { label: "Sedación", value: "sedacion" },
  ];

  const { id } = useParams();
  const [patientData, setPatientData] = useState({
    nombre_cirujano:"",
    nombre_anestesiologo:"",
    sala_quirofano:"",
    hora_entrada: "",
    hora_incision: "",
    hora_cierre: "",
    hora_salida: "",
    egreso: "",
    enf_quirurgica: "",
    enf_circulante: "",
    tipo_anestesia: [],
    nuevos_procedimientos_extra: [],
    comentarios: "",
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendDetail, setSuspendDetail] = useState("");
  const [suspendDetailOptions, setSuspendDetailOptions] = useState([]);
  const [error, setError] = useState("");
  const [procedimientoExtra, setProcedimientoExtra] = useState("");
  const [selected, setSelected] = useState([]);
  const [mostrarProcedureSelect, setMostrarProcedureSelect] = useState(false);
  const [procedureSelected, setProcedureSelected] = useState(false);

  const [mostrarInput, setMostrarInput] = useState(false);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || 'http://localhost:4000';
  const [errors, setErrors] = useState({
    hora_incision: '',
    hora_cierre: '',
    hora_salida: ''
  });

  useEffect(() => {
    const fetchAppointmentData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/solicitudes/${id}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setPatientData(data);
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
      const response = await fetch(`${baseURL}/api/solicitudes/motivos-suspension?category=${category}`
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

  const validateTimes = (field, value) => {
    const { hora_entrada, hora_incision, hora_cierre, hora_salida } = patientData;
    let newErrors = { ...errors };

    switch (field) {
      case 'hora_incision':
        if (value < hora_entrada) {
          newErrors.hora_incision = 'La hora de incisión no puede ser menor a la hora de entrada';
        } else {
          newErrors.hora_incision = '';
        }
        break;
      case 'hora_cierre':
        if (value < hora_incision || value < hora_entrada) {
          newErrors.hora_cierre = 'La hora de cierre no puede ser menor a la hora de incisión ni a la hora de entrada';
        } else {
          newErrors.hora_cierre = '';
        }
        break;
      case 'hora_salida':
        if (value < hora_cierre || value < hora_incision || value < hora_entrada) {
          newErrors.hora_salida = 'La hora de salida no puede ser menor a la hora de cierre, incisión ni entrada';
        } else {
          newErrors.hora_salida = '';
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  useEffect(() => {
    // Validar todos los campos cuando el componente se monta o los datos cambian
    validateTimes('hora_incision', patientData.hora_incision);
    validateTimes('hora_cierre', patientData.hora_cierre);
    validateTimes('hora_salida', patientData.hora_salida);
  }, [patientData.hora_entrada, patientData.hora_incision, patientData.hora_cierre, patientData.hora_salida]);

  const handleSalaChange = (newSala) => {
    setPatientData((prevData) => ({
      ...prevData,
      sala_quirofano: newSala || prevData.sala_quirofano // Si no se selecciona nueva sala, mantener la anterior
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseURL}/api/solicitudes/${id}`);
        const loadedData = response.data;
        setPatientData(prevData => ({
          ...prevData,
          ...loadedData,
          nuevos_procedimientos_extra: JSON.parse(loadedData.nuevos_procedimientos_extra || '[]')
        }));
      } catch (err) {
        setError('Error al cargar los datos de la solicitud');
        console.error('Error al cargar los datos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, baseURL]);
  
  const handleProcedureSelectChange = (selectedProcedure) => {
    setPatientData(prevData => ({
      ...prevData,
      nuevos_procedimientos_extra: [
        ...(Array.isArray(prevData.nuevos_procedimientos_extra) ? prevData.nuevos_procedimientos_extra : []),
        { value: selectedProcedure.value, label: selectedProcedure.label }
      ]
    }));
    setMostrarProcedureSelect(false);
  };
  

  const handleSuspendReasonChange = (e) => {
    const selectedReason = e.target.value;
    setSuspendReason(selectedReason);
    if (selectedReason) {
      fetchSuspendDetailOptions(selectedReason.toLowerCase());
    } else {
      setSuspendDetailOptions([]);
    }
  };

  const handleSuspend = () => {
    setSuspendModalOpen(true);
  };

  const closeModal = () => {
    setSuspendModalOpen(false);
  };

  const handleSuspendSubmit = async () => {
    if (!suspendReason || !suspendDetail) {
      setError("Por favor, selecciona un motivo y un detalle de suspensión.");
      return;
    }
    try {
      const response = await fetch(`${baseURL}/api/solicitudes/suspender/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            suspendReason,
            suspendDetail,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      setSuspendModalOpen(false);
      closeModal();
      navigate("/bitacora/Bitaenfermeria");
    } catch (error) {
      console.error("Error suspending appointment:", error);
    }
  };

  const handleSave = async () => {
    try {
      const {
        nuevos_procedimientos_extra,
        nombre_cirujano,
        nombre_anestesiologo,
        hora_entrada,
        hora_incision,
        hora_cierre,
        hora_salida,
        sala_quirofano,
        egreso,
        enf_quirurgica,
        enf_circulante,
        hi_anestesia,
        tipo_anestesia,
        ht_anestesia,
        comentarios,
      } = patientData;
      const response = await fetch(`${baseURL}/api/solicitudes/bitacoraenf/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            nuevos_procedimientos_extra: JSON.stringify(
              nuevos_procedimientos_extra
            ),
            hora_entrada,
            nombre_cirujano,
            nombre_anestesiologo,
            hora_incision,
            hora_cierre,
            hora_salida,
            sala_quirofano,
            egreso,
            enf_quirurgica,
            enf_circulante,
            hi_anestesia,
            tipo_anestesia,
            ht_anestesia,
            comentarios
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

  const handleSelectChange = (selectedOption) => {
    setPatientData((prevFormData) => ({
      ...prevFormData,
      enf_quirurgica: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatientData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    validateTimes(name, value);
  };

  const handleInputChange = (selectedOptions) => {
    if (!Array.isArray(selectedOptions)) return;
    setSelected(selectedOptions);
    const values = selectedOptions.map((option) => option.value);
    setPatientData((prevData) => ({
      ...prevData,
      tipo_anestesia: values,
    }));
  };
  const handlePersonalChange = (selectedOption, fieldName) => {
    setPatientData({
      ...patientData,
      [fieldName]: selectedOption ? selectedOption.value : "",
    });
  };

  const handleProcedimientoChange = (index, value) => {
    const updatedProcedimientos = [...patientData.nuevos_procedimientos_extra];
    updatedProcedimientos[index] = value;
    setPatientData({
      ...patientData,
      nuevos_procedimientos_extra: updatedProcedimientos,
    });
  };

  const agregarProcedimiento = () => {
    if (procedimientoExtra.trim() !== '') {
      setPatientData((prevData) => ({
        ...prevData,
        nuevos_procedimientos_extra: [
          ...(prevData.nuevos_procedimientos_extra || []),
          procedimientoExtra,
        ],
      }));
      setProcedimientoExtra('');
    }
  };
  const eliminarProcedimiento = (index) => {
    setPatientData(prevData => ({
      ...prevData,
      nuevos_procedimientos_extra: prevData.nuevos_procedimientos_extra.filter((_, i) => i !== index)
    }));
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Layout>
      <div
        data-aos="fade-right"
        data-aos-duration="1000"
        data-aos-delay="100"
        data-aos-offset="200"
      >
      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-xl font-semibold">Consulta Paciente</h1>
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

          <button
            onClick={handleSuspend}
            className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded inline-flex items-center"
          >
            Suspender cirugía
          </button>
        </div>

        <div class="flex flex-col p-4 bg-[#85AD8D] rounded-lg ">
          <div class="flex mb-4">
            <div class="w-full mr-4">
              <label
                for="fecha_solicitud"
                class="block font-semibold text-white mb-1"
              >
                Folio de solicitud:
              </label>
              <input
                type="text"
                id="folio"
                name="folio"
                value={patientData.folio || "N/A"}
                readOnly
                className={`"border-[#A8D5B1]"} rounded-lg px-3 py-2 w-full bg-[#A8D5B1] cursor-default`}
              />
            </div>

            <div className="w-full" style={{ width: "105%" }}>
              <label
                htmlFor="id_cirujano"
                className="block font-semibold text-white mb-1"
              >
                Cirujano encargado:
              </label>
              <input
                type="text"
                id="nombre_cirujano"
                name="nombre_cirujano"
                value={patientData.nombre_cirujano}
                onChange={handleChange}
                className={`"border-white"} rounded-lg px-3 py-2 w-full bg-white`}
              />
            </div>
          </div>

          <div class="flex mb-4">
            <div class="w-full mr-4">
              <label
                for="ap_paterno"
                class="block font-semibold text-white mb-1"
              >
                Ap. paterno:
              </label>
              <input
                placeholder="Apellido paterno paciente"
                type="text"
                id="ap_paterno"
                name="ap_paterno"
                value={patientData.ap_paterno || "N/A"}
                readOnly
                className={`"border-[#A8D5B1]"} rounded-lg px-3 py-2 w-full bg-[#A8D5B1] cursor-default`}
              />
            </div>

            <div class="w-full mr-4">
              <label
                for="ap_materno"
                class="block font-semibold text-white mb-1"
              >
                Ap. materno:
              </label>
              <input
                placeholder="Apellido materno paciente"
                type="text"
                id="ap_materno"
                name="ap_materno"
                value={patientData.ap_materno || "N/A"}
                readOnly
                className={`"border-[#A8D5B1]"} rounded-lg px-3 py-2 w-full bg-[#A8D5B1] cursor-default`}
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
                value={patientData.nombre_paciente || "N/A"}
                readOnly
                className={`"border-[#A8D5B1]"} rounded-lg px-3 py-2 w-full bg-[#A8D5B1] cursor-default`}
              />
            </div>

            <div className="mr-4 w-full">
              <label
                htmlFor="no_expediente"
                className="block font-semibold text-white mb-1"
              >
                No. Exp:
              </label>
              <input
                placeholder="Expediente de paciente"
                type="text"
                id="no_expediente"
                name="no_expediente"
                value={patientData.no_expediente || "N/A"}
                readOnly
                className={`"border-[#A8D5B1]"} rounded-lg px-3 py-2 w-full bg-[#A8D5B1] cursor-default`}
              />
            </div>

            <div className="mr-4 w-full">
              <label
                htmlFor="edad"
                className="block font-semibold text-white mb-1"
              >
                Edad:
              </label>
              <input
                placeholder="Edad de paciente"
                type="int"
                id="edad"
                name="edad"
                value={patientData.edad || "N/A"}
                readOnly
                className={`"border-[#A8D5B1]"} rounded-lg px-3 py-2 w-full bg-[#A8D5B1] cursor-default`}
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
                value={patientData.sexo || "N/A"}
                readOnly
                className={`"border-[#A8D5B1]"} rounded-lg px-3 py-2 w-full bg-[#A8D5B1] cursor-default`}
              ></input>
            </div>

            <div className="mr-4" style={{ width: "75%" }}>
              <label
                htmlFor="sala_quirofano"
                className="block font-semibold text-white mb-1"
              >
                Sala:
              </label>

              {/* Select para mostrar el valor actual y cambiarlo si es necesario */}
              <select
                id="sala_quirofano"
                name="sala_quirofano"
                value={patientData.sala_quirofano || ""}
                onChange={(e) => handleSalaChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full bg-white"
              >
                <option value="">Seleccionar sala</option>
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
            </div>
          </div>

          <div class="flex mb-4">
            <div class="w-full mr-4">
              <label
                htmlFor="fecha_nacimiento"
                className="block font-semibold text-white mb-1"
              >
                F. Nacimiento:
              </label>
              <input
                type="text"
                id="fecha_nacimiento"
                name="fecha_nacimiento"
                value={patientData.fecha_nacimiento || "N/A"}
                readOnly
                className={`"border-[#A8D5B1]"} rounded-lg px-3 py-2 w-full bg-[#A8D5B1] cursor-default`}
              />
            </div>

            <div className="w-full mr-4">
              <label
                htmlFor="tipo_admision"
                className="block font-semibold text-white mb-1"
              >
                Procedencia:
              </label>
              <input
                id="tipo_admision"
                name="tipo_admision"
                value={
                  patientData.tipo_admision === "CAMA"
                    ? `Cama - ${patientData.cama || "N/A"}`
                    : patientData.tipo_admision || "N/A"
                }
                readOnly
                className={`"border-[#A8D5B1]"} rounded-lg px-3 py-2 w-full bg-[#A8D5B1] cursor-default`}
              ></input>
            </div>


            <div className="mr-4 w-full">
              <label
                htmlFor="tipo_intervencion"
                className="block font-semibold text-white mb-1"
              >
                Int. planeada:
              </label>
              <input
                id="tipo_intervencion"
                name="tipo_intervencion"
                value={patientData.tipo_intervencion || "N/A"}
                readOnly
                className={`"border-[#A8D5B1]"} rounded-lg px-3 py-2 w-full bg-[#A8D5B1] cursor-default`}
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
                value={patientData.nombre_especialidad || "N/A"}
                readOnly
                className={`"border-[#A8D5B1]"} rounded-lg px-3 py-2 w-full bg-[#A8D5B1] cursor-default`}
              ></input>
            </div>

            <div className="mr-4 w-full">
              <label
                htmlFor="turno_solicitado"
                className="block font-semibold text-white mb-1"
              >
                Turno:
              </label>
              <input
                id="turno_solicitado"
                name="turno_solicitado"
                value={patientData.turno_solicitado || "N/A"}
                readOnly
                className={`"border-[#A8D5B1]"} rounded-lg px-3 py-2 w-full bg-[#A8D5B1] cursor-default`}
              ></input>
            </div>

            <div className="mr-4 w-full">
              <label
                htmlFor="tiempo_estimado"
                className="block font-semibold text-white mb-1"
              >
                Tiempo est.:
              </label>
              <input
                placeholder="Minutos"
                type="int"
                id="tiempo_estimado"
                name="tiempo_estimado"
                value={patientData.tiempo_estimado || "N/A"}
                readOnly
                className={`"border-[#A8D5B1]"} rounded-lg px-3 py-2 w-full bg-[#A8D5B1] cursor-default`}
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
                value={patientData.req_insumo || "N/A"}
                readOnly
                className={`"border-[#A8D5B1]"} rounded-lg px-3 py-2 w-full bg-[#A8D5B1] cursor-default`}
              ></input>
            </div>
          </div>

          <div class="flex mb-4">
            <div class="w-full mr-4">
              <label
                htmlFor="fecha_solicitada"
                className="block font-semibold text-white mb-1"
              >
                F. cirugía:
              </label>
              <input
                type="text"
                id="fecha_solicitada"
                name="fecha_solicitada"
                value={patientData.fecha_programada || "N/A"}
                readOnly
                className={`"border-[#A8D5B1]"} rounded-lg px-3 py-2 w-full bg-[#A8D5B1] cursor-default`}
              />
            </div>

            <div class="w-full mr-4">
              <label
                htmlFor="hora_solicitada"
                className="block font-semibold text-white mb-1"
              >
                H. cirugía:
              </label>
              <input
                type="time"
                id="hora_asignada"
                name="hora_asignada"
                value={patientData.hora_asignada || "N/A"}
                readOnly
                className={`"border-[#A8D5B1]"} rounded-lg px-3 py-2 w-full bg-[#A8D5B1] cursor-default`}
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
                type="=text"
                id="nombre_anestesiologo"
                name="nombre_anestesiologo"
                value={patientData.nombre_anestesiologo}
                onChange={handleChange}
                className={`"border-white" rounded-lg px-3 py-2 w-full bg-white`}
              ></input>
            </div>
            
            <div className="w-full mr-4">
              <label
                htmlFor="enf_circulante"
                className="block font-semibold text-white mb-1"
              >
                Proc. Extras:
              </label>
              <div className="relative">
              <input
                  placeholder="Enf. Circulante"
                  type="text"
                  id="enf_circulante"
                  name="enf_circulante"
                  value={patientData.procedimientos_extra + " más" || "N/A"}
                  readOnly
                  className={`"border-[#A8D5B1]"} rounded-lg px-3 py-2 w-full bg-[#A8D5B1] cursor-default`}
                />
              </div>
            </div>
            <div className="mb-4">
        <label htmlFor="hora_entrada" className="block font-semibold text-white mb-1">
          Hora de entrada:
        </label>
        <input
          type="time"
          id="hora_entrada"
          name="hora_entrada"
          value={patientData.hora_entrada || ''}
          onChange={handleChange}
          className="rounded-lg px-3 py-2 w-full bg-white"
        />
      </div>
          </div>

          <div class="flex mb-4">
          <div className="mr-4 w-full">
              <label
                htmlFor="enf_quirurgica"
                className="block font-semibold text-white mb-1"
              >
                Enf. Quirúrgica:
              </label>
              <PersonalSelect
                  id="enf_quirurgica"
                  name="enf_quirurgica"
                  value={patientData.enf_quirurgica}
                  onChange={(selectedOption) => handlePersonalChange(selectedOption, 'enf_quirurgica')}
                  backgroundColor="#A8D5B1" // Color de fondo para esta página
                />
            </div>

            <div className="mr-4 w-full">
              <label
                htmlFor="enf_circulante"
                className="block font-semibold text-white mb-1"
              >
                Enf. Circulante:
              </label>
              <PersonalSelect
                  id="enf_circulante"
                  name="enf_circulante"
                  value={patientData.enf_circulante}
                  onChange={(selectedOption) => handlePersonalChange(selectedOption, 'enf_circulante')}
                  backgroundColor="#A8D5B1" // Color de fondo para esta página
                />
            </div>
          </div>

          <div class="flex mb-4">
            <div className="mr-4 w-full">
              <label
                htmlFor="tiempo_estimado"
                className="block font-semibold text-white mb-1"
              >
                H.I. Anes:
              </label>
              <input
                placeholder="Minutos"
                type="time"
                id="hi_anestesia"
                name="hi_anestesia"
                value={patientData.hi_anestesia || ""}
                readOnly
                className={`"border-[#A8D5B1]"} rounded-lg px-3 py-2 w-full bg-[#A8D5B1] cursor-default`}
              />
            </div>

            <div className="mr-4 w-full">
              <label
                htmlFor="tipo_anestesia"
                className="block font-semibold text-white mb-1"
              >
                Tipo Anes:
              </label>
              <input
                options={options}
                value={patientData.tipo_anestesia}
                readOnly
                labelledBy="Seleccionar tipo de anestesia"
                className={`"border-[#A8D5B1]"} rounded-lg px-3 py-2 w-full bg-[#A8D5B1] cursor-default`}
              />
            </div>


            <div class="w-full mr-4">
              <label
                htmlFor="tiempo_estimado"
                className="block font-semibold text-white mb-1"
              >
                Hora Incisión:
              </label>
              <input
          type="time"
          id="hora_incision"
          name="hora_incision"
          value={patientData.hora_incision || ''}
          onChange={handleChange}
          className="rounded-lg px-3 py-2 w-full bg-white"
        />
        {errors.hora_incision && <p className="text-red-500 text-sm mt-1">{errors.hora_incision}</p>}
      </div>

            <div className="w-full mr-4">
              <label
                htmlFor="tiempo_estimado"
                className="block font-semibold text-white mb-1"
              >
                Hora Cierre:
              </label>
              <input
          type="time"
          id="hora_cierre"
          name="hora_cierre"
          value={patientData.hora_cierre || ''}
          onChange={handleChange}
          className="rounded-lg px-3 py-2 w-full bg-white"
        />
        {errors.hora_cierre && <p className="text-red-500 text-sm mt-1">{errors.hora_cierre}</p>}
      </div>

            <div className="mr-4 w-full">
              <label
                htmlFor="tiempo_estimado"
                className="block font-semibold text-white mb-1"
              >
                Termino Anes:
              </label>
              <input
                placeholder="Minutos"
                type="time"
                id="ht_anestesia"
                name="ht_anestesia"
                value={patientData.ht_anestesia || ""}
                readOnly
                className={`"border-[#A8D5B1]"} rounded-lg px-3 py-2 w-full bg-[#A8D5B1] cursor-default`}
              />
            </div>

            <div className="mr-4" style={{ width: "75%" }}>
              <label
                htmlFor="tiempo_estimado"
                className="block font-semibold text-white mb-1"
              >
                H. Salida:
              </label>
              <input
          type="time"
          id="hora_salida"
          name="hora_salida"
          value={patientData.hora_salida || ''}
          onChange={handleChange}
          className="rounded-lg px-3 py-2 w-full bg-white"
        />
        {errors.hora_salida && <p className="text-red-500 text-sm mt-1">{errors.hora_salida}</p>}
      </div>
                  <div className="mr-4" style={{ width: "75%" }}>
            <label
                htmlFor="egreso"
                className="block font-semibold text-white mb-1"
              >
                Egresa a:
              </label>
              <input
                type="text"
                id="egreso"
                name="egreso"
                value={patientData.egreso || ""}
                onChange={handleChange}
                className={`"border-white"} rounded-lg px-3 py-2 w-full bg-white`}
              ></input>
            </div>
          </div>
          <div className="p-4">
<div className="mb-4">
        <label htmlFor="procedimiento_paciente" className="block font-semibold text-white mb-1">
          Procedimiento inicial del paciente:
        </label>
        <input
          id="procedimientos_paciente"
          name="procedimientos_paciente"
          value={patientData.procedimientos_paciente || "N/A"}
          readOnly
          className="border-[#A8D5B1] rounded-lg px-3 py-2 w-full bg-[#A8D5B1] cursor-default mb-2"
        />
      </div>

      {Array.isArray(patientData.nuevos_procedimientos_extra) && patientData.nuevos_procedimientos_extra.length > 0 && (
        <div className="mb-4">
          <label className="block font-semibold text-white mb-1">
            Procedimientos adicionales:
          </label>
          {patientData.nuevos_procedimientos_extra.map((proc, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                value={proc.label || proc.value || "Procedimiento desconocido"}
                readOnly
                className="border-[#A8D5B1] rounded-lg px-3 py-2 flex-grow bg-[#A8D5B1] cursor-default mr-2"
              />
              <button
                onClick={() => eliminarProcedimiento(index)}
                className="bg-red-500 text-white rounded-lg px-3 py-2"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        className="border-[#A8D5B1] rounded-lg px-3 py-2 bg-[#A8D5B1] text-white cursor-pointer mb-2"
        onClick={() => setMostrarProcedureSelect(true)}
      >
        +
      </button>

      {mostrarProcedureSelect && (
        <div className="mb-4">
          <ProcedureSelect
            id="procedimientos_paciente_extra"
            name="procedimientos_paciente_extra"
            onChange={handleProcedureSelectChange}
          />
        </div>
      )}
    </div>


          <div className="flex mb-4">
            <div className="mr-4" style={{ width: "50%" }}>
              <label
                htmlFor="diagnostico_paciente"
                className="block font-semibold text-white mb-1"
              >
                Diagnóstico del paciente:
              </label>
              <textarea
                placeholder="Diagnóstico del paciente"
                id="diagnostico"
                name="diagnostico"
                rows="4"
                value={patientData.diagnostico || "N/A"}
                readOnly
                className={`"border-[#A8D5B1]"} rounded-lg px-3 py-2 w-full bg-[#A8D5B1] cursor-default`}
              ></textarea>
            </div>
            <div className="mr-4" style={{ width: "50%" }}>
              <label
                htmlFor="comentarios"
                className="block font-semibold text-white mb-1"
              >
                Comentarios:
              </label>
              <textarea
                placeholder="Escriba una nota o comentario sobre la cirugía realizada"
                id="comentarios"
                name="comentarios"
                rows="4"
                value={patientData.comentarios}
                onChange={handleChange}
                className={`"border-white"} rounded-lg px-3 py-2 w-full bg-white`}
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

      {suspendModalOpen && (
        <Modal
          closeModal={() => setSuspendModalOpen(false)}
          isOpen={suspendModalOpen}
          title={"Suspender Cita"}
          width={"max-w-lg"}
        >
          <div className="p-4">
            <div className="flex flex-col">
              <label className="block font-semibold text-gray-700 mb-2">
                Motivo de suspensión:
              </label>
              <select
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={suspendReason}
                onChange={handleSuspendReasonChange}
              >
                <option value="">Selecciona una categoría</option>
                <option value="Paciente">Paciente</option>
                <option value="Administrativas">Administrativas</option>
                <option value="Apoyo_clinico">Apoyo Clínico</option>
                <option value="Team_quirurgico">Team Quirúrgico</option>
                <option value="Infraestructura">Infraestructura</option>
                <option value="Tiempo_quirurgico">Tiempo Quirúrgico</option>
                <option value="Emergencias">Emergencias</option>
                <option value="Gremiales">Gremiales</option>
              </select>
            </div>

            <div className="flex flex-col mt-4">
              <label className="block font-semibold text-gray-700 mb-2">
                Detalle:
              </label>
              <select
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={suspendDetail}
                onChange={(e) => setSuspendDetail(e.target.value)}
              >
                <option value="">Selecciona un detalle</option>
                {suspendDetailOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Mensaje de error */}
            {error && <div className="mt-4 text-red-600">{error}</div>}

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setSuspendModalOpen(false)}
                className="bg-[#001B58] bg-opacity-20 text-[#001B58] text-sm p-4 rounded-lg font-light mr-2"
              >
                Cancelar
              </button>
              <button
                onClick={handleSuspendSubmit}
                className="bg-red-600 bg-opacity-5 text-red-600 text-sm p-4 rounded-lg font-light ml-2"
              >
                Suspender
              </button>
            </div>
          </div>
        </Modal>
      )}
      </div>
    </Layout>
  );
};

export default Consultabitacora;