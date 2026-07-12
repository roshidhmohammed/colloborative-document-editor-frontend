import { io, Socket } from "socket.io-client";
import { env } from "@/config/env";

let socket: Socket | null = null;

export const getSocket = () => {
  
  if (!socket) {
    socket = io(env.SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
      transports: ["websocket"]
    });
  }

  return socket;
};