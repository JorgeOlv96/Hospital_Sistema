import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../Layout";
import * as XLSX from "xlsx";
import "./GestorManager.css"; // Asegúrate de tener los estilos CSS

function GestorManager() {
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";

  const [historicoSolicitudes, setHistoricoSolicitudes] = useState([]);
  const [historicoAnestesiologos, setHistoricoAnestesiologos] = useState([]);
  const [especialidadesCount, setEspecialidadesCount] = useState([]);
  const [salasCount, setSalasCount] = useState([]);

  // Estados para la paginación
  const [page, setPage] = useState(1);
  const itemsPerPage = 10; // Número de elementos por página

  const fetchHistoricoSolicitudes = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/solicitudes`);
      setHistoricoSolicitudes(response.data);
      countEspecialidades(response.data); // Actualiza el conteo de especialidades cuando se obtienen las solicitudes
      countSalas(response.data); // Actualiza el conteo de salas cuando se obtienen las solicitudes
    } catch (err) {
      console.error("Error fetching historico solicitudes:", err);
    }
  };

  const fetchHistoricoAnestesiologos = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/api/anestesio/anestesiologos`
      );
      setHistoricoAnestesiologos(response.data);
    } catch (err) {
      console.error("Error fetching historico anestesiologos:", err);
    }
  };

  useEffect(() => {
    fetchHistoricoSolicitudes();
    fetchHistoricoAnestesiologos();
  }, []);

  const countEspecialidades = (solicitudes) => {
    const countMap = solicitudes.reduce((acc, solicitud) => {
      const especialidad = solicitud.nombre_especialidad || "Desconocida";
      const estado = solicitud.estado_solicitud || "Desconocido";
      
      // Inicializa el contador para la especialidad si no existe
      if (!acc[especialidad]) {
        acc[especialidad] = { realizadas: 0, programadas: 0, pendientes: 0, suspendidas: 0, preprogramadas: 0 };
      }
  
      // Contar según el estado
      if (estado.toLowerCase() === "realizada") {
        acc[especialidad].realizadas += 1;
      } else if (estado.toLowerCase() === "programada") {
        acc[especialidad].programadas += 1;
      } else if (estado.toLowerCase() === "pendiente") {
        acc[especialidad].pendientes += 1;
      } else if (estado.toLowerCase() === "suspendida") {
        acc[especialidad].suspendidas += 1;
      }  else if (estado.toLowerCase() === "pre-programada") {
        acc[especialidad].preprogramadas += 1;
      } 
  
      return acc;
    }, {});
  
    console.log("Conteo por especialidad:", countMap); // Agrega logging para verificar los datos
  
    setEspecialidadesCount(Object.entries(countMap).map(([especialidad, counts]) => ({
      especialidad,
      realizadas: counts.realizadas,
      programadas: counts.programadas,
      pendientes: counts.pendientes,
      suspendidas: counts.suspendidas,
      preprogramadas: counts.preprogramadas, 
    })));
  };
  

  const countSalas = (solicitudes) => {
    const countMap = solicitudes.reduce((acc, solicitud) => {
      const sala = solicitud.sala_quirofano || "Desconocida";
      acc[sala] = (acc[sala] || 0) + 1;
      return acc;
    }, {});

    setSalasCount(
      Object.entries(countMap).map(([sala, count]) => ({ sala, count }))
    );
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    const solicitudesSheet = XLSX.utils.json_to_sheet(historicoSolicitudes);
    const anestesiologosSheet = XLSX.utils.json_to_sheet(
      historicoAnestesiologos
    );

    XLSX.utils.book_append_sheet(workbook, solicitudesSheet, "Solicitudes");
    XLSX.utils.book_append_sheet(
      workbook,
      anestesiologosSheet,
      "Anestesiologos"
    );

    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10); // Formato: YYYY-MM-DD
    const fileName = `Productividad_${formattedDate}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  // Cálculo de paginación
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSolicitudes = historicoSolicitudes.slice(startIndex, endIndex);
  const paginatedAnestesiologos = historicoAnestesiologos.slice(
    startIndex,
    endIndex
  );

  return (
    <Layout>
      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-xl font-semibold">Gestor de Productividad</h1>
      </div>
      <button className="export-button" onClick={exportToExcel}>
        Exportar a Excel
      </button>
      <section className="historico-solicitudes">
        <h2 className="section-title">Histórico de Solicitudes</h2>
        <table className="historico-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre paciente</th>
              <th>Estado</th>
              <th>Fecha creación</th>
              <th>Fecha solicitada</th>
              <th>Fecha programada</th>
              <th>Sala quirófano</th>
              <th>Nombre Especialidad</th>
              <th>Nombre cirujano</th>
              <th>Nombre anestesiologo</th>
              <th>Enf. Quirúrgica</th>
              <th>Enf. Circulante</th>
              <th>Rep.</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSolicitudes.map((historico, index) => (
              <tr key={index}>
                <td>{historico.folio}</td>
                <td>{`${historico.nombre_paciente} ${historico.ap_paterno} ${historico.ap_materno}`}</td>
                <td>{historico.estado_solicitud || "Por definir"}</td>
                <td>{historico.fecha_solicitud || "Por definir"}</td>
                <td>{historico.fecha_solicitada || "Por definir"}</td>
                <td>{historico.fecha_programada || "Por definir"}</td>
                <td>{historico.sala_quirofano || "Por definir"}</td>
                <td>{historico.nombre_especialidad || "Por definir"}</td>
                <td>{historico.nombre_cirujano || "Por definir"}</td>
                <td>{historico.nombre_anestesiologo || "Por definir"}</td>
                <td>{historico.enf_quirurgica || "Por definir"}</td>
                <td>{historico.enf_circulante || "Por definir"}</td>
                <td>{historico.reprogramaciones || "Por definir"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <div className="section-separator"></div> {/* Separador */}
      <section className="historico-anestesiologos">
        <h2 className="section-title">Histórico de Anestesiólogos</h2>
        <table className="historico-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Turno</th>
              <th>Sala</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAnestesiologos.map((historico, index) => (
              <tr key={index}>
                <td>{historico.nombre}</td>
                <td>{historico.turno_anestesio}</td>
                <td>{historico.sala_anestesio}</td>
                <td>{historico.dia_anestesio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <div className="section-separator"></div> {/* Separador */}
      <section className="especialidades-count">
        <h2 className="section-title">
          Conteo de Solicitudes por Especialidad
        </h2>
        <table className="historico-table">
          <thead>
            <tr>
              <th>Especialidad</th>
              <th>Realizadas</th>
              <th>Programadas</th>
              <th>Pendiente</th>
              <th>Suspendidas</th>
              <th>Pre-programada</th>
            </tr>
          </thead>
          <tbody>
            {especialidadesCount.map((item, index) => (
              <tr key={index}>
                <td>{item.especialidad}</td>
                <td>{item.realizadas}</td>
                <td>{item.programadas}</td>
                <td>{item.pendientes}</td>
                <td>{item.suspendidas}</td>
                <td>{item.preprogramadas}</td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {/* Paginación */}
      <div className="pagination">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className={`${
            page === 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#365b77] hover:bg-[#7498b6]"
          } text-white font-semibold py-2 px-6 rounded-full shadow-md transition-all duration-300 ease-in-out transform hover:scale-105`}
        >
          &#8592;
        </button>
        <span className="text-lg font-semibold text-gray-800">
          Página {page}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={endIndex >= historicoAnestesiologos.length}
          className={`${
            endIndex >= historicoAnestesiologos.length
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#365b77] hover:bg-[#7498b6]"
          } text-white font-semibold py-2 px-6 rounded-full shadow-md transition-all duration-300 ease-in-out transform hover:scale-105`}
        >
          &#8594;
        </button>
      </div>
    </Layout>
  );
}

export default GestorManager;
