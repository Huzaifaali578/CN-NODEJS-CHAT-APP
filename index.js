import "./env.js"
import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import http from "http";
import { connect } from "./config.js";
import { chatModel } from "./chat.schema.js";
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const corsOptions = {
    origin: 'https://cn-nodejs-chat-app.onrender.com'
};

app.use(cors(corsOptions));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'client.html'));
});

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

    socket.on("join", (data) => {
        socket.userName = data;
        console.log(`${data} joined the chat`);

        // Send old messages to the client.
        chatModel.find().sort({ timestamp: 1 }).limit(50)
            .then(messages => {
                socket.emit("load_message", messages);
            })
            .catch(err => {
                console.error("Error loading messages:", err);
            });
    });

    socket.on("new_message", (message) => {
        const userMessage = {
            userName: socket.userName,
            message: message
        };
    
        const newChat = new chatModel({
            userName: socket.userName,
            message: message,
            timestamp: new Date() // Add timestamp for correct ordering
        });
    
        newChat.save()
            .then(() => {
                // Broadcast the message to all users except the sender
                socket.broadcast.emit("broadcast_message", userMessage);
            })
            .catch(err => {
                console.error("Error saving message:", err);
            });
    });

    socket.on("disconnect", () => {
        console.log(`${socket.userName} disconnected`);
    });
});

const port = process.env.PORT || 3000; // Default to 3000 if PORT is not defined
server.listen(port, () => {
    console.log(`Server is listening on PORT ${port}`);
    connect();
}).on('error', (err) => {
    console.error('Error starting server:', err);
});
