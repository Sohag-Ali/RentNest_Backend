import http from "http";
import { JwtPayload } from "jsonwebtoken";
import { Server as SocketIOServer, Socket } from "socket.io";
import config from "../config";
import { prisma } from "./prisma";
import { jwtUtils } from "../utils/jwt";

let io: SocketIOServer | null = null;

export const initSocketIO = (server: http.Server) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: config.app_url,
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE"],
    },
  });

  // Connection middleware for JWT authentication
  io.use(async (socket: Socket, next) => {
    try {
      let token: string | undefined = socket.handshake.auth?.token;

      if (!token && socket.handshake.headers?.authorization) {
        const authHeader = socket.handshake.headers.authorization;
        token = authHeader.startsWith("Bearer ")
          ? authHeader.split(" ")[1]
          : authHeader;
      }

      if (!token && socket.handshake.headers?.cookie) {
        const cookieHeader = socket.handshake.headers.cookie;
        const cookies = cookieHeader
          .split(";")
          .reduce((acc: Record<string, string>, curr) => {
            const [key, value] = curr.trim().split("=");
            if (key && value) acc[key] = decodeURIComponent(value);
            return acc;
          }, {});
        token = cookies.accessToken;
      }

      if (!token) {
        return next(new Error("Authentication error: Token missing"));
      }

      const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);
      if (!verifiedToken.success || !verifiedToken.data) {
        return next(new Error("Authentication error: Invalid or expired token"));
      }

      const decoded = verifiedToken.data as JwtPayload;
      if (!decoded || !decoded.id) {
        return next(new Error("Authentication error: User ID missing in token payload"));
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      if (user.status === "BANNED") {
        return next(new Error("Authentication error: Account has been banned"));
      }

      // Attach authenticated user payload to socket
      socket.data.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };

      next();
    } catch (error) {
      return next(new Error("Authentication error: Socket connection unauthorized"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = socket.data.user;

    if (user?.id) {
      const userRoom = `user:${user.id}`;
      socket.join(userRoom);
      console.log(`[Socket.IO] Connected: User ${user.id} (${user.email}) joined room ${userRoom}`);
    }

    socket.on("disconnect", () => {
      if (user?.id) {
        console.log(`[Socket.IO] Disconnected: User ${user.id}`);
      }
    });
  });

  return io;
};

export const getIO = (): SocketIOServer | null => {
  return io;
};

