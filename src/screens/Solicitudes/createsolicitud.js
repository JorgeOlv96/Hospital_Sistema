import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../../Layout';

function CreateSolicitud() {
  const [formData, setFormData] = useState({
    curp: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    nombres: '',
    fechaNacimiento: '',
    sexo: '',
    tipoConsulta: '',
    tipoIntervencion: '',
    fechaSolicitada: '',
    horaIniciada: '',
    tiempoEstimadoCirugia: '',
    turnoSolicitado: '',
    salaSolicitada: '',
    procedimientos: '',
    cirujanoEncargado: '',
    requiereInsumos: '',
    especificarInsumos: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí puedes manejar el envío del formulario
    console.log(formData);
  };

  return (
    <Layout>
    <h1 className="text-xl font-semibold mb-4">Nueva Solicitud</h1>
    <form onSubmit={handleSubmit}>
    <div className="container">
        <div className="row">
        <div className="col-md-6 mb-3">
            <label htmlFor="curp" className="form-label">Curp del paciente</label>
            <input type="text" className="form-control" id="curp" name="curp" value={formData.curp} onChange={handleChange} />
        </div>
        <div className="col-md-6 mb-3">
            <label htmlFor="apellidoPaterno" className="form-label">Apellido paterno</label>
            <input type="text" className="form-control" id="apellidoPaterno" name="apellidoPaterno" value={formData.apellidoPaterno} onChange={handleChange} />
        </div>
        </div>
        <div className="row">
        <div className="col-md-6 mb-3">
            <label htmlFor="apellidoMaterno" className="form-label">Apellido materno</label>
            <input type="text" className="form-control" id="apellidoMaterno" name="apellidoMaterno" value={formData.apellidoMaterno} onChange={handleChange} />
        </div>
        <div className="col-md-6 mb-3">
            <label htmlFor="nombres" className="form-label">Nombres</label>
            <input type="text" className="form-control" id="nombres" name="nombres" value={formData.nombres} onChange={handleChange} />
        </div>
        </div>
    </div>
    {/* Rest of your form */}
    </form>

</Layout>
  
  );
}

export default CreateSolicitud;
