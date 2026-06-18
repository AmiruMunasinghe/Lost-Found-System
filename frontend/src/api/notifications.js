import { apiRequest, getSavedUser } from "./client";

export function getCurrentUserId() {
  const user = getSavedUser();
  return user?.id ?? user?.user?.id ?? null;
}

/**
 * GET /api/notifications/users/{userId}
 * Returns all notifications for the logged-in user, newest first.
 */
export async function getAllNotifications(userId) {
  return apiRequest(`/api/notifications/users/${userId}`);
}

/**
 * GET /api/notifications/users/{userId}/unread
 * Returns only unread notifications.
 */
export async function getUnreadNotifications(userId) {
  return apiRequest(`/api/notifications/users/${userId}/unread`);
}

/**
 * GET /api/notifications/users/{userId}/unread-count
 * Returns { unreadCount: number }.
 */
export async function getUnreadCount(userId) {
  return apiRequest(`/api/notifications/users/${userId}/unread-count`);
}

/**
 * PATCH /api/notifications/{notificationId}/read?userId={userId}
 * Marks a single notification as read.
 */
export async function markNotificationAsRead(notificationId, userId) {
  return apiRequest(`/api/notifications/${notificationId}/read?userId=${userId}`, {
    method: "PATCH",
  });
}

/**
 * PATCH /api/notifications/users/{userId}/read-all
 * Marks all notifications as read for the user.
 */
export async function markAllNotificationsAsRead(userId) {
  return apiRequest(`/api/notifications/users/${userId}/read-all`, {
    method: "PATCH",
  });
}
