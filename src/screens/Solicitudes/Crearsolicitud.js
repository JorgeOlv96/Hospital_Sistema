import React, { useState, useEffect } from 'react';
import Layout from '../../Layout';
import { Link, useNavigate } from 'react-router-dom';

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
      <div className="flex">
        <div className="mr-4">
          <label htmlFor="curp" className="block">Curp del paciente:</label>
          <input type="text" id="curp" name="curp" className="border rounded-md px-2 py-1" />
        </div>
      </div>

      <div className="flex mt-4">
            <div className="mr-4">
                <label htmlFor="apellidoPaterno" className="block">Apellido paterno:</label>
                <input type="text" id="apellidoPaterno" name="apellidoPaterno" className="border rounded-md px-2 py-1" />
            </div>

            <div className="mr-4">
                <label htmlFor="apellidoMaterno" className="block">Apellido materno:</label>
                <input type="text" id="apellidoMaterno" name="apellidoMaterno" className="border rounded-md px-2 py-1" />
            </div>
            
            <div className="mr-4">
                <label htmlFor="nombres" className="block">Nombres:</label>
                <input type="text" id="nombres" name="nombres" className="border rounded-md px-2 py-1" />
            </div>
      </div>

      <div className="flex mt-4">
        <div className="mr-4">
          <label htmlFor="fechaNacimiento" className="block">Fecha de nacimiento:</label>
          <input type="date" id="fechaNacimiento" name="fechaNacimiento" className="border rounded-md px-2 py-1" />
      </div>
      
           <div className="mr-4">
                <label htmlFor="sexo" className="block">Sexo:</label>
                <select id="sexo" name="sexo" className="border rounded-md px-2 py-1">
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                </select>
            </div>
       </div>

      <div className="flex mt-4">
        <div className="mr-4">
          <label htmlFor="tipoConsulta" className="block">Tipo de consulta:</label>
          <select id="tipoConsulta" name="tipoConsulta" className="border rounded-md px-2 py-1">
            <option value="consultaExterna">Consulta Externa</option>
            <option value="urgencias">Urgencias</option>
            <option value="cirugia">Cirugía</option>
          </select>
        </div>
        
           <div>
            <label htmlFor="tipoIntervencion" className="block">Tipo de intervención:</label>
              <select id="tipoIntervencion" name="tipoIntervencion" className="border rounded-md px-2 py-1">
                <option value="ninguna">Ninguna</option>
                <option value="cirugiaMenor">Cirugía Menor</option>
                <option value="cirugiaMayor">Cirugía Mayor</option>
              </select>
            </div>
        </div>


        <div className="flex mt-4">
        <div className="mr-4">
          <label htmlFor="fechaSolicitada" className="block">Fecha solicitada:</label>
          <input type="date" id="fechaSolicitada" name="fechaSolicitada" className="border rounded-md px-2 py-1" />
        </div>
        <div className="mr-4">
          <label htmlFor="horaSolicitada" className="block">Hora solicitada:</label>
          <input type="time" id="horaSolicitada" name="horaSolicitada" className="border rounded-md px-2 py-1" />
        </div>
        <div className="mr-4">
          <label htmlFor="tiempoEstimadoCirugia" className="block">Tiempo estimado de cirugía:</label>
          <input type="time" id="tiempoEstimadoCirugia" name="tiempoEstimadoCirugia" className="border rounded-md px-2 py-1" />
        </div>
        <div className="mr-4">
          <label htmlFor="turnoSolicitado" className="block">Turno solicitado:</label>
          <select id="turnoSolicitado" name="turnoSolicitado" className="border rounded-md px-2 py-1">
            <option value="Vespertino">Vespertino</option>
            <option value="Matutino">Matutino</option>
            <option value="Nocturno">Nocturno</option>
            <option value="Especial">Especial</option>
          </select>
        </div>
      </div>

      <div className="flex mt-4">
        <div className="mr-4">
          <label htmlFor="salaSolicitada" className="block">Sala solicitada:</label>
          <select id="salaSolicitada" name="salaSolicitada" className="border rounded-md px-2 py-1">
            <option value="sala1">Sala 1</option>
            <option value="sala2">Sala 2</option>
            <option value="sala3">Sala 3</option>
          </select>
        </div>
        <div>
          <label htmlFor="procedimientosPaciente" className="block">Procedimientos para el paciente:</label>
          <select id="procedimientosPaciente" name="procedimientosPaciente" className="border rounded-md px-2 py-1">
            <option value="procedimiento1">Procedimiento 1</option>
            <option value="procedimiento2">Procedimiento 2</option>
            <option value="procedimiento3">Procedimiento 3</option>
          </select>
        </div>
      </div>

      <div className="flex mt-4">
        <div className="mr-4">
          <label htmlFor="cirujanoEncargado" className="block">Cirujano encargado:</label>
          <select id="cirujanoEncargado" name="cirujanoEncargado" className="border rounded-md px-2 py-1">
            <option value="cirujano1">Cirujano 1</option>
            <option value="cirujano2">Cirujano 2</option>
            <option value="cirujano3">Cirujano 3</option>
          </select>
        </div>
        <div>
          <label htmlFor="requiereInsumos" className="block">Requiere insumos:</label>
          <select id="requiereInsumos" name="requiereInsumos" className="border rounded-md px-2 py-1">
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>

      <div className="flex mt-4">
        <div className="mr-4">
          <label htmlFor="especificarInsumos" className="block">Especifique los insumos:</label>
          <select id="especificarInsumos" name="especificarInsumos" className="border rounded-md px-2 py-1">
            <option value="insumo1">Insumo 1</option>
            <option value="insumo2">Insumo 2</option>
            <option value="insumo3">Insumo 3</option>
          </select>
        </div>
      </div>


      <div className="flex mt-4">
        <div className="mr-4">
          <button onClick={handleGuardar} className="btn btn-sm btn-secondary p-2 bg-[#001B58] text-white rounded-lg">Guardar</button>
        </div>
      </div>

    </Layout>
  );
}

export default Solicitudes;