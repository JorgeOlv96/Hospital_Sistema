import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Layout from "../../Layout";
import { toast } from 'react-toastify';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Gestionusuarios() {
    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    const baseURL = process.env.REACT_APP_APP_BACK_SSQ || 'http://localhost:4000';

    // Fetch usuarios on component mount
    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const response = await fetch(`${baseURL}/api/users/users`);
                if (!response.ok) {
                    const data = await response.json();
                    setError(data.message);
                } else {
                    const data = await response.json();
                    setUsuarios(data);
                }
            } catch (err) {
                console.error("Error fetching users:", err);
                setError("Error fetching users. Please try again later.");
            }
        };

        fetchUsuarios();
    }, []);

    // Edit user and open modal
    const handleEdit = (user) => {
        setUserToEdit(user);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`${baseURL}/api/users/users/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                const data = await response.json();
                setError(data.message);
                toast.error(data.message); // Mostrar mensaje de error
            } else {
                // Remove user from state without needing to refetch
                setUsuarios((prevUsuarios) => prevUsuarios.filter((user) => user.id_usuario !== id));
                setSuccess("User deleted successfully.");
                toast.success("User deleted successfully."); // Mostrar mensaje de éxito
            }
        } catch (err) {
            console.error("Error deleting user:", err);
            setError("Error deleting user. Please try again later.");
            toast.error("Error deleting user. Please try again later."); // Mostrar mensaje de error
        }
    };

    // Save edited user
    const [updateFlag, setUpdateFlag] = useState(0);

    const handleSave = async (e) => {
        e.preventDefault();
        const { id, nombre, ap_paterno, ap_materno, nivel_usuario, email, cedula } = userToEdit;
    
        try {
            // Primero, desactivamos cualquier notificación existente
            toast.dismiss();
    
            // Realiza la solicitud de actualización
            const response = await fetch(`${baseURL}/api/users/users/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ nombre, ap_paterno, ap_materno, nivel_usuario, email, cedula }),
            });
    
            if (!response.ok) {
                const data = await response.json();
                setError(data.message);
                toast.error(data.message); // Mostrar mensaje de error
            } else {
                const updatedUser = await response.json();
                console.log("Updated user:", updatedUser); // Agregado para depuración
                console.log("Usuarios state:", usuarios); // Agregado para depuración
                setUsuarios(usuarios.map((user) => (user.id === id ? updatedUser : user)));
                setShowModal(false);
                toast.success("User updated successfully"); // Mostrar mensaje de éxito
            }
        } catch (err) {
            console.error("Error updating user:", err);
            setError("Error updating user. Please try again later.");
            toast.error("Error updating user. Please try again later."); // Mostrar mensaje de error
        }
    };
    
    

    // Handle input change in the modal form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserToEdit((prevUser) => ({
            ...prevUser,
            [name]: value,
        }));
    };

    return (
        <Layout>
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Gestión de Usuarios</h1>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                        {success}
                    </div>
                )}
                <table className="min-w-full divide-y divide-white-200">
                    <thead className="bg-[#365b77] text-white">
                        <tr>
                            <th className="px-4 py-2">Nombre</th>
                            <th className="px-4 py-2">Apellido Paterno</th>
                            <th className="px-4 py-2">Apellido Materno</th>
                            <th className="px-4 py-2">Email</th>
                            <th className="px-4 py-2">Nivel de Usuario</th>
                            <th className="px-4 py-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                            {usuarios.length > 0 ? (
                                usuarios.map((user) => (
                                    <tr key={user.id}>

                                        <td className="border px-4 py-2">{user.nombre}</td>
                                        <td className="border px-4 py-2">{user.ap_paterno}</td>
                                        <td className="border px-4 py-2">{user.ap_materno}</td>
                                        <td className="border px-4 py-2">{user.email}</td>
                                        <td className="border px-4 py-2">{user.nivel_usuario}</td>
                                        <td className="border px-4 py-2">
                                            <button
                                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                                                onClick={() => handleEdit(user)}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                                onClick={() => handleDelete(user.id)}
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="border px-4 py-2 text-center">
                                        No hay usuarios disponibles
                                    </td>
                                </tr>
                            )}
                        </tbody>

                </table>
                <Link to="/register">
                    <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                        Registrar Usuario
                    </button>
                </Link>
            </div>
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-1/2">
                        <h2 className="text-xl font-bold mb-4">Edit User</h2>
                        <form onSubmit={handleSave}>
                            <div className="mb-4">
                                <label className="block text-gray-700">Nombre</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={userToEdit?.nombre || ""}
                                    onChange={handleInputChange}
                                    className="border px-4 py-2 w-full"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Apellido Paterno</label>
                                <input
                                    type="text"
                                    name="ap_paterno"
                                    value={userToEdit?.ap_paterno || ""}
                                    onChange={handleInputChange}
                                    className="border px-4 py-2 w-full"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Apellido Materno</label>
                                <input
                                    type="text"
                                    name="ap_materno"
                                    value={userToEdit?.ap_materno || ""}
                                    onChange={handleInputChange}
                                    className="border px-4 py-2 w-full"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Nivel de Usuario</label>
                                <input
                                    type="text"
                                    name="nivel_usuario"
                                    value={userToEdit?.nivel_usuario || ""}
                                    onChange={handleInputChange}
                                    className="border px-4 py-2 w-full"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={userToEdit?.email || ""}
                                    onChange={handleInputChange}
                                    className="border px-4 py-2 w-full"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Cédula</label>
                                <input
                                    type="text"
                                    name="cedula"
                                    value={userToEdit?.cedula || ""}
                                    onChange={handleInputChange}
                                    className="border px-4 py-2 w-full"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Guardar
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-2"
                            >
                                Cancelar
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}

export default Gestionusuarios;
