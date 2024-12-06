import React, { useState, useEffect } from "react";
import AsyncCreatableSelect from "react-select/async-creatable";
import axios from "axios";

const PaquetesSelect = ({ onSelect, selectedInsumo }) => {
  const [inputValue, setInputValue] = useState("");
  const [selectedOption, setSelectedOption] = useState(selectedInsumo || null);
  const [paquetes, setPaquetes] = useState([]);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";

  useEffect(() => {
    const fetchPaquetes = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/insumos/paquetes`);
        setPaquetes(response.data || []);
      } catch (error) {
        console.error("Error al obtener paquetes:", error);
        setPaquetes([]); // Maneja errores con un valor por defecto
      }
    };
    fetchPaquetes();
  }, [baseURL]);
  

  const loadOptions = (inputValue, callback) => {
    const filteredPaquetes = paquetes.filter((paquete) =>
      paquete.nombre.toLowerCase().includes(inputValue.toLowerCase()) ||
    paquete.descripcion.toLowerCase().includes(inputValue.toLowerCase())
    );

    const options = filteredPaquetes.map((paquete) => ({
      label: `${paquete.nombre} - ${paquete.descripcion}`,
      value: paquete.id,
      nombre: paquete.nombre,
      descripcion: paquete.descripcion
    }));

    if (!inputValue) {
      const allOptions = paquetes.map((paquete) => ({
        label: `${paquete.nombre} - ${paquete.descripcion}`,
        value: paquete.id,
        nombre: paquete.nombre,
        descripcion: paquete.descripcion
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
      const paqueteCompleto = {
        ...option,
        cantidad: 1,
        nombre: option.nombre,
        descripcion: option.descripcion
      };
      onSelect(paqueteCompleto);
    } else {
      onSelect(null);
    }
  };

  return (
    <div>
      <AsyncCreatableSelect
        cacheOptions
        loadOptions={loadOptions}
        defaultOptions={paquetes.map((paquete) => ({
          label: `${paquete.nombre} - ${paquete.descripcion}`,
          value: paquete.id,
          nombre: paquete.nombre,
          descripcion: paquete.descripcion
        }))}
        onInputChange={handleInputChange}
        inputValue={inputValue}
        onChange={handleChange}
        value={selectedOption}
        placeholder="Seleccionar o escribir paquete..."
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

export default PaquetesSelect;