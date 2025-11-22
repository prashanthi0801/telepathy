const { join } = require("node:path");
const cors = require("cors");
const express = require("express");
const { Server } = require("socket.io");
const path = require("path");
const { createServer } = require("node:http");

const app = express();
const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://127.0.0.1:5501"],
        methods: ["GET", "POST"]
    }
});

app.use(cors({ origin: "http://127.0.0.1:5501" }));
app.use(express.static(path.join(__dirname, "..", "frontend")));

let onlineUsers = {};
let messages = [];   

app.get("/", (req, res) => {
    res.sendFile(join(__dirname, "..", "frontend", "dashboard.html"));
});

io.on("connection", (socket) => {
    socket.emit("chat-history", messages);
    socket.on("register", (username) => {
        onlineUsers[socket.id] = username;
        io.emit("online-users", onlineUsers);
    });
    socket.on("send-message", (msgObj) => {
        messages.push(msgObj);          
        io.emit("new-message", msgObj); 
    });
    socket.on("disconnect", () => {
        delete onlineUsers[socket.id];
        io.emit("online-users", onlineUsers);
    });
});

server.listen(3000, () => {
    console.log("server running at http://localhost:3000");
});
