import React, { useState, useEffect } from "react";
import Layout from "../Layout";
import { Link } from "react-router-dom";

const CustomToolbar = ({onPrint}) => {
  return (
    <div className="flex flex-col gap-8 mb-8">
      <h1 className="text-xl font-semibold">Enfermería</h1>
      <div className="flex justify-center my-4 space-x-4  mt-64"> {/* Ajusta el valor de mt-32 según sea necesario */}
      <div>
            <Link
              to="/bitacora/Bitaenfermeria"
              className="bg-[#365b77] hover:bg-[#7498b6] text-white py-2 px-4 rounded inline-flex items-center"
            >
              <span>Enfermera</span>
            </Link>
          </div>

          <div>
            <Link
              to="/bitacora/Bitaenfermeria"
              className="bg-[#365b77] hover:bg-[#7498b6] text-white py-2 px-4 rounded inline-flex items-center"
            >
              <span>Anestesiólogo</span>
            </Link>
          </div>
      
      </div>
    </div>
  );
};
function Bitacora() {
  const fetchAppointments = async () => {
    // Lógica para obtener citas
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <Layout>
      <CustomToolbar />
    </Layout>
  );
}

export default Bitacora;
