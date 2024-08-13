import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AnesthesiologistsBySpecialtyCard = () => {
  const [data, setData] = useState({});
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/anestesio/anestesiologos`);
        const anesthesiologists = response.data;

        const specialtyCounts = {};
        anesthesiologists.forEach(anesthesiologist => {
          const specialty = anesthesiologist.especialidad; // Asumiendo que hay un campo especialidad
          specialtyCounts[specialty] = (specialtyCounts[specialty] || 0) + 1;
        });

        setData(specialtyCounts);
      } catch (error) {
        console.error('Error fetching anesthesiologists by specialty:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-xl border-[1px] border-border p-5 shadow-md">
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
