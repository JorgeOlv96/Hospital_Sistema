import React, { useEffect, useState, useContext } from "react";
import Layout from "../Layout";
import {
  BsCheckCircleFill,
  BsClockFill,
  BsXCircleFill,
  BsFillCalendarCheckFill,
  BsChevronLeft,
  BsChevronRight,
} from "react-icons/bs";
import axios from "axios";
import { DashboardSmallChart } from "../components/Charts";
import { AuthContext } from "../AuthContext";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Dashboard.css";

import AnesthesiologistsByShiftCard from '../components/CardsAnestesios/AnesthesiologistsByShiftCard'
import AssignmentsPerDayChart from '../components/CardsAnestesios/AssignmentsPerDayChart';
import AnesthesiologistsBySpecialtyCard from '../components/CardsAnestesios/AnesthesiologistsBySpecialtyCard';
import SuspensionReasonsChart from "../components/CardsAnestesios/SuspensionReasonsChart";
import SurgeriesBySpecialtyCard from "../components/CardsAnestesios/SurgeriesBySpecialtyCard ";
import SurgeriesByRoomChart from "../components/CardsAnestesios/SurgeriesByRoomChart";
import SolicitudesProgramadasPorEspecialidadCard from "../components/CardsAnestesios/SolicitudesProgramadasPorEspecialidadCard";
import SolicitudesPendientesPorEspecialidadCard from "../components/CardsAnestesios/SolicitudesPendientesPorEspecialidadCard";
import SurgeryStatsTable from "../components/CardsAnestesios/SurgeryStatsTable";


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
  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${baseURL}/api/auth/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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
          preprogramadas: `${baseURL}/api/solicitudes/preprogramadas`,
          realizadas: `${baseURL}/api/solicitudes/realizadas`,
          suspendidas: `${baseURL}/api/solicitudes/suspendidas`,
          realizadasMes: `${baseURL}/api/solicitudes/realizadasMes`,
        };

        const responses = await Promise.all(
          Object.values(endpoints).map((endpoint) => axios.get(endpoint))
        );

        const processData = (data) => {
          // Primero filtramos las solicitudes eliminadas
          const solicitudesActivas = data.filter(solicitud => 
            solicitud.estado_solicitud !== 'Eliminada'
          );
          
          // Luego aplicamos el filtro por especialidad si existe
          if (user?.especialidad) {
            return solicitudesActivas.filter(solicitud => 
              solicitud.nombre_especialidad === user.especialidad
            );
          }
          return solicitudesActivas;
        };
        
        const [
          totalesResponse,
          preprogramadasResponse,
          realizadasResponse,
          suspendidasResponse,
          realizadasMesResponse,
        ] = responses;
        
        // Aplicar filtros
        const totalesFiltradas = processData(totalesResponse.data);
        const preprogramadasFiltradas = processData(preprogramadasResponse.data);
        const realizadasFiltradas = processData(realizadasResponse.data);
        const suspendidasFiltradas = processData(suspendidasResponse.data);
        const realizadasMesFiltradas = processData(realizadasMesResponse.data);

        const updatedCards = initialDashboardCards.map((card) => {
          switch (card.title) {
            case "Totales":
              return { 
                ...card, 
                value: totalesFiltradas.length,
                title: user?.especialidad ? `Totales - ${user.especialidad}` : "Totales" 
              };
            case "Pre-programadas":
              return { 
                ...card, 
                value: preprogramadasFiltradas.length,
                title: user?.especialidad ? `Pre-programadas - ${user.especialidad}` : "Pre-programadas" 
              };
            case "Realizadas":
              return { 
                ...card, 
                value: realizadasFiltradas.length,
                title: user?.especialidad ? `Realizadas - ${user.especialidad}` : "Realizadas" 
              };
            case "Suspendidas":
              return { 
                ...card, 
                value: suspendidasFiltradas.length,
                title: user?.especialidad ? `Suspendidas - ${user.especialidad}` : "Suspendidas" 
              };
            case "Realizadas este mes":
              return { 
                ...card, 
                value: realizadasMesFiltradas.length,
                title: user?.especialidad ? `Realizadas este mes - ${user.especialidad}` : "Realizadas este mes" 
              };
            default:
              return card;
          }
        });

        setDashboardCards(updatedCards);
      } catch (error) {
        console.error(
          "Error fetching solicitudes count:",
          error.response ? error.response.data : error.message
        );
      }
    };

    fetchSolicitudesCount();
  }, [user?.especialidad]); // Agregamos user.especialidad como dependencia

  const CustomPrevArrow = (props) => {
    const { className, onClick } = props;
    return (
      <div className={`${className} custom-arrow`} onClick={onClick}>
        <BsChevronLeft />
      </div>
    );
  };
  
  const CustomNextArrow = (props) => {
    const { className, onClick } = props;
    return (
      <div className={`${className} custom-arrow`} onClick={onClick}>
        <BsChevronRight />
      </div>
    );
  };

  const carouselSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 800,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };
  
  
  return (
    <Layout>
      <div data-aos="fade-right" data-aos-duration="1000" data-aos-delay="100" data-aos-offset="200">
        <div className="bg-gradient-to-r from-[#365b77] to-[#7498b6] text-white px-6 py-4 rounded-lg shadow-lg mb-6 flex items-center">
          <span className="text-lg font-semibold">
            {isLoading ? "Cargando..." : `¡Bienvenido, ${userName}! ${user?.especialidad ? `- Especialidad: ${user.especialidad}` : ''}`}
          </span>
        </div>
        <div className="w-full">
          <Slider {...carouselSettings}>
            {dashboardCards.map((card) => (
              <div key={card.id} className="bg-white rounded-xl border-[1px] border-border p-5 shadow-md card-zoom">
                <div className="flex gap-4 items-center">
                  <div className={`w-10 h-10 flex-colo bg-opacity-10 rounded-md ${card.color[1]} ${card.color[0]}`}>
                    <card.icon />
                  </div>
                  <h2 className="text-sm font-medium">{card.title}</h2>
                </div>
                <div className="grid grid-cols-8 gap-4 mt-4 bg-dry py-5 px-8 items-center rounded-xl">
                  <div className="col-span-5">
                    <DashboardSmallChart data={[card.value]} colors={card.color[2]} />
                  </div>
                  <div className="flex flex-col gap-4 col-span-3">
                    <h4 className="text-md font-medium">{card.value}</h4>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <div className="lg:col-span-3">
          <SurgeryStatsTable />
        </div>
        <SurgeriesByRoomChart />
        <SolicitudesProgramadasPorEspecialidadCard />
        <SurgeriesBySpecialtyCard />
        <div className="lg:col-span-3">
          <SolicitudesPendientesPorEspecialidadCard />
        </div>
        <div className="lg:col-span-3">
          <SuspensionReasonsChart />
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;