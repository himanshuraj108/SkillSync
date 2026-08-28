import { create } from 'zustand'

export const useSocketStore = create((set) => ({
  socket: null,
  isConnected: false,
  onlineUsers: new Set(),

  setSocket: (socket) => set({ socket }),
  
  setConnected: (isConnected) => set({ isConnected }),
  
  addOnlineUser: (userId) => set((state) => {
    const newUsers = new Set(state.onlineUsers)
    newUsers.add(userId)
    return { onlineUsers: newUsers }
  }),
  
  removeOnlineUser: (userId) => set((state) => {
    const newUsers = new Set(state.onlineUsers)
    newUsers.delete(userId)
    return { onlineUsers: newUsers }
  }),
  
  setOnlineUsers: (users) => set({ onlineUsers: new Set(users) }),
  
  disconnect: () => set((state) => {
    if (state.socket) {
      state.socket.disconnect()
    }
    return { socket: null, isConnected: false, onlineUsers: new Set() }
  })
}))
