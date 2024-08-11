import React, { useEffect, useState, useContext } from "react";
import Layout from "../Layout";
import { BsCheckCircleFill, BsClockFill, BsXCircleFill, BsFillCalendarCheckFill } from "react-icons/bs";
import axios from "axios";
import { DashboardSmallChart } from "../components/Charts";
import { AuthContext } from "../AuthContext";


const initialDashboardCards = [
  {
    id: 1,
    title: "Totales",
    icon: BsCheckCircleFill,
    value: 0,
    color: ["bg-subMain", "text-subMain", "#66B5A3"],
  },
  {
    id: 2,
    title: "Pre-programadas",
    icon: BsClockFill,
    value: 0,
    color: ["bg-[#06ABC9]", "text-[#06ABC9]", "#06ABC9"],
  },
  {
    id: 3,
    title: "Realizadas",
    icon: BsCheckCircleFill,
    value: 0,
    color: ["bg-green-500", "text-green-500", "#34C759"],
  },
  {
    id: 4,
    title: "Suspendidas",
    icon: BsXCircleFill,
    value: 0,
    color: ["bg-[#F6E05E]", "text-[#F6E05E]", "#F6E05E"],
  },
  {
    id: 5,
    title: "Realizadas este mes",
    icon: BsFillCalendarCheckFill,
    value: 0,
    color: ["bg-blue-500", "text-blue-500", "#1E90FF"],
  },
];

function Dashboard() {
  const [userName, setUserName] = useState("Nombre no disponible");
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardCards, setDashboardCards] = useState(initialDashboardCards);
  const { user } = useContext(AuthContext);
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || 'http://localhost:4000';

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${baseURL}/api/auth/user`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const { nombre, ap_paterno, ap_materno } = response.data;
        setUserName(`${nombre} ${ap_paterno} ${ap_materno}`);
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    const fetchSolicitudesCount = async () => {
      try {
        const endpoints = {
          totales: `${baseURL}/api/solicitudes`,
          preprogramadas:
            `${baseURL}/api/solicitudes/preprogramadas`,
          realizadas: `${baseURL}/api/solicitudes/realizadas`,
          suspendidas: `${baseURL}/api/solicitudes/suspendidas`,
          realizadasMes: `${baseURL}/api/solicitudes/realizadasMes`,
        };

        const [
          totalesResponse,
          preprogramadasResponse,
          realizadasResponse,
          suspendidasResponse,
          realizadasMesResponse,
        ] = await Promise.all(
          Object.values(endpoints).map((endpoint) => axios.get(endpoint))
        );

        const totalesCount = totalesResponse.data.length;
        const preprogramadasCount = preprogramadasResponse.data.length;
        const realizadasCount = realizadasResponse.data.length;
        const suspendidasCount = suspendidasResponse.data.length;
        const realizadasMesCount = realizadasMesResponse.data.length;

        const updatedCards = initialDashboardCards.map((card) => {
          switch (card.title) {
            case "Totales":
              return { ...card, value: totalesCount };
            case "Pre-programadas":
              return { ...card, value: preprogramadasCount };
            case "Realizadas":
              return { ...card, value: realizadasCount };
            case "Suspendidas":
              return { ...card, value: suspendidasCount };
            case "Realizadas este mes":
                return { ...card, value: realizadasMesCount };
            default:
              return card;
          }
        });

        console.log("Updated Cards:", updatedCards);

        setDashboardCards(updatedCards);
      } catch (error) {
        console.error(
          "Error fetching solicitudes count:",
          error.response ? error.response.data : error.message
        );
      }
    };

    fetchSolicitudesCount();
  }, []);

  return (
    <Layout>
      <div
        data-aos="fade-right"
        data-aos-duration="1000"
        data-aos-delay="100"
        data-aos-offset="200"
      >
      {/* Welcome message */}
      <div
      data-aos="fade-right"
      data-aos-duration="1000"
      data-aos-delay="100"
      data-aos-offset="200"
      >
      <div className="bg-gradient-to-r from-[#365b77] to-[#7498b6] text-white px-6 py-4 rounded-lg shadow-lg mb-6 flex items-center">
        <span className="text-lg font-semibold">
          {isLoading
            ? "Cargando..."
            : `¡Bienvenido, ${userName}! Estamos contentos de verte.`}
        </span>
      </div>
      {/* Debug display */}
      
      {/* boxes */}
      <div className="w-full grid xl:grid-cols-4 gap-6 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1">
        {dashboardCards.map((card) => (
          <div
            key={card.id}
            className="bg-white rounded-xl border-[1px] border-border p-5 shadow-md transition-transform transform hover:scale-105"
          >
            <div className="flex gap-4 items-center">
              <div
                className={`w-10 h-10 flex-colo bg-opacity-10 rounded-md ${card.color[1]} ${card.color[0]}`}
              >
                <card.icon />
              </div>
              <h2 className="text-sm font-medium">{card.title}</h2>
            </div>
            <div className="grid grid-cols-8 gap-4 mt-4 bg-dry py-5 px-8 items-center rounded-xl">
              <div className="col-span-5">
                {/* statistic */}
                <DashboardSmallChart
                  data={[card.value]}
                  colors={card.color[2]}
                />
              </div>
              <div className="flex flex-col gap-4 col-span-3">
                <h4 className="text-md font-medium">{card.value}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
