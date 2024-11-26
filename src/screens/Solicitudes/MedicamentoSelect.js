import React, { useState, useEffect } from "react";
import AsyncCreatableSelect from "react-select/async-creatable";
import axios from "axios";

const MedicamentoSelect = ({ onSelect, selectedInsumo }) => {
  const [inputValue, setInputValue] = useState("");
  const [selectedOption, setSelectedOption] = useState(selectedInsumo || null);
  const [insumos, setInsumos] = useState([]);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";

  useEffect(() => {
    const fetchInsumos = async () => {
      try {
        const response = await axios.get(
          `${baseURL}/api/insumos/insumos-disponibles`
        );
        setInsumos(response.data.insumos);
      } catch (error) {
        console.error("Error al obtener insumos:", error);
      }
    };
    fetchInsumos();
  }, [baseURL]);

  const loadOptions = (inputValue, callback) => {
    const filteredInsumos = insumos.filter((insumo) =>
      insumo.descripcion.toLowerCase().includes(inputValue.toLowerCase()) ||
      insumo.clave.toLowerCase().includes(inputValue.toLowerCase())
    );

    const options = filteredInsumos.map((insumo) => ({
      label: `${insumo.clave} - ${insumo.descripcion}`,
      value: insumo.id_insumo,
      clave: insumo.clave,
      descripcion: insumo.descripcion
    }));

    if (!inputValue) {
      const allOptions = insumos.map((insumo) => ({
        label: `${insumo.clave} - ${insumo.descripcion}`,
        value: insumo.id_insumo,
        clave: insumo.clave,
        descripcion: insumo.descripcion
      }));
      callback(allOptions);
    } else {
      callback(options);
    }
  };

  const handleInputChange = (newValue) => {
    setInputValue(newValue);
  };

  const handleChange = (option) => {
    setSelectedOption(option);
    if (option) {
      // Asegurarse de que todos los datos necesarios estén incluidos
      const insumoCompleto = {
        ...option,
        cantidad: 1,
        clave: option.clave,
        descripcion: option.descripcion
      };
      onSelect(insumoCompleto);
    } else {
      onSelect(null);
    }
  };

  return (
    <div>
      <AsyncCreatableSelect
        cacheOptions
        loadOptions={loadOptions}
        defaultOptions={insumos.map((insumo) => ({
          label: `${insumo.clave} - ${insumo.descripcion}`,
          value: insumo.id_insumo,
          clave: insumo.clave,
          descripcion: insumo.descripcion
        }))}
        onInputChange={handleInputChange}
        inputValue={inputValue}
        onChange={handleChange}
        value={selectedOption}
        placeholder="Seleccionar o escribir insumo..."
        isClearable
        styles={{
          control: (provided, state) => ({
            ...provided,
            backgroundColor: "#FFFFFF",
            borderColor: state.isFocused ? "#000" : provided.borderColor,
            boxShadow: state.isFocused ? "0 0 0 1px #000" : provided.boxShadow,
            "&:hover": {
              borderColor: "#000",
            },
          }),
          menu: (provided) => ({
            ...provided,
            zIndex: 9999,
          }),
          option: (provided) => ({
            ...provided,
            whiteSpace: "normal",
            wordWrap: "break-word",
          }),
        }}
      />
    </div>
  );
};

export default MedicamentoSelect;