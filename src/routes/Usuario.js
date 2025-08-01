
const { Router  }= require('express');
const router = Router();
const {Registrarse, IniciarSesion, DataPersonal, ActualizarPerfil, DetallePerfil, EliminarFotoPerfil, Perfiles, DarLike, MisLikes} = require("../controllers/Usuario")
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.patch('/actualizar-perfil', upload.fields([{ name: 'fotos', maxCount: 10 }]), ActualizarPerfil);

router.post('/registrarse', Registrarse ) ;
router.post('/iniciar-sesion', IniciarSesion ) ;
router.get('/mi-perfil', DataPersonal ) ;
router.delete('/eliminar-foto', EliminarFotoPerfil ) ;
router.get('/perfiles', Perfiles ) ;
router.get('/perfil/:id', DetallePerfil ) ;



router.post('/like', DarLike);
router.get('/mis-likes', MisLikes);












module.exports = router