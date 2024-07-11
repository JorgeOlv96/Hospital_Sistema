import React, { useState } from "react";
import AsyncSelect from "react-select/async";
import { FixedSizeList } from "react-window";

const ProcedureSelect = ({ onChange }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const loadOptions = (inputValue, callback) => {
    fetch(
      `http://localhost:4000/api/solicitudes/procedimientos?q=${inputValue}`
    )
      .then((res) => res.json())
      .then((data) => {
        const options = data.map((procedure) => ({
          label: procedure.nombre_procedimiento,
          value: procedure.nombre_procedimiento,
        }));
        callback(options);
      });
  };

  const handleChange = (option) => {
    setSelectedOption(option);
    onChange(option);
  };

  const VirtualizedSelect = ({ children, ...props }) => {
    const height = 35; // Altura estimada de cada opción
    const rowCount = children.length;
    return (
      <FixedSizeList
        height={height * Math.min(10, rowCount)}
        itemCount={rowCount}
        itemSize={height}
      >
        {({ index, style }) => <div style={style}>{children[index]}</div>}
      </FixedSizeList>
    );
  };

  return (
    <AsyncSelect
      cacheOptions
      loadOptions={loadOptions}
      defaultOptions
      onChange={handleChange}
      value={selectedOption}
      components={{ MenuList: VirtualizedSelect }}
      placeholder="Seleccionar..."
    />
  );
};

export default ProcedureSelect;
