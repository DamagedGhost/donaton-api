require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const verifyToken = require('./middlewares/verifyToken');

const app = express();

// 1. Capas de Seguridad y Programación Defensiva
app.use(helmet()); // Oculta cabeceras sensibles y previene inyecciones comunes
app.use(cors()); // Permite peticiones desde el frontend
app.use(logger('dev'));

// Proteger la ruta de terreno con el middleware
app.use('/api/terreno', verifyToken, createProxyMiddleware({ 
    target: process.env.TERRENO_SERVICE_URL, 
    changeOrigin: true 
}));

// Limitador de peticiones (Rate Limiting)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por IP cada 15 minutos
  message: { error: 'Demasiadas peticiones desde esta IP, por favor intente más tarde.' }
});
app.use(limiter);

// 2. Middlewares para parsear el body (solo necesarios para rutas propias del Gateway, como el login)
// Nota: Para las rutas proxy, a veces es mejor parsear en el microservicio destino.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 3. Rutas Propias del API Gateway (Ej: Autenticación)
app.post('/api/auth/login', (req, res) => {
  // Aquí irá la lógica para generar el JWT cuando un usuario/municipalidad se loguee
  res.json({ message: "Endpoint de login preparado" });
});

// 4. Enrutamiento (Proxy) hacia los Microservicios
// Redirige todo lo que entre a /api/donaciones al microservicio correspondiente
app.use('/api/donaciones', createProxyMiddleware({ 
    target: process.env.DONACIONES_SERVICE_URL, 
    changeOrigin: true 
}));

app.use('/api/logistica', createProxyMiddleware({ 
    target: process.env.LOGISTICA_SERVICE_URL, 
    changeOrigin: true 
}));

app.use('/api/terreno', createProxyMiddleware({ 
    target: process.env.TERRENO_SERVICE_URL, 
    changeOrigin: true 
}));

// 5. Manejo de Errores (Devolviendo JSON en lugar de HTML)
app.use(function(req, res, next) {
  res.status(404).json({ error: 'Ruta no encontrada en el API Gateway' });
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: 'Error interno del servidor',
    message: req.app.get('env') === 'development' ? err.message : 'Algo salió mal'
  });
});

module.exports = app;