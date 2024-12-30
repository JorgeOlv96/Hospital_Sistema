import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import Modal from "./Modal";
import { AuthContext } from "../../AuthContext"; 

function SuspendidaEnf({
  closeModal,
  isOpen,
  appointmentId,
  onSuspendAppointment,
  onDeleteAppointment
}) {
  const { user } = useContext(AuthContext);
  const [patientData, setPatientData] = useState({
    hora_asignada: "",
    turno: "",
    fecha_programada: "", // Agregar campo para fecha programada
    nombre_anestesiologo: "", // Agregar campo para nombre de anestesiólogo
  });
  const [loading, setLoading] = useState(true);
  const modalRef = useRef(null);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatientData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Lógica para determinar y actualizar el turno asignado
    if (name === "hora_asignada") {
      const [hours, minutes] = value.split(":").map(Number);
      if (!isNaN(hours)) {
        if (hours >= 7 && hours < 14) {
          setPatientData((prevData) => ({ ...prevData, turno: "Matutino" }));
        } else if (hours >= 14 && hours < 21) {
          setPatientData((prevData) => ({ ...prevData, turno: "Vespertino" }));
        } else {
          setPatientData((prevData) => ({ ...prevData, turno: "Nocturno" }));
        }
      }
    }
  };

  const handleDelete = async () => {
    const confirmation = window.confirm(
      "¿Estás seguro de que deseas eliminar esta solicitud?"
    );
    if (confirmation) {
      try {
        const response = await axios.put(
          `${baseURL}/api/solicitudes/delete/${appointmentId}`
        );
        if (response.status === 200) {
          onDeleteAppointment(appointmentId); // Notificar al componente padre que la solicitud ha sido eliminada
          closeModal(); // Cerrar el modal
          window.location.reload();
        } else {
          console.error("Unexpected response:", response);
        }
      } catch (error) {
        console.error("Error deleting appointment:", error.message);
        // Puedes mostrar una notificación al usuario si es necesario
      }
    }
  };

  useEffect(() => {
    if (isOpen && appointmentId) {
      const fetchAppointmentData = async () => {
        try {
          const response = await fetch(
            `${baseURL}/api/solicitudes/${appointmentId}`
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
    }
  }, [isOpen, appointmentId]);

  const handleProgramAppointment = async () => {
    try {
      const { fecha_programada, hora_asignada, turno, nombre_anestesiologo } =
        patientData;
      console.log("Datos a enviar:", {
        fecha_programada,
        hora_asignada,
        turno,
        nombre_anestesiologo,
      });

      const response = await fetch(
        `${baseURL}/api/solicitudes/programar/${appointmentId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            fecha_programada,
            hora_asignada,
            turno,
            nombre_anestesiologo,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      closeModal(); // Cerrar el modal después de eliminar
      // Recargar la página después de eliminar
      window.location.reload();
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  const handleReprogramar = async () => {
    try {
      const response = await fetch(
        `${baseURL}/api/solicitudes/reprogramar/${appointmentId}`,
        {
          method: "PATCH",
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      closeModal(); // Cerrar el modal después de eliminar
      window.location.reload();
    } catch (error) {
      console.error("Error reprogramar appointment:", error);
    }
  };

  return (
    <Modal
      ref={modalRef}
      closeModal={closeModal}
      isOpen={isOpen}
      title={"Información completa"}
      width={"max-w-3xl"}
    >
      {loading ? (
        <div className="p-4">
          <img
            src="images/cargando.gif"
            alt="Cargando..."
            className="h-8 w-8 mx-auto"
          />
        </div>
      ) : (
        <div className="p-4">
          {(user?.rol_user === 6 || user?.rol_user === 7) && (
            <div className="flex justify-center">
              <button
                onClick={handleReprogramar}
                className="bg-[#001B58] bg-opacity-20 text-[#001B58] text-sm p-4 rounded-lg font-light w-40 h-12 mb-2"
              >
                Reprogramar cita
              </button>
            </div>
          )}

          <div className="mr-4 w-full mb-2">
            <label className="block font-semibold text-gray-700 mb-2">
              Folio:
            </label>
            <p className="bg-gray-200 p-3 rounded-lg">
              {patientData?.folio || "N/A"}
            </p>
          </div>

          <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md">
            
            <div className="flex mt-4">
              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Apellido paterno:
                </label>
                <p className="bg-gray-200 p-3 rounded-lg">
                  {patientData?.ap_paterno || "N/A"}
                </p>
              </div>

              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Apellido materno:
                </label>
                <p className="bg-gray-200 p-3 rounded-lg">
                  {patientData?.ap_materno || "N/A"}
                </p>
              </div>

              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Nombre:
                </label>
                <p className="bg-gray-200 p-3 rounded-lg">
                  {patientData?.nombre_paciente || "N/A"}
                </p>
              </div>

              <div className="w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Sexo:
                </label>
                <p className="bg-gray-200 p-3 rounded-lg">
                  {patientData?.sexo || "N/A"}
                </p>
              </div>
            </div>

          </div>

          <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
           
            <div className="flex mb-4">
              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Fecha asignada:
                </label>
                <input
                  type="text"
                  name="fecha_programada"
                  value={patientData.fecha_programada || ""}
                  className="bg-gray-200 p-3 rounded-lg cursor-default w-full"
                  readOnly
                />
              </div>

              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Hora asignada:
                </label>
                <input
                  type="text"
                  name="hora_asignada"
                  value={patientData.hora_asignada || ""}
                  className="bg-gray-200 p-3 rounded-lg cursor-default w-full"
                  readOnly
                />
              </div>

              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  T. est. de cirugía:
                </label>
                <input
                  type="text"
                  name="tiempo_estimado"
                  value={patientData.tiempo_estimado + " Minutos" || ""}
                  onChange={handleChange}
                  className="bg-gray-200 p-3 rounded-lg cursor-default w-full"
                />
              </div>

              <div className="w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Turno asignado:
                </label>
                <input
                  name="turno"
                  value={patientData.turno || ""}
                  onChange={handleChange}
                  className="bg-gray-200 p-3 rounded-lg cursor-default w-full"
                ></input>
              </div>
            </div>
          </div>


          <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
            <div className="flex  mb-4">
              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Quirófano asignado:
                </label>
                <input
                  type="text"
                  name="sala_quirofano"
                  value={patientData.sala_quirofano || ""}
                  onChange={handleChange}
                  className="bg-gray-200 p-3 rounded-lg cursor-default w-full"
                />
              </div>

              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700mb-2">
                  Anest. asignado:
                </label>
                <input
                  type="text"
                  name="nombre_anestesiologo"
                  value={patientData.nombre_anestesiologo || ""}
                  onChange={handleChange}
                  className="bg-gray-200 p-3 rounded-lg cursor-default w-full"
                />
              </div>

              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Cirujano encargado:
                </label>
                <p className="bg-gray-200 p-3 rounded-lg">
                  {patientData?.nombre_cirujano || "N/A"}
                </p>
              </div>

              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Requiere insumos:
                </label>
                <p className="bg-gray-200 p-3 rounded-lg">
                  {patientData?.req_insumo}
                </p>
              </div>

            </div>
          </div>


          <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
            <div className="flex mb-4">
              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">
                  Motivo de suspensión
                </label>
                <p className="bg-gray-200 p-3 rounded-lg">
                  {patientData?.motivo_suspension || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default SuspendidaEnf;
