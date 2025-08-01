const http = require('http');
const server = require('./src/app.js'); // tu express app
const { conn } = require('./src/db.js');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3001;

const httpServer = http.createServer(server);

const io = new Server(httpServer, {
  cors: {
    origin: '*', // cambiar en producción por tu frontend
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`Usuario ${socket.id} se unió a la sala ${roomId}`);
  });

  socket.on('sendMessage', ({ roomId, message, emisorId }) => {
    const msg = { message, emisorId, fecha: new Date() };
    io.to(roomId).emit('receiveMessage', msg);
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

conn.sync({ force: false }).then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
});
