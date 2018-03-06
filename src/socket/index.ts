import { createServer } from "http";
import * as socketIO from "socket.io";
const server = createServer();
const io = socketIO(server, {
    path: "/2018-primary-elections",
    serveClient: false,
});

export default io;
