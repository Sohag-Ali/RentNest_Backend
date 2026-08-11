import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { getIO } from "../../lib/socket";
import { AppError } from "../../utils/AppError";
import {
  TCreateNotificationInput,
  TNotificationQueryFilters,
} from "./notification.interface";

export const createNotification = async (payload: TCreateNotificationInput) => {
  if (payload.entityId) {
    const existing = await prisma.notification.findFirst({
      where: {
        userId: payload.userId,
        type: payload.type,
        entityId: payload.entityId,
      },
    });

    if (existing) {
      return existing;
    }
  }

  const notification = await prisma.notification.create({
    data: {
      userId: payload.userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      entityId: payload.entityId,
      entityType: payload.entityType,
    },
  });

  // Real-time emit to authenticated user room: user:{userId}
  try {
    const io = getIO();
    if (io) {
      io.to(`user:${notification.userId}`).emit("notification:new", notification);
    }
  } catch (error) {
    console.error("[Socket.IO] Failed to emit real-time notification:", error);
  }

  return notification;
};

const getNotificationsFromDB = async (
  userId: string,
  filters: TNotificationQueryFilters
) => {
  const page = Number(filters.page) > 0 ? Number(filters.page) : 1;
  const limit = Number(filters.limit) > 0 ? Number(filters.limit) : 10;
  const skip = (page - 1) * limit;

  const whereCondition: Prisma.NotificationWhereInput = {
    userId,
  };

  if (filters.isRead !== undefined) {
    if (typeof filters.isRead === "boolean") {
      whereCondition.isRead = filters.isRead;
    } else if (filters.isRead === "true") {
      whereCondition.isRead = true;
    } else if (filters.isRead === "false") {
      whereCondition.isRead = false;
    }
  }

  if (filters.type) {
    whereCondition.type = filters.type;
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: whereCondition,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.notification.count({
      where: whereCondition,
    }),
  ]);

  const totalPage = Math.ceil(total / limit) || 0;

  return {
    data: notifications,
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
  };
};

const getUnreadCountFromDB = async (userId: string) => {
  const count = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });

  return { count };
};

const markAsReadInDB = async (userId: string, notificationId: string) => {
  const notification = await prisma.notification.findUnique({
    where: {
      id: notificationId,
    },
  });

  if (!notification) {
    throw new AppError(404, "Notification not found");
  }

  if (notification.userId !== userId) {
    throw new AppError(403, "Forbidden. You do not have permission to access this notification");
  }

  const updatedNotification = await prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      isRead: true,
    },
  });

  return updatedNotification;
};

const markAllAsReadInDB = async (userId: string) => {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  return { count: result.count };
};

const deleteNotificationFromDB = async (userId: string, notificationId: string) => {
  const notification = await prisma.notification.findUnique({
    where: {
      id: notificationId,
    },
  });

  if (!notification) {
    throw new AppError(404, "Notification not found");
  }

  if (notification.userId !== userId) {
    throw new AppError(403, "Forbidden. You do not have permission to delete this notification");
  }

  const deletedNotification = await prisma.notification.delete({
    where: {
      id: notificationId,
    },
  });

  return deletedNotification;
};

export const notificationService = {
  createNotification,
  getNotificationsFromDB,
  getUnreadCountFromDB,
  markAsReadInDB,
  markAllAsReadInDB,
  deleteNotificationFromDB,
};
