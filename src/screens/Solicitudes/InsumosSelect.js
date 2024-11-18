import React, { useState, useEffect } from "react";
import AsyncCreatableSelect from "react-select/async-creatable";
import { FixedSizeList } from "react-window";
import axios from "axios";

const InsumosSelect = ({ onSelect, selectedInsumos }) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedOptions, setSelectedOptions] = useState(selectedInsumos || []);
  const [insumos, setInsumos] = useState([]);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || 'http://localhost:4000';

  useEffect(() => {
    const fetchInsumos = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/insumos/insumos-disponibles`);
        setInsumos(response.data.insumos);
      } catch (error) {
        console.error("Error al obtener insumos:", error);
      }
    };
    fetchInsumos();
  }, [baseURL]);

  const loadOptions = (inputValue, callback) => {
    const filteredInsumos = insumos.filter((insumo) =>
      insumo.nombre.toLowerCase().includes(inputValue.toLowerCase())
    );
    const options = filteredInsumos.map((insumo) => ({
      label: insumo.nombre,
      value: insumo.id_insumo,
    }));
    callback(options);
  };

  const handleInputChange = (newValue) => {
    setInputValue(newValue);
  };

  const handleChange = (options) => {
    setSelectedOptions(options);
    onSelect(options);
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
    <div>
      <AsyncCreatableSelect
        isMulti
        cacheOptions
        loadOptions={loadOptions}
        defaultOptions
        onInputChange={handleInputChange}
        inputValue={inputValue}
        onChange={handleChange}
        value={selectedOptions}
        components={{ MenuList: VirtualizedSelect }}
        placeholder="Seleccionar o escribir insumo..."
        isClearable
        styles={{
          control: (provided, state) => ({
            ...provided,
            backgroundColor: state.selectProps.value ? '#FFFFFF' : '#FFFFFF',
            borderColor: state.isFocused ? '#FFFFFF' : provided.borderColor,
            boxShadow: state.isFocused ? '0 0 0 1px #FFFFFF' : provided.boxShadow,
            '&:hover': {
              borderColor: '#000',
            },
          }),
          menu: (provided) => ({
            ...provided,
            zIndex: 9999,
          }),
        }}
      />
      <button
        className="bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 mt-4"
        onClick={() => onSelect(selectedOptions)}
      >
        Aceptar
      </button>
    </div>
  );
};

export default InsumosSelect;