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
      closeModal(); // Cerrar el modal después de suspender
      // Redirigir a la página /bitacora/Bitaenfermeria
      window.location.href = '/bitacora/Bitaenfermeria';
    } catch (error) {
      console.error("Error suspending appointment:", error);
    }
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
                className={`border  "border-red-500" : "border-gray-200"} rounded-lg px-3 py-2 w-full bg-gray-300`}
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
                value={patientData.curp || "N/A"}
                readOnly
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
                value={patientData.ap_paterno || "N/A"}
                 
                className={`rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
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
                 
                className={`rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
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
                 
                className={`rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
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
                 
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-[#001B58] focus:border-[#001B58]"
              />
            </div>

            <div className="mr-4" style={{ width: "50%" }}>
              <label
                htmlFor="sala_quirofano"
                className="block font-semibold text-white mb-1"
              >
                Sala solicitada:
              </label>
              <input
                type="text"
                id="sala_quirofano"
                name="sala_quirofano"
                value={patientData.sala_quirofano || "N/A"}
                 
                className={`rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                
              >
              </input>
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
                type="text"
                id="fecha_nacimiento"
                name="fecha_nacimiento"
                value={patientData.fecha_nacimiento || "N/A"}
                 
                className={`border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2}`}
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
              <input
                id="sexo"
                name="sexo"
                value={patientData.sexo || "N/A"}
                 
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2"
              >
              </input>
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
                className={`rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                />
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
              <input
                id="tipo_admision"
                name="tipo_admision"
                value={patientData.tipo_admision || "N/A"}
                 
                className={`border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                >
              </input>
              </div>

            <div className="mr-4 w-full">
              <label
                htmlFor="tipo_intervencion"
                className="block font-semibold text-white mb-1"
              >
                Tipo de intervención quirúrgica planeada:
              </label>
              <input
                id="tipo_intervencion"
                name="tipo_intervencion"
                value={patientData.tipo_intervencion || "N/A"}
                 
                className={`rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                >
              </input>
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
                className={`rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                >
              </input>
              </div>

            <div className="w-full">
              <label
                htmlFor="clave_esp"
                className="block font-semibold text-white mb-1"
              >
                Clave de especialidad:
              </label>
              <input
                id="clave_esp"
                name="clave_esp"
                value={patientData.clave_esp || "N/A"}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
              </input>
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
                value={patientData.hora_solicitada || "N/A"}
                 
                className={`border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                />
              </div>

            <div className="mr-4 w-full">
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
                 
                className={`border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                />
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
                value={patientData.tiempo_estimado || "N/A"}
                 
                className={`rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                />
              </div>

            <div className="w-full">
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
                 
                className={`rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                >
              </input>
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
                className={`rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                >
              </input>
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
                 
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
              </input>
            </div>

            <div className="mr-4" style={{ width: "14%" }}>
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
                 
                className={`rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                >
              </input>
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
                 
                className={`border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4F638F] focus:border-[#001B58] w-full`}
                >
              </textarea>
            </div>
          </div>
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
