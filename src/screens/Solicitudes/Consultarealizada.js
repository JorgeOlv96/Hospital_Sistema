import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../../Layout";
import { MultiSelect } from "react-multi-select-component";

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
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [userName, setUserName] = useState("");
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
        setFormData({
          ...data,
          tipo_anestesia: data.tipo_anestesia ? data.tipo_anestesia.split(", ") : [],
        });
        setLoading(false);

        if (data.timestamp_no_editable) {
          const timestampNoEditable = new Date(data.timestamp_no_editable);
          const ahora = new Date();
          const diferenciaHoras = (timestampNoEditable.getTime() + 16 * 60 * 60 * 1000 - ahora.getTime()) / (1000 * 60 * 60);
          setCanEdit(diferenciaHoras > 0);
          if (diferenciaHoras > 0) {
            setTimeLeft(Math.floor(diferenciaHoras * 60)); // Convertir a minutos
          }
        }
      } catch (error) {
        console.error("Error fetching appointment data:", error);
        setLoading(false);
      }
    };

    fetchAppointmentData();
  }, [id, baseURL]);

  useEffect(() => {
    let timer;
    if (timeLeft && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setCanEdit(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 60000); // Actualizar cada minuto
    }
    return () => clearInterval(timer);
  }, [timeLeft]);
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await axios.get(
            `${baseURL}/api/auth/user`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const { nombre, ap_paterno, ap_materno } = response.data;
          setUserName(`${nombre} ${ap_paterno} ${ap_materno}`);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({ ...patientData });
  };

  const handleTipoAnestesiaChange = (selectedOptions) => {
    const selectedValues = selectedOptions.map(option => option.value);
    setFormData({ ...formData, tipo_anestesia: selectedValues });
  };

  const handleSaveEdit = async () => {
    try {
      console.log("Datos a enviar:", formData);

      if (!Array.isArray(formData.tipo_anestesia)) {
        console.error("tipo_anestesia no es un array:", formData.tipo_anestesia);
        return;
      }

      const updatedData = {
        ...formData,
        tipo_anestesia: formData.tipo_anestesia.join(", "),
        ultimo_editor: userName,
      };

      const response = await fetch(`${baseURL}/api/solicitudes/editarrealizadas/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updatedData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      setPatientData(updatedData);
      if (result.timestamp_no_editable) {
        const timestampNoEditable = new Date(result.timestamp_no_editable);
        const ahora = new Date();
        const diferenciaHoras = (timestampNoEditable.getTime() + 16 * 60 * 60 * 1000 - ahora.getTime()) / (1000 * 60 * 60);
        setCanEdit(diferenciaHoras > 0);
        if (diferenciaHoras > 0) {
          setTimeLeft(Math.floor(diferenciaHoras * 60)); // Convertir a minutos
        }
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving changes:", error);
    }
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
            <button
              onClick={handleGoBack}
              className="bg-[#365b77] hover:bg-[#7498b6] text-white py-2 px-4 rounded inline-flex items-center"
            >
              <span style={{ display: "inline-flex", alignItems: "center" }}>
                <span>&lt;</span>
                <span style={{ marginLeft: "5px" }}>Regresar</span>
              </span>
            </button>
            
            {!isEditing && canEdit && (
              <button
                onClick={handleEdit}
                className="bg-[#365b77] hover:bg-[#7498b6] text-white py-2 px-4 rounded inline-flex items-center"
              >
                Editar
              </button>
            )}
            {isEditing && (
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
          {timeLeft && timeLeft > 0 && (
            <div className="text-sm text-gray-600">
              Tiempo restante para editar: {Math.floor(timeLeft / 60)} horas y {timeLeft % 60} minutos
            </div>
          )}


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
                Ap. Paterno:
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
                Ap. Materno:
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
                Edad:
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
                F. Nacimiento:
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
                Procedencia:
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
                Turno:
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
                Tiempo est.:
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
                F. Cirugía:
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
                H. Cirugía:
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
            H.I. Anes:
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
                Hr. Incisión:
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

            <div class="w-full mr-4">
              <label
                htmlFor="tiempo_estimado"
                className="block font-semibold text-white mb-1"
              >
                Hr. Cierre:
              </label>
              <input
                placeholder="Minutos"
                type="time"
                id="hora_cierre"
                name="hora_cierre"
                value={patientData.hora_cierre || ""}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className={`${isEditing ? 'border-gray-300' : 'bg-[#a8e7ed] cursor-default'} rounded-lg px-3 py-2 w-full`}
              />
            </div>

            <div className="mr-4 w-full">
              <label
                htmlFor="tiempo_estimado"
                className="block font-semibold text-white mb-1"
              >
                H.T. Anes:
              </label>
              <input
                placeholder="Minutos"
                type="time"
                id="ht_anestesia"
                name="ht_anestesia"
                value={patientData.ht_anestesia || ""}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className={`${isEditing ? 'border-gray-300' : 'bg-[#a8e7ed] cursor-default'} rounded-lg px-3 py-2 w-full`}
              />
            </div>

            <div className="mr-4 w-full">
              <label
                htmlFor="tiempo_estimado"
                className="block font-semibold text-white mb-1"
              >
                Hr. Salida:
              </label>
              <input
                placeholder="Minutos"
                type="time"
                id="hora_salida"
                name="hora_salida"
                value={patientData.hora_salida || ""}
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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