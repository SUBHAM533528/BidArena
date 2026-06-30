import { io } from "socket.io-client";

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io("/", { autoConnect: false, withCredentials: true });
  }
  return socket;
};
