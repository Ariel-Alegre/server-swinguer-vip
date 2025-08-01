const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Perfil = sequelize.define('Perfil', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    usuarioId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },

    nombre_visible: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Usuario VIP',
    },
  genero: {
       type: DataTypes.STRING,

      allowNull: true,
    },

      busco: {
       type: DataTypes.STRING,

      allowNull: true,
    },
    fecha_nacimiento : {
      type: DataTypes.STRING,
      allowNull: true,
    },

    direccion: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    descripcion: {
      type: DataTypes.STRING(1000),
      allowNull: true,
      defaultValue: 'Privada. Solo comparto detalles si me interesa tu perfil.',
    },

    fotos: {
      type: DataTypes.ARRAY(DataTypes.JSON),
      allowNull: true,
    },

    visibilidad_foto: {
            type: DataTypes.BOOLEAN,
        defaultValue: false,

    },
 perfil_publico: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    privacidad_activa: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

     verificado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }

  }, {
    tableName: 'Perfiles',
    timestamps: true,
  });

  return Perfil;
};
