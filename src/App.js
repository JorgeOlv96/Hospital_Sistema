// src/App.js
import './App.css';
import React, { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Aos from 'aos';
import ProtectedRoute from "./ProtectedRoute"
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
import Evaluacionmedica from './screens/Evaluacion';
import Anestesiólogos from './screens/Anestesiologos';
import Programaranestesiologo from './screens/Anestesio/Programaranestesiologo';
import Bitacora from './screens/Bitacora';
import Bitacoraenfermeria from './screens/BitacoraEnfermeria/Bitaenfermeria';
import Consultabitacora from './screens/BitacoraEnfermeria/Consultabitacora';
import Solicitudurgencia from './screens/Urgencias/Solicitudurgencia';
import Consultaurgencia from './screens/Urgencias/Consultaurgencia';
import Solicitudesurgentes from './screens/Urgencias/Urgentes';

function App() {
  const [activeSection, setActiveSection] = useState('appointments');
  const { user } = useContext(AuthContext);
  Aos.init();

  return (
    <>
      {/* Toaster */}
      <Toast />
      {/* Routes */}
      <BrowserRouter>
        <AuthProvider>
          
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Invoce */}
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoices/create" element={<CreateInvoice />} />
            <Route path="/invoices/edit/:id" element={<EditInvoice />} />
            <Route path="/invoices/preview/:id" element={<PreviewInvoice />} />
            {/* Payments */}
            <Route path="/payments" element={<Payments />} />
            <Route path="/payments/edit/:id" element={<EditPayment />} />
            <Route path="/payments/preview/:id" element={<PreviewPayment />} />
            {/* Patient */}
            <Route path="/patients" element={<Patients />} />
            <Route path="/solicitudes" element={<Solicitudes />} />
            <Route path="/solicitudes/crearsolicitud" element={<Crearsolicitud />} />
            <Route path="/solicitudes/Programarsolicitud" element={<Programarsolicitud setActiveSection={setActiveSection} />} />
            <Route path="/solicitudes/Solicitudesprogramadas" element={<Solicitudesprogramadas />} />
            <Route path="/solicitudes/Solicitudsuspendida" element={<Solicitudessuspendidas />} />
            <Route path="/evaluacion" element={<Evaluacionmedica />} />
            <Route path="/patients/preview/:id" element={<PatientProfile />} />
            <Route path="/patients/create" element={<CreatePatient />} />
            <Route path="/patients/visiting/:id" element={<NewMedicalRecode />} />
            {/* Doctors */}
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctors/preview/:id" element={<DoctorProfile />} />
            {/* Reception */}
            <Route path="/receptions" element={<Receptions />} />
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
            <Route path="/urgencias/Solicitudurgencia" element={<Solicitudurgencia />} />
            <Route path="/urgencias/Consultaurgencia" element={<Consultaurgencia />} />
            <Route path="/urgencias/Urgentes" element={<Solicitudesurgentes />} />
            <Route path="/services" element={<Services />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/ayuda" element={<Ayuda />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
        <ToastContainer />
      </BrowserRouter>
    </>
  );
}

export default App;
