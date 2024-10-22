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
  const { user } = useContext(AuthContext); // Aquí está el 'user' desde el AuthContext
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
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

  const handlePasswordChange = () => {
    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden");
      return;
    }

    const token = localStorage.getItem("token");

    if (!user?.id) {  // Verifica que 'user' y 'user.id' existan
      console.error("No se pudo obtener el ID del usuario");
      setErrorMessage("Error: no se pudo obtener el ID del usuario");
      return;
    }

    axios.patch(`${baseURL}/api/users/password/${user.id}`, 
      { 
        newPassword: password,
        confirmPassword: confirmPassword  // Añade este campo
      }, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
      .then(response => {
        alert("Contraseña actualizada correctamente");
        setShowPasswordForm(false);
        setPassword("");
        setConfirmPassword("");
        setErrorMessage("");
      })
      .catch(error => {
        // Mejora el manejo de errores para mostrar el mensaje específico del backend
        const errorMessage = error.response?.data?.message || "Hubo un error al actualizar la contraseña";
        console.error("Error actualizando la contraseña:", error);
        setErrorMessage(errorMessage);
      });
  };

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

        {/* Botón Cambiar Contraseña */}
        <div className="text-center">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            onClick={() => setShowPasswordForm(true)}
          >
            Cambiar contraseña
          </button>
        </div>

        {/* Formulario para cambiar contraseña */}
        {showPasswordForm && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Cambiar contraseña</h3>
            <div className="grid grid-cols-1 gap-4">
              <input
                type="password"
                placeholder="Nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border rounded px-4 py-2"
              />
              <input
                type="password"
                placeholder="Confirmar nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border rounded px-4 py-2"
              />
              {errorMessage && <p className="text-red-500">{errorMessage}</p>}
              <div className="flex justify-center gap-4 mt-4">
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                  onClick={handlePasswordChange}
                >
                  Guardar
                </button>
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                  onClick={() => setShowPasswordForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Settings;
