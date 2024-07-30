import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AnesthesiologistsCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchAnesthesiologistsCount = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_APP_BACK_SSQ}/anesthesiologists`);
        setCount(response.data.count);
      } catch (error) {
        console.error('Error fetching anesthesiologists count:', error);
      }
    };

    fetchAnesthesiologistsCount();
  }, []);

  return (
    <div className="bg-white rounded-xl border-[1px] border-border p-5 shadow-md">
      <h2 className="text-lg font-semibold">Total Anesthesiologists</h2>
      <div className="text-3xl font-bold mt-2">{count}</div>
    </div>
  );
}

export default AnesthesiologistsCount;
