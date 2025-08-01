// controllers/messageController.js
const { Op } = require('sequelize');
const { Message } = require('../db');

const obtenerMensajes = async (req, res) => {
  const { emisorId, receptorId } = req.query;

  try {
    const mensajes = await Message.findAll({
      where: {
        [Op.or]: [
          { emisorId, receptorId },
          { emisorId: receptorId, receptorId: emisorId },
        ],
      },
      order: [['fecha', 'ASC']],
    });

    res.json(mensajes);
  } catch (error) {
    console.error('❌ Error al obtener mensajes:', error);
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
};
const crearMensaje = async (req, res) => {
  const { emisorId, receptorId, mensaje } = req.body;

  try {
    const nuevoMensaje = await Message.create({ emisorId, receptorId, mensaje });
    res.status(201).json(nuevoMensaje);
  } catch (error) {
    console.error('❌ Error al crear mensaje:', error);
    res.status(500).json({ error: 'Error al crear mensaje' });
  }
};



module.exports = { crearMensaje, obtenerMensajes };