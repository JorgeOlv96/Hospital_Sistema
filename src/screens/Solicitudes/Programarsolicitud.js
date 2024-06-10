import React, { useState, useEffect } from 'react';
import Layout from '../../Layout';
import { Link, useNavigate } from 'react-router-dom';

function Programarsolicitud() {
    
  const [solicitudes, setSolicitudes] = useState([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null); // Estado para almacenar la solicitud seleccionada
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/solicitudes');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setSolicitudes(data);
      } catch (error) {
        console.error('Error fetching solicitudes:', error);
      }
    };

    fetchSolicitudes();
  }, []);

  const especialidadToClave = {
    'Algología': 'ALG',
    'Angiología': 'ANG',
    'C.Plástica y Reconstructiva': 'CPR',
    'Cardiología': 'CAR',
    'Cirugía de Torax': 'CTO',
    'Cirugía Bariatrica': 'CBR',
    'Cirugía Cardiaca': 'CCA',
    'Cirugía General': 'CIG',
    'Cirugía Hepatobiliar': 'CHE',
    'Coloproctología': 'CLP',
    'Columna': 'COL',
    'Endoscopia': 'END',
    'Gastroenterología': 'GAS',
    'Hemodinamía': 'HEM',
    'Imagenología': 'IMG',
    'Maxilofacial': 'MAX',
    'Neurocirugía': 'NEU',
    'Oftalmología': 'OFT',
    'Oncología': 'ONC',
    'Orbitología': 'OBT',
    'Otorrino': 'ONG',
    'Proctología': 'PRC',
    'Procuración': 'PCU',
    'T. de córnea': 'TCO',
    'T. Hepático': 'THE',
    'T. Renal': 'TRN',
    'Transplantes': 'TRA',
    'Trauma y Ortopedia': 'TYO',
    'Urología': 'URO'
  };

  const claveToEspecialidad = Object.fromEntries(
    Object.entries(especialidadToClave).map(([key, value]) => [value, key])
  );

  const [nombreEspecialidad, setNombreEspecialidad] = useState('');
  const [claveEspecialidad, setClaveEspecialidad] = useState('');
  const [formData, setFormData] = useState({
    fecha_solicitud: '',
    clave_esp: '',
    nombre_especialidad: '',
    curp: '',
    ap_paterno: '',
    ap_materno: '',
    nombre_paciente: '',
    fecha_nacimiento: '',
    edad: '',
    sexo: '',
    no_expediente: '',
    tipo_intervencion: '',
    fecha_solicitada: '',
    hora_solicitada: '',
    tiempo_estimado: '',
    turno_solicitado: '',
    sala_quirofano: '',
    id_cirujano: '',
    req_insumo: '',
    insumos: '',
    tipo_admision: '',
    estado_solicitud: '',
    procedimientos_paciente: ''
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleNombreEspecialidadChange = (e) => {
    const selectedNombreEspecialidad = e.target.value;
    setNombreEspecialidad(selectedNombreEspecialidad);
    const correspondingClave = especialidadToClave[selectedNombreEspecialidad] || 'Seleccionar clave de especialidad';
    setClaveEspecialidad(correspondingClave);
    setFormData({
      ...formData,
      nombreEspecialidad: selectedNombreEspecialidad,
      claveEspecialidad: correspondingClave
    });
  };

  const handleClaveEspecialidadChange = (e) => {
    const selectedClaveEspecialidad = e.target.value;
    setClaveEspecialidad(selectedClaveEspecialidad);
    const correspondingNombre = claveToEspecialidad[selectedClaveEspecialidad] || '';
    setNombreEspecialidad(correspondingNombre);
    setFormData({
      ...formData,
      nombreEspecialidad: correspondingNombre,
      claveEspecialidad: selectedClaveEspecialidad
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:4000/api/solicitudes', {
        method: selectedSolicitud ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Solicitud guardada:', data);
      navigate('/solicitudes');
    } catch (error) {
      console.error('Error saving solicitud:', error);
    }
  };

  return (
    <Layout>
        <h2 className="text-2xl font-semibold mb-4">Programar Solicitud</h2>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md">
          <div className="mb-4">
            <label htmlFor="curp" className="block font-semibold text-gray-700 mb-2">Curp del paciente:</label>
            <input 
              type="text" 
              id="curp" 
              name="curp" 
              value={formData.curp}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>

          <div className="flex mt-4">
            <div className="mr-4 w-full">
              <label htmlFor="apellidoPaterno" className="block font-semibold text-gray-700 mb-2">Apellido paterno:</label>
              <input 
                type="text" 
                id="apellidoPaterno" 
                name="apellidoPaterno" 
                value={formData.ap_paterno}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>

            <div className="mr-4 w-full">
              <label htmlFor="apellidoMaterno" className="block font-semibold text-gray-700 mb-2">Apellido materno:</label>
              <input 
                type="text" 
                id="apellidoMaterno" 
                name="apellidoMaterno" 
                value={formData.ap_materno}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            
            <div className="w-full">
              <label htmlFor="nombres" className="block font-semibold text-gray-700 mb-2">Nombres:</label>
              <input 
                type="text" 
                id="nombres" 
                name="nombres" 
                value={formData.nombre_paciente}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
          <div className="flex mb-4">
            <div className="mr-4 w-full">
              <label htmlFor="fechaNacimiento" className="block font-semibold text-gray-700 mb-2">Fecha de nacimiento:</label>
              <input 
                type="date" 
                id="fechaNacimiento" 
                name="fechaNacimiento" 
                value={formData.fecha_nacimiento}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            
            <div className="w-full">
              <label htmlFor="sexo" className="block font-semibold text-gray-700 mb-2">Sexo:</label>
              <select 
                id="sexo" 
                name="sexo" 
                value={formData.sexo}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              >
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
          <div className="flex mb-4">
            <div className="mr-4 w-full">
              <label htmlFor="tipoConsulta" className="block font-semibold text-gray-700 mb-2">Tipo de consulta:</label>
              <input 
                type="text" 
                id="tipoConsulta" 
                name="tipoConsulta" 
                value={formData.tipoConsulta}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            
            <div className="w-full">
              <label htmlFor="tipoIntervencion" className="block font-semibold text-gray-700 mb-2">Tipo de intervención:</label>
              <input 
                type="text" 
                id="tipoIntervencion" 
                name="tipoIntervencion" 
                value={formData.tipoIntervencion}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
          <div className="flex mb-4">
            <div className="mr-4 w-full">
              <label htmlFor="nombreEspecialidad" className="block font-semibold text-gray-700 mb-2">Especialidad:</label>
              <select 
                id="nombreEspecialidad" 
                name="nombreEspecialidad" 
                value={nombreEspecialidad}
                onChange={handleNombreEspecialidadChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar especialidad</option>
                {Object.keys(especialidadToClave).map((especialidad) => (
                  <option key={especialidad} value={especialidad}>
                    {especialidad}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-full">
              <label htmlFor="claveEspecialidad" className="block font-semibold text-gray-700 mb-2">Clave de especialidad:</label>
              <select 
                id="claveEspecialidad" 
                name="claveEspecialidad" 
                value={claveEspecialidad}
                onChange={handleClaveEspecialidadChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar clave de especialidad</option>
                {Object.values(especialidadToClave).map((clave) => (
                  <option key={clave} value={clave}>
                    {clave}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
          <div className="flex mb-4">
            <div className="mr-4 w-full">
              <label htmlFor="fechaSolicitada" className="block font-semibold text-gray-700 mb-2">Fecha solicitada:</label>
              <input 
                type="date" 
                id="fechaSolicitada" 
                name="fechaSolicitada" 
                value={formData.fecha_solicitada}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            
            <div className="w-full">
              <label htmlFor="horaSolicitada" className="block font-semibold text-gray-700 mb-2">Hora solicitada:</label>
              <input 
                type="time" 
                id="horaSolicitada" 
                name="horaSolicitada" 
                value={formData.hora_solicitada}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
          <div className="flex mb-4">
            <div className="mr-4 w-full">
              <label htmlFor="tiempoEstimadoCirugia" className="block font-semibold text-gray-700 mb-2">Tiempo estimado de cirugía:</label>
              <input 
                type="text" 
                id="tiempoEstimadoCirugia" 
                name="tiempoEstimadoCirugia" 
                value={formData.tiempo_estimado}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            
            <div className="w-full">
              <label htmlFor="turnoSolicitado" className="block font-semibold text-gray-700 mb-2">Turno solicitado:</label>
              <input 
                type="text" 
                id="turnoSolicitado" 
                name="turnoSolicitado" 
                value={formData.turnoSolicitado}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
          <div className="flex mb-4">
            <div className="mr-4 w-full">
              <label htmlFor="salaSolicitada" className="block font-semibold text-gray-700 mb-2">Sala solicitada:</label>
              <input 
                type="text" 
                id="salaSolicitada" 
                name="salaSolicitada" 
                value={formData.salaSolicitada}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            
            <div className="w-full">
              <label htmlFor="procedimientosPaciente" className="block font-semibold text-gray-700 mb-2">Procedimientos que se realizarán al paciente:</label>
              <textarea 
                id="procedimientosPaciente" 
                name="procedimientosPaciente" 
                value={formData.procedimientos_paciente}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              ></textarea>
            </div>
          </div>
        </div>

        <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
          <div className="flex mb-4">
            <div className="mr-4 w-full">
              <label htmlFor="cirujanoEncargado" className="block font-semibold text-gray-700 mb-2">Nombre del cirujano encargado:</label>
              <input 
                type="text" 
                id="cirujanoEncargado" 
                name="cirujanoEncargado" 
                value={formData.id_cirujano}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            
            <div className="w-full">
              <label htmlFor="requiereInsumos" className="block font-semibold text-gray-700 mb-2">Requiere insumos:</label>
              <input 
                type="text" 
                id="requiereInsumos" 
                name="requiereInsumos" 
                value={formData.requiereInsumos}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
          <div className="flex mb-4">
            <div className="w-full">
              <label htmlFor="especificarInsumos" className="block font-semibold text-gray-700 mb-2">Especificar insumos:</label>
              <textarea 
                id="especificarInsumos" 
                name="especificarInsumos" 
                value={formData.insumos}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              ></textarea>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Enviar
          </button>
        </div>
      </form>
    </Layout>
  );
}

export default Programarsolicitud;
