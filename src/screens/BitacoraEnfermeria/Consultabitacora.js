import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../../Layout";
import Modal from "../../components/Modals/Modal";

const Consultabitacora = () => {
  const { id } = useParams();
  const [patientData, setPatientData] = useState({});
  const [loading, setLoading] = useState(true);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendDetail, setSuspendDetail] = useState("");
  const [suspendDetailOptions, setSuspendDetailOptions] = useState([]);

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
        setPatientData(data);
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
      // Assuming data is an array of objects with a 'motivo' property
      const options = data.map(option => option.motivo); // Extracting 'motivo' from each object
      setSuspendDetailOptions(options);
    } catch (error) {
      console.error("Error fetching suspend detail options:", error);
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
    try {
      const response = await fetch(
        `http://localhost:4000/api/solicitudes/suspender/${id}`,
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
      closeModal(); // Cerrar el modal después de eliminar
      // Recargar la página después de eliminar
      window.location.reload();
    } catch (error) {
      console.error("Error suspending appointment:", error);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-xl font-semibold">Consulta Paciente</h1>

        <div className="flex my-4 space-x-4">
          <div>
            <Link
              to="/bitacora/Bitaenfermeria"
              className="bg-[#365b77] hover:bg-[#7498b6]  text-white py-2 px-4 rounded inline-flex items-center"
            >
              <span style={{ display: "inline-flex", alignItems: "center" }}>
                <span>&lt;</span>
                <span style={{ marginLeft: "5px" }}>Regresar a bitácora</span>
              </span>
            </Link>
          </div>
        </div>

        <div class="flex flex-col p-4 bg-[#80909C] rounded-lg ">
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
                className={`border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
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
                className={`border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
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
                className={`border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
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
                className={`border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
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
                className={`border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
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
                value={patientData.no_expediente || "N/A"}
                readOnly
                className={`border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
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
                className={`border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
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
                className={`border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
              ></input>
            </div>

            <div className="mr-4" style={{ width: "50%" }}>
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
                className={`border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
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
                className={`border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
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
                className={`border border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
              ></input>
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
                value={patientData.tipo_intervencion || "N/A"}
                readOnly
                className={`border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
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
                className={`border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
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
                className={`border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
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
                className={`border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
              />
            </div>

            <div className="mr-4" style={{ width: "50%" }}>
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
                className={`border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
              ></input>
            </div>
          </div>

          <div class="flex mb-4">
            <div class="w-full mr-4">
              <label
                htmlFor="fecha_solicitada"
                className="block font-semibold text-white mb-1"
              >
                Fecha solicitada:
              </label>
              <input
                type="text"
                id="fecha_solicitada"
                name="fecha_solicitada"
                value={patientData.fecha_solicitada || "N/A"}
                readOnly
                className={`border border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
              />
            </div>

            <div class="w-full mr-4">
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
                value={patientData.hora_solicitada || "N/A"}
                readOnly
                className={`border border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
              />
            </div>

            <div className="mr-4 w-full">
              <label
                htmlFor="tiempo_estimado"
                className="block font-semibold text-white mb-1"
              >
                Hora entr. cirugía:
              </label>
              <input
                placeholder="Minutos"
                type="int"
                id="tiempo_estimado"
                name="tiempo_estimado"
                value={patientData.tiempo_estimado || "N/A"}
                readOnly
                className={`border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
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
                type="int"
                id="tiempo_estimado"
                name="tiempo_estimado"
                value={patientData.tiempo_estimado || "N/A"}
                readOnly
                className={`border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
              />
            </div>

            <div className="mr-4 w-full">
              <label
                htmlFor="tiempo_estimado"
                className="block font-semibold text-white mb-1"
              >
                Tipo Anes:
              </label>
              <input
                placeholder="Minutos"
                type="int"
                id="tiempo_estimado"
                name="tiempo_estimado"
                value={patientData.tiempo_estimado || "N/A"}
                readOnly
                className={`border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
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
                type="int"
                id="tiempo_estimado"
                name="tiempo_estimado"
                value={patientData.tiempo_estimado || "N/A"}
                readOnly
                className={`border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
              />
            </div>

            <div className="mr-4" style={{ width: "50%" }}>
              <label
                htmlFor="tiempo_estimado"
                className="block font-semibold text-white mb-1"
              >
                Hr Incisión:
              </label>
              <input
                placeholder="Minutos"
                type="int"
                id="tiempo_estimado"
                name="tiempo_estimado"
                value={patientData.tiempo_estimado || "N/A"}
                readOnly
                className={`border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
              />
            </div>
          </div>

          <div class="flex mb-4">
            <div class="w-full mr-4">
              <label
                htmlFor="procedimientos_paciente"
                className="block font-semibold text-white mb-1"
              >
                Enf. Quirirjica:
              </label>
              <input
                id="procedimientos_paciente"
                name="procedimientos_paciente"
                value={patientData.procedimientos_paciente || "N/A"}
                readOnly
                className={`border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
              ></input>
            </div>

            <div class="w-full mr-4">
              <label
                htmlFor="procedimientos_paciente"
                className="block font-semibold text-white mb-1"
              >
                Enf. Circulante:
              </label>
              <input
                id="procedimientos_paciente"
                name="procedimientos_paciente"
                value={patientData.procedimientos_paciente || "N/A"}
                readOnly
                className={`border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
              ></input>
            </div>

            <div class="w-full mr-4">
              <label
                htmlFor="procedimientos_paciente"
                className="block font-semibold text-white mb-1"
              >
                Anestesiólogo:
              </label>
              <input
                id="procedimientos_paciente"
                name="procedimientos_paciente"
                value={patientData.procedimientos_paciente || "N/A"}
                readOnly
                className={`border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
              ></input>
            </div>

            <div class="w-full mr-4">
              <label
                htmlFor="procedimientos_paciente"
                className="block font-semibold text-white mb-1"
              >
                Egresa a:
              </label>
              <input
                id="procedimientos_paciente"
                name="procedimientos_paciente"
                value={patientData.procedimientos_paciente || "N/A"}
                readOnly
                className={`border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
              ></input>
            </div>


            <div class="w-full mr-4">
              <label
                htmlFor="tiempo_estimado"
                className="block font-semibold text-white mb-1"
              >
                Hora term. anestesia:
              </label>
              <input
                placeholder="Minutos"
                type="int"
                id="tiempo_estimado"
                name="tiempo_estimado"
                value={patientData.tiempo_estimado || "N/A"}
                readOnly
                className={`border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
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
                type="int"
                id="tiempo_estimado"
                name="tiempo_estimado"
                value={patientData.tiempo_estimado || "N/A"}
                readOnly
                className={`border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
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
                type="int"
                id="tiempo_estimado"
                name="tiempo_estimado"
                value={patientData.tiempo_estimado || "N/A"}
                readOnly
                className={`border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
              />
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
              <input
                id="procedimientos_paciente"
                name="procedimientos_paciente"
                value={patientData.procedimientos_paciente || "N/A"}
                readOnly
                className={`border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
              ></input>
            </div>

            <div className="mr-4" style={{ width: "15%" }}>
              <label
                htmlFor="se_preveen"
                className="block font-semibold text-white mb-1"
              >
                Se preveén: (más)
              </label>
              <input
                id="procedimientos_extra"
                name="procedimientos_extra"
                value={patientData.procedimientos_extra || "N/A"}
                readOnly
                className={`border border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
              ></input>
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
                className={`border border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-[#DADADA] cursor-default`}
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Consultabitacora;
