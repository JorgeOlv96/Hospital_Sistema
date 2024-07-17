import React, { useEffect, useState } from 'react';
import Layout from '../Layout';
import {
  BsArrowDownLeft,
  BsArrowDownRight,
  BsArrowUpRight,
  BsCheckCircleFill,
  BsClockFill,
  BsXCircleFill,
} from 'react-icons/bs';
import { DashboardBigChart, DashboardSmallChart } from '../components/Charts';
import { Transactiontable } from '../components/Tables';
import { Link } from 'react-router-dom';
import axios from 'axios';

const initialDashboardCards = [
  {
    id: 1,
    title: 'Totales',
    icon: BsCheckCircleFill,
    value: 0,
    percent: 0,
    color: ['bg-subMain', 'text-subMain', '#66B5A3'],
    datas: [],
  },
  {
    id: 2,
    title: 'Por aprobar',
    icon: BsClockFill,
    value: 0,
    percent: 0,
    color: ['bg-yellow-500', 'text-yellow-500', '#F9C851'],
    datas: [],
  },
  {
    id: 3,
    title: 'Realizadas',
    icon: BsCheckCircleFill,
    value: 0,
    percent: 0,
    color: ['bg-green-500', 'text-green-500', '#34C759'],
    datas: [],
  },
  {
    id: 4,
    title: 'Suspendidas',
    icon: BsXCircleFill,
    value: 0,
    percent: 0,
    color: ['bg-red-500', 'text-red-500', '#FF3B30'],
    datas: [],
  },
];

function Dashboard() {
  const [userName, setUserName] = useState('Nombre no disponible');
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardCards, setDashboardCards] = useState(initialDashboardCards);
  const [solicitudes, setSolicitudes] = useState([]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:4000/api/auth/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const { nombre, ap_paterno, ap_materno } = response.data;
        setUserName(`${nombre} ${ap_paterno} ${ap_materno}`);
      } catch (error) {
        console.error('Error fetching user info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/solicitudes');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Fetched solicitudes for dashboard:', data); // Agregar este log
        setSolicitudes(data);
      } catch (error) {
        console.error('Error fetching solicitudes:', error);
      }
    };

    fetchSolicitudes();
  }, []);

  return (
    <Layout>
      {/* Welcome message */}
      <div className="bg-gradient-to-r from-[#365b77] to-[#7498b6] text-white px-6 py-4 rounded-lg shadow-lg mb-6 flex items-center">
        <span className="text-lg font-semibold">
          {isLoading ? 'Cargando...' : `¡Bienvenido, ${userName}! Estamos contentos de verte.`}
        </span>
      </div>
      {/* boxes */}
      <div className="w-full grid xl:grid-cols-4 gap-6 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1">
        {dashboardCards.map((card, index) => (
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
                {/* statistc */}
                <DashboardSmallChart data={card.datas} colors={card.color[2]} />
              </div>
              <div className="flex flex-col gap-4 col-span-3">
                <h4 className="text-md font-medium">
                  {card.value}
                  {card.id === 4 ? '$' : '+'}
                </h4>
                <p className={`text-sm flex gap-2 ${card.color[1]}`}>
                  {card.percent > 50 && <BsArrowUpRight />}
                  {card.percent > 30 && card.percent < 50 && (
                    <BsArrowDownRight />
                  )}
                  {card.percent < 30 && <BsArrowDownLeft />}
                  {card.percent.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default Dashboard;
