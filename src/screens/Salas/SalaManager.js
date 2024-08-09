import React, { useState, useEffect } from "react";
import Layout from "../../Layout";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import "./SalaManager.css";

// Registering Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const SalaManager = () => {
  const [salas, setSalas] = useState([]);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";

  useEffect(() => {
    fetchSalas();
  }, []);

  const fetchSalas = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/salas/salas`);
      setSalas(response.data);
    } catch (error) {
      console.error("Error fetching salas:", error);
    }
  };

  const toggleEstado = async (id, estadoActual) => {
    try {
      const newEstado = !estadoActual;
      const ultimaActualizacion = newEstado ? new Date().toISOString() : null; // Guardar la fecha de desactivación
      await axios.put(`${baseURL}/api/salas/salas/${id}`, {
        estado: newEstado,
        ultima_actualizacion: ultimaActualizacion, // Enviar la fecha de desactivación al servidor
      });
      fetchSalas(); // Refresh the list after updating
    } catch (error) {
      console.error("Error updating sala state:", error);
    }
  };

  const calculateInactiveTime = (ultimaActualizacion, estado) => {
    if (estado) return 0; // Si está encendida, no hay tiempo inactivo

    const now = new Date();
    const ultimaActualizacionDate = new Date(ultimaActualizacion);
    const differenceInMs = now - ultimaActualizacionDate;

    // Convertir a horas, minutos o segundos según sea necesario
    const hours = Math.floor(differenceInMs / (1000 * 60 * 60));
    const minutes = Math.floor((differenceInMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((differenceInMs % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
  };

  const formatFechaHora = (fechaHora) => {
    // Eliminar 'T', 'Z' y los ceros al final
    return fechaHora.replace('T', ' ').replace('Z', '').replace('.000', '');
  };

  // Prepare data for the bar chart
  const barChartData = {
    labels: salas.map((sala) => `Sala ${sala.nombre_sala}`),
    datasets: [
      {
        label: "Estado de las Salas",
        data: salas.map((sala) => (sala.estado ? 1 : 0)), // 1 for available, 0 for not available
        backgroundColor: salas.map((sala) =>
          sala.estado ? "#4CAF50" : "#FF6F6F"
        ), // Green for available, red for not available
      },
    ],
  };

  // Prepare data for the pie chart
  const availableCount = salas.filter((sala) => sala.estado).length;
  const unavailableCount = salas.length - availableCount;

  const pieChartData = {
    labels: ["Disponible", "No Disponible"],
    datasets: [
      {
        label: "Distribución de Salas",
        data: [availableCount, unavailableCount],
        backgroundColor: ["#4CAF50", "#FF6F6F"], // Green for available, red for not available
      },
    ],
  };

  return (
    <Layout>
      <div
        data-aos="fade-right"
        data-aos-duration="1000"
        data-aos-delay="100"
        data-aos-offset="200"
      >
       <div className="flex flex-col gap-4 mb-6">
       <h1 className="text-xl font-semibold">Gestor de Salas de Quirófano</h1>
       
        <div className="content-container">
          <div className="table-container sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#365b77] text-white">
                <tr>
                  <th className="text-center py-2">ID</th>
                  <th className="text-center py-2">Nombre</th>
                  <th className="text-center py-2">Estado</th>
                  <th className="text-center py-2">Última Desactivación</th> {/* Nueva columna */}
                  <th className="text-center py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {salas.map((sala) => (
                  <tr key={sala.id} className="bg-blue-50 hover:bg-[#7498b6]">
                    <td className="text-center py-2">{sala.id}</td>
                    <td className="text-center py-2">
                      Sala {sala.nombre_sala}
                    </td>
                    <td className="text-center py-2">
                      <div className="status-container">
                        <span className={`status-text ${sala.estado ? 'available' : 'unavailable'}`}>
                          {sala.estado ? "Disponible" : "No disponible"}
                        </span>
                      </div>
                    </td>
                    <td className="text-center py-2">
                      {sala.estado ? '---' : sala.ultima_actualizacion ? formatFechaHora(sala.ultima_actualizacion) : "N/A"}
                    </td>

                    <td className="text-center py-2">
                      <div className="switch-container">
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={sala.estado}
                            onChange={() => toggleEstado(sala.id, sala.estado)}
                          />
                          <span className="slider round"></span>
                        </label>
                        <span className="status-text">
                          {sala.estado ? "Apagar" : "Prender"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="charts-container">
            <div className="chart-item">
              <Bar data={barChartData} />
            </div>
            <div className="chart-item pie-chart">
              <Pie data={pieChartData} />
            </div>
          </div>
        </div>
      </div>
      </div>
    </Layout>
  );
};

export default SalaManager;
