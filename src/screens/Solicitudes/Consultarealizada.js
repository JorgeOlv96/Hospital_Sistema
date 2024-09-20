import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../../Layout";
import Modal from "../../components/Modals/Modal";
import { MultiSelect } from "react-multi-select-component";
import AsyncSelect from "react-select/async";

const Consultarealizada = () => {
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
  const [formData, setFormData] = useState({}); // Estado para los datos del formulario
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [procedimientoExtra, setProcedimientoExtra] = useState("");
  const [selected, setSelected] = useState([]);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || 'http://localhost:4000';

  useEffect(() => {
    const fetchAppointmentData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/solicitudes/${id}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setPatientData(data);
        setFormData(data); // Inicializar formData con los datos actuales
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

  const handleGoBack = () => {
    navigate(-1); // Navegar a la página anterior
  };

  const handleEdit = () => {
    setIsEditing(true); // Activar el modo de edición
  };

  const handleCancelEdit = () => {
    setIsEditing(false); // Desactivar el modo de edición
    setFormData({ ...patientData }); // Revertir cambios al estado original
  };
  const handleTipoAnestesiaChange = (selectedOptions) => {
    const selectedValues = selectedOptions.map(option => option.value); // Extraer los valores seleccionados
    setFormData({ ...formData, tipo_anestesia: selectedValues });
  };
  
  const handleSaveEdit = async () => {
    try {
      // Muestra los datos que vas a enviar en la consola para verificar
      console.log("Datos a enviar:", formData); 
  
      // Hacer la petición PATCH para actualizar la solicitud
      const response = await fetch(`${baseURL}/api/solicitudes/editarrealizadas/${id}`, {
        method: "PATCH",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      // Si la respuesta no es OK, lanzar un error
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
  
      // Actualiza los datos originales en la página con la nueva información
      setPatientData(formData); 
  
      // Refrescar la página para reflejar los cambios en la interfaz
      window.location.reload();
    } catch (error) {
      // Manejar cualquier error de red o de la API
      console.error("Error saving changes:", error);
    }
  };
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  
    // Actualizar también patientData si es necesario
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
  <button
    onClick={handleGoBack}
    className="bg-[#365b77] hover:bg-[#7498b6] text-white py-2 px-4 rounded inline-flex items-center"
  >
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      <span>&lt;</span>
      <span style={{ marginLeft: "5px" }}>Regresar</span>
    </span>
  </button>
  
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


        <div class="flex flex-col p-4 bg-[#0dafbf] rounded-lg ">
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
                className={`"border-[#a8e7ed]"} rounded-lg px-3 py-2 w-full bg-[#a8e7ed] cursor-default`}
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
                className={`"border-[#a8e7ed]"} rounded-lg px-3 py-2 w-full bg-[#a8e7ed] cursor-default`}
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
                className={`"border-[#a8e7ed]"} rounded-lg px-3 py-2 w-full bg-[#a8e7ed] cursor-default`}
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
                className={`"border-[#a8e7ed]"} rounded-lg px-3 py-2 w-full bg-[#a8e7ed] cursor-default`}
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
                className={`"border-[#a8e7ed]"} rounded-lg px-3 py-2 w-full bg-[#a8e7ed] cursor-default`}
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
                className={`"border-[#a8e7ed]"} rounded-lg px-3 py-2 w-full bg-[#a8e7ed] cursor-default`}
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
                className={`"border-[#a8e7ed]"} rounded-lg px-3 py-2 w-full bg-[#a8e7ed] cursor-default`}
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
                className={`"border-[#a8e7ed]"} rounded-lg px-3 py-2 w-full bg-[#a8e7ed] cursor-default`}
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
                className={`"border-[#a8e7ed]"} rounded-lg px-3 py-2 w-full bg-[#a8e7ed] cursor-default`}
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
                className={`"border-[#a8e7ed]"} rounded-lg px-3 py-2 w-full bg-[#a8e7ed] cursor-default`}
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
                className={`"border-[#a8e7ed]"} rounded-lg px-3 py-2 w-full bg-[#a8e7ed] cursor-default`}
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
                className={`"border-[#a8e7ed]"} rounded-lg px-3 py-2 w-full bg-[#a8e7ed] cursor-default`}
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
                className={`"border-[#a8e7ed]"} rounded-lg px-3 py-2 w-full bg-[#a8e7ed] cursor-default`}
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
                className={`"border-[#a8e7ed]"} rounded-lg px-3 py-2 w-full bg-[#a8e7ed] cursor-default`}
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
                className={`"border-[#a8e7ed]"} rounded-lg px-3 py-2 w-full bg-[#a8e7ed] cursor-default`}
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
                className={`"border-[#a8e7ed]"} rounded-lg px-3 py-2 w-full bg-[#a8e7ed] cursor-default`}
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
                className={`"border-[#a8e7ed]"} rounded-lg px-3 py-2 w-full bg-[#a8e7ed] cursor-default`}
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
                className={`"border-[#a8e7ed]"} rounded-lg px-3 py-2 w-full bg-[#a8e7ed] cursor-default`}
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
                className={`"border-[#a8e7ed]"} rounded-lg px-3 py-2 w-full bg-[#a8e7ed] cursor-default`}
              ></input>
            </div>

            <div className="w-full mr-4">
        <label htmlFor="enf_quirurgica" className="block font-semibold text-white mb-1">Enf. Quirúrgica:</label>
        <div className="relative">
          <input
            placeholder="Enf. Quirúrgica"
            type="text"
            id="enf_quirurgica"
            name="enf_quirurgica"
            value={formData.enf_quirurgica || ""}
            onChange={handleInputChange}
            readOnly={!isEditing}
            className={`${isEditing ? 'border-gray-300' : 'bg-[#a8e7ed] cursor-default'} rounded-lg px-3 py-2 w-full`}
          />
        </div>
      </div>

      <div className="w-full mr-4">
        <label htmlFor="enf_circulante" className="block font-semibold text-white mb-1">Enf. Circulante:</label>
        <div className="relative">
          <input
            placeholder="Enf. Circulante"
            type="text"
            id="enf_circulante"
            name="enf_circulante"
            value={formData.enf_circulante || ""}
            onChange={handleInputChange}
            readOnly={!isEditing}
            className={`${isEditing ? 'border-gray-300' : 'bg-[#a8e7ed] cursor-default'} rounded-lg px-3 py-2 w-full`}
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
                className={`"border-[#a8e7ed]"} rounded-lg px-3 py-2 w-full bg-[#a8e7ed] cursor-default`}
              ></input>
            </div>
          </div>

        <div class="flex mb-4">
        <div className="w-full mr-4">
          <label htmlFor="hora_entrada" className="block font-semibold text-white mb-1">
            Entr. quirófano:
          </label>
          <input
            placeholder="Minutos"
            type="time"
            id="hora_entrada"
            name="hora_entrada"
            value={formData.hora_entrada || ""}
            onChange={handleInputChange}
            readOnly={!isEditing}
            className={`${isEditing ? 'border-gray-300' : 'bg-[#a8e7ed] cursor-default'} rounded-lg px-3 py-2 w-full`}
          />
        </div>
        <div className="mr-4 w-full">
          <label htmlFor="hi_anestesia" className="block font-semibold text-white mb-1">
            Hora inicio Anes:
          </label>
          <input
            placeholder="Minutos"
            type="time"
            id="hi_anestesia"
            name="hi_anestesia"
            value={formData.hi_anestesia || ""}
            onChange={handleInputChange}
            readOnly={!isEditing}
            className={`${isEditing ? 'border-gray-300' : 'bg-[#a8e7ed] cursor-default'} rounded-lg px-3 py-2 w-full`}
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
      className="border border-[#A8D5B1] rounded-lg w-full bg-[#A8D5B1] text-[#333333] cursor-pointer text-sm"
      style={{ minHeight: "auto" }}
    />
  ) : (
    // Verificar si tipo_anestesia es un array antes de usar join()
    <p className="bg-[#a8e7ed] rounded-lg px-3 py-2 w-full text-black">
      {Array.isArray(formData.tipo_anestesia) ? formData.tipo_anestesia.join(", ") : formData.tipo_anestesia || ""}
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
                readOnly={!isEditing}
                className={`${isEditing ? 'border-gray-300' : 'bg-[#a8e7ed] cursor-default'} rounded-lg px-3 py-2 w-full`}
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
                readOnly={!isEditing}
                className={`${isEditing ? 'border-gray-300' : 'bg-[#a8e7ed] cursor-default'} rounded-lg px-3 py-2 w-full`}
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
                readOnly={!isEditing}
                className={`${isEditing ? 'border-gray-300' : 'bg-[#a8e7ed] cursor-default'} rounded-lg px-3 py-2 w-full`}
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
                readOnly={!isEditing}
                className={`${isEditing ? 'border-gray-300' : 'bg-[#a8e7ed] cursor-default'} rounded-lg px-3 py-2 w-full`}
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
                readOnly={!isEditing}
                className={`${isEditing ? 'border-gray-300' : 'bg-[#a8e7ed] cursor-default'} rounded-lg px-3 py-2 w-full`}
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
              className="border-[#a8e7ed] rounded-lg px-3 py-2 w-full bg-[#a8e7ed] cursor-default"
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
                  Procedimientos adicionales:
                </label>
                <input
                  id="procedimiento_extra"
                  name="procedimiento_extra"
                  value={patientData.nuevos_procedimientos_extra || "N/A"}
                  readOnly
                  className={`"border-[#a8e7ed]"} rounded-lg px-3 py-2 w-full bg-[#a8e7ed] cursor-default`}
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
                readOnly
                className={`"border-[#a8e7ed]"} rounded-lg px-3 py-2 w-full bg-[#a8e7ed] cursor-default`}
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
                className={`${isEditing ? 'border-gray-300' : 'bg-[#a8e7ed] cursor-default'} rounded-lg px-3 py-2 w-full`}
              ></textarea>
            </div>
            <div class="w-1/4 mr-4">
              <label
                htmlFor="egreso"
                className="block font-semibold text-white mb-1"
              >
                Teléfono de contacto
              </label>
              <input
                type="text"
                id="tel_contacto"
                name="tel_contacto"
                value={patientData.tel_contacto || ""}
                readOnly
                className={`"border-[#a8e7ed]"} rounded-lg px-3 py-2 w-full bg-[#a8e7ed] cursor-default`}
              ></input>
            </div>
          </div>
        </div>
      </div>

    
      </div>
    </Layout>
  );
};

export default Consultarealizada;