import { io } from "socket.io-client";

let socket;
export const getSocket = () => {
  if (!socket) {
    socket = io("https://bidarena-backend-su27.onrender.com", {
      transports: ["websocket", "polling"],
      autoConnect: false,
    });
  }
  return socket;
};