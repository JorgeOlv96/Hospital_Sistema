import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';

const ProcedureSelect = () => {
  const [selectedOption, setSelectedOption] = useState(null);

  const loadOptions = (inputValue, callback) => {
    fetch(`http://localhost:4000/api/solicitudes/procedimientos?q=${inputValue}`)
      .then(res => res.json())
      .then(data => {
        const options = data.map(procedure => ({
          label: procedure.nombre_procedimiento,
          value: procedure.nombre_procedimiento
        }));
        callback(options);
      });
  };

  return (
    <AsyncSelect
      cacheOptions
      loadOptions={loadOptions}
      defaultOptions
      onChange={setSelectedOption}
      value={selectedOption}
    />
  );
};

export default ProcedureSelect;
