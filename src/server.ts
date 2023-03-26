import express from "express";
import cors from "cors";
import * as http from "http";
import { Server } from "socket.io";

const app = express();

app.use(cors());

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
