import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import axios from 'axios';
import PatientMedicineServiceModal from './PatientMedicineServiceModal';

function AddAppointmentModal({ closeModal, isOpen, appointmentId, onDeleteAppointment }) {
  const [open, setOpen] = useState(false);
  const [patientData, setPatientData] = useState({});
  const [loading, setLoading] = useState(true);
  const modalRef = useRef(null);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || 'http://localhost:4000';

  const [reload, setReload] = useState(1);

  useEffect(() => {
    if (isOpen && appointmentId) {
      const fetchAppointmentData = async () => {
        try {
          const response = await fetch(`${baseURL}/api/solicitudes/${appointmentId}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          setPatientData(data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching appointment data:', error);
          setLoading(false);
        }
      };

      fetchAppointmentData();
    }
  }, [isOpen, appointmentId, reload]);

  const handleDelete = async () => {
    const confirmation = window.confirm('¿Estás seguro de que deseas eliminar esta solicitud?');
    if (confirmation) {
      try {
        await axios.delete(`${baseURL}/api/solicitudes/${appointmentId}`);
        onDeleteAppointment(appointmentId); // Notificar al componente padre que la solicitud ha sido eliminada
        closeModal(); // Cerrar el modal
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  return (
    <Modal
      ref={modalRef}
      closeModal={closeModal}
      isOpen={isOpen}
      title={'Información completa'}
      width={'max-w-3xl'}
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
          <img src="images/cargando.gif" alt="Cargando..." className="h-8 w-8 mx-auto" />
        </div>
      ) : (
        <div className="p-4">
          <div className="mr-4 w-full">
            <label className="block font-semibold text-gray-700 mb-2">Folio:</label>
            <p className="bg-gray-200 p-3 rounded-lg">{patientData?.folio || 'N/A'}</p>
          </div>

          <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md">
            <div className="flex mt-4">
              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">Apellido paterno:</label>
                <p className="bg-gray-200 p-3 rounded-lg">{patientData?.ap_paterno || 'N/A'}</p>
              </div>

              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">Apellido materno:</label>
                <p className="bg-gray-200 p-3 rounded-lg">{patientData?.ap_materno || 'N/A'}</p>
              </div>

              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">Nombre:</label>
                <p className="bg-gray-200 p-3 rounded-lg">{patientData?.nombre_paciente || 'N/A'}</p>
              </div>

              <div className="w-full">
                <label className="block font-semibold text-gray-700 mb-2">Sexo:</label>
                <p className="bg-gray-200 p-3 rounded-lg">{patientData?.sexo || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
            <div className="flex mb-4">
              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">Tipo de admisión:</label>
                <p className="bg-gray-200 p-3 rounded-lg">{patientData?.tipo_admision || 'N/A'}</p>
              </div>

              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">Tipo de intervención:</label>
                <p className="bg-gray-200 p-3 rounded-lg">{patientData?.tipo_intervencion || 'N/A'}</p>
              </div>

              <div className="w-full">
                <label className="block font-semibold text-gray-700 mb-2">Especialidad:</label>
                <p className="bg-gray-200 p-3 rounded-lg">{patientData?.nombre_especialidad || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
            <div className="flex mb-4">
              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">Fecha solicitada:</label>
                <p className="bg-gray-200 p-3 rounded-lg">{patientData?.fecha_solicitada || 'N/A'}</p>
              </div>

              <div className="w-full">
                <label className="block font-semibold text-gray-700 mb-2">Hora solicitada:</label>
                <p className="bg-gray-200 p-3 rounded-lg">{patientData?.hora_solicitada || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
            <div className="flex mb-4">
              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">Tiempo estimado de cirugía:</label>
                <p className="bg-gray-200 p-3 rounded-lg">{patientData?.tiempo_estimado || 'N/A'}</p>
              </div>

              <div className="w-full">
                <label className="block font-semibold text-gray-700 mb-2">Turno solicitado:</label>
                <p className="bg-gray-200 p-3 rounded-lg">{patientData?.turno_solicitado || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
            <div className="flex mb-4">
              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">Sala solicitada:</label>
                <p className="bg-gray-200 p-3 rounded-lg">{patientData?.sala_quirofano || 'N/A'}</p>
              </div>

              <div className="w-full">
                <label className="block font-semibold text-gray-700 mb-2">Procedimientos que se realizarán al paciente:</label>
                <p className="bg-gray-200 p-3 rounded-lg">{patientData?.procedimientos_paciente || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
            <div className="flex mb-4">
              <div className="mr-4 w-full">
                <label className="block font-semibold text-gray-700 mb-2">Cirujano encargado:</label>
                <p className="bg-gray-200 p-3 rounded-lg">{patientData?.nombre_cirujano || 'N/A'}</p>
              </div>

              <div className="w-full">
                <label className="block font-semibold text-gray-700 mb-2">Requiere insumos:</label>
                <p className="bg-gray-200 p-3 rounded-lg">{patientData?.req_insumo}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-4">
        <button
          onClick={closeModal}
          className="bg-[#001B58] bg-opacity-20 text-[#001B58] py-2 px-4 rounded-lg font-semibold"
        >
          Cerrar
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white py-2 px-4 rounded-lg font-semibold"
        >
          Eliminar solicitud
        </button>
      </div>
    </Modal>
  );
}

export default AddAppointmentModal;
