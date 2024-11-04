// src/pages/Insumos.js

import React, { useState, useEffect, useContext } from "react";
import Layout from "../Layout";
import AddAppointmentModalInsumos from "../components/Modals/AddApointmentModalInsumos";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import { FaTable, FaThLarge } from "react-icons/fa";

const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";


const especialidadToClave = {
  Algología: "ALG",
  Angiología: "ANG",
  "C.Plástica y Reconstructiva": "CPR",
  Cardiología: "CAR",
  "Cirugía de Torax": "CTO",
  "Cirugía Bariatrica": "CBR",
  "Cirugía Cardiaca": "CCA",
  "Cirugía General": "CIG",
  "Cirugía Hepatobiliar": "CHE",
  Coloproctología: "CLP",
  Columna: "COL",
  Endoscopia: "END",
  Gastroenterología: "GAS",
  Hemodinamía: "HEM",
  Imagenología: "IMG",
  Maxilofacial: "MAX",
  Neurocirugía: "NEU",
  Oftalmología: "OFT",
  Oncología: "ONC",
  Orbitología: "OBT",
  Otorrino: "ONG",
  Proctología: "PRC",
  Procuración: "PCU",
  "T. de córnea": "TCO",
  "T. Hepático": "THE",
  "T. Renal": "TRN",
  Trasplantes: "TRA",
  "Trauma y Ortopedia": "TYO",
  Urología: "URO",
};


const Insumos = () => {
  const { authToken } = useContext(AuthContext);
  const [paquetes, setPaquetes] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [selectedPaquete, setSelectedPaquete] = useState(null);
  const [newPaquete, setNewPaquete] = useState({
    clave: '',
    nombre: '',
    descripcion: '',
    id_insumo: '',
    nombre_insumo: ''
  });
  const [insumosToAdd, setInsumosToAdd] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEspecialidad, setSelectedEspecialidad] = useState("");
  const [newInsumo, setNewInsumo] = useState({
    clave: "",
    nombre: "",
    descripcion: "",
    especialidad: "",
    modulo: "",
    paquete: "",
  });
  const [selectedInsumos, setSelectedInsumos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedPackages, setSelectedPackages] = useState([]);
const [packages, setPackages] = useState([]);
const [selectedInsumo, setSelectedInsumo] = useState(null);

  // Configuración de encabezados con token
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  };

  // Obtener todos los paquetes e insumos al cargar la página
  useEffect(() => {
    fetchPaquetes();
    fetchInsumos();
  }, []);

  // Función para obtener todos los paquetes
  const fetchPaquetes = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/insumos/paquetes`, axiosConfig);
      setPaquetes(response.data);
    } catch (error) {
      console.error("Error al obtener paquetes:", error);
    }
  };

  useEffect(() => {
    fetchInsumosYPaquetes();
  }, []);

  // Función para obtener todos los insumos y paquetes
  const fetchInsumosYPaquetes = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/insumos/insumos-disponibles`, axiosConfig);
      setInsumos(response.data.insumos); // Ajuste para obtener insumos y paquetes juntos
    } catch (error) {
      console.error("Error al obtener insumos y paquetes:", error);
    }
  };

  // Función para obtener todos los insumos
  const fetchInsumos = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/insumos/insumos-disponibles`, axiosConfig);
      setInsumos(response.data.insumos);
    } catch (error) {
      console.error("Error al obtener insumos:", error);
    }
  };

  // Handle form input changes
  const handleNewPaqueteChange = (e) => {
    const { name, value } = e.target;
    setNewPaquete((prevPaquete) => ({
      ...prevPaquete,
      [name]: value
    }));
  };

  const handleDeleteInsumo = async (idInsumo) => {
    try {
      await fetch(`/api/insumos/${idInsumo}`, {
        method: 'DELETE',
      });
      // Aquí actualizas la lista de insumos después de la eliminación
      setInsumos(insumos.filter(insumo => insumo.id_insumo !== idInsumo));
    } catch (error) {
      console.error('Error eliminando insumo:', error);
    }
  };
  
  const handleInsumoSelected = async (idInsumo) => {
    try {
      setSelectedInsumo(idInsumo);
      setIsModalOpen(true);
  
      // Llama a fetchPaquetes para obtener los paquetes
      await fetchPaquetes();
    } catch (error) {
      console.error("Error en handleInsumoSelect:", error);
    }
  };



// Función para guardar paquetes seleccionados
const handleSavePackages = async () => {
  await fetch(`/api/insumos/${selectedInsumo}/paquetes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paquetes: selectedPackages }),
  });
  setIsModalOpen(false);
};

const handlePackageSelection = (packageId) => {
  setSelectedPackages((prevSelected) =>
    prevSelected.includes(packageId)
      ? prevSelected.filter((id) => id !== packageId)
      : [...prevSelected, packageId]
  );
};

  const handleInsumoSelect = (event) => {
    const selectedId = event.target.value;
    const selectedInsumo = insumos.find(insumo => insumo.id_insumo === parseInt(selectedId));
  
    if (selectedInsumo) {
      setNewPaquete({
        ...newPaquete,
        id_insumo: selectedId,
        nombre_insumo: selectedInsumo.nombre, // Guardar el nombre del insumo
      });
    } else {
      setNewPaquete({
        ...newPaquete,
        id_insumo: selectedId,
        nombre_insumo: '', // Reiniciar si no se encuentra el insumo
      });
    }
  };
  // Crear un nuevo paquete
  const createPaquete = async () => {
    try {
      const paqueteData = {
        ...newPaquete,
        insumos: selectedInsumos.map(id => ({ id_insumo: id }))
      };
      await axios.post(`${baseURL}/api/insumos/paquetes`, paqueteData, axiosConfig);
      fetchPaquetes();
      setNewPaquete({ clave: "", nombre: "", descripcion: "" });
      setSelectedInsumos([]);
    } catch (error) {
      console.error("Error al crear paquete:", error);
    }
  };
  // Mostrar detalles de un paquete
  const viewPaqueteDetails = async (idPaquete) => {
    try {
      const response = await axios.get(`${baseURL}/api/insumos/paquetes/${idPaquete}`, axiosConfig);
      setSelectedPaquete(response.data);
    } catch (error) {
      console.error("Error al obtener detalles del paquete:", error);
    }
  };

  // Agregar insumos seleccionados a un paquete
  const addInsumosToPaquete = async () => {
    try {
      const data = { insumos: insumosToAdd.map(insumo => ({ id_insumo: insumo.id_insumo, cantidad: insumo.cantidad || 1 })) };
      await axios.post(`${baseURL}/api/insumos/paquetes/${selectedPaquete.id_paquete}/insumos`, data, axiosConfig);
      viewPaqueteDetails(selectedPaquete.id_paquete);
      setInsumosToAdd([]);
      setShowModal(false);
    } catch (error) {
      console.error("Error al agregar insumos al paquete:", error);
    }
  };

    // Manejar cambio en los campos del nuevo insumo
    const handleNewInsumoChange = (e) => {
      const { name, value } = e.target;
      setNewInsumo((prev) => ({ ...prev, [name]: value }));
    };
  
    // Manejar cambio en la especialidad y asignar la clave correspondiente
    const handleEspecialidadChange = (e) => {
      const especialidad = e.target.value;
      setSelectedEspecialidad(especialidad);
      setNewInsumo((prev) => ({
        ...prev,
        especialidad,
        clave: especialidadToClave[especialidad] || ""
      }));
    };
  
    // Agregar nuevo insumo
    const addInsumo = async () => {
      try {
        await axios.post(`${baseURL}/api/insumos/insumos`, newInsumo, axiosConfig);
        fetchInsumos(); // Refrescar lista de insumos
        setNewInsumo({
          clave: "",
          nombre: "",
          descripcion: "",
          especialidad: "",
          modulo: "",
          paquete: ""
        });
      } catch (error) {
        console.error("Error al agregar el insumo:", error);
      }
    };

    return (
      <Layout>
        <div className="flex flex-col gap-8 mb-8">
          {/* Título */}
          <h1 className="text-3xl font-bold mb-8 text-center">Gestión de Insumos y Paquetes</h1>
    
          {/* Formulario de Insumos */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">Agregar Insumo Individual</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Especialidad:</label>
                  <select
                    name="especialidad"
                    value={selectedEspecialidad}
                    onChange={handleEspecialidadChange}
                    required
                    className="w-full rounded-md border border-gray-300 p-2"
                  >
                    <option value="">Selecciona una especialidad</option>
                    {Object.keys(especialidadToClave).map((especialidad) => (
                      <option key={especialidad} value={especialidad}>
                        {especialidad}
                      </option>
                    ))}
                  </select>
                </div>
    
                <div>
                  <label className="block text-sm font-medium mb-1">Clave:</label>
                  <input
                    type="text"
                    name="clave"
                    value={newInsumo.clave}
                    readOnly
                    className="w-full rounded-md border border-gray-300 p-2 bg-gray-50"
                  />
                </div>
    
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre del Insumo:</label>
                  <input
                    type="text"
                    name="nombre"
                    value={newInsumo.nombre}
                    onChange={handleNewInsumoChange}
                    required
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                </div>
    
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción:</label>
                  <textarea
                    name="descripcion"
                    value={newInsumo.descripcion}
                    onChange={handleNewInsumoChange}
                    required
                    className="w-full rounded-md border border-gray-300 p-2"
                    rows="2"
                  />
                </div>
    
                <div>
                  <label className="block text-sm font-medium mb-1">Módulo (opcional):</label>
                  <input
                    type="text"
                    name="modulo"
                    value={newInsumo.modulo}
                    onChange={handleNewInsumoChange}
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                </div>
    
                <div>
                  <label className="block text-sm font-medium mb-1">Paquete (opcional):</label>
                  <input
                    type="text"
                    name="paquete"
                    value={newInsumo.paquete}
                    onChange={handleNewInsumoChange}
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                </div>
              </div>
    
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={addInsumo}
                  className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Agregar Insumo
                </button>
              </div>
            </form>
          </div>
    
          {/* Formulario de Paquetes */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">Crear Paquete</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Clave:</label>
                  <input
                    type="text"
                    name="clave"
                    value={newPaquete.clave}
                    onChange={handleNewPaqueteChange}
                    required
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                </div>
    
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre del Paquete:</label>
                  <input
                    type="text"
                    name="nombre"
                    value={newPaquete.nombre}
                    onChange={handleNewPaqueteChange}
                    required
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                </div>
    
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción:</label>
                  <input
                    type="text"
                    name="descripcion"
                    value={newPaquete.descripcion}
                    onChange={handleNewPaqueteChange}
                    required
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                </div>
    
                <div>
                  <label className="block text-sm font-medium mb-1">Insumo:</label>
                  <select
                    name="id_insumo"
                    value={newPaquete.id_insumo}
                    onChange={handleInsumoSelect}
                    required
                    className="w-full rounded-md border border-gray-300 p-2"
                  >
                    <option value="">Seleccione un insumo</option>
                    {insumos.map((insumo) => (
                      <option key={insumo.id_insumo} value={insumo.id_insumo}>
                        {insumo.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
    
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={createPaquete}
                  className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Crear Paquete
                </button>
              </div>
            </form>
          </div>
    
 {/* Tabla de Insumos */}
       <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Lista de Insumos</h2>
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border">Clave</th>
                <th className="py-2 px-4 border">Nombre</th>
                <th className="py-2 px-4 border">Especialidad</th>
                <th className="py-2 px-4 border">Acción</th>
              </tr>
            </thead>
            <tbody>
              {insumos.map(insumo => (
                <tr key={insumo.id_insumo}>
                  <td className="py-2 px-4 border">{insumo.clave}</td>
                  <td className="py-2 px-4 border">{insumo.nombre}</td>
                  <td className="py-2 px-4 border">{insumo.especialidad}</td>
                  <td className="py-2 px-4 border flex gap-2">
                    <button
                      onClick={() => handleInsumoSelected(insumo.id_insumo)}
                      className="text-blue-600 hover:underline"
                    >
                      Seleccionar para Paquete
                    </button>
                    <button
                      onClick={() => handleDeleteInsumo(insumo.id_insumo)}
                      className="text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tabla de Paquetes */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Lista de Paquetes</h2>
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border">Clave</th>
                <th className="py-2 px-4 border">Nombre</th>
                <th className="py-2 px-4 border">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {paquetes.map(paquete => (
                <tr key={paquete.id_paquete}>
                  <td className="py-2 px-4 border">{paquete.clave}</td>
                  <td className="py-2 px-4 border">{paquete.nombre}</td>
                  <td className="py-2 px-4 border">{paquete.descripcion}</td>
                  <td className="py-2 px-4 border">{paquete.nombre_insumo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


      {/* Modal */}
      {isModalOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-semibold mb-4">Seleccione los Paquetes</h3>
              
              {packages.length === 0 ? (
                <p className="text-gray-500">No hay paquetes disponibles</p>
              ) : (
                <ul className="space-y-2 mb-4">
                  {packages.map(pkg => (
                    <li key={pkg.id_paquete} className="flex items-center">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-blue-600"
                          checked={selectedPackages.includes(pkg.id_paquete)}
                          onChange={() => handlePackageSelection(pkg.id_paquete)}
                        />
                        <span>{pkg.nombre}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
              
              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSavePackages}
                  className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                  disabled={selectedPackages.length === 0}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </>
      )}

    
          {/* Modal para detalles del paquete */}
          {selectedPaquete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl w-full mx-4">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FaThLarge className="text-blue-600" /> Detalles del Paquete
                </h2>
                <div className="space-y-2 mb-4">
                  <p><strong>Clave:</strong> {selectedPaquete.clave}</p>
                  <p><strong>Nombre:</strong> {selectedPaquete.nombre}</p>
                  <p><strong>Descripción:</strong> {selectedPaquete.descripcion}</p>
                </div>
                <h3 className="font-semibold mb-2">Insumos en el Paquete</h3>
                <ul className="list-disc pl-5 mb-4">
                  {selectedPaquete.insumos.map(insumo => (
                    <li key={insumo.id_insumo}>{insumo.nombre}</li>
                  ))}
                </ul>
                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedPaquete(null)}
                    className="bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    );
    
};

export default Insumos;
