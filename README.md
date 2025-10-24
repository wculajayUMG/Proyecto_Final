# Sistema de Votación - Colegio de Ingenieros de Guatemala

## Descripción del Proyecto
El proyecto tiene como objetivo diseñar y desarrollar una plataforma web completa
para la gestión y realización de votaciones destinadas a la elección de la Junta Directiva del Colegio de Ingenieros de Guatemala.

## Credendicales

- Keyli Andrea Tobar Morales.           Carnet: 9490-22-4796
- Willy Estuardo Culajay Asturias.     Carnet: 9490-22-3432


## Estructura del Proyecto
El proyecto está dividido en dos partes principales:

### Backend (Node.js + Express + TypeScript)

#### Tecnologías Utilizadas
- **Node.js**: v18.x
- **Express**: Framework web
- **TypeScript**: Lenguaje de programación
- **JWT**: Autenticación y autorización
- **bcryptjs**: Encriptación de contraseñas
- **cors**: Manejo de CORS
- **helmet**: Seguridad adicional

#### Estructura del Backend
```
backend/
├── src/
│   ├── config/         # Configuraciones (DB, middlewares)
│   ├── controllers/    # Controladores de la aplicación
│   ├── middlewares/    # Middlewares personalizados
│   ├── models/         # Modelos de MongoDB
│   ├── routes/         # Rutas de la API
│   └── index.ts        # Punto de entrada
```

#### Características Principales del Backend
- Autenticación segura con JWT
- Validación de roles (admin/votante)
- API RESTful
- Manejo de sesiones
- Encriptación de datos sensibles
- Middlewares de seguridad

### Frontend (React + TypeScript)

#### Tecnologías Utilizadas
- **React**: v18.x
- **TypeScript**: Tipado estático
- **Redux Toolkit**: Gestión de estado
- **React Bootstrap**: Componentes de UI
- **Axios**: Cliente HTTP
- **SCSS**: Estilos
- **React Router**: Enrutamiento

#### Estructura del Frontend
```
frontend/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── pages/         # Páginas de la aplicación
│   ├── store/         # Configuración de Redux
│   ├── styles/        # Estilos SCSS
│   ├── services/      # Servicios de API
│   └── types/         # Tipos TypeScript
```

#### Características Principales del Frontend
- Diseño responsivo
- Gestión de estado centralizada
- Rutas protegidas
- Validación de formularios
- Interfaz intuitiva
- Feedback visual de acciones

## Base de Datos (MongoDB Atlas)

### Configuración de MongoDB Atlas
- **Cluster**: Cluster en la nube de MongoDB Atlas
- **Tipo**: Base de datos NoSQL
- **Conexión**: URI de conexión segura
- **Autenticación**: Usuario y contraseña
- **Red**: IP Whitelist configurada

### Colecciones Principales
1. **Users**
   - Información de usuarios
   - Roles y permisos
   - Datos de autenticación

2. **Campañas**
   - Información de campañas electorales
   - Estado de las campañas
   - Candidatos y votos

### Seguridad de Datos
- Conexión SSL/TLS
- Autenticación de dos factores
- Backups automatizados
- Monitoreo de accesos

## Instrucciones de Instalación

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Variables de Entorno
#### Backend (.env)
```
PORT=5000
MONGODB_URI=tu_uri_de_mongodb
JWT_SECRET=tu_secreto_jwt
NODE_ENV=development
```

#### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Funcionalidades Principales
1. Gestión de Usuarios
   - Registro de votantes
   - Autenticación segura
   - Control de roles

2. Gestión de Campañas
   - Crear/Editar campañas
   - Agregar candidatos
   - Control de estado

3. Sistema de Votación
   - Votación segura
   - Verificación de elegibilidad
   - Conteo en tiempo real

## Seguridad
- Autenticación JWT
- Encriptación de contraseñas
- Validación de sesiones
- Protección contra CSRF
- Headers de seguridad
- Sanitización de datos

## Despliegue
- Backend: Render
- Frontend: Netlify
- Base de Datos: MongoDB Atlas

