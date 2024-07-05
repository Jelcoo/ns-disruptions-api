import 'dotenv/config';
import { Server } from 'socket.io';

console.log('Websocket server started');

const io = new Server(3000);

io.on('connection', (socket) => {
    console.log('Client connected');
});
