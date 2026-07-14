import { io, Socket } from "socket.io-client";
import { env } from "@/config/env";
import { getClientAuthToken } from "@/lib/auth-token";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    const token = getClientAuthToken();

    socket = io(env.SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
      transports: ["websocket"],
      auth: token ? { token } : undefined,
      extraHeaders: token
        ? {
            Authorization: `Bearer ${token}`,
            Cookie: `token=${token}`,
          }
        : undefined,
    });
  }

  return socket;
};
