import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { corsOptionsWebSocket } from './cors.js';
import { wsRoutes } from './routes/wsRoutes.js';

const server = createServer(app);
const io = new Server(server, {
  path: '/socket.io',
  cors: {
    origin: (origin, callback) => {
      corsOptionsWebSocket(origin, callback)
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization'],
    credentials: true,
  },
});
wsRoutes(io)

server.listen(9090, () => {
  console.log('Server running at http://localhost:9090');
});

export { io };
