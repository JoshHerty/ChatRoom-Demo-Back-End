const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (roomId) => {
    io.to(roomId).emit("user_joined", `User joined: ${socket.id}`);
    socket.join(roomId);
    console.log(`${socket.id} has joined the room`);
  });

  socket.on("leave_room", (roomId) => {
    socket.leave(roomId);
    io.to(roomId).emit("user_left", `User left: ${socket.id}`);
    console.log(`User ${socket.id} left room ${roomId}`);
  });

  socket.on("send_message", (data) => {
    if (!data.roomId || !data.message) {
      return console.error("Invalid message data");
    }

    socket.to(data.roomId).emit("receive_message", data.message);
    console.log(data);
    console.log(
      `User ${socket.id} sent the message (${data.message.slice(
        0,
        15
      )}...) to room ${data.roomId}`
    );
  });

  socket.on("disconnect", () => {
    io.emit("user_disconnected", `User Disconnected: ${socket.id}`);

    console.log(`User Disconnected: ${socket.id}`);
  });
});

server.listen(3001, () => {
  console.log("Server is running");
});
