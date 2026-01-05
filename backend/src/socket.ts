import { Server } from "socket.io";
import { Server as Engine } from "@socket.io/bun-engine";
import redis from "./redisconf";

export function initSocket(engine: Engine) {
  const io = new Server({
    cors: {
      origin: ["http://localhost:5173", process.env.FRONTEND_URL! as string],
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type"],
      credentials: true,
    },
  });

  io.bind(engine);

  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);
    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
    socket.on("join", (jobId) => {
      socket.join(jobId);
      console.log("joining room", jobId);
      socket.emit("joined", "room joined");
    });
  });

  redis.subscribe("progress", (message) => {
    try {
      const { jobId } = JSON.parse(message) as onProgressType;
      console.log("sharing message to room", jobId);
      io.to(jobId).emit("progress", message);
    } catch (error) {
      console.error(error);
    }
  });
}

type onProgressType = {
  jobId: string;
  status: string;
};
