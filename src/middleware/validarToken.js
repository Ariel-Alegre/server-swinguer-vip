// middleware/validarToken.js
const jwt = require('jsonwebtoken');
const { Usuario } = require('../db');

const validarToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'Se requiere autenticación' });
  }

  jwt.verify(token, process.env.FIRMA_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token no válido' });
    }

    // Extraemos el usuarioId del payload del token
    req.usuarioId = decoded.id;
    next(); // Continuamos con la siguiente función (en este caso la de obtener los productos)
  });
};

module.exports = validarToken;
