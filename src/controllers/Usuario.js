require('dotenv').config();
const nodemailer = require('nodemailer');
const cloudinary = require('cloudinary').v2;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { Usuario, Perfil, Like} = require('../db'); // Asegúrate de tener bien asociadas las relaciones
const streamifier = require('streamifier');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  
});
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

module.exports = {
  Registrarse: async (req, res) => {
    try {
      const { nombre, apellido, correo_electronico, contraseña, telefono, pais, role, avatar } = req.body;

      const usuarioExistente = await Usuario.findOne({ where: { correo_electronico } });
      if (usuarioExistente) {
        return res.status(400).json({ message: 'Ya existe un usuario con ese correo electrónico.' });
      }

      const hashedPassword = await bcrypt.hash(contraseña, 10);

      const nuevoUsuario = await Usuario.create({
        nombre,
        apellido,
        correo_electronico,
        contraseña: hashedPassword,
        telefono,
        pais,
        role: role || 'usuario',
        color_del_fondo: getRandomColor(),
        avatar,
        estado: "activo"
      });

      const perfil = await Perfil.create({
        usuarioId: nuevoUsuario.id,
        nombre_visible: `${nombre} ${apellido.charAt(0)}.`,
        descripcion: null,
        visibilidad_foto: false,
         privacidad_activa: false,
        perfil_publico: true,
          verificado: false, 
      });
      const emailContent = `
<html>
  <body style="background-color: #f4f4f4; padding: 2em 0;">
    <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #fff; border: 1px solid #ddd; border-radius: 10px; font-family: Arial, Helvetica, sans-serif; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
      
      <tr>
        <td style="
          background: linear-gradient(135deg, #363683, #d62874);
          text-align: center;
          padding: 1.5em;
          border-top-left-radius: 10px;
          border-top-right-radius: 10px;
        ">
          <img src="https://res.cloudinary.com/dz0lruj7k/image/upload/v1754070475/avatars/cozmn15y8ogl97f81wtz.png" alt="Swingers VIP" style="display: block; max-width: 160px; margin: 0 auto;">
        </td>
      </tr>

      <tr>
        <td style="padding: 2em; color: #333;">
          <h2 style="color: #363683; margin-bottom: 0.5em;">¡Bienvenido/a a Swingers VIP, ${nombre} ${apellido}!</h2>
          
          <p style="color: #444; font-size: 15px;">
            Tu cuenta ha sido creada con éxito y ya formas parte de nuestra exclusiva comunidad.
          </p>

          <p style="color: #444; font-size: 15px;">
            Explora perfiles, conecta con personas afines y viví nuevas experiencias dentro de un entorno seguro, respetuoso y totalmente privado.
          </p>

          <div style="margin: 2em 0; text-align: center;">
            <a href="https://www.elaritech.com/" target="_blank" style="background-color: #d62874; color: #fff; padding: 0.9em 1.8em; border-radius: 5px; text-decoration: none; font-weight: bold;">
              Ingresar a la plataforma
            </a>
          </div>

          <p style="color: #555; font-size: 14px;">
            ¿Tenés alguna pregunta o necesitás asistencia? <a href="https://swingersvip.com/contacto" style="color: #363683;" target="_blank">Contactanos aquí</a>. Nuestro equipo está para ayudarte.
          </p>

          <p style="margin-top: 2.5em; color: #888; font-size: 12px;">
            Este correo fue generado automáticamente. Por favor, no respondas a esta dirección.
          </p>

          <p style="color: #555; font-size: 13px;">
            — El equipo de <strong>Swingers VIP</strong>
          </p>
        </td>
      </tr>

    </table>
  </body>
</html>



      `;

      await transporter.sendMail({
        from: "info@elaritech.com",
        to: correo_electronico,
        subject: '¡Hemos recibido tu solicitud de cotización.!',
        html: emailContent,
      });

      return res.status(201).json({ usuario: nuevoUsuario, perfil });
    } catch (error) {
      console.error("❌ Error en el servidor:", error);
      return res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

IniciarSesion: async (req, res) => {
  try {
    const { correo_electronico, contraseña } = req.body;

    const usuario = await Usuario.findOne({ where: { correo_electronico } });
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    if (!usuario.contraseña) {
      return res.status(500).json({ message: 'La contraseña del usuario es inválida o no está definida.' });
    }

    const match = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!match) {
      return res.status(401).json({ message: 'Contraseña incorrecta.' });
    }

    const token = jwt.sign(
      { id: usuario.id, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: '15d' }
    );

    return res.status(200).json({ token, usuario });
  } catch (error) {
    console.error("❌ Error en el servidor:", error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
},

  DataPersonal: async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token no proporcionado o inválido.' });
      }

      const token = authHeader.split(' ')[1];

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(401).json({ message: 'Token inválido o expirado.' });
      }

      const usuario = await Usuario.findByPk(decoded.id, {
        attributes: { exclude: ['contraseña'] },
        include: [{ model: Perfil }],
      });

      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }

      return res.status(200).json(usuario);
    } catch (error) {
      console.error("❌ Error al obtener perfil con token:", error);
      return res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  },

  Perfil: async (req, res) => {
    try {
      const { id } = req.params;

      const usuario = await Usuario.findByPk(id, {
        attributes: { exclude: ['contraseña'] },
        include: [{ model: Perfil }],
      });

      if (!usuario) {
        return res.status(404).json({ message: 'Perfil no encontrado.' });
      }

      return res.status(200).json(usuario);
    } catch (error) {
      console.error("❌ Error al obtener perfil:", error);
      return res.status(500).json({ error: error.message });
    }
  },

 ActualizarPerfil: async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token no proporcionado o inválido.' });
    }
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Token inválido o expirado.' });
    }

    const usuario = await Usuario.findByPk(decoded.id, {
      include: [{ model: Perfil }],
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Recibí descripción, direccion, avatar, etc del req.body
    const { descripcion, direccion, fecha_nacimiento, genero, busco, perfil_publico} = req.body;

    // Subir fotos a Cloudinary y armar array de { url }
    let fotosArray = [];
    if (req.files && req.files['fotos']) {
      const uploadPromises = req.files['fotos'].map(
        (file) =>
          new Promise((resolve, reject) => {
            const upload_stream = cloudinary.uploader.upload_stream(
              { folder: 'perfil_fotos' },
              (error, result) => {
                if (error) reject(error);
                else resolve({ url: result.secure_url });
              }
            );
            streamifier.createReadStream(file.buffer).pipe(upload_stream);
          })
      );

      fotosArray = await Promise.all(uploadPromises);
    }

    // Actualizar perfil
    await Perfil.update(
      {
        descripcion,
        direccion,
        fecha_nacimiento,
        genero,
        perfil_publico,
        busco,
        fotos: fotosArray.length > 0 ? fotosArray : usuario.Perfil.fotos, // conservar fotos si no subieron nuevas
      },
      { where: { id: usuario.Perfil.id } }
    );

    return res.status(200).json({ message: 'Perfil actualizado correctamente.' });
  } catch (error) {
    console.error('❌ Error al actualizar perfil:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
},

EliminarFotoPerfil: async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token no proporcionado o inválido.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await Usuario.findByPk(decoded.id, { include: [Perfil] });
    if (!usuario || !usuario.Perfil) {
      return res.status(404).json({ message: 'Perfil no encontrado.' });
    }

    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ message: 'URL de la foto requerida.' });
    }

    // Obtener public_id desde la URL de Cloudinary
    const publicId = url.split('/').slice(-1)[0].split('.')[0];
    const folder = 'perfil_fotos';
    const fullPublicId = `${folder}/${publicId}`;

    // Eliminar de Cloudinary
    await cloudinary.uploader.destroy(fullPublicId);

    // Eliminar del array de fotos
    const nuevasFotos = (usuario.Perfil.fotos || []).filter(f => f.url !== url);

    // Actualizar en DB
    await Perfil.update({ fotos: nuevasFotos }, { where: { id: usuario.Perfil.id } });

    return res.status(200).json({ message: 'Foto eliminada correctamente.' });
  } catch (error) {
    console.error('❌ Error al eliminar foto:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
},



Perfiles: async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token no proporcionado o inválido.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Token inválido o expirado.' });
    }

    const usuario = await Usuario.findByPk(decoded.id, {
      include: [{ model: Perfil }],
    });

    if (!usuario || !usuario.Perfil) {
      return res.status(404).json({ message: 'Usuario o perfil no encontrado.' });
    }

    const paisUsuario = usuario.pais;
    const busco = usuario.Perfil.busco;

    if (!busco) {
      return res.status(400).json({ message: 'Debes especificar a quién estás buscando en tu perfil.' });
    }

    // Determinar qué género buscar según "busco"
    let generoBuscado;
    if (busco === 'Mujeres') generoBuscado = ['Femenino'];
    else if (busco === 'Hombres') generoBuscado = ['Masculino'];
    else if (busco === 'Ambos') generoBuscado = ['Masculino', 'Femenino'];
    else {
      return res.status(400).json({ message: 'Valor de "busco" inválido.' });
    }

    // Buscar con condiciones básicas
const usuarios = await Usuario.findAll({
  where: {
    pais: paisUsuario,
    id: { [Op.ne]: usuario.id },
  },
  include: [
    {
      model: Perfil,
      where: {
        genero: { [Op.in]: generoBuscado },
        perfil_publico: true,
        busco: { [Op.ne]: null },
        descripcion: { [Op.ne]: null },
      }
    }
  ],
  attributes: { exclude: ['contraseña'] },
});

// Filtro en JS para validar campos necesarios
const filtrados = usuarios.filter(u => {
  const perfil = u.Perfil;

  const tieneFotos = Array.isArray(perfil?.fotos) && perfil.fotos.length > 0;
  const descripcionValida = perfil?.descripcion?.trim().length > 0;

  // Validar fecha_nacimiento como una fecha válida y real
  const fecha = perfil?.fecha_nacimiento;
  const fechaValida = !!fecha && !isNaN(new Date(fecha).getTime());

  return tieneFotos && descripcionValida && fechaValida;
});

return res.status(200).json(filtrados);


  } catch (error) {
    console.error('❌ Error al obtener perfiles:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
},

DetallePerfil: async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ['contraseña'] },
      include: [{
        model: Perfil,
        where: {
          perfil_publico: true,
        },
        required: true,
      }],
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado o perfil no público.' });
    }

    return res.status(200).json(usuario);
  } catch (error) {
    console.error('❌ Error al obtener detalle de usuario:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
},

DarLike: async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token no proporcionado o mal formado.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Token inválido o expirado.' });
    }

    const usuarioId = decoded.id;
    const { likedUserId } = req.body;

    if (!likedUserId) {
      return res.status(400).json({ message: 'Falta el ID del usuario al que das like.' });
    }

    if (usuarioId === likedUserId) {
      return res.status(400).json({ message: 'No puedes likearte a ti mismo.' });
    }

    // Verificar si ambos usuarios existen
    const usuario = await Usuario.findByPk(usuarioId);
    const likedUser = await Usuario.findByPk(likedUserId);

    if (!usuario || !likedUser) {
      return res.status(404).json({ message: 'Uno o ambos usuarios no existen.' });
    }

    // Verificar si ya existe el like
    const yaExiste = await Like.findOne({ where: { usuarioId, likedUserId } });
    if (yaExiste) {
      return res.status(200).json({ message: 'Ya habías dado like a este perfil.' });
    }

    // Crear el nuevo like
    const nuevoLike = await Like.create({ usuarioId, likedUserId });
    return res.status(201).json({ message: 'Like registrado correctamente.', like: nuevoLike });

  } catch (error) {
    console.error('❌ Error al guardar like:', error);
    return res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
  }
},

 MisLikes: async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token requerido.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuarioId = decoded.id;

    const likes = await Like.findAll({
      where: { usuarioId },
      include: [{
        model: Usuario,
        as: 'likedUser',
        attributes: ['id', 'nombre', 'apellido', 'color_del_fondo'],
        include: ['Perfil'],
      }],
    });

    return res.status(200).json(likes.map(l => l.likedUser));
  } catch (error) {
    console.error('❌ Error al obtener likes:', error);
    return res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
}




};
