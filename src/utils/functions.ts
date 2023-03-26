import { io } from "../server";

export const currentTime = () => {
  const now = new Date();

  return now.toLocaleTimeString();
};

export const avatarsInUse = (roomId: string): void => {
  const usersInRoom = Array.from(
    io.sockets.adapter.rooms.get(roomId)?.values() ?? []
  );

  const userDataArray: string[] = [];
  for (const socketId of usersInRoom) {
    const avatar = io.sockets.sockets.get(socketId)?.data.avatar;
    if (avatar) {
      userDataArray.push(avatar);
    }
  }

  io.to(roomId).emit("unavailable_avatars", userDataArray);

  // console.log(`User data array in room ${roomId}:`, userDataArray);
};
