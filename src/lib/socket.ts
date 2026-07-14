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
      // Do not set Cookie here — forbidden in browsers. Auth goes via `auth.token`.
      extraHeaders: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });
  }

  return socket;
};
