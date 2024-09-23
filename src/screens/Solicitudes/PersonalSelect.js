import React, { useState } from "react";
import AsyncCreatableSelect from "react-select/async-creatable";
import { FixedSizeList } from "react-window";

const PersonalSelect = ({ onChange, value, backgroundColor = '#FFFFFF' }) => {
  const [inputValue, setInputValue] = useState(''); // Para manejar el texto en el input
  const [selectedOption, setSelectedOption] = useState(value);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || 'http://localhost:4000';

  const loadOptions = (inputValue, callback) => {
    if (inputValue) { // Solo hacer la consulta si hay texto en el input
      fetch(`${baseURL}/api/solicitudes/personal?q=${inputValue}`)
        .then((res) => res.json())
        .then((data) => {
          const options = data.map((person) => ({
            label: person.nombre_completo,
            value: person.nombre_completo,
          }));
          callback(options);
        });
    } else {
      callback([]); // Si el input está vacío, no devolver opciones
    }
  };

  const handleInputChange = (newValue) => {
    setInputValue(newValue); // Actualiza el valor del input
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
      onInputChange={handleInputChange}
      inputValue={inputValue}
      onChange={handleChange}
      value={selectedOption}
      components={{ MenuList: VirtualizedSelect }}
      placeholder="Escribir nombre..."
      isClearable
      styles={{
        control: (provided, state) => ({
          ...provided,
          backgroundColor: selectedOption ? backgroundColor : '#FFFFFF', // Cambia el fondo usando el prop
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

export default PersonalSelect;
