import 'dotenv/config';
import { createServer } from "http";
import { Server, Socket } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: process.env.WS_CORS_ORIGIN,
    }
});

io.on("connection", (socket: Socket) => {
    console.log("Connected: " + socket.id);
});

httpServer.listen(3000);
