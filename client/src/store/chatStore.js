import { create } from 'zustand'

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  typingUsers: {},
  hasMore: {},

  setConversations: (conversations) => set({ conversations }),

  updateConversation: (conversationId, updates) => set((state) => ({
    conversations: state.conversations.map(c => 
      c.id === conversationId ? { ...c, ...updates } : c
    )
  })),

  setActiveConversation: (id) => set({ activeConversationId: id }),

  setMessages: (conversationId, newMessages, append = false) => set((state) => {
    const existing = state.messages[conversationId] || []
    return {
      messages: {
        ...state.messages,
        [conversationId]: append ? [...existing, ...newMessages] : newMessages
      }
    }
  }),

  addMessage: (conversationId, message, prepend = false) => set((state) => {
    const existing = state.messages[conversationId] || []
    return {
      messages: {
        ...state.messages,
        [conversationId]: prepend ? [message, ...existing] : [...existing, message]
      }
    }
  }),

  updateMessage: (conversationId, messageId, updates) => set((state) => {
    const msgs = state.messages[conversationId] || []
    return {
      messages: {
        ...state.messages,
        [conversationId]: msgs.map(m => m.id === messageId ? { ...m, ...updates } : m)
      }
    }
  }),

  setTyping: (conversationId, userId, isTyping) => set((state) => {
    const typing = state.typingUsers[conversationId] || new Set()
    const newTyping = new Set(typing)
    if (isTyping) {
      newTyping.add(userId)
    } else {
      newTyping.delete(userId)
    }
    return {
      typingUsers: {
        ...state.typingUsers,
        [conversationId]: newTyping
      }
    }
  }),

  incrementUnread: (conversationId) => set((state) => ({
    conversations: state.conversations.map(c => 
      c.id === conversationId ? { ...c, unread_count: (c.unread_count || 0) + 1 } : c
    )
  })),

  resetUnread: (conversationId) => set((state) => ({
    conversations: state.conversations.map(c => 
      c.id === conversationId ? { ...c, unread_count: 0 } : c
    )
  })),

  setHasMore: (conversationId, bool) => set((state) => ({
    hasMore: {
      ...state.hasMore,
      [conversationId]: bool
    }
  }))
}))
