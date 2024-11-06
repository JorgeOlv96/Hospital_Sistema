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
import Appointments from './screens/Agenda/Appointments';
import Patients from './screens/Patients/Patients';
import Campaings from './screens/Campaings';
import Services from './screens/Services';
import Insumos from './screens/Medicine';
import Invoices from './screens/Invoices/Invoices';
import Settings from './screens/Settings';
import CreateInvoice from './screens/Invoices/CreateInvoice';
import EditInvoice from './screens/Invoices/EditInvoice';
import PreviewInvoice from './screens/Invoices/PreviewInvoice';
import EditPayment from './screens/Payments/EditPayment';
import PreviewPayment from './screens/Payments/PreviewPayment';
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
import Programarsolicitud from './screens/Agenda/Programarsolicitud';
import Solicitudesprogramadas from './screens/Agenda/Programadas';
import Solicitudessuspendidas from './screens/Agenda/Suspendidas';
import Solicitudesrealizadas from './screens/Agenda/Realizadas';
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
import TodasSolicitudes from './screens/Agenda/Todas';
import SolicitudessuspendidasB from './screens/BitacoraEnfermeria/Suspendida';
import AppointmentsEnf from './screens/BitacoraEnfermeria/AgendaEnf';
import AppointmentsEv from './screens/AgendaEv';
import SolicitudInsumosPaciente from './screens/Solicitudes/SolicitudInsumosPaciente';

function App() {
  Aos.init();

  return (
    <>
      {/* Routes */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/login" element={<Login />} />
        </Routes>
        <AuthProvider>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Patient */}
            <Route path="/patients" element={<Patients />} />
            <Route path="/solicitudes" element={<Solicitudes />} />
            <Route path="/solicitudes/crearsolicitud" element={<Crearsolicitud />} />
            <Route path="/solicitudes/solicitud-insumos/:id" element={<SolicitudInsumosPaciente />} />
            <Route path="/agenda/Programarsolicitud" element={<Programarsolicitud />} />
            <Route path="/agenda/Solicitudesprogramadas" element={<Solicitudesprogramadas />} />
            <Route path="/agenda/Solicitudsuspendida" element={<Solicitudessuspendidas />} />
            <Route path="/agenda/Solicitudreaizada" element={<Solicitudesrealizadas />} />
            <Route path="/agenda/todas" element={<TodasSolicitudes />} />
            <Route path="/evaluacion" element={<Evaluacionmedica />} />
            <Route path="/evaluacion/agendaev" element={<AppointmentsEv />} />
            {/* Others */}
            <Route path="/agenda/appointments" element={<Appointments />} />
            <Route path="/anestesiólogos" element={<Anestesiólogos />} />
            <Route path="/anestesio/Programaranestesiologo" element={<Programaranestesiologo />} />
            <Route path="/campaigns" element={<Campaings />} />
            <Route path="/insumos" element={<Insumos />} />
            <Route path="/urgencias" element={<Urgencias />} />
            <Route path="/bitacora" element={<Bitacora />} />
            <Route path="/bitacora/Bitaenfermeria" element={<Bitacoraenfermeria />} />
            <Route path="/bitacora/appointmentsenf" element={<AppointmentsEnf />} />
            <Route path="/bitacora/Solicitudsuspendida" element={<SolicitudessuspendidasB />} />
            <Route path="/bitacora/Consultabitacora/:id" element={<Consultabitacora />} />
            <Route path="/bitacora/Consultabitacoraanestesio/:id" element={<ConsultabitacoraAnestesio />} />
            <Route path="/solicitudes/Consultarealizada/:id" element={<Consultarealizada />} />
            <Route path="/urgencias/Solicitudurgencia" element={<Solicitudurgencia />} />
            <Route path="/urgencias/Consultaurgencia/:id" element={<Consultaurgencia />} />
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
