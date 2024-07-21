import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import axios from 'axios';

function AnesthesiologistsDistribution() {
  const [data, setData] = useState({ labels: [], values: [] });

  useEffect(() => {
    const fetchAnesthesiologistsDistribution = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/anesthesiologists/distribution');
        const distribution = response.data; // Assume [{ specialty: '...', count: ... }, ...]

        setData({
          labels: distribution.map(item => item.specialty),
          values: distribution.map(item => item.count)
        });
      } catch (error) {
        console.error('Error fetching anesthesiologists distribution:', error);
      }
    };

    fetchAnesthesiologistsDistribution();
  }, []);

  const options = {
    chart: {
      type: 'pie',
    },
    labels: data.labels,
  };

  const series = data.values;

  return (
    <div className="bg-white rounded-xl border-[1px] border-border p-5 shadow-md">
      <h2 className="text-lg font-semibold">Anesthesiologists by Specialty</h2>
      <Chart
        options={options}
        series={series}
        type="pie"
        width="100%"
        height={300}
      />
    </div>
  );
}

export default AnesthesiologistsDistribution;
