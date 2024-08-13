import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AnesthesiologistsByShiftCard = () => {
  const [data, setData] = useState({ matutino: 0, vespertino: 0, nocturno: 0 });
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/anestesio/anestesiologos`);
        const anesthesiologists = response.data;

        const counts = {
          matutino: 0,
          vespertino: 0,
          nocturno: 0,
        };

        anesthesiologists.forEach(anesthesiologist => {
          if (anesthesiologist.turno_anestesio === 'Matutino') counts.matutino++;
          if (anesthesiologist.turno_anestesio === 'Vespertino') counts.vespertino++;
          if (anesthesiologist.turno_anestesio === 'Nocturno') counts.nocturno++;
        });

        setData(counts);
      } catch (error) {
        console.error('Error fetching anesthesiologists by shift:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-xl border-[1px] border-border p-5 shadow-md">
      <h3 className="text-lg font-medium mb-4">Anestesiólogos por Turno</h3>
      <ul>
        <li>Matutino: {data.matutino}</li>
        <li>Vespertino: {data.vespertino}</li>
        <li>Nocturno: {data.nocturno}</li>
      </ul>
    </div>
  );
};

export default AnesthesiologistsByShiftCard;
