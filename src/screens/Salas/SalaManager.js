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
      await axios.put(`${baseURL}/api/salas/salas/${id}`, {
        estado: !estadoActual,
      });
      fetchSalas(); // Refresh the list after updating
    } catch (error) {
      console.error("Error updating sala state:", error);
    }
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
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">
          Gestión de Salas de Quirófano
        </h1>
        <div className="content-container">
          <div className="table-container">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#365b77] text-white">
                <tr>
                  <th className="text-center py-2">ID</th>
                  <th className="text-center py-2">Nombre</th>
                  <th className="text-center py-2">Estado</th>
                  <th className="text-center py-2">Tiempo Inactivo</th>{" "}
                  {/* Nueva columna */}
                  <th className="text-center py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {salas.map((sala) => (
                  <tr key={sala.id} className="border-b">
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
                      {/* Asegúrate de que 'sala.tiempo_inactivo' esté en el formato adecuado */}
                      {sala.tiempo_inactivo
                        ? `${sala.tiempo_inactivo} minutos`
                        : "N/A"}
                    </td>{" "}
                    {/* Nueva celda */}
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
    </Layout>
  );
};

export default SalaManager;
