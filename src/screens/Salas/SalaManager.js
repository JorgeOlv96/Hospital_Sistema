import React, { useState, useEffect } from "react";
import Layout from "../../Layout";
import axios from "axios";

const SalaManager = () => {
  const [salas, setSalas] = useState([]);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || 'http://localhost:4000';

  useEffect(() => {
    fetchSalas();
  }, []);

  const fetchSalas = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/salas/salas`);
      setSalas(response.data);
    } catch (error) {
      console.error('Error fetching salas:', error);
    }
  };

  const toggleEstado = async (id, estadoActual) => {
    try {
      await axios.put(`${baseURL}/api/salas/salas/${id}`, { estado: !estadoActual });
      fetchSalas(); // Refresh the list after updating
    } catch (error) {
      console.error('Error updating sala state:', error);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Gestión de Salas de Quirófano</h1>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#365b77] text-white">
            <tr>
              <th className="text-center py-2">ID</th>
              <th className="text-center py-2">Nombre</th>
              <th className="text-center py-2">Estado</th>
              <th className="text-center py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {salas.map((sala) => (
              <tr key={sala.id} className="border-b">
                <td className="text-center py-2">{sala.id}</td>
                <td className="text-center py-2">Sala {sala.nombre_sala}</td>
                <td className="text-center py-2">{sala.estado ? 'Disponible' : 'No disponible'}</td>
                <td className="text-center py-2">
                  <button
                    className={`text-white font-bold py-2 px-4 rounded ${
                      sala.estado ? 'bg-red-500 hover:bg-red-700' : 'bg-green-500 hover:bg-green-700'
                    }`}
                    onClick={() => toggleEstado(sala.id, sala.estado)}
                  >
                    {sala.estado ? 'Marcar como no disponible' : 'Marcar como disponible'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default SalaManager;
