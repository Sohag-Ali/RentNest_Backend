import { NotificationType } from "../../../generated/prisma/enums";

export interface TCreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityId?: string;
  entityType?: string;
}

export interface TNotificationQueryFilters {
  page?: number | string;
  limit?: number | string;
  isRead?: boolean | string;
  type?: NotificationType;
}
