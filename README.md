# Frontend - React.js

Este es el frontend del proyecto, desarrollado con **React.js**. Se encarga de la interfaz de usuario para la gestión de cirugías, bitacora de enfermería, asignar anestesiólogos a las salas, gestionar usuarios, etc.

## 📂 Estructura del Proyecto
```
frontend/
│-- src/
│   ├── screens/         # Páginas principales de la aplicación
│   ├── components/
│   │   ├── Modals/      # Modales utilizados en distintas vistas
│   │   ├── Datas.js     # Configuración de niveles de usuario
│-- App.js               # Archivo principal de la aplicación React
│-- .env.example         # Variables de entorno
```

## 🚀 Instalación y Configuración

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/JorgeOlv96/Hospital_Sistema.git
   cd Hospital_Sistema
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   - Copia el archivo `.env.example` y renómbralo a `.env`
   - Modifica la variable `REACT_APP_BACKEND_URL` con la URL del backend

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm start
   ```
   La aplicación se ejecutará en `http://localhost:3000` (por defecto).

## 📌 Consideraciones
- Para agregar nuevos niveles de usuario, edita el archivo `src/components/Datas.js`.
- Asegúrate de que el `.env` está correctamente configurado para conectar con el backend.

## 🛠️ Tecnologías utilizadas
- **React.js**
- **React Router** (para la navegación)
- **Axios** (para las peticiones al backend)
- **Tailwind CSS / CSS Modules** (para el diseño)
