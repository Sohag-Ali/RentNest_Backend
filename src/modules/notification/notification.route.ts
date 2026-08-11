import { Router } from "express";
import { authenticateUser } from "../../middlewares/authenticateUser";
import { validateRequest } from "../../middlewares/validateRequest";
import { notificationController } from "./notification.controller";
import {
  getNotificationsQueryValidation,
  notificationIdParamValidation,
} from "./notification.validation";

const router = Router();

// Protect all notification routes (any logged-in user can access their notifications)
router.use(authenticateUser());

router.get(
  "/",
  validateRequest(getNotificationsQueryValidation, "query"),
  notificationController.getMyNotifications
);

router.get(
  "/unread-count",
  notificationController.getUnreadCount
);

router.patch(
  "/read-all",
  notificationController.markAllAsRead
);

router.patch(
  "/:id/read",
  validateRequest(notificationIdParamValidation, "params"),
  notificationController.markAsRead
);

router.delete(
  "/:id",
  validateRequest(notificationIdParamValidation, "params"),
  notificationController.deleteNotification
);

export const notificationRouter = router;
