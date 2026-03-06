import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

const getSocketUrl = (): string =>
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:6000";

export const connectSocket = (token: string): Socket => {
  if (socketInstance?.connected) {
    return socketInstance;
  }

  socketInstance = io(getSocketUrl(), {
    transports: ["websocket"],
    auth: { token },
  });

  return socketInstance;
};

export const disconnectSocket = (): void => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
