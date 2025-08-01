
const { DataTypes } = require('sequelize');
// models/Message.js
module.exports = (sequelize) => {
  const Message = sequelize.define('Message', {
    emisorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    receptorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });
  return Message;
};
