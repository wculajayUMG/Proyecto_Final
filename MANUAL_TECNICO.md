# Manual Técnico - Sistema de Votación CIG

## Tabla de Contenido
1. [Esquema Conceptual de Componentes](#esquema-conceptual-de-componentes)
2. [Descripción de Componentes](#descripción-de-componentes)
3. [Descripción de uso de TypeScript](#descripción-de-uso-de-typescript)
4. [Descripción de uso SASS/SCSS](#descripción-de-uso-sassscss)
5. [Diagrama Entidad Relación](#diagrama-entidad-relación)

---

## 1. Esquema Conceptual de Componentes

### Arquitectura General del Sistema
```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TypeScript)            │
├─────────────────────┬───────────────────┬───────────────────┤
│   Presentation      │   Business Logic  │   Data Management │
│   Layer             │   Layer           │   Layer           │
│                     │                   │                   │
│ • LoginPage         │ • Redux Store     │ • API Services    │
│ • Dashboard         │ • Auth Slice      │ • Axios Config   │
│ • CampanasPage      │ • Campaign Slice  │ • Type Definitions│
│ • NavigationBar     │ • Middlewares     │                   │
│ • FormModals        │                   │                   │
└─────────────────────┴───────────────────┴───────────────────┘
                              │
                              │ HTTP/HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + TypeScript)          │
├─────────────────────┬───────────────────┬───────────────────┤
│   API Layer         │   Business Logic  │   Data Access     │
│                            │   Layer               │   Layer           │
│                            │                           │                   │
│ • Express Routes  │ • Controllers     │ • Mongoose Models │
│ • Middleware        │ • Validation      │ • Database Config │
│ • Auth Guards       │ • Business Rules  │                   │
│ • CORS Config       │                   │                   │
└─────────────────────┴───────────────────┴───────────────────┘
                              │
                              │ MongoDB Protocol
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (MongoDB Atlas)                │
│                                                             │
│ • Users Collection                                          │
│ • Campaigns Collection                                      │
│ • Votes Collection                                          │
│ • Indexes and Constraints                                   │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Datos
```
Usuario → Frontend → Redux Store → API Service → Backend Routes → Controllers → Models → MongoDB
```

---

## 2. Descripción de Componentes

### 2.1 Componentes del Frontend

#### 2.1.1 Páginas Principales
- **Ubicación**: `frontend/src/pages/`

**LoginPage.tsx**
- **Propósito**: Autenticación de usuarios
- **Funcionalidades**: 
  - Validación de credenciales
  - Manejo de sesiones JWT
  - Redirección según rol de usuario
- **Dependencias**: Redux AuthSlice, React-Bootstrap

**Dashboard.tsx**
- **Propósito**: Panel principal post-login
- **Funcionalidades**:
  - Visualización de campañas activas
  - Navegación rápida a funciones principales
  - Información del usuario logueado
- **Dependencias**: Redux Store, NavigationBar

**GestionCampanasPage.tsx**
- **Propósito**: Administración de campañas electorales
- **Funcionalidades**:
  - CRUD de campañas
  - Gestión de candidatos
  - Control de estados de campaña
- **Dependencias**: CampaignFormModal, CandidateManager

**CampanasPage.tsx**
- **Propósito**: Vista pública de campañas para votantes
- **Funcionalidades**:
  - Listado de campañas disponibles
  - Navegación a formulario de votación
- **Dependencias**: CampanaCard, ProtectedRoute

#### 2.1.2 Componentes Reutilizables
- **Ubicación**: `frontend/src/components/`

**NavigationBar.tsx**
- **Propósito**: Navegación principal del sistema
- **Funcionalidades**:
  - Menú adaptativo según rol
  - Logout functionality
  - Indicador de usuario activo

**CampaignFormModal.tsx**
- **Propósito**: Formulario para crear/editar campañas
- **Funcionalidades**:
  - Validación de campos
  - Manejo de fechas
  - Integración con Redux

**FormularioVotacion.tsx**
- **Propósito**: Interfaz de votación
- **Funcionalidades**:
  - Selección de candidatos
  - Validación de elegibilidad
  - Confirmación de voto

#### 2.1.3 Gestión de Estado
- **Ubicación**: `frontend/src/store/`

**authSlice.ts**
- **Responsabilidades**:
  - Manejo de autenticación
  - Almacenamiento de tokens JWT
  - Estado de usuario logueado

**campaignSlice.ts**
- **Responsabilidades**:
  - Gestión de campañas
  - Cache de datos de candidatos
  - Estados de votación

### 2.2 Componentes del Backend

#### 2.2.1 Estructura de Rutas
- **Ubicación**: `backend/src/routes/`

**user.routes.ts**
- **Endpoints**:
  - `POST /api/users/register` - Registro de usuarios
  - `POST /api/users/login` - Autenticación
  - `GET /api/users/profile` - Perfil de usuario

**campana.routes.ts**
- **Endpoints**:
  - `GET /api/campanas` - Listar campañas
  - `POST /api/campanas` - Crear campaña
  - `PUT /api/campanas/:id` - Actualizar campaña
  - `DELETE /api/campanas/:id` - Eliminar campaña
  - `PATCH /api/campanas/:id/estado` - Cambiar estado

**votacion.routes.ts**
- **Endpoints**:
  - `POST /api/votacion/votar` - Emitir voto
  - `GET /api/votacion/resultados/:id` - Resultados

#### 2.2.2 Controladores
- **Ubicación**: `backend/src/controllers/`

**campana.controller.ts**
- **Funciones**:
  - `crearCampana()`: Validación y creación
  - `obtenerCampanas()`: Listado con filtros
  - `actualizarCampana()`: Modificación de datos
  - `eliminarCampana()`: Eliminación lógica

#### 2.2.3 Modelos de Datos
- **Ubicación**: `backend/src/models/`

**user.model.ts**
- **Schema**:
  - numeroColegiado: String (unique)
  - nombreCompleto: String
  - correoElectronico: String
  - dpi: String
  - fechaNacimiento: Date
  - password: String (hashed)
  - rol: Enum ['admin', 'votante']

**campana.model.ts**
- **Schema**:
  - titulo: String
  - descripcion: String
  - candidatos: Array de subdocumentos
  - fechaInicio/fechaFin: Date
  - estado: Enum ['habilitada', 'deshabilitada']
  - votantes: Array de referencias a usuarios

---

## 3. Descripción de uso de TypeScript

### 3.1 Configuración del Proyecto

**tsconfig.json (Frontend)**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  }
}
```

### 3.2 Definición de Tipos

**Ubicación**: `frontend/src/types/index.ts`

```typescript
// Interfaz para Usuario
export interface User {
    _id: string;
    numeroColegiado: string;
    nombreCompleto: string;
    correoElectronico: string;
    dpi: string;
    fechaNacimiento: Date;
    rol: 'admin' | 'votante';
}

// Interfaz para Candidato
export interface Candidato {
    _id: string;
    nombreCompleto: string;
    descripcion: string;
    imagen: string;
    votos: number;
}

// Interfaz para Campaña
export interface Campana {
    _id: string;
    titulo: string;
    descripcion: string;
    candidatos: Candidato[];
    fechaInicio: Date;
    fechaFin: Date;
    estado: 'habilitada' | 'deshabilitada';
    cantidadVotosPorCampana: number;
    votantes: string[];
}
```

### 3.3 Tipado de Componentes React

**Ejemplo**: `LoginPage.tsx`
```typescript
interface LoginFormData {
    numeroColegiado: string;
    dpi: string;
    fechaNacimiento: string;
    password: string;
}

const LoginPage: React.FC = () => {
    const [formData, setFormData] = useState<LoginFormData>({
        numeroColegiado: '',
        dpi: '',
        fechaNacimiento: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
}
```

### 3.4 Tipado de Redux

**authSlice.ts**
```typescript
interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
}

export const login = createAsyncThunk<
    { user: User; token: string },
    LoginCredentials,
    { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
    // Implementation
});
```

### 3.5 Tipado del Backend

**Controladores con tipos Express**
```typescript
import { Request, Response } from 'express';
import { IUser } from '../models/user.model';

interface RequestWithUser extends Request {
    user?: IUser;
}

export const obtenerCampanas = async (req: RequestWithUser, res: Response) => {
    try {
        const campanas = await Campana.find();
        res.json(campanas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener campañas' });
    }
};
```

---

## 4. Descripción de uso SASS/SCSS

### 4.1 Estructura de Archivos
- **Archivo principal**: `frontend/src/styles/main.scss`
- **Importación**: Integrado en `index.tsx`

### 4.2 Variables SCSS

```scss
// Variables de colores
$primary-color: #0066cc;
$secondary-color: #ffd700;
$tertiary-color: #003366;
$success-color: #28a745;
$danger-color: #dc3545;
$light-color: #ffffff;
$dark-color: #1a1a2e;
```

### 4.3 Mixins Reutilizables

```scss
// Mixin para gradientes primarios
@mixin gradient-primary {
    background: linear-gradient(135deg, $primary-color 0%, #0099ff 100%);
}

// Mixin para gradientes secundarios
@mixin gradient-secondary {
    background: linear-gradient(135deg, $secondary-color 50%, #ffed4a 50%, #ffffff 100%);
}

// Mixin para efectos hover en tarjetas
@mixin card-hover-effect {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
    }
}

// Mixin para diseño responsivo
@mixin responsive($breakpoint) {
    @if $breakpoint == tablet {
        @media (min-width: 768px) { @content; }
    }
    @if $breakpoint == desktop {
        @media (min-width: 1024px) { @content; }
    }
}
```

### 4.4 Estilos de Componentes Específicos

**Header responsivo**
```scss
.header-band {
    width: 100%;
    height: 80px;
    @include gradient-secondary();
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1rem;
    
    @media (min-width: 768px) {
        height: 100px;
        padding: 0 2rem;
    }
    
    @media (min-width: 1024px) {
        height: 120px;
        padding: 0 4rem;
    }
}

.header-text {
    font-size: 1rem;
    font-weight: 700;
    text-transform: uppercase;
    
    @media (min-width: 768px) {
        font-size: 1.5rem;
    }
    
    @media (min-width: 1024px) {
        font-size: 2rem;
    }
}
```

**Páginas con temas específicos**
```scss
.login-page, .register-page {
    background: linear-gradient(-25deg, #0066cc 0%, #0099ff 0%, #001f3f 0%);
    min-height: 100vh;
    padding: 2rem 0;

    .form-container {
        background: rgba(255, 255, 255, 0.95);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        @include card-hover-effect;
        
        h2 {
            background: linear-gradient(to right, $primary-color, #001f3f);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
        }
    }
}
```

### 4.5 Beneficios del uso de SCSS

1. **Variables**: Mantenimiento centralizado de colores y valores
2. **Mixins**: Reutilización de código CSS complejo
3. **Nesting**: Organización jerárquica de estilos
4. **Responsive Design**: Media queries organizadas
5. **Modularidad**: Separación de estilos por componente

---

## 5. Diagrama Entidad Relación

### 5.1 Modelo Conceptual de Datos

```
┌─────────────────────┐         ┌─────────────────────┐
│       USERS                               │         │      CAMPAÑAS       │
├─────────────────────┤         ├─────────────────────┤
│ _id (ObjectId) PK                    │         │ _id (ObjectId) PK                   │
│ numeroColegiado                      │    ┌────│ titulo                                │
│ nombreCompleto                      │    │    │ descripcion                            │
│ correoElectronico                    │    │    │ fechaInicio                            │
│ dpi                                           │    │    │ fechaFin                             │
│ fechaNacimiento                     │    │    │ estado              │
│ password                                 │    │    │ cantidadVotosPorC.. │
│ rol                                           │    │    │ candidatos[]     │
│ createdAt                               │    │    │ votantes[] (refs)   │
│ updatedAt                               │    │    │ createdAt           │
└─────────────────────┘    │    │ updatedAt           │
            │              │                                  └─────────────────────┘
            │              │
            │              │    ┌─────────────────────┐
            │              │    │    CANDIDATOS       │
            │              │    │   (Subdocumento)    │
            │              │    ├─────────────────────┤
            │              └────│ _id (ObjectId)      │
            │                   │ nombreCompleto      │
            │                   │ descripcion         │
            │                   │ imagen              │
            │                   │ votos               │
            │                   └─────────────────────┘
            │
            │              ┌─────────────────────┐
            │              │       VOTOS         │
            │              │   (Referencia)      │
            │              ├─────────────────────┤
            └──────────────│ usuarioId (ref)     │
                           │ campanaId (ref)     │
                           │ candidatoId (ref)   │
                           │ fechaVoto           │
                           │ ipAddress           │
                           └─────────────────────┘
```

### 5.2 Relaciones del Sistema

#### Relación Users - Campañas (N:M)
- **Tipo**: Muchos a muchos
- **Implementación**: Array de referencias en campo `votantes`
- **Propósito**: Controlar qué usuarios han votado en cada campaña

#### Relación Campañas - Candidatos (1:N)
- **Tipo**: Uno a muchos (subdocumento)
- **Implementación**: Array embebido `candidatos[]`
- **Propósito**: Cada campaña puede tener múltiples candidatos

#### Relación Users - Votos (1:N)
- **Tipo**: Uno a muchos
- **Implementación**: Referencia al usuario en cada voto
- **Propósito**: Auditoría y control de votación

### 5.3 Índices de Base de Datos

```javascript
// Índices para optimización
db.users.createIndex({ "numeroColegiado": 1 }, { unique: true });
db.users.createIndex({ "dpi": 1 }, { unique: true });
db.users.createIndex({ "correoElectronico": 1 }, { unique: true });

db.campanas.createIndex({ "estado": 1 });
db.campanas.createIndex({ "fechaInicio": 1, "fechaFin": 1 });
db.campanas.createIndex({ "votantes": 1 });
```

### 5.4 Reglas de Negocio Implementadas

1. **Integridad Referencial**: Validación de existencia de usuarios y campañas
2. **Unicidad**: Números colegiados y DPIs únicos
3. **Validación Temporal**: Verificación de fechas de campaña
4. **Control de Votación**: Un voto por usuario por campaña
5. **Seguridad**: Encriptación de contraseñas con bcrypt

---

## Ubicación de Archivos por Sección

### Esquema Conceptual de Componentes
- `README.md` - Estructura general
- `frontend/src/` - Componentes React
- `backend/src/` - Estructura del servidor

### Descripción de Componentes
- `frontend/src/pages/` - Páginas principales
- `frontend/src/components/` - Componentes reutilizables
- `backend/src/controllers/` - Lógica de negocio
- `backend/src/routes/` - Endpoints API
- `backend/src/models/` - Modelos de datos

### Descripción de TypeScript
- `tsconfig.json` - Configuración TypeScript
- `frontend/src/types/` - Definiciones de tipos
- `backend/src/` - Implementación tipada del backend

### Descripción de SASS/SCSS
- `frontend/src/styles/main.scss` - Archivo principal de estilos
- Variables, mixins y componentes de estilo

### Diagrama Entidad Relación
- `backend/src/models/` - Modelos Mongoose
- Documentación de relaciones y índices de base de datos