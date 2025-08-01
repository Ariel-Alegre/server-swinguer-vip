const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Usuario = sequelize.define('Usuario', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

 

    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    apellido: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    correo_electronico: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    contraseña: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    telefono: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    color_del_fondo: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    pais: {
      type: DataTypes.STRING,
      allowNull: true,
    },

       estado: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    role: {
      type: DataTypes.STRING,
      defaultValue: 'usuario', // o 'vip', 'admin', etc.
    },

  }, {
    tableName: 'Usuarios',
    timestamps: true, // createdAt y updatedAt
  });

  return Usuario;
};
