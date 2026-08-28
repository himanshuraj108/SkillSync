import { create } from 'zustand'

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
  markRead: (notificationId) =>
    set((state) => {
      const notification = state.notifications.find((n) => n._id === notificationId)
      return {
        notifications: state.notifications.map((n) =>
          n._id === notificationId ? { ...n, is_read: true } : n
        ),
        unreadCount: notification && !notification.is_read
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      }
    }),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    })),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
}))
