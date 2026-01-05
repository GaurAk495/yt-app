import { io } from "socket.io-client";

export function connectWs() {
  const socket = io(
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
    {
      withCredentials: true,
      transports: ["websocket"],
    }
  );
  return socket;
}
