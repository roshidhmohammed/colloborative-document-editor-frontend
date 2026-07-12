"use client";

import { createContext, useContext, useEffect } from "react";

import { Socket } from "socket.io-client";

import { getSocket } from "@/lib/socket";

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socket = getSocket();

  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const socket = useContext(SocketContext);

  if (!socket) {
    throw new Error("SocketProvider missing");
  }

  return socket;
}
