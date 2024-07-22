import React, { useState, useEffect } from "react";
import Layout from "../../Layout";
import AsyncSelect from "react-select/async";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Programaranestesiologo() {
  const [formData, setFormData] = useState({
    nombre: "",
    dia_anestesio: "",
    turno_anestesio: "",
    sala_anestesio: "",
    hora_inicio: "",
    hora_fin: "",
  });

  const [anesthesiologists, setAnesthesiologists] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [anesthesiologistsPerPage] = useState(10);

  const fetchActiveAnesthesiologists = async (inputValue) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/anestesiologos/activos?search=${inputValue}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data.map((anesthesiologist) => ({
        label: anesthesiologist.nombre_completo,
        value: anesthesiologist.nombre_completo,
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
            hora_fin: "14:00",
          }));
          break;
        case "Vespertino":
          setFormData((prevFormData) => ({
            ...prevFormData,
            hora_inicio: "14:00",
            hora_fin: "20:00",
          }));
          break;
        case "Nocturno":
          setFormData((prevFormData) => ({
            ...prevFormData,
            hora_inicio: "20:00",
            hora_fin: "06:00",
          }));
          break;
        default:
          setFormData((prevFormData) => ({
            ...prevFormData,
            hora_inicio: "",
            hora_fin: "",
          }));
      }
    }
  };

  const handleSelectChange = (selectedOption) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      nombre: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleSaveAnesthesiologist = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/anestesio/anestesiologos",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("Anesthesiologist saved successfully:", data);

      // Mostrar notificación de éxito
      toast.success("¡Anestesiólogo asignado con éxito!");

      // Limpiar el formulario
      setFormData({
        nombre: "",
        dia_anestesio: "",
        turno_anestesio: "",
        sala_anestesio: "",
        hora_inicio: "",
        hora_fin: "",
      });

      // Actualizar la lista de anestesiólogos después de guardar uno nuevo
      fetchAnesthesiologists();
    } catch (error) {
      console.error("Error saving anesthesiologist:", error);
      // Mostrar notificación de error
      toast.error("Error al guardar el anestesiólogo");
    }
  };

  const fetchAnesthesiologists = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/anestesio/anestesiologos"
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      // Ordenar por fecha más reciente a más antigua
      data.sort(
        (a, b) => new Date(b.fecha_asignacion) - new Date(a.fecha_asignacion)
      );
      setAnesthesiologists(data);
    } catch (error) {
      console.error("Error fetching anesthesiologists:", error);

      toast.error("Error al guardar el anestesiólogo");
    }
  };

  useEffect(() => {
    fetchAnesthesiologists();
  }, []);

  // Calcular índices para la paginación
  const indexOfLastAnesthesiologist = currentPage * anesthesiologistsPerPage;
  const indexOfFirstAnesthesiologist =
    indexOfLastAnesthesiologist - anesthesiologistsPerPage;
  const currentAnesthesiologists = anesthesiologists.slice(
    indexOfFirstAnesthesiologist,
    indexOfLastAnesthesiologist
  );

  // Cambiar página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Layout>
      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-xl font-semibold">Anestesiólogos asignados</h1>
        <div className="my-4">
          <div>
            <Link
              to="/anestesiólogos"
              className="bg-[#365b77] hover:bg-[#7498b6] text-white py-2 px-4 rounded inline-flex items-center"
            >
              <span>Ver agenda de anestesiólogos</span>
            </Link>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex flex-col">
            <div className="flex mb-2 space-x-4">
              <div className="w-1/4">
              <label style={{ marginBottom: "30px" }} className="text-sm font-medium text-gray-700">
                  Nombre de anestesiólogo
                </label>
                <AsyncSelect
                  loadOptions={fetchActiveAnesthesiologists}
                  onChange={handleSelectChange}
                  placeholder="Nombre"
                  className="rounded-lg w-full cursor-pointer text-sm"
                  style={{ minHeight: "auto" }}
                />
              </div>

              <div className="w-1/4">
                <label className="block text-sm font-medium text-gray-700">
                  Asignar día
                </label>
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
                <label className="block text-sm font-medium text-gray-700">
                  Asignar turno
                </label>
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
                <label className="block text-sm font-medium text-gray-700">
                  Hora Inicio
                </label>
                <input
                  type="text"
                  name="hora_inicio"
                  value={formData.hora_inicio}
                  readOnly
                  className="mt-1 block w-full px-2 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-200 cursor-default"
                />
              </div>
              <div className="w-1/8">
                <label className="block text-sm font-medium text-gray-700">
                  Hora Fin
                </label>
                <input
                  type="text"
                  name="hora_fin"
                  value={formData.hora_fin}
                  readOnly
                  className="mt-1 block w-full px-2 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-200 cursor-default"
                />
              </div>

              <div className="w-1/4">
                <label className="block text-sm font-medium text-gray-700">
                  Asignar sala
                </label>
                <select
                  name="sala_anestesio"
                  value={formData.sala_anestesio}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Seleccione la sala --</option>
                  <option value="A1">Sala A1</option>
                  <option value="A2">Sala A2</option>
                  <option value="T1">Sala T1</option>
                  <option value="T2">Sala T2</option>
                  <option value="1">Sala 1</option>
                  <option value="2">Sala 2</option>
                  <option value="3">Sala 3</option>
                  <option value="4">Sala 4</option>
                  <option value="5">Sala 5</option>
                  <option value="6">Sala 6</option>
                  <option value="E">Sala E</option>
                  <option value="H">Sala H</option>
                  <option value="RX">Sala RX</option>

                  <option value="Rec_Matutino">Recuperación Matutino</option>
                  <option value="Con_Ext_P1_mat">
                    Consulta Externa Piso 1
                  </option>
                  <option value="Con_Ext_P2_mat">
                    Consulta Externa Piso 2
                  </option>
                  <option value="Rec_Vespertino">
                    Recuperación Vespertino
                  </option>
                  <option value="Con_Ext_P1_vesp">
                    Consulta Externa Piso 1
                  </option>
                  <option value="Con_Ext_P2_vesp">
                    Consulta Externa Piso 2
                  </option>
                </select>
              </div>
            </div>
            <div className="px-2 py-2 text-right">
              <button
                onClick={handleSaveAnesthesiologist}
                className="bg-[#365b77] text-white px-5 py-2 rounded-md hover:bg-[#7498b6]"
              >
                Guardar
              </button>
            </div>
          </div>

          <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Nombre
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Día asignado
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Turno asignado
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Sala asignada
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Hora inicio
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Hora fin
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentAnesthesiologists.map((anesthesiologist) => (
                  <tr key={anesthesiologist.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {anesthesiologist.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {anesthesiologist.dia_anestesio}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {anesthesiologist.turno_anestesio}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {anesthesiologist.sala_anestesio}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {anesthesiologist.hora_inicio}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {anesthesiologist.hora_fin}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() =>
                    setCurrentPage((prevPage) =>
                      prevPage > 1 ? prevPage - 1 : prevPage
                    )
                  }
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prevPage) =>
                      prevPage <
                      Math.ceil(
                        anesthesiologists.length / anesthesiologistsPerPage
                      )
                        ? prevPage + 1
                        : prevPage
                    )
                  }
                  disabled={
                    currentPage ===
                    Math.ceil(
                      anesthesiologists.length / anesthesiologistsPerPage
                    )
                  }
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Página <span className="font-medium">{currentPage}</span> de{" "}
                    <span className="font-medium">
                      {Math.ceil(
                        anesthesiologists.length / anesthesiologistsPerPage
                      )}
                    </span>{" "}
                    • Resultados{" "}
                    <span className="font-medium">
                      {anesthesiologists.length}
                    </span>
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() =>
                        setCurrentPage((prevPage) =>
                          prevPage > 1 ? prevPage - 1 : prevPage
                        )
                      }
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Anterior</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.293 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 111.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((prevPage) =>
                          prevPage <
                          Math.ceil(
                            anesthesiologists.length / anesthesiologistsPerPage
                          )
                            ? prevPage + 1
                            : prevPage
                        )
                      }
                      disabled={
                        currentPage ===
                        Math.ceil(
                          anesthesiologists.length / anesthesiologistsPerPage
                        )
                      }
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Siguiente</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9.707 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586L9.707 6.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Mostrar notificaciones */}
        <ToastContainer position="bottom-right" />
      </div>
    </Layout>
  );
}

export default Programaranestesiologo;
