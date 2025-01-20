import React from 'react';
import Modal from './Modal'; // Asegúrate de que el componente Modal esté en la misma carpeta o ajusta la ruta según corresponda

const UserFormModal = ({ isOpen, closeModal, nombre, setNombre, apPaterno, setApPaterno, apMaterno, setApMaterno, email, setEmail, password, setPassword, cedula, setCedula, nivelUsuario, setNivelUsuario, errors, handleRegister }) => {
  return (
    <Modal
      closeModal={closeModal}
      isOpen={isOpen}
      title={"Registro de Usuario"}
      width={"max-w-3xl"}
    >
      <div className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex mb-2 space-x-4">
            <div className="w-1/4">
              <label htmlFor="nombre" className="block text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={`w-full p-3 border ${errors.nombre ? "border-red-500" : "border-gray-300"} rounded-lg`}
              />
              {errors.nombre && <span className="text-red-500">{errors.nombre}</span>}
            </div>

            <div className="w-1/4">
              <label>Apellido Paterno</label>
              <input
                type="text"
                value={apPaterno}
                onChange={(e) => setApPaterno(e.target.value)}
                className={`w-full p-3 border ${errors.apPaterno ? "border-red-500" : "border-gray-300"} rounded-lg`}
              />
              {errors.apPaterno && <span className="text-red-500">{errors.apPaterno}</span>}
            </div>

            <div className="w-1/4">
              <label>Apellido Materno</label>
              <input
                type="text"
                value={apMaterno}
                onChange={(e) => setApMaterno(e.target.value)}
                className={`w-full p-3 border ${errors.apMaterno ? "border-red-500" : "border-gray-300"} rounded-lg`}
              />
              {errors.apMaterno && <span className="text-red-500">{errors.apMaterno}</span>}
            </div>

            <div className="w-1/4">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full p-3 border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-lg`}
              />
              {errors.email && <span className="text-red-500">{errors.email}</span>}
            </div>
          </div>

          <div className="flex mb-2 space-x-4">
            <div className="w-1/4">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full p-3 border ${errors.password ? "border-red-500" : "border-gray-300"} rounded-lg`}
              />
              {errors.password && <span className="text-red-500">{errors.password}</span>}
            </div>

            <div className="w-1/4">
              <label>Cédula</label>
              <input
                type="text"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                className={`w-full p-3 border ${errors.cedula ? "border-red-500" : "border-gray-300"} rounded-lg`}
              />
              {errors.cedula && <span className="text-red-500">{errors.cedula}</span>}
            </div>

            <div className="w-1/4">
              <label>Rol de usuario</label>
              <select
                value={nivelUsuario}
                onChange={(e) => setNivelUsuario(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar</option>
                <option value="1">(1) Programación Qx</option>
                <option value="2">(2) Enfermería</option>
                <option value="3">(3) Anestesiología</option>
                <option value="4">(4) Médico</option>
                <option value="5">(5) Gestor de insumos</option>
                <option value="6">(6) Admin</option>
                <option value="7">(7) Admin Enfermería</option>
                <option value="8">(8) Compras</option>
              </select>
            </div>
          </div>

          <div className="text-right">
            <button
              onClick={handleRegister}
              className="bg-[#365b77] text-white px-5 py-2 rounded-md hover:bg-[#7498b6]"
            >
              Registrar
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UserFormModal;
