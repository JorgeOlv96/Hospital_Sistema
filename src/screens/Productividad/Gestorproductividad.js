import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../Layout";
import * as XLSX from "xlsx";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./GestorManager.css"; // Asegúrate de tener los estilos CSS

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function GestorManager() {
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";

  const [historicoSolicitudes, setHistoricoSolicitudes] = useState([]);
  const [historicoAnestesiologos, setHistoricoAnestesiologos] = useState([]);
  const [especialidadesCount, setEspecialidadesCount] = useState([]);
  const [salasCount, setSalasCount] = useState([]);

  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const [viewMode, setViewMode] = useState("table");

  // Estado para controlar la expansión de las cards
  const [expandedCard, setExpandedCard] = useState(null);

  const fetchHistoricoSolicitudes = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/solicitudes`);
      setHistoricoSolicitudes(response.data);
      countEspecialidades(response.data);
      countSalas(response.data);
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

      if (!acc[especialidad]) {
        acc[especialidad] = {
          pendientes: 0,
          preprogramadas: 0,
          programadas: 0,
          realizadas: 0,
         // urgencia: 0,
          suspendidas: 0,          
        };
      }

      if (estado.toLowerCase() === "realizada") {
        acc[especialidad].realizadas += 1;
      } else if (estado.toLowerCase() === "programada") {
        acc[especialidad].programadas += 1;
      } else if (estado.toLowerCase() === "pendiente") {
        acc[especialidad].pendientes += 1;
      } else if (estado.toLowerCase() === "suspendida") {
        acc[especialidad].suspendidas += 1;
      } else if (estado.toLowerCase() === "pre-programada") {
        acc[especialidad].preprogramadas += 1;
      }

      return acc;
    }, {});

    setEspecialidadesCount(
      Object.entries(countMap).map(([especialidad, counts]) => ({
        especialidad,
        realizadas: counts.realizadas,
        programadas: counts.programadas,
        pendientes: counts.pendientes,
        suspendidas: counts.suspendidas,
        preprogramadas: counts.preprogramadas,
      }))
    );
  };

  const countSalas = (solicitudes) => {
    const countMap = solicitudes.reduce((acc, solicitud) => {
      const sala = solicitud.sala_quirofano || "Desconocida";
      if (!acc[sala]) {
        acc[sala] = { 
          pendientes: 0,
          preprogramadas: 0,
          programadas: 0,
          realizadas: 0,
          suspendidas: 0, 
        };
      }

      if (solicitud.estado_solicitud.toLowerCase() === "realizada") {
        acc[sala].realizadas += 1;
      } else if (solicitud.estado_solicitud.toLowerCase() === "programada") {
        acc[sala].programadas += 1;
      } else if (solicitud.estado_solicitud.toLowerCase() === "pendiente") {
        acc[sala].pendientes += 1;
      } else if (solicitud.estado_solicitud.toLowerCase() === "suspendida") {
        acc[sala].suspendidas += 1;
      } else if (solicitud.estado_solicitud.toLowerCase() === "pre-programada") {
        acc[sala].preprogramadas += 1;
      }


      return acc;
    }, {});

    setSalasCount(
      Object.entries(countMap).map(([sala, counts]) => ({
        sala,
        realizadas: counts.realizadas,
        programadas: counts.programadas,
        pendientes: counts.pendientes,
        suspendidas: counts.suspendidas,
        preprogramadas: counts.preprogramadas,
      }))
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
    const formattedDate = today.toISOString().slice(0, 10);
    const fileName = `Productividad_${formattedDate}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSolicitudes = historicoSolicitudes.slice(startIndex, endIndex);
  const paginatedAnestesiologos = historicoAnestesiologos.slice(
    startIndex,
    endIndex
  );
  const paginateespecialidadesCount = especialidadesCount.slice(
    startIndex,
    endIndex
  );
    // Paginación de datos
    const paginatedSalasCount = salasCount.slice(startIndex, endIndex);

  const chartData = {
    labels: especialidadesCount.map((item) => item.especialidad),
    datasets: [
      {
        label: "Realizadas",
        data: especialidadesCount.map((item) => item.realizadas),
        backgroundColor: "#63B3ED",
      },
      {
        label: "Programadas",
        data: especialidadesCount.map((item) => item.programadas),
        backgroundColor: "#68D391",
      },
      {
        label: "Pendientes",
        data: especialidadesCount.map((item) => item.pendientes),
        backgroundColor: "#ffc658",
      },
      {
        label: "Suspendidas",
        data: especialidadesCount.map((item) => item.suspendidas),
        backgroundColor: "#ff7300",
      },
      {
        label: "Preprogramadas",
        data: especialidadesCount.map((item) => item.preprogramadas),
        backgroundColor: "#06ABC9",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
          },
        },
      },
    },
  };

  const handleCardClick = (cardName) => {
    setExpandedCard(expandedCard === cardName ? null : cardName);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-xl font-semibold">Gestor de Productividad</h1>
      </div>
      <button className="export-button" onClick={exportToExcel}>
        Exportar a Excel
      </button>

      {/* Tarjeta para Histórico de Solicitudes */}
      <div
        className={`card ${expandedCard === "historico" ? "expanded" : ""}`}
        onClick={(e) => {
          // Evita cerrar el card si se hace clic en los botones de paginación
          if (!e.target.closest(".pagination-buttons")) {
            handleCardClick("historico");
          }
        }}
      >
        <h2 className="card-title">Histórico de Solicitudes</h2>
        <div
          className={`card-content ${
            expandedCard === "historico" ? "expanded" : ""
          }`}
        >
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

          {/* Botones de navegación */}
          <div className="pagination-buttons">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Anterior
            </button>
            <button
              disabled={
                page === Math.ceil(historicoSolicitudes.length / itemsPerPage)
              }
              onClick={() => setPage(page + 1)}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Tarjeta para Conteo de Especialidades */}
<div
  className={`card ${
    expandedCard === "especialidades" ? "expanded" : ""
  }`}
  onClick={(e) => {
    // Evita cerrar el card si se hace clic en los botones de vista
    if (!e.target.closest(".view-toggle") && !e.target.closest(".pagination-buttons")) {
      handleCardClick("especialidades");
    }
  }}
>
  <h2 className="card-title">Conteo de Especialidades</h2>
  {/* Mostrar los botones de vista solo si la tarjeta está expandida */}
  {expandedCard === "especialidades" && (
    <div className="view-toggle">
      <button
        className={viewMode === "table" ? "active" : ""}
        onClick={(e) => {
          e.stopPropagation(); // Previene que el clic en el botón de vista cierre la tarjeta
          setViewMode("table");
        }}
      >
        Tabla
      </button>
      <button
        className={viewMode === "chart" ? "active" : ""}
        onClick={(e) => {
          e.stopPropagation(); // Previene que el clic en el botón de vista cierre la tarjeta
          setViewMode("chart");
        }}
      >
        Gráfica
      </button>
    </div>
  )}
  <div
    className={`card-content ${
      expandedCard === "especialidades" ? "expanded" : ""
    }`}
  >
    {viewMode === "table" ? (
      <table className="historico-table">
        <thead>
          <tr>
            <th>Especialidad</th>
            <th>Pendientes</th>
            <th>Preprogramadas</th>
            <th>Programadas</th>
            <th>Realizadas</th>
            <th>Suspendidas</th>
          </tr>
        </thead>
        <tbody>
          {paginateespecialidadesCount.map((especialidad, index) => (
            <tr key={index}>
              <td>{especialidad.especialidad}</td>
              <td>{especialidad.pendientes}</td>
              <td>{especialidad.preprogramadas}</td>
              <td>{especialidad.programadas}</td>
              <td>{especialidad.realizadas}</td>
              <td>{especialidad.suspendidas}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <Bar data={chartData} options={chartOptions} />
    )}

    {/* Botones de navegación */}
    {expandedCard === "especialidades" && (
      <div className="pagination-buttons">
        <button
          disabled={page === 1}
          onClick={(e) => {
            e.stopPropagation(); // Previene que el clic en el botón de navegación cierre la tarjeta
            setPage(page - 1);
          }}
        >
          Anterior
        </button>
        <button
          disabled={
            page === Math.ceil(historicoSolicitudes.length / itemsPerPage)
          }
          onClick={(e) => {
            e.stopPropagation(); // Previene que el clic en el botón de navegación cierre la tarjeta
            setPage(page + 1);
          }}
        >
          Siguiente
        </button>
      </div>
    )}
  </div>
</div>


      {/* Tarjeta para Histórico de Anestesiologos */}
      <div
        className={`card ${
          expandedCard === "anestesiologos" ? "expanded" : ""
        }`}
        onClick={(e) => {
          // Evita cerrar el card si se hace clic en los botones de paginación
          if (!e.target.closest(".pagination-buttons")) {
            handleCardClick("anestesiologos");
          }
        }}
      >
        <h2 className="card-title">Histórico de Anestesiologos</h2>
        <div
          className={`card-content ${
            expandedCard === "anestesiologos" ? "expanded" : ""
          }`}
        >
          <table className="historico-table">
            <thead>
              <tr>
                <th>Nombre completo</th>
                <th>Turno</th>
                <th>Sala</th>
                <th>Fecha asignación</th>
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

          {/* Botones de navegación */}
          <div className="pagination-buttons">
            <button
              disabled={page === 1}
              onClick={(e) => {
                e.stopPropagation();
                setPage(page - 1);
              }}
            >
              Anterior
            </button>
            <button
              disabled={
                page ===
                Math.ceil(historicoAnestesiologos.length / itemsPerPage)
              }
              onClick={(e) => {
                e.stopPropagation();
                setPage(page + 1);
              }}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Tarjeta para Conteo de Salas */}
      <div>
      {/* Tarjeta para Conteo de Salas */}
      <div
        className={`card ${expandedCard === "salas" ? "expanded" : ""}`}
        onClick={(e) => {
          // Evita cerrar el card si se hace clic en los botones de navegación
          if (!e.target.closest(".pagination-buttons")) {
            handleCardClick("salas");
          }
        }}
      >
        <h2 className="card-title">Conteo de Salas</h2>
        <div
          className={`card-content ${expandedCard === "salas" ? "expanded" : ""}`}
        >
          <table className="historico-table">
            <thead>
              <tr>
                <th>Sala</th>
                <th>Pendientes</th>
                  <th>Preprogramadas</th>
                  <th>Programadas</th>
                  <th>Realizadas</th>
                  <th>Suspendidas</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSalasCount.map((sala, index) => (
                <tr key={index}>
                  <td>{sala.sala}</td>
                  <td>{sala.pendientes}</td>
                  <td>{sala.preprogramadas}</td>
                  <td>{sala.programadas}</td>
                  <td>{sala.realizadas}</td>
                  <td>{sala.suspendidas}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Botones de navegación */}
          <div className="pagination-buttons">
            <button
              disabled={page === 1}
              onClick={(e) => {
                e.stopPropagation(); // Evita que se cierre el card
                setPage(page - 1);
              }}
            >
              Anterior
            </button>
            <button
              disabled={page === Math.ceil(salasCount.length / itemsPerPage)}
              onClick={(e) => {
                e.stopPropagation(); // Evita que se cierre el card
                setPage(page + 1);
              }}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
}

export default GestorManager;
