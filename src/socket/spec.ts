import { assert } from "chai";
import * as ioClient from "socket.io-client";
import ioServer from "./index";

const socketURL = "http://localhost:5000/2018-primary-elections";

// describe("Socket", () => {
//     describe("Test", () => {
//         let data: object = {};
//         ioServer.listen(5000);

//         let client: SocketIOClient.Socket;

//         after(async () => {
//             client.disconnect();
//             ioServer.close();
//         });

//         it("is a test", async () => {
//             client = await ioClient.connect(socketURL);
//             client.on("data", (message: any) => {
//                 data = JSON.parse(message);
//                 assert.property(data, "foo");
//             });
//         });
//     });
// });
