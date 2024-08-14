import React, { useEffect, useState } from 'react';

const AnesthesiologistsBySpecialtyCard = () => {
  const [data, setData] = useState({});
  const [error, setError] = useState(null);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/anestesio/anestesiologos`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const anesthesiologists = await response.json();

        const specialtyCounts = {};
        anesthesiologists.forEach(anesthesiologist => {
          const specialty = anesthesiologist.sala_quirofano; // Asumiendo que hay un campo especialidad
          specialtyCounts[specialty] = (specialtyCounts[specialty] || 0) + 1;
        });

        setData(specialtyCounts);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching anesthesiologists by specialty:', error);
      }
    };

    fetchData();
  }, [baseURL]);

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-white rounded-xl border-[1px] border-border p-5 shadow-md card-zoom">
      <h3 className="text-lg font-medium mb-4">Anestesiólogos por Especialidad</h3>
      <ul>
        {Object.entries(data).map(([specialty, count]) => (
          <li key={specialty}>{specialty}: {count}</li>
        ))}
      </ul>
    </div>
  );
};

export default AnesthesiologistsBySpecialtyCard;
