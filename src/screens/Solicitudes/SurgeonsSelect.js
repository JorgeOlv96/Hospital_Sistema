import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';

const SurgeonSelect = ({ onChange }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const loadOptions = (inputValue, callback) => {
    fetch(`http://localhost:4000/api/cirujanos/activos?q=${inputValue}`)
      .then(res => res.json())
      .then(data => {
        const options = data.map(surgeon => ({
          label: surgeon.nombre_cirujano,
          value: surgeon.nombre_cirujano
        }));
        callback(options);
      });
  };

  const handleChange = (option) => {
    setSelectedOption(option);
    onChange(option);
  };

  return (
    <AsyncSelect
      cacheOptions
      loadOptions={loadOptions}
      defaultOptions
      onChange={handleChange}
      value={selectedOption}
    />
  );
};

export default SurgeonSelect;
