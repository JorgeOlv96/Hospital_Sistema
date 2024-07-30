import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Gestionusuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/users");
        const data = await response.json();
        if (response.ok) {
          setUsuarios(data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Error fetching users. Please try again later.");
      }
    };

    fetchUsuarios();
  }, []);

  const handleEdit = (id) => {
    navigate(`/edit-user/${id}`);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:4000/api/users/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setUsuarios(usuarios.filter((user) => user.id !== id));
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Error deleting user. Please try again later.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Gestión de Usuarios</h1>
      {error && <p className="text-red-500">{error}</p>}
      <table className="w-full bg-white rounded-lg shadow">
        <thead>
          <tr>
            <th className="p-4 border-b">Nombre</th>
            <th className="p-4 border-b">Apellido Paterno</th>
            <th className="p-4 border-b">Apellido Materno</th>
            <th className="p-4 border-b">Nivel de Usuario</th>
            <th className="p-4 border-b">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((user) => (
            <tr key={user.id}>
              <td className="p-4 border-b">{user.nombre}</td>
              <td className="p-4 border-b">{user.ap_paterno}</td>
              <td className="p-4 border-b">{user.ap_materno}</td>
              <td className="p-4 border-b">{user.nivel_usuario}</td>
              <td className="p-4 border-b">
                <button
                  className="text-blue-500 mr-2"
                  onClick={() => handleEdit(user.id)}
                >
                  Editar
                </button>
                <button
                  className="text-red-500"
                  onClick={() => handleDelete(user.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="mt-4 p-2 bg-blue-500 text-white rounded"
        onClick={() => navigate("/register")}
      >
        Registrar Usuario jeje
      </button>
    </div>
  );
}

export default Gestionusuarios;
