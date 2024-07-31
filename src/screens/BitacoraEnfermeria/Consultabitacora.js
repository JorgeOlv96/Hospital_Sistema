import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../../Layout";
import Modal from "../../components/Modals/Modal";
import { MultiSelect } from "react-multi-select-component";
import AsyncSelect from "react-select/async";

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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendDetail, setSuspendDetail] = useState("");
  const [suspendDetailOptions, setSuspendDetailOptions] = useState([]);
  const [error, setError] = useState("");
  const [procedimientoExtra, setProcedimientoExtra] = useState("");
  const [selected, setSelected] = useState([]);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || 'http://localhost:4000';

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
      } = patientData;
      const response = await fetch(`${baseURL}/api/solicitudes/bitacoraenf/${id}`,
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

  const agregarProcedimiento = () => {
    setPatientData((prevData) => ({
      ...prevData,
      nuevos_procedimientos_extra: Array.isArray(
        prevData.nuevos_procedimientos_extra
      )
        ? [...prevData.nuevos_procedimientos_extra, procedimientoExtra]
        : [procedimientoExtra],
    }));
    setProcedimientoExtra(""); // Limpiar el campo después de agregar
  };

  return (
    <Layout>
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
                Folio de solicitud
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
                placeholder="Nombre del cirujano"
                value={patientData.nombre_cirujano || "N/A"}
                readOnly
                className={`"border-[#A8D5B1]"} rounded-lg px-3 py-2 w-full bg-[#A8D5B1] cursor-default`}
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
                Apellido materno:
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
                No. expediente
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
                Edad
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
              <input
                type="text"
                id="sala_quirofano"
                name="sala_quirofano"
                value={patientData.sala_quirofano || "N/A"}
                readOnly
                className={`"border-[#A8D5B1]"} rounded-lg px-3 py-2 w-full bg-[#A8D5B1] cursor-default`}
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
                value={patientData.fecha_nacimiento || "N/A"}
                readOnly
                className={`"border-[#A8D5B1]"} rounded-lg px-3 py-2 w-full bg-[#A8D5B1] cursor-default`}
              />
            </div>

            <div class="w-full mr-4">
              <label
                htmlFor="tipo_admision"
                className="block font-semibold text-white mb-1"
              >
                Procedencia paciente:
              </label>
              <input
                id="tipo_admision"
                name="tipo_admision"
                value={patientData.tipo_admision || "N/A"}
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
                Turno solicitado:
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
                Tiempo est. de cirugía:
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
                Fecha de cirugía:
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
                Hora de cirugía:
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
                id="procedimientos_paciente"
                name="procedimientos_paciente"
                value={patientData.nombre_anestesiologo || "N/A"}
                readOnly
                className={`"border-[#A8D5B1]"} rounded-lg px-3 py-2 w-full bg-[#A8D5B1] cursor-default`}
              ></input>
            </div>

            <div className="w-full mr-4">
              <label
                htmlFor="enf_quirurgica"
                className="block font-semibold text-white mb-1"
              >
                Enf. Quirúrgica:
              </label>
              <div className="relative">
                <input
                  placeholder="Enf. Quirúrgica"
                  type="text"
                  id="enf_quirirjica"
                  name="enf_quirirjica"
                  className={`"border-[#A8D5B1]"} rounded-lg px-3 py-2 w-full`}
                />
              </div>
            </div>

            <div className="w-full mr-4">
              <label
                htmlFor="enf_circulante"
                className="block font-semibold text-white mb-1"
              >
                Enf. Circulante:
              </label>
              <div className="relative">
              <input
                  placeholder="Enf. Quirúrgica"
                  type="text"
                  id="enf_circulante"
                  name="enf_circulante"
                  className={`"border-[#A8D5B1]"} rounded-lg px-3 py-2 w-full`}
                />
              </div>
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
                value={patientData.estado_solicitud || "N/A"}
                readOnly
                className={`"border-[#A8D5B1]"} rounded-lg px-3 py-2 w-full bg-[#A8D5B1] cursor-default`}
              ></input>
            </div>
          </div>

          <div class="flex mb-4">
            
          <div class="w-full mr-4">
              <label
                htmlFor="procedimientos_paciente"
                className="block font-semibold text-white mb-1"
              >
                Entr. quirófano:
              </label>
              <input
                placeholder="Minutos"
                type="time"
                id="hora_entrada"
                name="hora_entrada"
                value={patientData.hora_entrada || ""}
                onChange={handleChange}
                className={`"border-white"} rounded-lg px-3 py-2 w-full bg-white cursor-default`}
              />
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
                value={patientData.hi_anestesia || ""}
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
                className="border border-[#A8D5B1] rounded-lg w-full bg-[#A8D5B1] text-[#333333] cursor-pointer text-sm"
                style={{ minHeight: "auto" }}
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
                placeholder="Minutos"
                type="time"
                id="hora_incision"
                name="hora_incision"
                value={patientData.hora_incision || ""}
                onChange={handleChange}
                className={`"border-white"} rounded-lg px-3 py-2 w-full bg-white`}
              />
            </div>

            <div className="mr-4" style={{ width: "50%" }}>
              <label
                htmlFor="tiempo_estimado"
                className="block font-semibold text-white mb-1"
              >
                Hora Cierre:
              </label>
              <input
                placeholder="Minutos"
                type="time"
                id="hora_cierre"
                name="hora_cierre"
                value={patientData.hora_cierre || ""}
                onChange={handleChange}
                className={`"border-white"} rounded-lg px-3 py-2 w-full bg-white`}
              />
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
                onChange={handleChange}
                className={`rounded-lg px-3 py-2 w-full bg-white`}
              />
            </div>

            <div className="mr-4 w-full">
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
                value={patientData.hora_salida || ""}
                onChange={handleChange}
                className={`"border-white"} rounded-lg px-3 py-2 w-full bg-white cursor-default`}
              />
            </div>
            <div class="w-full mr-4">
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
                className={`"border-white"} rounded-lg px-3 py-2 w-full bg-white cursor-default`}
              ></input>
            </div>

          </div>
          <div className="mr-4 w-full">
            <label
              htmlFor="procedimiento_paciente"
              className="block font-semibold text-white mb-1"
            >
              Procedimiento inicial del paciente:
            </label>
            <input
              id="procedimientos_paciente"
              name="procedimientos_paciente"
              value={patientData.procedimientos_paciente || "N/A"}
              readOnly
              className="border-[#A8D5B1] rounded-lg px-3 py-2 w-full bg-[#A8D5B1] cursor-default"
            ></input>
          </div>
          <div>
            {Array.isArray(patientData.nuevos_procedimientos_extra) &&
              patientData.nuevos_procedimientos_extra.map(
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
                  className="border-[#A8D5B1] rounded-lg px-3 py-2 w-full bg-[#A8D5B1] text-white cursor-pointer"
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
                value={patientData.diagnostico || "N/A"}
                readOnly
                className={`"border-[#A8D5B1]"} rounded-lg px-3 py-2 w-full bg-[#A8D5B1] cursor-default`}
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
    </Layout>
  );
};

export default Consultabitacora;