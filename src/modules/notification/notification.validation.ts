import { z } from "zod";
import { NotificationType } from "../../../generated/prisma/enums";

export const getNotificationsQueryValidation = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  isRead: z
    .string()
    .optional()
    .transform((val) =>
      val === "true" ? true : val === "false" ? false : undefined
    ),
  type: z.nativeEnum(NotificationType).optional(),
});

export const notificationIdParamValidation = z
  .object({
    id: z
      .string({ error: "Notification ID must be a string" })
      .trim()
      .uuid("Notification ID must be a valid UUID"),
  })
  .strict();

export const createNotificationValidation = z
  .object({
    userId: z
      .string({ error: "User ID must be a string" })
      .trim()
      .uuid("User ID must be a valid UUID"),
    type: z.nativeEnum(NotificationType),
    title: z.string({ error: "Title must be a string" }).min(1, "Title is required"),
    message: z.string({ error: "Message must be a string" }).min(1, "Message is required"),
    entityId: z.string().optional(),
    entityType: z.string().optional(),
  })
  .strict();
