// src/components/Datas.js
import { HiOutlineHome, HiOutlineMail, HiOutlineUsers } from 'react-icons/hi';
import { FaWpforms } from "react-icons/fa6";
import {
  TbCalendar,
  TbChartHistogram,
  TbFile,
  TbFileInvoice,
  TbLockAccess,
  TbUsers,
} from 'react-icons/tb';
import { FaRegCalendarAlt, FaTelegramPlane, FaWhatsapp } from 'react-icons/fa';
import {
  RiFileList3Line,
  RiHeartLine,
  RiImageLine,
  RiLockPasswordLine,
  RiMedicineBottleLine,
  RiMoneyDollarCircleLine,
  RiStethoscopeLine,
  RiUserHeartLine,
  RiUserLine,
} from 'react-icons/ri';
import {
  MdListAlt,
  MdOutlineAttachMoney,
  MdOutlineCampaign,
  MdOutlineInventory2,
  MdOutlineTextsms,
} from 'react-icons/md';
import { AiOutlineSetting } from 'react-icons/ai';
import { BiCalendar, BiUserPlus } from 'react-icons/bi';
import { FaAmbulance } from "react-icons/fa";
import { FaSheetPlastic } from "react-icons/fa6";
import { FaSyringe } from "react-icons/fa";
import { LuFileSpreadsheet } from "react-icons/lu";
import { PiSyringe } from "react-icons/pi";
import { LiaUserNurseSolid } from "react-icons/lia";
import { RiNurseFill } from "react-icons/ri";
import { FaUserCog } from "react-icons/fa";
import { FaBedPulse } from "react-icons/fa6";
import { AiOutlineMedicineBox } from "react-icons/ai";
import { IoIosPulse } from "react-icons/io";
import { GrUserSettings } from "react-icons/gr";
import { BiBarChartAlt } from "react-icons/bi";



export const MenuDatas = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: HiOutlineHome,
    viewRole: [1, 2, 3, 4, 5, 6]
  },
  {
    title: 'Solicitudes',
    path: '/solicitudes',
    icon: FaWpforms,
    viewRole: [1, 2, 3, 4, 5, 6]
  },
  {
    title: 'Evaluación',
    path: '/evaluacion',
    icon: LuFileSpreadsheet,
    viewRole: [1, 2, 3, 4, 5, 6]
  },
  {
    title: 'Agenda',
    path: '/agenda/appointments',
    icon: FaRegCalendarAlt,
    viewRole: [1, 2, 3, 4, 5, 6]
  },
  {
    title: 'Anestesiólogos',
    path: '/anestesiólogos',
    icon: PiSyringe,
    viewRole:[1, 2, 3, 4, 5, 6]
  },
  {
    title: 'Bitácora enfermería',
    path: '/bitacora/Bitaenfermeria',
    icon: LiaUserNurseSolid,
    viewRole: [1, 2, 3, 4, 5, 6]
  },
  {
    title: 'Bitácora anestesiología',
    path: '/Bitacoraanestesio',
    icon: RiNurseFill ,
    viewRole: [1, 2, 3, 4, 5, 6]
  },
  {
    title: 'Gestor de usuarios',
    path: '/Gestionusr',
    icon: GrUserSettings , // Puedes cambiar este icono por uno más representativo si lo deseas
    viewRole: [1, 2, 3, 4, 5, 6] // Solo accesible para el nivel 5
  },
  {
    title: 'Gestor de salas',
    path: '/SalaManager',
    icon: IoIosPulse  , // Puedes cambiar este icono por uno más representativo si lo deseas
    viewRole: [1, 2, 3, 4, 5, 6] // Solo accesible para el nivel 5
  },
  {
    title: 'Solicitudes insumos',
    path: '/solicitudesInsumos',
    icon: AiOutlineMedicineBox , // Puedes cambiar este icono por uno más representativo si lo deseas
    viewRole: [1, 2, 3, 4, 5, 6] // Solo accesible para el nivel 5
  },
  {
    title: 'Gestor de productividad',
    path: '/Gestorproductividad',
    icon: BiBarChartAlt , // Puedes cambiar este icono por uno más representativo si lo deseas
    viewRole: [1, 2, 3, 4, 5, 6] // Solo accesible para el nivel 5
  },
];

export const getMenuItemsForUser = (user) => {
  if (!user || !user.rol_user) {
    return [];
  }

  // Convierte 'pantallas' a un array
  const pantallasArray = user.pantallas ? user.pantallas.split(',') : [];

  // Filtra los elementos del menú
  return MenuDatas.filter(item => 
    (item.viewRole ? item.viewRole.includes(user.rol_user) : true) && 
    pantallasArray.includes(item.title) // Verifica si la pantalla está en el array
  );
};

export const memberData = [
 
];

export const sortsDatas = {
 
};

export const campaignData = [
 
];
export const servicesData = [
 
];

export const invoicesData = [
  
];

export const appointmentsData = [
  
];

export const transactionData = [

];



export const notificationsData = [
 
];

export const shareData = [
 
];

export const medicineData = [
 
];

export const patientTab = [
 
];

export const doctorTab = [
 
];

export const medicalRecodData = [
 
];

export const doctorsData = [
 
];

export const receptionsData = [
 
];
