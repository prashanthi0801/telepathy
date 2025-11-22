// const io = require("socket.io");
const { join } = require("node:path");
const cors = require("cors");
const port = 3000;
const express = require("express");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const { createServer } = require("node:http");
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://127.0.0.1:5501"],
        methods: ["GET", "POST"]
    }
});

// ENABLE CORS FOR EXPRESS
app.use(cors({
    origin: "http://127.0.0.1:5501"
}));
// const io = new Server(server);

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, "..", "frontend")));

let onlineUsers = {};

// Serve dashboard.html
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "..", "frontend", "dashboard.html"));
});

// SOCKET.IO
io.on("connection", (socket) => {
  socket.on("register", (username) => {
    onlineUsers[socket.id] = username;

    io.emit("online-users", onlineUsers);
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
