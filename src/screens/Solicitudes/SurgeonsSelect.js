import React, { useState, useRef } from 'react';
import axios from 'axios';
import AsyncSelect from 'react-select/async';
import debounce from 'lodash/debounce'; // Importa debounce desde lodash


const SurgeonSelect = ({ onChange }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || 'http://localhost:4000';

  const loadOptions = (inputValue, callback) => {
    axios.get(`${baseURL}/cirujanos/activos?q=${inputValue}`)
      .then(res => res.json())
      .then(data => {
        const options = data.map(surgeon => ({
          label: surgeon.nombre_cirujano,
          value: surgeon.nombre_cirujano
        }));
        callback(options);
      });

      setIsLoading(true);
      debouncedLoadOptions(inputValue, callback);
    };

  const debouncedLoadOptions = useRef(
    debounce((inputValue, callback) => {
      fetchSurgeons(inputValue)
        .then(data => {
          const options = data.map(surgeon => ({
            label: surgeon.nombre_cirujano,
            value: surgeon.nombre_cirujano
          }));
          callback(options);
          setIsLoading(false);
        })
        .catch(error => {
          setError(error.message);
          setIsLoading(false);
        });
    }, 300) // Tiempo de debounce (milisegundos)
  ).current;

  const handleChange = (option) => {
    setSelectedOption(option);
    onChange(option);
  };

  return (
    <>
      {isLoading && <p>Cargando opciones...</p>}
      {error && <p>Error: {error}</p>}
      <AsyncSelect
        cacheOptions
        loadOptions={loadOptions}
        defaultOptions
        onChange={handleChange}
        value={selectedOption}
        placeholder="Seleccionar..."
        menuIsOpen={true} // Mantener abierta la lista de opciones
      />
    </>
  );
};

export default SurgeonSelect;
