require("dotenv").config();

import * as dataStore from "./data-store";
import socket from "./socket";
import * as types from "./types";

const main = async () => {

    try {
        const port = parseInt(process.env.SOCKET_PORT as string, 10);

        socket.listen(port);

        let data = await dataStore.generateDataStore({
            primaries: [],
            nextAPRequestURL: process.env.AP_URL as string,
        });

        socket.on("connection", (clientSocket) => {
            clientSocket.emit("data", JSON.stringify({ primaries: data.primaries }));
        });

        const updateDataStore = async (): Promise<void> => {
            data = await dataStore.generateDataStore(data);
        };

        const broadcastData = (): void => {
            socket.sockets.emit("data", JSON.stringify({ primaries: data.primaries }));
        };

        const updateAndPushNewData = async (): Promise<void> => {
            await updateDataStore();
            console.log("broadcasting");
            broadcastData();
        };

        setInterval(updateAndPushNewData, 90000);
    } catch (error) {
        throw error;
    }
};

main();
