const express = require('express');
const router = express.Router();
const { crearMensaje, obtenerMensajes } = require('../controllers/Message');

router.post('/mensaje', crearMensaje);
router.get('/mensajes', obtenerMensajes);

module.exports = router;
