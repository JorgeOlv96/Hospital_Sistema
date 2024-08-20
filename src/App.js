import './App.css';
import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Aos from 'aos';
import axios from 'axios';
import ProtectedRoute from "./ProtectedRoute";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext, AuthProvider } from './AuthContext';
import Dashboard from './screens/Dashboard';
import Solicitudes from './screens/Solicitudes/Solicitudes';
import Toast from './components/Notifications/Toast';
import Payments from './screens/Payments/Payments';
import Appointments from './screens/Appointments';
import Patients from './screens/Patients/Patients';
import Campaings from './screens/Campaings';
import Services from './screens/Services';
import Invoices from './screens/Invoices/Invoices';
import Settings from './screens/Settings';
import CreateInvoice from './screens/Invoices/CreateInvoice';
import EditInvoice from './screens/Invoices/EditInvoice';
import PreviewInvoice from './screens/Invoices/PreviewInvoice';
import EditPayment from './screens/Payments/EditPayment';
import PreviewPayment from './screens/Payments/PreviewPayment';
import Medicine from './screens/Medicine';
import PatientProfile from './screens/Patients/PatientProfile';
import CreatePatient from './screens/Patients/CreatePatient';
import Doctors from './screens/Doctors/Doctors';
import DoctorProfile from './screens/Doctors/DoctorProfile';
import Receptions from './screens/Receptions';
import NewMedicalRecode from './screens/Patients/NewMedicalRecode';
import NotFound from './screens/NotFound';
import Login from './screens/Login';
import Register from './screens/Register';
import Crearsolicitud from './screens/Solicitudes/Crearsolicitud';
import Urgencias from './screens/Urgencias';
import IndexPage from './IndexPage';
import Ayuda from './HelpPage';
import Programarsolicitud from './screens/Solicitudes/Programarsolicitud';
import Solicitudesprogramadas from './screens/Solicitudes/Programadas';
import Solicitudessuspendidas from './screens/Solicitudes/Suspendidas';
import Solicitudesrealizadas from './screens/Solicitudes/Realizadas';
import Evaluacionmedica from './screens/Evaluacion';
import Anestesiólogos from './screens/Anestesiologos';
import Programaranestesiologo from './screens/Anestesio/Programaranestesiologo';
import Bitacora from './screens/Bitacora';
import Bitacoraanestesio from './screens/Bitacoraanestesio';
import Bitacoraenfermeria from './screens/BitacoraEnfermeria/Bitaenfermeria';
import Consultabitacora from './screens/BitacoraEnfermeria/Consultabitacora';
import ConsultabitacoraAnestesio from './screens/BitacoraEnfermeria/Consultabitacoraanestesio';
import Consultarealizada from './screens/Solicitudes/Consultarealizada';
import Solicitudurgencia from './screens/Urgencias/Solicitudurgencia';
import Consultaurgencia from './screens/Urgencias/Consultaurgencia';
import Solicitudesurgentes from './screens/Urgencias/Urgentes';
import Gestionusuarios from './screens/Gestorusuarios/Gestionusr';
import SalaManager from './screens/Salas/SalaManager';
import SolicitudesInsumos from './screens/Insumos/solicitudesInsumos';
import GestorManager from './screens/Productividad/Gestorproductividad';
import TodasSolicitudes from './screens/Solicitudes/Todas';

function App() {
  Aos.init();

  useEffect(() => {
    const baseURL = process.env.REACT_APP_APP_BACK_SSQ || 'http://localhost:4000';

    // Función para contar las solicitudes
    const countSolicitudes = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/solicitudes`);
        const totalSolicitudes = response.data.length;
        console.log(`Total de solicitudes: ${totalSolicitudes}`);
      } catch (error) {
        console.error('Error fetching solicitudes count:', error);
      }
    };

    // Configura un intervalo para contar las solicitudes cada 40 segundos (40000 ms)
    const interval = setInterval(countSolicitudes, 40000);

    // Realiza un conteo inicial al cargar la aplicación
    countSolicitudes();

    // Limpia el intervalo al desmontar el componente
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Routes */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<IndexPage />} />
        </Routes>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Patient */}
            <Route path="/patients" element={<Patients />} />
            <Route path="/solicitudes" element={<Solicitudes />} />
            <Route path="/solicitudes/crearsolicitud" element={<Crearsolicitud />} />
            <Route path="/solicitudes/Programarsolicitud" element={<Programarsolicitud />} />
            <Route path="/solicitudes/Solicitudesprogramadas" element={<Solicitudesprogramadas />} />
            <Route path="/solicitudes/Solicitudsuspendida" element={<Solicitudessuspendidas />} />
            <Route path="/solicitudes/Solicitudreaizada" element={<Solicitudesrealizadas />} />
            <Route path="/solicitudes/todas" element={<TodasSolicitudes />} />
            <Route path="/evaluacion" element={<Evaluacionmedica />} />
            {/* Others */}
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/anestesiólogos" element={<Anestesiólogos />} />
            <Route path="/anestesio/Programaranestesiologo" element={<Programaranestesiologo />} />
            <Route path="/campaigns" element={<Campaings />} />
            <Route path="/medicine" element={<Medicine />} />
            <Route path="/urgencias" element={<Urgencias />} />
            <Route path="/bitacora" element={<Bitacora />} />
            <Route path="/bitacora/Bitaenfermeria" element={<Bitacoraenfermeria />} />
            <Route path="/bitacora/Consultabitacora/:id" element={<Consultabitacora />} />
            <Route path="/bitacora/Consultabitacoraanestesio/:id" element={<ConsultabitacoraAnestesio />} />
            <Route path="/solicitudes/Consultarealizada/:id" element={<Consultarealizada />} />
            <Route path="/urgencias/Solicitudurgencia" element={<Solicitudurgencia />} />
            <Route path="/urgencias/Consultaurgencia" element={<Consultaurgencia />} />
            <Route path="/urgencias/Urgentes" element={<Solicitudesurgentes />} />
            <Route path="/Gestionusr" element={<Gestionusuarios />} />
            <Route path="/SalaManager" element={<SalaManager />} />
            <Route path="/Gestorproductividad" element={<GestorManager />} />
            <Route path="/services" element={<Services />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/ayuda" element={<Ayuda />} />
            <Route path="/solicitudesInsumos" element={<SolicitudesInsumos />} />
            <Route path="/bitacoraanestesio" element={<Bitacoraanestesio />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
