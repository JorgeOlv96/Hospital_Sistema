import React, { useState } from "react";
import AsyncCreatableSelect from "react-select/async-creatable";
import { FixedSizeList } from "react-window";

const ProcedureSelect = ({ onChange, value }) => {
  const [inputValue, setInputValue] = useState('');  // Para manejar el texto en el input
  const [selectedOption, setSelectedOption] = useState(value);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || 'http://localhost:4000';

  const loadOptions = (inputValue, callback) => {
    fetch(`${baseURL}/api/solicitudes/procedimientos?q=${inputValue}`)
      .then((res) => res.json())
      .then((data) => {
        const options = data.map((procedure) => ({
          label: procedure.nombre_procedimiento,
          value: procedure.nombre_procedimiento,
        }));
        callback(options);
      });
  };

  const handleInputChange = (newValue) => {
    setInputValue(newValue);  // Actualiza el valor del input
  };

  const handleChange = (option) => {
    setSelectedOption(option);
    onChange(option);
  };

  const VirtualizedSelect = ({ children, ...props }) => {
    const height = 35;
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
    <AsyncCreatableSelect
      cacheOptions
      loadOptions={loadOptions}
      defaultOptions
      onInputChange={handleInputChange} // Actualiza inputValue mientras escribes
      inputValue={inputValue}  // Asocia el estado inputValue con el input
      onChange={handleChange}
      value={selectedOption}
      components={{ MenuList: VirtualizedSelect }}
      placeholder="Seleccionar o escribir procedimiento..."
      isClearable
      styles={{
        control: (provided, state) => ({
          ...provided,
          backgroundColor: state.selectProps.value ? '#A8CBD5' : '#FFFFFF',
          borderColor: state.isFocused ? '#4F638F' : provided.borderColor,
          boxShadow: state.isFocused ? '0 0 0 1px #4F638F' : provided.boxShadow,
          '&:hover': {
            borderColor: '#4F638F',
          },
        }),
        menu: (provided) => ({
          ...provided,
          zIndex: 9999,
        }),
      }}
    />
  );
};

export default ProcedureSelect;
