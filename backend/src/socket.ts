import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { Server, Socket } from "socket.io";
import { JwtPayload } from "./types/auth";

let io: Server | null = null;

const extractSocketToken = (authHeader?: string, authToken?: string): string | null => {
  if (authToken) {
    return authToken;
  }

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1] ?? null;
  }

  return null;
};

export const initSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });

  io.use((socket: Socket, next) => {
    try {
      const authHeader = socket.handshake.headers.authorization as string | undefined;
      const authToken = socket.handshake.auth?.token as string | undefined;
      const token = extractSocketToken(authHeader, authToken);

      if (!token) {
        return next(new Error("Authentication token missing"));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;

      socket.data.user = decoded;
      return next();
    } catch {
      return next(new Error("Invalid socket token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = socket.data.user as JwtPayload | undefined;
    if (!user?.id) {
      socket.disconnect();
      return;
    }

    socket.join(user.id);
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io has not been initialized");
  }
  return io;
};

export const emitAttendanceUpdated = (
  studentUserId: string,
  payload: Record<string, unknown>
): void => {
  if (!io) {
    return;
  }

  io.to(studentUserId).emit("attendanceUpdated", payload);
};
