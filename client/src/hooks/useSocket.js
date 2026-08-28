import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '@/store/authStore.js'
import { useSocketStore } from '@/store/socketStore.js'
import { useNotificationStore } from '@/store/notificationStore.js'
import { SOCKET_URL } from '@/lib/constants.js'

export function useSocket() {
  const { isAuthenticated } = useAuthStore()
  const { socket, setSocket, setConnected, setOnlineUsers, disconnect } = useSocketStore()
  const { addNotification, setUnreadCount } = useNotificationStore()
  const initialized = useRef(false)

  useEffect(() => {
    if (!isAuthenticated) {
      disconnect()
      initialized.current = false
      return
    }

    if (initialized.current) return
    initialized.current = true

    const token = localStorage.getItem('ss_access_token')
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    newSocket.on('connect', () => {
      setConnected(true)
    })

    newSocket.on('disconnect', () => {
      setConnected(false)
    })

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message)
      setConnected(false)
    })

    newSocket.on('notification', (notification) => {
      addNotification(notification)
    })

    newSocket.on('online_users', (users) => {
      setOnlineUsers(new Set(users))
    })

    newSocket.on('unread_count', (count) => {
      setUnreadCount(count)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
      initialized.current = false
    }
  }, [isAuthenticated])

  return {
    socket,
    isConnected: useSocketStore((s) => s.isConnected),
    onlineUsers: useSocketStore((s) => s.onlineUsers),
  }
}
