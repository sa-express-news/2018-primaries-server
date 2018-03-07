import { createServer, IncomingMessage, ServerResponse } from "http";
import * as socketIO from "socket.io";


const handler = (req: IncomingMessage, res: ServerResponse) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
}
const server = createServer(handler);
const io = socketIO(server, {
    path: "/2018-primary-elections",
    serveClient: false,
    origins: '*:*'
});

export default io;
