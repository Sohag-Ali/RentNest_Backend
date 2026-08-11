import http from "http";
import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";
import { initSocketIO } from "./lib/socket";

const PORT = config.port;

async function main() {
    try {
        await prisma.$connect();
        console.log("Connected to the database");

        const server = http.createServer(app);
        initSocketIO(server);

        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Error starting server:", error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();