import React, { useState, useEffect } from 'react';
import Layout from '../../Layout';
import { Link, useHistory } from 'react-router-dom'; // Asegúrate de que useHistory esté importado


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
                <option value="ninguna">Ninguna</option>
                <option value="cirugiaMenor">Cirugía Menor</option>
                <option value="cirugiaMayor">Cirugía Mayor</option>
            </select>
        </div>
    </div>
    
    <div className="mb-4">
        <label htmlFor="tipoEspecialidad" className="block font-semibold text-gray-700 mb-2">Tipo de especialidad:</label>
        <div className="flex">
            <div className="mr-4 w-1/2">
                <label htmlFor="nombreEspecialidad" className="block font-semibold text-gray-700 mb-2">Nombre:</label>
                <input 
                    type="text" 
                    id="nombreEspecialidad" 
                    name="nombreEspecialidad" 
                    className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
            </div>
            <div className="w-1/2">
                <label htmlFor="claveEspecialidad" className="block font-semibold text-gray-700 mb-2">Clave:</label>
                <input 
                    type="text" 
                    id="claveEspecialidad" 
                    name="claveEspecialidad" 
                    className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
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
                <option value="sala1">Sala 1</option>
                <option value="sala2">Sala 2</option>
                <option value="sala3">Sala 3</option>
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
                <option value="cirujano1">Cirujano 1</option>
                <option value="cirujano2">Cirujano 2</option>
                <option value="cirujano3">Cirujano 3</option>
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