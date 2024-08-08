import React, { useEffect, useState, useContext } from "react";
import Layout from "../Layout";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from "axios";
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from "../AuthContext";

function Settings() {
  const [userInfo, setUserInfo] = useState({
    nombre: "Nombre no disponible",
    apPaterno: "",
    apMaterno: "",
    email: "Correo no disponible",
  });
  const [isLoading, setIsLoading] = useState(true);
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
        const { nombre, ap_paterno: apPaterno, ap_materno: apMaterno, email } = response.data;
        setUserInfo({ nombre, apPaterno, apMaterno, email });
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [baseURL]);

  return (
    <Layout>
      <div
        data-aos="fade-right"
        data-aos-duration="1000"
        data-aos-delay="100"
        data-aos-offset="200"
      >
      <h1 className="text-xl font-semibold">Perfil</h1>
      <div className="grid grid-cols-12 gap-6 my-8 items-start">
        <div
          data-aos="fade-right"
          data-aos-duration="1000"
          data-aos-delay="100"
          data-aos-offset="200"
          className="col-span-12 lg:col-span-12 bg-gradient-to-r from-[#365b77] to-[#7498b6] text-white rounded-xl p-8 flex flex-col items-center justify-center shadow-lg"
        >
          <div className="w-40 h-40 rounded-full border-4 border-white flex items-center justify-center mb-6">
            <FontAwesomeIcon icon={faUser} size="4x" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">
              {userInfo.nombre} {userInfo.apPaterno} {userInfo.apMaterno}
            </h2>
            <p className="text-lg">{userInfo.email}</p>
          </div>
        </div>
      </div>
      </div>
    </Layout>
  );
}

export default Settings;
