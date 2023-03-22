import express from "express";
import cors from "cors";
import * as http from "http";
import { Server } from "socket.io";
import ChatMessage from "./models/ChatMessage";
import UserData from "./models/UserData";
import { currentTime } from "./utils/functions";

let currentRoomId = "";

const app = express();

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

  socket.on("set_user_data", (userData: UserData) => {
    socket.data = userData;
    console.log(socket.data);
  });

  socket.on("join_room", (roomId: string) => {
    currentRoomId = roomId;
    socket.join(roomId);
  });

  socket.on("choose_avatar", (avatar: string) => {
    const joinRoomMessage: ChatMessage = {
      avatar: avatar,
      userName: socket.data.userName,
      message: "User joined Room",
      currentTime: currentTime(),
    };

    io.to(currentRoomId).emit("user_joined", joinRoomMessage);
    console.log(`${socket.id} has joined the room`);
  });

  socket.on("send_message", (data: ChatMessage) => {
    if (!data.roomId || !data.message) {
      return console.error("Invalid message data");
    }

    socket.to(data.roomId).emit("receive_message", data);
    console.log(
      `User ${socket.id} sent the message (${data.message.slice(
        0,
        15
      )}...) to room ${data.roomId}`
    );
  });

  socket.on("leave_room", (roomId: string) => {
    const leaveRoomMessage = {
      avatar: socket.data.avatar,
      userName: "",
      message: `User left: ${socket.data.userName}`,
      currentTime: currentTime(),
    };

    socket.leave(roomId);
    io.to(roomId).emit("user_left", leaveRoomMessage);
    console.log(`User ${socket.id} left room ${roomId}`);
  });

  socket.on("disconnect", () => {
    const disconnectMessage: ChatMessage = {
      avatar: socket.data.avatar,
      userName: socket.data.userName,
      message: "User Disconnected",
      currentTime: currentTime(),
    };

    io.emit("user_disconnected", disconnectMessage);

    console.log(`User Disconnected: ${socket.id}`);
  });
});

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
