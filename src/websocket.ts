import 'dotenv/config';
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { getDrivingVehicles } from './api';
import { CronJob } from 'cron';

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: process.env.WS_CORS_ORIGIN,
    }
});

io.on("connection", async (socket: Socket) => {
    const vehicles = await getDrivingVehicles();
    socket.emit("vehicles", vehicles);
});

async function emitVehicles() {
    const vehicles = await getDrivingVehicles();
    io.emit("vehicles", vehicles);
}

httpServer.listen(3000);

new CronJob(
	'* * * * * *',
	function () {
        emitVehicles();
	},
	null, // onComplete
	true, // start
	'Europe/Amsterdam'
);
