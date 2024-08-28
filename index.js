import "./env.js";
import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import http from "http";

const app = express();

// Create server using http.
const server = http.createServer(app);

// Create Socket.IO server.
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust this as needed
        methods: ["GET", "POST"]
    }
});

// Use Socket.IO event.
io.on("connection", (socket) => {
    console.log("Connection established");

    socket.on("new_message", (message) => {
        // Broadcast the message all the users.
        socket.broadcast.emit("braodcast_message", message)
    });

    socket.on("disconnect", () => {
        console.log("Connection disconnected");
    });
});

const port = process.env.PORT || 3000; // Default to 3000 if PORT is not defined
server.listen(port, () => {
    console.log(`Server is listening on PORT ${port}`);
}).on('error', (err) => {
    console.error('Error starting server:', err);
});
