# Donatón - API Gateway (Backend For Frontend)

##  Descripción del Proyecto
Este repositorio contiene el **API Gateway** o **Backend For Frontend (BFF)** del ecosistema de microservicios para la fundación Donatón. Este componente es parte integral de la **Evaluación Parcial N°2** de la asignatura Desarrollo Fullstack III. Su función principal es actuar como la única puerta de entrada para las aplicaciones cliente (Frontend), centralizando la seguridad, el enrutamiento y la validación de peticiones.

##  Arquitectura y Patrones de Diseño

El diseño de este componente responde a las exigencias de la evaluación mediante la implementación de las siguientes prácticas:

* **Patrón API Gateway / BFF:** Resuelve el problema de exponer múltiples microservicios directamente al frontend. En lugar de que el cliente web deba conocer las IPs y puertos de cada servicio interno (Donaciones, Logística, Terreno), el Gateway recibe una única petición y la enruta de forma transparente mediante `http-proxy-middleware`.
* **Seguridad Centralizada:** Resuelve los problemas de vulnerabilidades web implementando `Helmet` (protección de cabeceras HTTP), `CORS` (control de acceso de dominios cruzados) y `express-rate-limit` (prevención de ataques de denegación de servicio o fuerza bruta).
* **Autenticación mediante JWT:** Las rutas sensibles hacia los microservicios internos están protegidas mediante un middleware que exige, valida y decodifica un JSON Web Token (JWT) antes de permitir el paso de la petición.
* **Modularidad (Adaptación de Arquetipos Maven):** Cumpliendo con el estándar requerido, la arquitectura modular tradicional de Java/Maven se adapta al ecosistema Node.js/NPM, aislando las responsabilidades de este Gateway en su propio `package.json` y repositorio independiente.

##  Stack Tecnológico
* **Runtime:** Node.js
* **Framework:** Express.js
* **Proxy:** http-proxy-middleware
* **Seguridad:** jsonwebtoken, helmet, cors, express-rate-limit

| Método | Ruta | Acción | Seguridad |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/login` | Autenticación de usuario y generación de JWT. | Pública |
| **ANY** | `/api/donaciones/*` | Derivación al Microservicio de Donaciones. | Pública |
| **ANY** | `/api/logistica/*` | Derivación al Microservicio de Logística. | Pública |
| **ANY** | `/api/terreno/*` | Derivación al Microservicio de Terreno. | **Requiere Token JWT** |

##  Instalación y Uso

1. **Clonar el repositorio**
   Se utiliza Git para el control de versiones y el trabajo colaborativo del equipo.
   ```bash
   git clone https://github.com/DamagedGhost/donaton-api.git
   cd donaton-api

## **Configuración de entorno**

2. **Crear un archivo .env**
  Se utiliza un archivo .env para poder manejar variables del entorno como puerto, rutas de microservicios o secreto de JWT.
    ```bash
    PORT=3000
    DONACIONES_SERVICE_URL=http://localhost:3001
    LOGISTICA_SERVICE_URL=http://localhost:3002
    TERRENO_SERVICE_URL=http://localhost:3003
    JWT_SECRET=secreto

## **Instalar dependencias y correr la API**

3. **Gestor de dependencias de Node.js**
   Para que todo funcione se necesita instalar el gestor de dependencias de Node.js npm y arrancar la api para que empiece a recibir peticiones.
    ```bash
    npm install
    npm start

**Nota de Calidad:** Los reportes de cobertura certifican que tanto el middleware de autenticación JWT como los endpoints de proxy derivan el tráfico de manera segura y validada hacia los microservicios correspondientes, previniendo accesos no autorizados.
