import React, { useState, useEffect } from "react";
import AsyncCreatableSelect from "react-select/async-creatable";
import axios from "axios";

const AdicionalSelect = ({ onSelect, selectedInsumo }) => {
  const [inputValue, setInputValue] = useState("");
  const [selectedOption, setSelectedOption] = useState(selectedInsumo || null);
  const [materialesAdicionales, setMaterialesAdicionales] = useState([]);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";

  useEffect(() => {
    const fetchMaterialesAdicionales = async () => {
      try {
        const response = await axios.get(
          `${baseURL}/api/insumos/materiales-adicionales`
        );
        setMaterialesAdicionales(response.data); // Ajuste para el endpoint de materiales_adicionales
      } catch (error) {
        console.error("Error al obtener materiales adicionales:", error);
      }
    };
    fetchMaterialesAdicionales();
  }, [baseURL]);

  const loadOptions = (inputValue, callback) => {
    // Filtrar los materiales adicionales basados en el valor ingresado
    const filteredMateriales = materialesAdicionales.filter((material) =>
      material.descripcion.toLowerCase().includes(inputValue.toLowerCase()) ||
      material.clave.toLowerCase().includes(inputValue.toLowerCase())
    );

    // Crear opciones para el selector
    const options = filteredMateriales.map((material) => ({
      label: `${material.clave} - ${material.descripcion}`,
      value: material.id, // Cambiado a clave como identificador
      clave: material.clave,
      descripcion: material.descripcion,
    }));

    // Mostrar todas las opciones si no hay entrada
    if (!inputValue) {
      const allOptions = materialesAdicionales.map((material) => ({
        label: `${material.clave} - ${material.descripcion}`,
        value: material.id,
        clave: material.clave,
        descripcion: material.descripcion,
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
      // Crear un objeto de material adicional completo
      const materialCompleto = {
        ...option,
        cantidad: 1, // Por defecto, cantidad adicional es 1
        clave: option.clave,
        descripcion: option.descripcion,
      };
      onSelect(materialCompleto);
    } else {
      onSelect(null);
    }
  };

  return (
    <div>
      <AsyncCreatableSelect
        cacheOptions
        loadOptions={loadOptions}
        defaultOptions={materialesAdicionales.map((material) => ({
          label: `${material.clave} - ${material.descripcion}`,
          value: material.id,
          clave: material.clave,
          descripcion: material.descripcion,
        }))}
        onInputChange={handleInputChange}
        inputValue={inputValue}
        onChange={handleChange}
        value={selectedOption}
        placeholder="Seleccionar o escribir material adicional..."
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

export default AdicionalSelect;
