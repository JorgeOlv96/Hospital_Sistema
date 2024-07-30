import React, { useEffect, useState } from "react";
import { MenuSelect } from "../components/Form";
import { TbUser } from "react-icons/tb";
import { AiOutlinePoweroff } from "react-icons/ai";
import { MdOutlineNotificationsNone } from "react-icons/md";
import NotificationComp from "../components/NotificationComp";
import { useNavigate } from "react-router-dom";
import { BiMenu } from "react-icons/bi";
import MenuDrawer from "../components/Drawer/MenuDrawer";
import axios from "axios";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("Nombre no disponible");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await axios.get(
            `${process.env.REACT_APP_APP_BACK_SSQ}/auth/user`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const { nombre, ap_paterno, ap_materno } = response.data;
          setUserName(`${nombre} ${ap_paterno} ${ap_materno}`);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const toggleDrawer = () => {
    setIsOpen((prevState) => !prevState);
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Elimina el token del almacenamiento local
    setUserName("Nombre no disponible"); // Limpia el nombre de usuario
    navigate("/login"); // Redirige al usuario a la página de inicio de sesión
  };

  const DropDown1 = [
    {
      title: "Perfil",
      icon: TbUser,
      onClick: () => {
        navigate("/settings");
      },
    },
    {
      title: "Cerrar Sesión",
      icon: AiOutlinePoweroff,
      onClick: handleLogout, // Usa la función handleLogout
    },
  ];

  return (
    <>
      {isOpen && <MenuDrawer isOpen={isOpen} toggleDrawer={toggleDrawer} />}

      <div className="xl:w-5/6 w-full 2xl:max-w-[1640px] bg-dry grid md:grid-cols-2 grid-cols-12 items-center bg-opacity-95 fixed top-0 z-40 xs:px-8 px-2">
        <div className="md:col-span-1 sm:col-span-11 col-span-10 flex gap-4 items-center md:py-0 py-4">
          <button
            onClick={toggleDrawer}
            className="block xl:hidden border text-2xl bg-greyed w-16 md:w-12 h-12 rounded-md flex-colo text-textGray transitions hover:bg-border"
          >
            <BiMenu />
          </button>
        </div>
        <div className="md:col-span-1 sm:col-span-1 col-span-2 items-center justify-end pr-4 md:pr-0">
          <div className="float-right flex gap-4 items-center justify-center">
            <NotificationComp>
              <div className="relative">
                <MdOutlineNotificationsNone className="text-2xl hover:text-subMain" />
                <span className="absolute -top-2.5 -right-2.5 font-semibold bg-subMain rounded-full px-1.5 py-0.5 text-xs text-white text-center">
                  5
                </span>
              </div>
            </NotificationComp>

            <div className="items-center md:flex hidden">
              <MenuSelect datas={DropDown1}>
                <div className="flex gap-4 items-center p-4 rounded-lg">
                  <div className="w-10 h-10 rounded-full border border-dashed border-subMain flex items-center justify-center">
                    <FontAwesomeIcon icon={faUser} size="2x" />
                  </div>
                  <p className="text-sm text-textGray font-medium">
                    {isLoading ? "Cargando..." : userName}
                  </p>
                </div>
              </MenuSelect>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;
