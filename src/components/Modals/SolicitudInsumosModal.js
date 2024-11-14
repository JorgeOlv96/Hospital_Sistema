import React, { useState, useEffect, useRef } from "react";
import Modal from "./Modal";
import axios from "axios";
import PatientMedicineServiceModal from "./PatientMedicineServiceModal";

function SolicitudInsumosModal({
  closeModal,
  isOpen,
  appointmentId,
  onDeleteAppointment,
}) {
  const [open, setOpen] = useState(false);
  const [patientData, setPatientData] = useState({});
  const [loading, setLoading] = useState(true);
  const modalRef = useRef(null);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";

  const [reload] = useState(1);

  useEffect(() => {
    if (isOpen && appointmentId) {
      const fetchAppointmentData = async () => {
        try {
          const response = await fetch(
            `${baseURL}/api/insumos/${appointmentId}`
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
  }, [isOpen, appointmentId, reload]);

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

  return (
    <Modal
      ref={modalRef}
      closeModal={closeModal}
      isOpen={isOpen}
      title={"Información completa"}
      width={"max-w-3xl"}
    >
      {open && (
        <PatientMedicineServiceModal
          closeModal={() => setOpen(!open)}
          isOpen={open}
          patient={true}
          patientData={patientData}
        />
      )}

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
          <div className="flex justify-between">
            <button
              onClick={closeModal}
              className="bg-blue-500 bg-opacity-20 text-blue-500 text-sm p-4 rounded-lg font-light"
              style={{ marginBottom: "8px" }}
            >
              Cerrar
            </button>

            {patientData?.estado_solicitud === "Pendiente" && (
              <button
                onClick={handleDelete}
                className="bg-red-500 bg-opacity-20 text-red-500 text-sm p-4 rounded-lg font-light"
              >
                Eliminar solicitud
              </button>
            )}
          </div>

          <div className="mr-4 w-full mb-2">
            <label className="block font-semibold text-gray-700 mb-2">
              Folio:
            </label>
            <p className="bg-gray-200 p-3 rounded-lg">
              {patientData?.folio || "N/A"}
            </p>
          </div>
          <div className="mr-4 w-full mb-2">
            <label className="block font-semibold text-gray-700 mb-2">
              Insumos:
            </label>
            <p className="bg-gray-200 p-3 rounded-lg">
              {patientData?.nombre_insumos || "N/A"}
            </p>
          </div>
          <div className="mr-4 w-full mb-2">
            <label className="block font-semibold text-gray-700 mb-2">
              Paquetes:
            </label>
            <p className="bg-gray-200 p-3 rounded-lg">
              {patientData?.nombre_paquetes || "N/A"}
            </p>
          </div>
          <div className="mr-4 w-full mb-2">
            <label className="block font-semibold text-gray-700 mb-2">
              Estado:
            </label>
            <p className="bg-gray-200 p-3 rounded-lg">
              {patientData?.estado || "N/A"}
            </p>
          </div>

    
        </div>
      )}
    </Modal>
  );
}

export default SolicitudInsumosModal;
