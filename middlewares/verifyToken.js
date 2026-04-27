const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Obtenemos el token de la cabecera 'Authorization'
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    }

    try {
        // Verificamos el token usando el secreto del .env
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Guardamos los datos del usuario en la request
        next(); // Permitimos que la petición continúe hacia el microservicio
    } catch (error) {
        res.status(403).json({ error: 'Token inválido o expirado.' });
    }
};

module.exports = verifyToken;