import React, { useState, useEffect } from "react";
import Layout from "../../Layout";
import AsyncSelect from 'react-select/async';
import { Link } from "react-router-dom";

function Programaranestesiologo() {
  const [formData, setFormData] = useState({
    nombre: "",
    dia_anestesio: "",
    turno_anestesio: "",
    sala_anestesio: "",
    hora_inicio: "",
    hora_fin: ""
  });

  const [anesthesiologists, setAnesthesiologists] = useState([]); // Estado para almacenar los anestesiólogos

  const fetchActiveAnesthesiologists = async (inputValue) => {
    try {
      const response = await fetch(`http://localhost:4000/api/anestesiologos/activos?search=${inputValue}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data.map((anesthesiologist) => ({
        label: anesthesiologist.nombre_completo,
        value: anesthesiologist.nombre_completo
      }));
    } catch (error) {
      console.error("Error fetching active anesthesiologists:", error);
      return [];
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    if (name === "turno_anestesio") {
      switch (value) {
        case "Matutino":
          setFormData((prevFormData) => ({
            ...prevFormData,
            hora_inicio: "08:00",
            hora_fin: "14:00"
          }));
          break;
        case "Vespertino":
          setFormData((prevFormData) => ({
            ...prevFormData,
            hora_inicio: "14:01",
            hora_fin: "20:00"
          }));
          break;
        case "Nocturno":
          setFormData((prevFormData) => ({
            ...prevFormData,
            hora_inicio: "20:01",
            hora_fin: "06:00"
          }));
          break;
        default:
          setFormData((prevFormData) => ({
            ...prevFormData,
            hora_inicio: "",
            hora_fin: ""
          }));
      }
    }
  };

  const handleSelectChange = (selectedOption) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      nombre: selectedOption ? selectedOption.value : ""
    }));
  };

  const handleSaveAnesthesiologist = async () => {
    console.log("Formulario a enviar:", formData);
    try {
      const response = await fetch("http://localhost:4000/api/anestesio/anestesiologos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("Anesthesiologist saved successfully:", data);
      // Opcional: Actualizar la lista de anestesiólogos después de guardar uno nuevo
      fetchAnesthesiologists();
    } catch (error) {
      console.error("Error saving anesthesiologist:", error);
    }
  };

  const fetchAnesthesiologists = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/anestesio/anestesiologos");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setAnesthesiologists(data);
    } catch (error) {
      console.error("Error fetching anesthesiologists:", error);
    }
  };

  useEffect(() => {
    fetchAnesthesiologists();
  }, []);

  return (
    <Layout>
      <div className="flex flex-col gap-8 mb-8">
        <h1 className="text-xl font-semibold">Anestesiologos asignados</h1>
        <div className="flex my-4 space-x-4">
          <div>
            <Link
              to="/anestesiólogos"
              className="bg-[#001B58] hover:bg-[#001B58] text-white py-2 px-4 rounded inline-flex items-center"
            >
              <span>Ver agenda de anestesiologos</span>
            </Link>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex mb-2 space-x-4">
          <div className="w-1/4">
              <label className="block text-sm font-medium text-gray-700">Nombre de anestesiólogo</label>
              <AsyncSelect
                loadOptions={fetchActiveAnesthesiologists}
                onChange={handleSelectChange}
                placeholder="Nombre"
                className="mt-1 block w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-1/4">
              <label className="block text-sm font-medium text-gray-700">Asignar día</label>
              <input
                type="date"
                name="dia_anestesio"
                value={formData.dia_anestesio}
                onChange={handleInputChange}
                placeholder="dd/mm/aaaa"
                className="mt-1 block w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-1/4">
              <label className="block text-sm font-medium text-gray-700">Asignar turno</label>
              <select
                name="turno_anestesio"
                value={formData.turno_anestesio}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Seleccione el turno --</option>
                <option value="Matutino">Matutino</option>
                <option value="Vespertino">Vespertino</option>
                <option value="Nocturno">Nocturno</option>
              </select>
            </div>

            <div className="w-1/8">
              <label className="block text-sm font-medium text-gray-700">Hora Inicio</label>
              <input
                type="text"
                name="hora_inicio"
                value={formData.hora_inicio}
                readOnly
                className="mt-1 block w-full px-2 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-200 cursor-default"
              />
            </div>
            <div className="w-1/8">
              <label className="block text-sm font-medium text-gray-700">Hora Fin</label>
              <input
                type="text"
                name="hora_fin"
                value={formData.hora_fin}
                readOnly
                className="mt-1 block w-full px-2 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-200 cursor-default"
              />
            </div>

            <div className="w-1/4">
              <label className="block text-sm font-medium text-gray-700">Asignar sala</label>
              <select
                name="sala_anestesio"
                value={formData.sala_anestesio}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Seleccione la sala --</option>
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="T1">T1</option>
                <option value="T2">T2</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="E">E</option>
                <option value="H">H</option>
                <option value="RX">RX</option>
              </select>
            </div>
          </div>
          <div className="px-2 py-2 text-right">
            <button
              onClick={handleSaveAnesthesiologist}
              className="bg-[#001B58] text-white px-5 py-2 rounded-md hover:bg-blue-800"
            >
              Guardar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
            <thead className="bg-[#304678] text-white">
              <tr>
                <th className="px-4 py-3 text-center border-b border-gray-300">Nombre</th>
                <th className="px-4 py-3 text-center border-b border-gray-300">Día</th>
                <th className="px-4 py-3 text-center border-b border-gray-300">Turno</th>
                <th className="px-4 py-3 text-center border-b border-gray-300">Hora Inicio</th>
                <th className="px-4 py-3 text-center border-b border-gray-300">Hora Fin</th>
                <th className="px-4 py-3 text-center border-b border-gray-300">Sala</th>
              </tr>
            </thead>
            <tbody>
              {anesthesiologists.map((anesthesiologist) => (
                <tr key={anesthesiologist.id_anestesiologo} className="bg-blue-50 hover:bg-blue-300">
                  <td className="px-2 py-2 text-left border-b border-gray-300">{anesthesiologist.nombre}</td>
                  <td className="px-2 py-2 text-center border-b border-gray-300">{anesthesiologist.dia_anestesio}</td>
                  <td className="px-2 py-2 text-center border-b border-gray-300">{anesthesiologist.turno_anestesio}</td>
                  <td className="px-2 py-2 text-center border-b border-gray-300">{anesthesiologist.hora_inicio}</td>
                  <td className="px-2 py-2 text-center border-b border-gray-300">{anesthesiologist.hora_fin}</td>
                  <td className="px-2 py-2 text-center border-b border-gray-300">{anesthesiologist.sala_anestesio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

export default Programaranestesiologo;
