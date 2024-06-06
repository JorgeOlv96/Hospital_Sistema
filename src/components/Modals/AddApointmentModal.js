import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import {
  Button,
  Checkbox,
  DatePickerComp,
  Input,
  Select,
  Textarea,
  TimePickerComp,
} from '../Form';
import { BiChevronDown } from 'react-icons/bi';
import { memberData, servicesData, sortsDatas } from '../Datas';
import { HiOutlineCheckCircle } from 'react-icons/hi';
import PatientMedicineServiceModal from './PatientMedicineServiceModal';

const doctorsData = memberData.map((item) => ({
  id: item.id,
  name: item.title,
}));

function AddAppointmentModal({ closeModal, isOpen, datas }) {
  const [services, setServices] = useState(servicesData[0]);
  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [status, setStatus] = useState(sortsDatas.status[0]);
  const [doctors, setDoctors] = useState(doctorsData[0]);
  const [shares, setShares] = useState({
    email: false,
    sms: false,
    whatsapp: false,
  });
  const [open, setOpen] = useState(false);

  const onChangeShare = (e) => {
    setShares({ ...shares, [e.target.name]: e.target.checked });
  };

  useEffect(() => {
    if (datas?.title) {
      setServices(datas?.service);
      setStartTime(datas?.start);
      setEndTime(datas?.end);
      setShares(datas?.shareData);
    }
  }, [datas]);

  return (
    <Modal
      closeModal={closeModal}
      isOpen={isOpen}
      title={datas?.title ? 'Editar Solicitud' : 'Nueva Solicitud'}
      width={'max-w-3xl'}
    >
      {open && (
        <PatientMedicineServiceModal
          closeModal={() => setOpen(!isOpen)}
          isOpen={open}
          patient={true}
        />
      )}
      <d  iv className="flex-col gap-6">
        {/* Información del Paciente */}
        <div className="grid gap-6">
          <h2 className="text-lg font-semibold">Información del Paciente</h2>
          <div className="grid sm:grid-cols-2 gap-4 w-full">
            <div>
              <Input
                label="Curp del paciente"
                placeholder="CURP"
                className="bg-gray-200 border border-gray-400 rounded-lg p-2 text-gray-800 placeholder-gray-600 focus:bg-gray-100"
                style={{ borderRadius: '14px' }}
              />
            </div>
          </div>
        </div>

        {/* Nombre Completo */}
        <div className="grid gap-6">
        <h2 className="text-lg font-semibold">Nombre</h2>
          <div className="grid sm:grid-cols-3 gap-4 w-full">
            <div>
              <Input
                label="Apellido paterno"
                placeholder="Apellido paterno"
                className="bg-gray-200 border border-gray-400 rounded-lg p-2 text-gray-800 placeholder-gray-600 focus:bg-gray-100"
                style={{ borderRadius: '14px' }}
              />
            </div>
            <div>
              <Input
                label="Apellido materno"
                placeholder="Apellido materno"
                className="bg-gray-200 border border-gray-400 rounded-lg p-2 text-gray-800 placeholder-gray-600 focus:bg-gray-100"
                style={{ borderRadius: '14px' }}
              />
            </div>
            <div>
              <Input
                label="Nombres"
                className="bg-gray-200 border border-gray-400 rounded-lg p-2 text-gray-800 placeholder-gray-600 focus:bg-gray-100"
                style={{ borderRadius: '14px' }}
              />
            </div>
          </div>
        </div>

        {/* Otros Campos */}
        <div className="grid sm:grid-cols-2 gap-4 w-full">
          <DatePickerComp
            label="Fecha de nacimiento"
            startDate={startDate}
            onChange={(date) => setStartDate(date)}
          />
          <Select
            selectedPerson={status}
            setSelectedPerson={setStatus}
            datas={[
              { name: 'Femenino', id: 1 },
              { name: 'Masculino', id: 2 },
            ]}
          >
            <div className="w-full flex items-center justify-between text-textGray text-sm p-4 border border-border font-light rounded-lg focus:border focus:border-subMain">
              {status.name} <BiChevronDown className="text-xl" />
            </div>
          </Select>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 w-full">
          <Select
            selectedPerson={services}
            setSelectedPerson={setServices}
            datas={servicesData}
          >
            <div className="w-full flex items-center justify-between text-textGray text-sm p-4 border border-border font-light rounded-lg focus:border focus:border-subMain">
              {services.name} <BiChevronDown className="text-xl" />
            </div>
          </Select>
          <Select
            selectedPerson={status}
            setSelectedPerson={setStatus}
            datas={sortsDatas.status}
          >
            <div className="w-full flex items-center justify-between text-textGray text-sm p-4 border border-border font-light rounded-lg focus:border focus:border-subMain">
              {status.name} <BiChevronDown className="text-xl" />
            </div>
          </Select>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 w-full">
          <DatePickerComp
            label="Fecha solicitada"
            startDate={startDate}
            onChange={(date) => setStartDate(date)}
          />
          <TimePickerComp
            label="Hora iniciada"
            startDate={startTime}
            onChange={(date) => setStartTime(date)}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 w-full">
          <TimePickerComp
            label="Tiempo estimado de cirugía"
            startDate={endTime}
            onChange={(date) => setEndTime(date)}
          />
          <TimePickerComp
            label="Turno solicitado"
            startDate={endTime}
            onChange={(date) => setEndTime(date)}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 w-full">
          <Select
            selectedPerson={services}
            setSelectedPerson={setServices}
            datas={servicesData}
          >
            <div className="w-full flex items-center justify-between text-textGray text-sm p-4 border border-border font-light rounded-lg focus:border focus:border-subMain">
              Sala solicitada <BiChevronDown className="text-xl" />
            </div>
          </Select>
          <Select
            selectedPerson={services}
            setSelectedPerson={setServices}
            datas={servicesData}
          >
            <div className="w-full flex items-center justify-between text-textGray text-sm p-4 border border-border font-light rounded-lg focus:border focus:border-subMain">
              Procedimientos para el paciente <BiChevronDown className="text-xl" />
            </div>
          </Select>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 w-full">
          <Select
            selectedPerson={doctors}
            setSelectedPerson={setDoctors}
            datas={doctorsData}
          >
            <div className="w-full flex items-center justify-between text-textGray text-sm p-4 border border-border font-light rounded-lg focus:border focus:border-subMain">
              Cirujano encargado <BiChevronDown className="text-xl" />
            </div>
          </Select>
          <Select
            selectedPerson={status}
            setSelectedPerson={setStatus}
            datas={[
              { name: 'Sí', id: 1 },
              { name: 'No', id: 2 },
            ]}
          >
            <div className="w-full flex items-center justify-between text-textGray text-sm p-4 border border-border font-light rounded-lg focus:border focus:border-subMain">
              ¿Requiere insumos? <BiChevronDown className="text-xl" />
            </div>
          </Select>
        </div>

        <Select
          selectedPerson={status}
          setSelectedPerson={setStatus}
          datas={[
            { name: 'Insumo 1', id: 1 },
            { name: 'Insumo 2', id: 2 },
          ]}
        >
          <div className="w-full flex items-center justify-between text-textGray text-sm p-4 border border-border font-light rounded-lg focus:border focus:border-subMain">
            Especifique los insumos <BiChevronDown className="text-xl" />
          </div>
        </Select>

        <Textarea
          label="Descripción"
          placeholder={
            datas?.message
              ? datas.message
              : 'Describa los detalles adicionales...'
          }
          color={true}
          rows={5}
          className="bg-gray-200 border border-gray-400 rounded-lg p-2 text-gray-800 placeholder-gray-600 focus:bg-gray-100"
        />

        <div className="flex justify-center w-full">
          <Button
            label="Guardar"
            Icon={HiOutlineCheckCircle}
            onClick={() => {
              // Acción de guardar
            }}
          />
        </div>
      </d>
    </Modal>
  );
}

export default AddAppointmentModal;
