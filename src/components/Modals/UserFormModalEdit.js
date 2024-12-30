import Modal from './Modal';
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditUserModal = ({ showModal, setShowModal, userToEdit: initialUser, handleInputChange, errors, setUsuarios }) => {
  const [userToEdit, setUserToEdit] = useState({
    nombre: "",
    ap_paterno: "",
    ap_materno: "",
    email: "",
    nivel_usuario: "",
    cedula: "",
    especialidad: "",
    pantallasDisponibles: [],
  });

  const baseURL = process.env.REACT_APP_APP_BACK_SSQ || "http://localhost:4000";
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});

  React.useEffect(() => {
    setUserToEdit(initialUser);
  }, [initialUser]);

  // Save edited user
const handleSaveChanges = async (e) => {
    e.preventDefault();
  
    if (!userToEdit) return;
  
    try {
      toast.dismiss();
  
      console.log("Pantallas disponibles:", userToEdit.pantallasDisponibles);
  
      // Asegúrate de incluir pantallasDisponibles en userToEdit
      const response = await fetch(
        `${baseURL}/api/users/users/${userToEdit.id_usuario}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...userToEdit,
            pantallasDisponibles: userToEdit.pantallasDisponibles.join(","), // Debe coincidir con el nombre que esperas en el backend
          }),
        }
      );
  
      // Check if the response is ok, otherwise handle the error
      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }
  
      // If the response is ok, update the state with the updated user
      const updatedUser = await response.json();
      setUsuarios((prevUsuarios) =>
        prevUsuarios.map((user) =>
          user.id_usuario === updatedUser.id_usuario ? updatedUser : user
        )
      );
  
      // Close the modal and show a success message
      setShowModal(false);
      toast.success("Usuario actualizado correctamente");
    } catch (err) {
      // Handle any errors from the try block or fetch
      console.error("Error updating user:", err);
      setError(err.message || "Error updating user. Please try again later.");
      toast.error(
        err.message || "Error updating user. Please try again later."
      );
    }
  };

  return (
    <Modal
      isOpen={showModal}
      closeModal={() => setShowModal(false)}
      title="Editar Usuario"
      width="max-w-3xl"
    >
      <form onSubmit={handleSaveChanges}> {/* Cambié el handler aquí */}
        <div className="mb-4 grid grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="nombre"
              className="block text-gray-700 mb-2"
            >
              Nombre
            </label>
            <input
              type="text"
              name="nombre"
              value={userToEdit.nombre || ""}
              onChange={handleInputChange}
              className={`w-full p-3 border ${
                formErrors.nombre ? "border-red-500" : "border-gray-300"
              } rounded-lg`}
            />
          </div>

          <div>
            <label
              htmlFor="ap_paterno"
              className="block text-gray-700 mb-2"
            >
              Apellido Paterno
            </label>
            <input
              type="text"
              id="ap_paterno"
              name="ap_paterno"
              value={userToEdit.ap_paterno || ""}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg"
            />
          </div>
          <div>
            <label
              htmlFor="ap_materno"
              className="block text-gray-700 mb-2"
            >
              Apellido Materno
            </label>
            <input
              type="text"
              id="ap_materno"
              name="ap_materno"
              value={userToEdit.ap_materno || ""}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg"
            />
          </div>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="email"
              className="block text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={userToEdit.email}
              onChange={handleInputChange || ""}
              className="w-full p-3 border rounded-lg"
            />
          </div>
          <div>
            <label
              htmlFor="nivel_usuario"
              className="block text-gray-700 mb-2"
            >
              Rol de usuario
            </label>
            <select
              id="nivel_usuario"
              name="nivel_usuario"
              value={userToEdit.nivel_usuario || ""}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Seleccionar</option>
              <option value="1">(1) Programación Qx</option>
              <option value="2">(2) Enfermería</option>
              <option value="3">(3) Anestesiología</option>
              <option value="4">(4) Médico</option>
              <option value="5">(5) Gestor de insumos</option>
              <option value="6">(6) Admin</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="cedula"
              className="block text-gray-700 mb-2"
            >
              Cédula
            </label>
            <input
              type="text"
              id="cedula"
              name="cedula"
              value={userToEdit.cedula || ""}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg"
            />
          </div>
          <div className="mb-4 w-full">
            <label
              htmlFor="especialidad"
              className="block text-sm font-medium text-gray-700"
            >
              Especialidad
            </label>
            <select
              id="especialidad"
              name="especialidad"
              value={userToEdit.especialidad}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Selecciona una especialidad</option>
              <option value="Algología">Algología</option>
              <option value="Angiología">Angiología</option>
              <option value="C.Plástica y Reconstructiva">
                C.Plástica y Reconstructiva
              </option>
              <option value="Cardiología">Cardiología</option>
              <option value="Cirugía de Torax">
                Cirugía de Torax
              </option>
              <option value="Cirugía Bariatrica">
                Cirugía Bariatrica
              </option>
              <option value="Cirugía Cardiaca">
                Cirugía Cardiaca
              </option>
              <option value="Cirugía General">Cirugía General</option>
              <option value="Cirugía Hepatobiliar">
                Cirugía Hepatobiliar
              </option>
              <option value="Coloproctología">Coloproctología</option>
              <option value="Columna">Columna</option>
              <option value="Endoscopia">Endoscopia</option>
              <option value="Gastroenterología">
                Gastroenterología
              </option>
              <option value="Hemodinamía">Hemodinamía</option>
              <option value="Imagenología">Imagenología</option>
              <option value="Maxilofacial">Maxilofacial</option>
              <option value="Neurocirugía">Neurocirugía</option>
              <option value="Oftalmología">Oftalmología</option>
              <option value="Oncología">Oncología</option>
              <option value="Orbitología">Orbitología</option>
              <option value="Otorrinolaringología">
                Otorrinolaringología
              </option>
              <option value="Proctología">Proctología</option>
              <option value="Procuración">Procuración</option>
              <option value="T. de córnea">T. de córnea</option>
              <option value="T. de vitreorretiniano">
                T. de vitreorretiniano
              </option>
              <option value="Urología">Urología</option>
              <option value="Traumatología y Ortopedia">
                Traumatología y Ortopedia
              </option>
              <option value="Cirugía Plastica">
                Cirugía Plástica
              </option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-center mb-2">
            Pantallas Disponibles
          </label>

          <div className="grid grid-cols-2 gap-4 mt-4">
            {[
              "Dashboard",
              "Solicitudes",
              "Evaluación",
              "Agenda",
              "Anestesiólogos",
              "Bitácora enfermería",
              "Bitácora anestesiología",
              "Gestor de salas",
              "Solicitudes insumos",
              "Gestor de productividad",
              "Gestor de usuarios",
            ].map((screen) => (
              <div key={screen} className="flex items-center">
                <input
                  type="checkbox"
                  id={screen}
                  name="pantallasDisponibles"
                  value={screen}
                  checked={
                    userToEdit?.pantallasDisponibles?.includes(
                      screen
                    ) || false
                  }
                  onChange={(e) => {
                    const { checked, value } = e.target;
                    setUserToEdit((prevUser) => {
                      const updatedPantallas = Array.isArray(
                        prevUser.pantallasDisponibles
                      )
                        ? prevUser.pantallasDisponibles
                        : [];
                      if (checked) {
                        updatedPantallas.push(value);
                      } else {
                        const index = updatedPantallas.indexOf(value);
                        if (index > -1) {
                          updatedPantallas.splice(index, 1);
                        }
                      }
                      return {
                        ...prevUser,
                        pantallasDisponibles: updatedPantallas,
                      };
                    });
                  }}
                />
                <label htmlFor={screen} className="ml-2">
                  {screen}
                </label>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="text-red-500 mb-4">{error}</div>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Guardar Cambios
          </button>
        </div>
      </form>
      <ToastContainer />
    </Modal>
  );
};

export default EditUserModal;
