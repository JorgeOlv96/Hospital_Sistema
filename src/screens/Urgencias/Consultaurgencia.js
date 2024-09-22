import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../../Layout";
import Modal from "../../components/Modals/Modal";
import { MultiSelect } from "react-multi-select-component";
import AsyncSelect from "react-select/async";
import ProcedureSelect from "../Solicitudes/ProcedureSelect";

const Consultaurgencia = () => {
  const options = [
    { label: "General", value: "general" },
    { label: "TIVA", value: "tiva" },
    { label: "Regional", value: "regional" },
    { label: "USG", value: "usg" },
    { label: "Local", value: "local" },
    { label: "Sedación", value: "sedacion" },
  ];

  const { id } = useParams();
  const [patientData, setPatientData] = useState({});
  const [isEditing, setIsEditing] = useState(false); // Estado para el modo de edición
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
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
  const handleEdit = () => {
    setIsEditing(true);
  };
  const handleProcedureChange = (selectedOption) => {
    setFormData({
      ...formData,
      procedimientos_paciente: selectedOption ? selectedOption.value : "",
    });
  };

  const handleTipoAnestesiaChange = (selectedOptions) => {
    const selectedValues = selectedOptions.map(option => option.value);
    setFormData({ ...formData, tipo_anestesia: selectedValues });
  };

  const handleSaveEdit = async () => {
    // Asegúrate de que nuevos_procedimientos_extra sea un array o undefined
    if (formData.nuevos_procedimientos_extra && !Array.isArray(formData.nuevos_procedimientos_extra)) {
        formData.nuevos_procedimientos_extra = [formData.nuevos_procedimientos_extra];
    }

    // Eliminar nuevos_procedimientos_extra si está vacío o no es válido
    if (!formData.nuevos_procedimientos_extra || formData.nuevos_procedimientos_extra.length === 0) {
        delete formData.nuevos_procedimientos_extra; // Eliminar el campo del objeto
    }

    try {
        await axios.patch(`${baseURL}/api/solicitudes/editarrealizadas/${id}`, formData);
        setIsEditing(false);
        window.location.reload();
        // Opcionalmente, puedes volver a cargar los datos
        // fetchAppointmentData();
    } catch (error) {
        console.error("Error saving appointment data:", error);
    }
};


  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData(patientData); // Reset formData to original patientData
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setPatientData({ ...patientData, [name]: value });
  };

  return (
    <Layout>
      <div
        data-aos="fade-right"
        data-aos-duration="1000"
        data-aos-delay="100"
        data-aos-offset="200"
      >
      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-xl font-semibold">Consulta de solicitud realizada</h1>
        <div className="flex my-4 justify-between">
        <Link
            to="/urgencias/Urgentes"
            className="bg-[#365b77] hover:bg-[#7498b6] text-white py-2 px-4 rounded inline-flex items-center"
          >
            <span style={{ display: "inline-flex", alignItems: "center" }}>
              <span>&lt;</span>
              <span style={{ marginLeft: "5px" }}>Regresar</span>
            </span>
          </Link>
              {!isEditing ? (
        <button
          onClick={handleEdit}
          className="bg-[#365b77] hover:bg-[#7498b6] text-white py-2 px-4 rounded inline-flex items-center"
        >
          Editar
        </button>
      ) : (
        <>
          <button
            onClick={handleSaveEdit}
            className="bg-green-800 hover:bg-green-700 text-white py-2 px-4 rounded inline-flex items-center"
          >
            Guardar
          </button>
          <button
            onClick={handleCancelEdit}
            className="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded inline-flex items-center"
          >
            Cancelar
          </button>
        </>
      )}
        </div>

        <div class="flex flex-col p-4 bg-[#CB7E7E] rounded-lg ">
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
                className={`"border-[#DBB7B7]"} rounded-lg px-3 py-2 w-full bg-[#DBB7B7] cursor-default`}
              />
            </div>

            <div className="w-full" style={{ width: "105%" }}>
                <label htmlFor="id_cirujano" className="block font-semibold text-white mb-1">
                  Cirujano encargado:
                </label>
                <input
                  placeholder="Nombre del cirujano"
                  type="text"
                  id="nombre_cirujano"
                  name="nombre_cirujano"
                  onChange={handleInputChange}
                  value={patientData.nombre_cirujano || "N/A"} // Use formData
                  readOnly={!isEditing} // Toggle editability
                  className={`border-[#DBB7B7] rounded-lg px-3 py-2 w-full ${isEditing ? "" : "bg-[#DBB7B7] cursor-default"}`}
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
                onChange={handleInputChange}
                value={patientData.ap_paterno || "N/A"}
                readOnly={!isEditing} // Toggle editability
                className={`border-[#DBB7B7] rounded-lg px-3 py-2 w-full ${isEditing ? "" : "bg-[#DBB7B7] cursor-default"}`}
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
                onChange={handleInputChange}
                value={patientData.ap_materno || "N/A"}
                readOnly={!isEditing} // Toggle editability
                className={`border-[#DBB7B7] rounded-lg px-3 py-2 w-full ${isEditing ? "" : "bg-[#DBB7B7] cursor-default"}`}
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
                onChange={handleInputChange}
                readOnly={!isEditing} // Toggle editability
                className={`border-[#DBB7B7] rounded-lg px-3 py-2 w-full ${isEditing ? "" : "bg-[#DBB7B7] cursor-default"}`}
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
                onChange={handleInputChange}
                readOnly={!isEditing} // Toggle editability
                className={`border-[#DBB7B7] rounded-lg px-3 py-2 w-full ${isEditing ? "" : "bg-[#DBB7B7] cursor-default"}`}
              />
            </div>

            <div class="w-full mr-4">
              <label
                htmlFor="fecha_nacimiento"
                className="block font-semibold text-white mb-1"
              >
                F. Nacimiento:
              </label>
              <input
                type="date"
                id="fecha_nacimiento"
                name="fecha_nacimiento"
                value={patientData.fecha_nacimiento || "N/A"}
                onChange={handleInputChange}
                readOnly={!isEditing} // Toggle editability
                className={`border-[#DBB7B7] rounded-lg px-3 py-2 w-full ${isEditing ? "" : "bg-[#DBB7B7] cursor-default"}`}
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
                onChange={handleInputChange}
                readOnly={!isEditing} // Toggle editability
                className={`border-[#DBB7B7] rounded-lg px-3 py-2 w-full ${isEditing ? "" : "bg-[#DBB7B7] cursor-default"}`}
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
                disabled={!isEditing} // Deshabilitar si no está en modo de edición
                className={`border-[#DBB7B7] rounded-lg px-3 py-2 w-full ${isEditing ? "" : "bg-[#DBB7B7] cursor-not-allowed"}`} // Cambiar el estilo cuando no se puede editar
              >
                <option value="">Seleccionar</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

          </div>

          <div class="flex mb-4">
          <div className="mr-4" style={{ width: "75%" }}>
              <label
                htmlFor="sala_quirofano"
                className="block font-semibold text-white mb-1"
              >
                Sala:
              </label>
              {isEditing ? (
              <select
                type="text"
                id="sala_quirofano"
                name="sala_quirofano"
                value={formData.sala_quirofano}
                onChange={handleInputChange}
                disabled={!isEditing} // Deshabilitar si no está en modo de edición
                className={`border-[#DBB7B7] rounded-lg px-3 py-2 w-full ${isEditing ? "" : "bg-[#DBB7B7] cursor-not-allowed"}`} // Cambiar el estilo cuando no se puede editar
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
                ) : (
                // Mostrar el input en modo de solo lectura
                <input
                  id="sala_quirofano"
                  name="sala_quirofano"
                  value={patientData.sala_quirofano || "N/A"}
                  readOnly
                  className={`border-[#DBB7B7] rounded-lg px-3 py-2 w-full bg-[#DBB7B7] cursor-default`}
                />
              )}
            </div>
            <div className="mr-4 w-full">
              <label
                htmlFor="tipo_intervencion"
                className="block font-semibold text-white mb-1"
              >
                Int. planeada:
              </label>

              {isEditing ? (
                // Mostrar el select solo en modo edición
                <select
                  id="tipo_intervencion"
                  name="tipo_intervencion"
                  value={formData.tipo_intervencion || ""}
                  onChange={handleInputChange}
                  className={`border-[#DBB7B7] rounded-lg px-3 py-2 w-full ${isEditing ? "" : "bg-[#DBB7B7] cursor-not-allowed"}`}
                >
                  <option value="">Seleccionar</option>
                  <option value="Cirugía">Cirugía</option>
                  <option value="Procedimiento">Procedimiento</option>
                  <option value="Cirugía ambulatoria">Cirugía ambulatoria</option>
                </select>
              ) : (
                // Mostrar el input en modo de solo lectura
                <input
                  id="tipo_intervencion"
                  name="tipo_intervencion"
                  value={patientData.tipo_intervencion || "N/A"}
                  readOnly
                  className={`border-[#DBB7B7] rounded-lg px-3 py-2 w-full bg-[#DBB7B7] cursor-default`}
                />
              )}
            </div>

            <div className="mr-4 w-full">
              <label
                htmlFor="turno_solicitado"
                className="block font-semibold text-white mb-1"
              >
                Turno:
              </label>
              {isEditing ? (
              <select
                id="turno_solicitado"
                name="turno_solicitado"
                value={formData.turno_solicitado}
                onChange={handleInputChange}
                disabled={!isEditing} // Deshabilitar si no está en modo de edición
                className={`border-[#DBB7B7] rounded-lg px-3 py-2 w-full ${isEditing ? "" : "bg-[#DBB7B7] cursor-not-allowed"}`}
              >
                <option value=""> Seleccionar </option>
                <option value="Matutino">Matutino</option>
                <option value="Vespertino">Vespertino</option>
                <option value="Nocturno">Nocturno</option>
                <option value="Especial">Especial</option>
              </select>
              ) : (
                // Mostrar el input en modo de solo lectura
                <input
                  id="turno_solicitado"
                  name="turno_solicitado"
                  value={patientData.turno_solicitado || "N/A"}
                  readOnly
                  className={`border-[#DBB7B7] rounded-lg px-3 py-2 w-full bg-[#DBB7B7] cursor-default`}
                />
              )}
            </div>

            <div className="mr-4" style={{ width: "75%" }}>
              <label
                htmlFor="req_insumo"
                className="block font-semibold text-white mb-1"
              >
                Insumos:
              </label>
              {isEditing ? (
              <select
                id="req_insumo"
                name="req_insumo"
                value={formData.req_insumo}
                onChange={handleInputChange}
                disabled={!isEditing} // Deshabilitar si no está en modo de edición
                className={`border-[#DBB7B7] rounded-lg px-3 py-2 w-full ${isEditing ? "" : "bg-[#DBB7B7] cursor-not-allowed"}`}
              >
                <option value="">Seleccionar</option>
                <option value="Si">Si</option>
                <option value="No">No</option>
              </select>
                ) : (
                // Mostrar el input en modo de solo lectura
                <input
                  id="req_insumo"
                  name="req_insumo"
                  value={patientData.req_insumo || "N/A"}
                  readOnly
                  className={`border-[#DBB7B7] rounded-lg px-3 py-2 w-full bg-[#DBB7B7] cursor-default`}
                />
              )}

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
                className={`"border-[#DBB7B7]"} rounded-lg px-3 py-2 w-full bg-[#DBB7B7] cursor-default`}
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
                type="date"
                id="fecha_programada"
                name="fecha_programada"
                value={patientData.fecha_programada || "N/A"}
                onChange={handleInputChange}
                readOnly={!isEditing} // Toggle editability
                className={`border-[#DBB7B7] rounded-lg px-3 py-2 w-full ${isEditing ? "" : "bg-[#DBB7B7] cursor-default"}`}
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
                onChange={handleInputChange}
                readOnly={!isEditing} // Toggle editability
                className={`border-[#DBB7B7] rounded-lg px-3 py-2 w-full ${isEditing ? "" : "bg-[#DBB7B7] cursor-default"}`}
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
                id="nombre_anestesiologo"
                name="nombre_anestesiologo"
                value={patientData.nombre_anestesiologo || "N/A"}
                onChange={handleInputChange}
                readOnly={!isEditing} // Toggle editability
                className={`border-[#DBB7B7] rounded-lg px-3 py-2 w-full ${isEditing ? "" : "bg-[#DBB7B7] cursor-default"}`}
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
                  id="enf_quirurgica"
                  name="enf_quirurgica"
                  value={patientData.enf_quirurgica || "N/A"}
                  onChange={handleInputChange}
                  readOnly={!isEditing} // Toggle editability
                  className={`border-[#DBB7B7] rounded-lg px-3 py-2 w-full ${isEditing ? "" : "bg-[#DBB7B7] cursor-default"}`}
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
                  placeholder="Enf. Circulante"
                  type="text"
                  id="enf_circulante"
                  name="enf_circulante"
                  value={patientData.enf_circulante || "N/A"}
                  onChange={handleInputChange}
                  readOnly={!isEditing} // Toggle editability
                  className={`border-[#DBB7B7] rounded-lg px-3 py-2 w-full ${isEditing ? "" : "bg-[#DBB7B7] cursor-default"}`}
                />
              </div>
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
                onChange={handleInputChange}
                readOnly={!isEditing} // Toggle editability
                className={`border-[#DBB7B7] rounded-lg px-3 py-2 w-full ${isEditing ? "" : "bg-[#DBB7B7] cursor-default"}`}
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
                onChange={handleInputChange}
                readOnly={!isEditing} // Toggle editability
                className={`border-[#DBB7B7] rounded-lg px-3 py-2 w-full ${isEditing ? "" : "bg-[#DBB7B7] cursor-default"}`}
              />
            </div>

            <div className="mr-4 w-full">
          <label
            htmlFor="tipo_anestesia"
            className="block font-semibold text-white mb-1"
          >
            Tipo Anes:
          </label>

          {/* Mostrar MultiSelect solo si isEditing es true */}
          {isEditing ? (
            <MultiSelect
              options={options}
              value={options.filter(option => formData.tipo_anestesia?.includes(option.value))} // Selección actual
              onChange={handleTipoAnestesiaChange}
              labelledBy="Seleccionar tipo de anestesia"
              overrideStrings={{
                allItemsAreSelected: "Todo seleccionado",
                clearSearch: "Limpiar búsqueda",
                noOptions: "Sin opciones",
                search: "Buscar",
                selectAll: "Seleccionar todo",
                selectSomeItems: "Seleccionar",
              }}
              className="border border-[#DBB7B7] rounded-lg w-full bg-[#DBB7B7] text-[#333333] cursor-pointer text-sm"
              style={{ minHeight: "auto" }}
            />
          ) : (
            // Verificar si tipo_anestesia es un array antes de usar join()
            <p className="bg-[#DBB7B7] rounded-lg px-3 py-2 w-full text-black">
              {Array.isArray(formData.tipo_anestesia) ? formData.tipo_anestesia.join(", ") : patientData.tipo_anestesia || ""}
            </p>
          )}
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
                onChange={handleInputChange}
                readOnly={!isEditing} // Toggle editability
                className={`border-[#DBB7B7] rounded-lg px-3 py-2 w-full ${isEditing ? "" : "bg-[#DBB7B7] cursor-default"}`}
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
                onChange={handleInputChange}
                readOnly={!isEditing} // Toggle editability
                className={`border-[#DBB7B7] rounded-lg px-3 py-2 w-full ${isEditing ? "" : "bg-[#DBB7B7] cursor-default"}`}
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
                onChange={handleInputChange}
                readOnly={!isEditing} // Toggle editability
                className={`border-[#DBB7B7] rounded-lg px-3 py-2 w-full ${isEditing ? "" : "bg-[#DBB7B7] cursor-default"}`}
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
                onChange={handleInputChange}
                readOnly={!isEditing} // Toggle editability
                className={`border-[#DBB7B7] rounded-lg px-3 py-2 w-full ${isEditing ? "" : "bg-[#DBB7B7] cursor-default"}`}
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
                onChange={handleInputChange}
                readOnly={!isEditing} // Toggle editability
                className={`border-[#DBB7B7] rounded-lg px-3 py-2 w-full ${isEditing ? "" : "bg-[#DBB7B7] cursor-default"}`}
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

            {isEditing ? (
              // Cuando se está editando, mostrar el componente interactivo con fondo blanco
              <div className="w-full">
                <ProcedureSelect onChange={handleProcedureChange} />
              </div>
            ) : (
              // Cuando no se está editando, mostrar un campo de solo lectura con fondo gris
              <input
                type="text"
                id="procedimientos_paciente"
                name="procedimientos_paciente"
                value={patientData.procedimientos_paciente || "N/A"} // Asegurar que haya un valor por defecto
                readOnly
                className="border-[#DBB7B7] rounded-lg px-3 py-2 w-full bg-[#DBB7B7] cursor-default"
              />
            )}
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
                  Procedimientos adicionales:
                </label>
                <input
                  id="procedimiento_extra"
                  name="procedimiento_extra"
                  value={patientData.nuevos_procedimientos_extra || "N/A"}
                  readOnly
                  className={`"border-[#DBB7B7]"} rounded-lg px-3 py-2 w-full bg-[#DBB7B7] cursor-default`}
                ></input>
              </div>
            </div>
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
                onChange={handleInputChange}
                readOnly={!isEditing} // Toggle editability
                className={`border-[#DBB7B7] rounded-lg px-3 py-2 w-full ${isEditing ? "" : "bg-[#DBB7B7] cursor-default"}`}
              ></textarea>
            </div>
            <div className="mr-4" style={{ width: "50%" }}>
              <label htmlFor="comentarios" className="block font-semibold text-white mb-1">
                Comentarios adicionales:
              </label>
              <textarea
                placeholder="comentarios"
                id="comentarios"
                name="comentarios"
                rows="4"
                value={patientData.comentarios || ""}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className={`${isEditing ? 'border-gray-300' : 'bg-[#DBB7B7] cursor-default'} rounded-lg px-3 py-2 w-full`}
              ></textarea>
            </div>
          </div>
        </div>
      </div>

    
      </div>
    </Layout>
  );
};

export default Consultaurgencia;