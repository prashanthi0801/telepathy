// const io = require("socket.io");
const { join } = require('node:path');
const cors = require("cors");
const port=3000;
const express = require('express');
const { Server } = require('socket.io');

const app = express();
const { createServer } = require('node:http');
const server = createServer(app);
const io = new Server(server);
// const app = express();
// const server = createServer(app);

// app.get('/', (req, res) => {
//   res.send('<h1>Hello world</h1>');
// });
let onlineUsers={};
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '..', 'frontend', 'dashboard.html'));
});

io.on("connection",socket=>{
    socket.on("register",username=>{
        onlineUsers[socket.id]=username;

        io.emit("online-users",onlineUsers);
    })


})
server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});