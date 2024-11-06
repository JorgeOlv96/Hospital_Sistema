import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Layout from "../../Layout";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../AuthContext";
import AsyncSelect from "react-select/async";

const SolicitudInsumosPaciente = () => {
  const { appointmentId } = useParams();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { baseURL } = useContext(AuthContext);

  useEffect(() => {
    const fetchAppointmentData = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/solicitudes/${appointmentId}`);
        setPatientData(response.data);
      } catch (error) {
        console.error("Error fetching appointment data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointmentData();
  }, [appointmentId, baseURL]);

  const handleInsumosSubmit = async (e) => {
    e.preventDefault();
    // Lógica para enviar insumos
    try {
      const response = await axios.post(`${baseURL}/api/insumos`, {
        // Agregar los campos del formulario de insumos aquí
      });
      console.log("Insumos agregados:", response.data);
    } catch (error) {
      console.error("Error al agregar insumos:", error);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <Layout>
      <div>
        <h2>Solicitud de Insumos para Paciente</h2>
        {patientData && (
          <div>
            <p>Nombre del Paciente: {patientData.nombre}</p>
            <p>Edad: {patientData.edad}</p>
            {/* Agrega más campos según los datos disponibles */}
          </div>
        )}
        <form onSubmit={handleInsumosSubmit}>
          {/* Campos para agregar insumos */}
          <div>
            <label>Insumo</label>
            <input type="text" name="insumo" required />
          </div>
          <button type="submit">Agregar Insumo</button>
        </form>
      </div>
    </Layout>
  );
};

export default SolicitudInsumosPaciente;
