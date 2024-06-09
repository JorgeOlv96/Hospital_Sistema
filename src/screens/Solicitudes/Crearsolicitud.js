import React, { useState, useEffect } from 'react';
import Layout from '../../Layout';
import { Link } from 'react-router-dom';

function Solicitudes() {

  const [solicitudes, setSolicitudes] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null); // Estado para almacenar la solicitud seleccionada

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

  const handleGuardar = () => {
    // Lógica para guardar la solicitud
    console.log('Solicitud guardada');
  };

  const especialidadToClave = {
    'Algología': 'ALG',
    'Angiología': 'ANG',
    'C.Plástica y Reconstructiva': 'CPR',
    'Cardiología': 'CAR',
    'Cirigía de Torax': 'CTO',
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

  const handleNombreEspecialidadChange = (e) => {
    const selectedNombreEspecialidad = e.target.value;
    setNombreEspecialidad(selectedNombreEspecialidad);
    const correspondingClave = especialidadToClave[selectedNombreEspecialidad] || 'Seleccionar clave de especialidad';
    setClaveEspecialidad(correspondingClave);
  };

  const handleClaveEspecialidadChange = (e) => {
    const selectedClaveEspecialidad = e.target.value;
    setClaveEspecialidad(selectedClaveEspecialidad);
    const correspondingNombre = claveToEspecialidad[selectedClaveEspecialidad] || '';
    setNombreEspecialidad(correspondingNombre);
  };

  return (
    <Layout>
      <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="curp" className="block font-semibold text-gray-700 mb-2">Curp del paciente:</label>
          <input 
            type="text" 
            id="curp" 
            name="curp" 
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
              className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>

          <div className="mr-4 w-full">
            <label htmlFor="apellidoMaterno" className="block font-semibold text-gray-700 mb-2">Apellido materno:</label>
            <input 
              type="text" 
              id="apellidoMaterno" 
              name="apellidoMaterno" 
              className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          
          <div className="w-full">
            <label htmlFor="nombres" className="block font-semibold text-gray-700 mb-2">Nombres:</label>
            <input 
              type="text" 
              id="nombres" 
              name="nombres" 
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
              className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          
          <div className="w-full">
            <label htmlFor="sexo" className="block font-semibold text-gray-700 mb-2">Sexo:</label>
            <select 
              id="sexo" 
              name="sexo" 
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
            <select 
              id="tipoConsulta" 
              name="tipoConsulta" 
              className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            >
              <option value="">Seleccione el tipo de consulta</option>
              <option value="consultaExterna">Consulta Externa</option>
              <option value="urgencias">Urgencias</option>
              <option value="cirugia">Cirugía</option>
            </select>
          </div>
          
          <div className="w-full">
            <label htmlFor="tipoIntervencion" className="block font-semibold text-gray-700 mb-2">Tipo de intervención:</label>
            <select 
              id="tipoIntervencion" 
              name="tipoIntervencion" 
              className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            >
              <option value="-">Seleccione el tipo de intervención</option>
              <option value="Cirugía">Cirugía</option>
              <option value="cirugiaMenor">Cirugía Ambulatoria</option>
              <option value="cirugiaMayor">Procedimiento</option>
            </select>
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="tipoEspecialidad" className="block font-semibold text-gray-700 mb-2">Tipo de especialidad:</label>
          <div className="flex">
            <div className="mr-4 w-1/2">
              <label htmlFor="nombreEspecialidad" className="block font-semibold text-gray-700 mb-2">Especialidad:</label>
              <select 
                id="nombreEspecialidad" 
                name="nombreEspecialidad" 
                value={nombreEspecialidad} // Asignar el valor seleccionado
                onChange={handleNombreEspecialidadChange} // Evento onChange
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccione una especialidad</option>
                {Object.keys(especialidadToClave).map((especialidad) => (
                  <option key={especialidad} value={especialidad}>{especialidad}</option>
                ))}
              </select>
            </div>

            <div className="w-1/2">
              <label htmlFor="claveEspecialidad" className="block font-semibold text-gray-700 mb-2">Clave de especialidad:</label>
              <select 
                id="claveEspecialidad" 
                name="claveEspecialidad" 
                value={claveEspecialidad} // Asignar el valor seleccionado
                onChange={handleClaveEspecialidadChange} // Evento onChange
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccione una clave</option>
                {Object.values(especialidadToClave).map((clave) => (
                  <option key={clave} value={clave}>{clave}</option>
                ))}
              </select>
            </div>
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
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
        </div>

        <div className="mr-4 w-full">
            <label htmlFor="horaSolicitada" className="block font-semibold text-gray-700 mb-2">Hora solicitada:</label>
            <input 
                type="time" 
                id="horaSolicitada" 
                name="horaSolicitada" 
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
        </div>

        <div className="mr-4 w-full">
            <label htmlFor="tiempoEstimadoCirugia" className="block font-semibold text-gray-700 mb-2">Tiempo estimado de cirugía:</label>
            <input 
                type="time" 
                id="tiempoEstimadoCirugia" 
                name="tiempoEstimadoCirugia" 
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
        </div>

        <div className="w-full">
            <label htmlFor="turnoSolicitado" className="block font-semibold text-gray-700 mb-2">Turno solicitado:</label>
            <select 
                id="turnoSolicitado" 
                name="turnoSolicitado" 
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            >
                <option value="Vespertino">Vespertino</option>
                <option value="Matutino">Matutino</option>
                <option value="Nocturno">Nocturno</option>
                <option value="Especial">Especial</option>
            </select>
        </div>
    </div>
</div>


<div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
    <div className="flex mb-4">
        <div className="mr-4 w-full">
            <label htmlFor="salaSolicitada" className="block font-semibold text-gray-700 mb-2">Sala solicitada:</label>
            <select 
                id="salaSolicitada" 
                name="salaSolicitada" 
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            >
                <option value="SalaA1">A1</option>
                <option value="SalaA2">A2</option>
                <option value="SalaT1">T1</option>
                <option value="SalaT2">T2</option>
                <option value="Sala1">1</option>
                <option value="Sala2">2</option>
                <option value="Sala3">3</option>
                <option value="Sala4">4</option>
                <option value="Sala5">5</option>
                <option value="Sala6">6</option>
                <option value="SalaE">E</option>
                <option value="SalaH">H</option>
                <option value="SalaRX">RX</option>
            </select>
        </div>
        
        <div className="w-full">
            <label htmlFor="procedimientosPaciente" className="block font-semibold text-gray-700 mb-2">Procedimientos para el paciente:</label>
            <select 
                id="procedimientosPaciente" 
                name="procedimientosPaciente" 
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            >
                <option value="procedimiento1">Procedimiento 1</option>
                <option value="procedimiento2">Procedimiento 2</option>
                <option value="procedimiento3">Procedimiento 3</option>
            </select>
        </div>
    </div>
</div>


<div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md mt-4">
    <div className="flex mb-4">
        <div className="mr-4 w-full">
            <label htmlFor="cirujanoEncargado" className="block font-semibold text-gray-700 mb-2">Cirujano encargado:</label>
            <select 
                id="cirujanoEncargado" 
                name="cirujanoEncargado" 
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            >
                <option value="cirujano1">1</option>
                <option value="cirujano2">2</option>
                <option value="cirujano3">3</option>
            </select>
        </div>
        
        <div className="w-full">
            <label htmlFor="requiereInsumos" className="block font-semibold text-gray-700 mb-2">Requiere insumos:</label>
            <select 
                id="requiereInsumos" 
                name="requiereInsumos" 
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            >
                <option value="si">Sí</option>
                <option value="no">No</option>
            </select>
        </div>
    </div>

    <div className="flex mb-4">
        <div className="mr-4 w-full">
            <label htmlFor="especificarInsumos" className="block font-semibold text-gray-700 mb-2">Especifique los insumos:</label>
            <select 
                id="especificarInsumos" 
                name="especificarInsumos" 
                className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            >
                <option value="insumo1">Insumo 1</option>
                <option value="insumo2">Insumo 2</option>
                <option value="insumo3">Insumo 3</option>
            </select>
        </div>
    </div>
</div>



<div className="flex mt-4">
    <div className="mr-4">
        <Link 
            to="/solicitudes" 
            className="inline-block bg-blue-500 hover:bg-blue-700 focus:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
        >
            Guardar
        </Link>
    </div>
</div>



    </Layout>
  );
}

export default Solicitudes;
