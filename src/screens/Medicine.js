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
      await axios.post(`${baseURL}/api/insumos/paquetes`, newPaquete, axiosConfig);
      fetchPaquetes(); // Refrescar la lista de paquetes
      setNewPaquete({ clave: "", nombre: "", descripcion: "" });
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
          <div className="bg-white rounded-lg shadow-md p-6">
  <h2 className="text-xl font-semibold mb-4">Lista de Insumos y Paquetes Disponibles</h2>
  <div className="overflow-x-auto">
    <table className="w-full table-auto">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-2 text-left">Clave</th>
          <th className="px-4 py-2 text-left">Nombre</th>
          <th className="px-4 py-2 text-left">Descripción</th>
          <th className="px-4 py-2 text-left">Tipo</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {/* Combina insumos y paquetes */}
        {[...insumos, ...paquetes].map((item) => (
          <tr key={item.id_insumo || item.id_paquete} className="hover:bg-gray-50">
            <td className="px-4 py-2">{item.clave}</td>
            <td className="px-4 py-2">{item.nombre}</td>
            <td className="px-4 py-2">{item.descripcion}</td>
            <td className="px-4 py-2">{item.tipo || "Paquete"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

    
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
