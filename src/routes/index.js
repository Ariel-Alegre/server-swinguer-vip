
const { Router  }= require('express');
const router = Router();

const UsuarioRouter = require("./Usuario")
const MessageRouter = require("./Message")

















router.use('/api', UsuarioRouter, MessageRouter) 



















module.exports = router