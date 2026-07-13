// src/types/notification.types.ts

export type NotificationType =
  | 'BOOKING_CONFIRMATION'
  | 'BOOKING_CANCELLATION'
  | 'CHECK_IN_REMINDER'
  | 'CHECK_OUT_REMINDER'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_DUE'
  | 'MAINTENANCE_UPDATE'
  | 'SERVICE_UPDATE'
  | 'GENERAL_ALERT'
  | 'SYSTEM_ALERT';

export type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';

export type Role =
  | 'ADMIN'
  | 'MANAGER'
  | 'STAFF'
  | 'CUSTOMER'
  | 'MAINTENANCE'
  | 'CHEF';

// ── Core Entities ──────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  data?: Record<string, unknown> | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject?: string | null;
  bodyTemplate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ── Request Payloads ───────────────────────────────────────

export interface CreateNotificationPayload {
  userId: string;
  type: NotificationType;
  channel?: NotificationChannel;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface BroadcastNotificationPayload {
  roles?: Role[];
  userIds?: string[];
  type: NotificationType;
  channel?: NotificationChannel;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface CreateTemplatePayload {
  name: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject?: string;
  bodyTemplate: string;
  isActive?: boolean;
}

export interface UpdateTemplatePayload {
  name?: string;
  type?: NotificationType;
  channel?: NotificationChannel;
  subject?: string;
  bodyTemplate?: string;
  isActive?: boolean;
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: string;
  channel?: NotificationChannel;
}

// ── Response Payloads ──────────────────────────────────────

export interface BroadcastResult {
  sent: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: { type: NotificationType; _count: { type: number } }[];
  byChannel: { channel: NotificationChannel; _count: { channel: number } }[];
}