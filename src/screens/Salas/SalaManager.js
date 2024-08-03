import React, { useState, useEffect } from "react";
import Layout from "../../Layout";
import { Link } from "react-router-dom";
import axios from "axios";

function SalaManager() {
    const [salas, setSalas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      async function fetchSalas() {
        try {
          const response = await axios.get('/api/salas');
          console.log('Salas cargadas:', response.data); // Verifica los datos en la consola
          setSalas(response.data);
        } catch (err) {
          console.error('Error al cargar las salas:', err); // Verifica el error en la consola
          setError('No se pudieron cargar las salas.');
        } finally {
          setLoading(false);
        }
      }
  
      fetchSalas();
    }, []);

  return (
    <Layout>
        <div>
      <h1 className="text-xl font-semibold">Enfermería</h1>
      </div>
    </Layout>
  );
}

export default SalaManager;
