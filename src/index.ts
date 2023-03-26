import ChatMessage from "./models/ChatMessage";
import UserData from "./models/UserData";
import { io, server } from "./server";
import { avatarsInUse, currentTime } from "./utils/functions";

let currentRoomId = "";

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("set_user_data", (userData: UserData) => {
    socket.data = userData;
  });

  socket.on("join_room", (roomId: string) => {
    currentRoomId = roomId;
    socket.join(roomId);

    avatarsInUse(currentRoomId);
    // test
    // const clients = io.sockets.adapter.rooms.get(roomId)?.size;
    // console.log(`Number of clients in ${roomId}: ${clients}`);
    // test
  });

  socket.on("check_avatars_in_use", (roomId: string) => {
    avatarsInUse(roomId);
  });

  socket.on("choose_avatar", (avatar: string) => {
    const joinRoomMessage: ChatMessage = {
      avatar: avatar,
      userName: socket.data.userName,
      message: "User joined Room",
      currentTime: currentTime(),
    };

    avatarsInUse(socket.data.roomId);
    io.to(currentRoomId).emit("user_joined", joinRoomMessage);
  });

  socket.on("send_message", (data: ChatMessage) => {
    if (!data.roomId || !data.message) {
      return console.error("Invalid message data");
    }

    socket.to(data.roomId).emit("receive_message", data);
  });

  socket.on("leave_room", (roomId: string) => {
    const leaveRoomMessage: ChatMessage = {
      avatar: socket.data.avatar,
      userName: "",
      message: `User left: ${socket.data.userName}`,
      currentTime: currentTime(),
    };

    socket.leave(roomId);
    io.to(roomId).emit("user_left", leaveRoomMessage);
    avatarsInUse(socket.data.roomId);
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
    avatarsInUse(socket.data.roomId);
    console.log(`User Disconnected: ${socket.id}`);
  });
});

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
