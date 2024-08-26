import "./env.js"
import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import http from "http";


const app = express();

// 1. create server using http.
const server = http.createServer(app);

// 2. create socket srver.
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// use socket event.
io.on("connection", (socket) => {
    console.log("Connection is established");

    socket.on("disconnect", () => {
        console.log("Connection is Disconnected");
    });
});

const port = process.env.PORT || 3000; // Default to 3000 if PORT is not defined 
server.listen(port, () => {
    console.log("server is listening on PORT 3000")
})
