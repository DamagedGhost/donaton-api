const jwt = require('jsonwebtoken');
require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const verifyToken = require('./middlewares/verifyToken');

const app = express();


// Capas de Seguridad Iniciales (Siempre van primero)
app.use(helmet()); 
app.use(cors()); 
app.use(logger('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { error: 'Demasiadas peticiones desde esta IP, por favor intente más tarde.' }
});
app.use(limiter);

// Enrutamiento a Microservicios  
app.use('/api/donaciones', createProxyMiddleware({ 
    target: process.env.DONACIONES_SERVICE_URL, 
    changeOrigin: true 
}));

app.use('/api/logistica', verifyToken, createProxyMiddleware({ 
    target: process.env.LOGISTICA_SERVICE_URL, 
    changeOrigin: true 
}));

app.use('/api/terreno', verifyToken, createProxyMiddleware({ 
    target: process.env.TERRENO_SERVICE_URL, 
    changeOrigin: true 
}));


// Middlewares 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// Rutas Propias del API Gateway

app.post('/api/auth/login', (req, res) => {
  // Simulamos que leemos el body (en la vida real, esto iría a una BD)
  const { usuario, password } = req.body;

  if (usuario === 'admin' && password === 'admin123') {
    // ¡Credenciales correctas! Fabricamos el token
    const payload = { usuario: 'admin', rol: 'coordinador' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.json({ message: "Login exitoso", token: token });
  } else {
    res.status(401).json({ error: 'Credenciales inválidas' });
  }
});


// Manejo de Errores 
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