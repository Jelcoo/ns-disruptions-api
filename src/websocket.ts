import 'dotenv/config';
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { getDrivingVehicles } from './api';

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: process.env.WS_CORS_ORIGIN,
    }
});

let activeVehicles: any = null;
let counter = 0;

io.on("connection", async (socket: Socket) => {
    if (activeVehicles) {
        socket.emit("vehicles", activeVehicles);
    }
});

async function emitVehicles() {
    let vehicles = await getDrivingVehicles();
    activeVehicles = vehicles;
    vehicles.counter = counter++;
    io.emit("vehicles", vehicles);
    setTimeout(emitVehicles, 1000);
}

httpServer.listen(3000);

emitVehicles();
