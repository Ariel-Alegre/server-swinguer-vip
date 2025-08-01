require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const {
  DB_USER, DB_PASSWORD, DB_HOST, DB_DATABASE, DB_PORT
} = process.env;

const sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`, {
  logging: false,
  native: false,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
});

const basename = path.basename(__filename);
const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, '/models'))
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)));
  });

// Injectamos la conexión (sequelize) a todos los modelos
modelDefiners.forEach(model => model(sequelize));

// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
sequelize.models = Object.fromEntries(capsEntries);

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring



// Obtener modelos
const {
  Usuario,
Perfil,
Like,

Message
} = sequelize.models;

// RELACIONES
Usuario.hasOne(Perfil, { foreignKey: 'usuarioId' });
Perfil.belongsTo(Usuario, { foreignKey: 'usuarioId' });


Usuario.hasMany(Like, { foreignKey: 'usuarioId', as: 'likes' });
Usuario.hasMany(Like, { foreignKey: 'likedUserId', as: 'likedBy' });
  Like.belongsTo(Usuario, { as: 'usuario', foreignKey: 'usuarioId' });
    Like.belongsTo(Usuario, { as: 'likedUser', foreignKey: 'likedUserId' });


    // en db.js o index.js, después de definir todos los modelos:
Message.belongsTo(Usuario, { as: 'emisor', foreignKey: 'emisorId' });
Message.belongsTo(Usuario, { as: 'receptor', foreignKey: 'receptorId' });

module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize,     // para importar la conexión { conn } = require('./db.js');
};
