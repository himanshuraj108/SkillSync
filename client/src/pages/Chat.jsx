import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Send, MessageSquare, Search, ArrowLeft, MoreVertical, Compass,
  Calendar, Check, CheckCheck, Loader2
} from 'lucide-react'
import { getConversations, getMessages, sendMessage, markRead } from '@/services/chat.service.js'
import { Button } from '@/components/ui/Button.jsx'
import { Avatar } from '@/components/ui/Avatar.jsx'
import { useAuthStore } from '@/store/authStore.js'
import { useSocketStore } from '@/store/socketStore.js'
import { formatRelativeTime, formatDate, truncateText, cn } from '@/lib/utils.js'
import BookSessionModal from '@/components/sessions/BookSessionModal.jsx'
import toast from 'react-hot-toast'

function MessageBubble({ message, isOwn }) {
  const timeStr = message.timestamp || message.created_at
    ? new Date(message.timestamp || message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div className={cn('flex w-full my-1 px-1', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[82%] sm:max-w-[72%] px-3.5 py-2 text-sm shadow-sm transition-all relative break-words',
          isOwn
            ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm'
            : 'bg-neutral-800 text-neutral-100 rounded-2xl rounded-tl-sm border border-neutral-750'
        )}
      >
        {message.type === 'code' ? (
          <pre className="font-mono text-xs whitespace-pre-wrap bg-black/30 p-2.5 rounded-xl my-1 overflow-x-auto text-emerald-400">
            {message.content}
          </pre>
        ) : (
          <p className="whitespace-pre-wrap leading-relaxed select-text">{message.content}</p>
        )}

        <div className={cn(
          'flex items-center justify-end gap-1 mt-0.5 select-none',
          isOwn ? 'text-indigo-200' : 'text-neutral-400'
        )}>
          <span className="text-[10px] tracking-tight">{timeStr}</span>
          {isOwn && <CheckCheck className="h-3 w-3 text-indigo-300" />}
        </div>
      </div>
    </div>
  )
}

export default function Chat() {
  const { conversationId: paramConvId } = useParams()
  const { user } = useAuthStore()
  const { socket } = useSocketStore()
  const queryClient = useQueryClient()
  const [activeId, setActiveId] = useState(paramConvId || null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [convSearch, setConvSearch] = useState('')
  const [bookingMatch, setBookingMatch] = useState(null)
  const messagesContainerRef = useRef(null)
  const messagesEndRef = useRef(null)

  const convQ = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
  })

  const msgQ = useQuery({
    queryKey: ['messages', activeId],
    queryFn: () => getMessages(activeId),
    enabled: !!activeId,
  })

  const conversations = convQ.data?.data || []
  const messages = msgQ.data?.data || []
  const activeConv = conversations.find((c) => c._id === activeId)

  const partner = activeConv
    ? activeConv.participants?.find((p) => p._id !== user?._id)
    : null

  // Auto-scroll to bottom like WhatsApp/Telegram
  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
    }
  }

  useEffect(() => {
    if (!socket || !activeId) return
    socket.emit('join_conversation', activeId)
    markRead(activeId).catch(() => {})

    const handleMessage = (msg) => {
      if (msg.conversation_id === activeId) {
        queryClient.setQueryData(['messages', activeId], (old) => {
          if (!old) return old
          return { ...old, data: [...(old.data || []), msg] }
        })
        setTimeout(() => scrollToBottom(true), 50)
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    }

    socket.on('message_received', handleMessage)
    return () => {
      socket.emit('leave_conversation', activeId)
      socket.off('message_received', handleMessage)
    }
  }, [socket, activeId, queryClient])

  useEffect(() => {
    scrollToBottom(false)
  }, [activeId, messages.length])

  const handleSend = async (e) => {
    e?.preventDefault()
    if (!text.trim() || !activeId || sending) return
    const msgContent = text.trim()
    setText('')
    setSending(true)

    try {
      const data = await sendMessage(activeId, { content: msgContent, type: 'text' })
      const newMsg = data.data || data
      queryClient.setQueryData(['messages', activeId], (old) => ({
        ...old,
        data: [...(old?.data || []), newMsg],
      }))
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      socket?.emit('send_message', { conversationId: activeId, content: msgContent, type: 'text' })
      setTimeout(() => scrollToBottom(true), 30)
    } catch {
      toast.error('Failed to send message')
      setText(msgContent) // restore on error
    } finally {
      setSending(false)
    }
  }

  const filteredConvs = conversations.filter((c) => {
    const p = c.participants?.find((p) => p._id !== user?._id)
    return !convSearch || p?.name?.toLowerCase().includes(convSearch.toLowerCase())
  })

  // Prepare match dummy for booking from chat
  const handleOpenBooking = () => {
    if (!partner || !activeConv) return
    const fakeMatch = {
      _id: activeConv.match_id || activeConv._id,
      user_a: { user: user, teaches_skill: user?.skills_teach?.[0]?.skill || 'Programming' },
      user_b: { user: partner, teaches_skill: partner?.skills_teach?.[0]?.skill || 'Programming' }
    }
    setBookingMatch(fakeMatch)
  }

  return (
    <div className="flex h-[calc(100dvh-3.5rem-4rem)] lg:h-[calc(100vh)] w-full overflow-hidden bg-neutral-950 select-none">
      {/* 1. Conversations List Panel */}
      <div
        className={cn(
          'flex flex-col border-r border-neutral-800 bg-neutral-950 h-full',
          'w-full md:w-80 lg:w-96 flex-shrink-0',
          activeId ? 'hidden md:flex' : 'flex'
        )}
      >
        {/* Panel Header */}
        <div className="px-4 py-3.5 border-b border-neutral-800 shrink-0 bg-neutral-900/50">
          <h2 className="text-base font-bold text-neutral-100 mb-2.5">Direct Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              placeholder="Search chats..."
              value={convSearch}
              onChange={(e) => setConvSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Scrollable Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/40 overscroll-contain">
          {convQ.isLoading && (
            <div className="p-6 text-xs text-neutral-500 text-center flex flex-col items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
              Loading conversations...
            </div>
          )}

          {filteredConvs.map((conv) => {
            const p = conv.participants?.find((p) => p._id !== user?._id)
            const unread = conv.unread_counts?.[user?._id] || 0
            const isCurrent = conv._id === activeId

            return (
              <button
                key={conv._id}
                onClick={() => setActiveId(conv._id)}
                className={cn(
                  'flex items-center gap-3 w-full px-4 py-3.5 text-left transition-colors',
                  isCurrent
                    ? 'bg-neutral-900 border-l-4 border-indigo-600'
                    : 'hover:bg-neutral-900/60'
                )}
              >
                <Avatar src={p?.avatar?.url} name={p?.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-neutral-200 truncate">{p?.name || 'SkillSync Peer'}</span>
                    <span className="text-[10px] text-neutral-500 shrink-0 ml-2">
                      {conv.last_message?.timestamp ? formatRelativeTime(conv.last_message.timestamp) : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400 truncate">
                      {truncateText(conv.last_message?.content || 'Say hello to start chatting', 38)}
                    </span>
                    {unread > 0 && (
                      <span className="ml-2 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white font-bold shrink-0">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}

          {!convQ.isLoading && filteredConvs.length === 0 && (
            <div className="flex flex-col items-center justify-center p-8 text-center text-neutral-500">
              <MessageSquare className="h-8 w-8 mb-2 opacity-40 text-neutral-600" />
              <p className="text-sm font-medium text-neutral-400">No active conversations</p>
              <p className="text-xs text-neutral-600 mt-1 mb-4">Accept a match on Discover or Matches to start chatting.</p>
              <Link to="/discover">
                <Button size="sm" variant="outline">
                  <Compass className="h-4 w-4" /> Find matches
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 2. WhatsApp/Telegram Locked Chat Stream Area */}
      <div
        className={cn(
          'flex flex-col flex-1 h-full bg-neutral-950 relative overflow-hidden',
          !activeId ? 'hidden md:flex' : 'flex'
        )}
      >
        {!activeId ? (
          <div className="flex flex-col flex-1 items-center justify-center text-center p-6 select-none">
            <div className="h-16 w-16 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 mb-4 shadow-xl">
              <MessageSquare className="h-8 w-8 opacity-60 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-neutral-200">Select a conversation</h3>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1.5 max-w-sm leading-relaxed">
              Pick a peer chat from the list to exchange study materials, ask questions, and book 1-on-1 sessions.
            </p>
          </div>
        ) : (
          <div className="flex flex-col h-full w-full overflow-hidden">
            {/* FIXED TOP HEADER (WhatsApp/Telegram style) */}
            <header className="h-14 px-4 border-b border-neutral-800 bg-neutral-900/95 backdrop-blur-md flex items-center justify-between shrink-0 z-20 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setActiveId(null)}
                  className="md:hidden p-1.5 -ml-1 rounded-xl text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
                  aria-label="Back to chat list"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <Avatar src={partner?.avatar?.url} name={partner?.name} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-neutral-100 truncate leading-tight">
                    {partner?.name || 'SkillSync Peer'}
                  </p>
                  <p className="text-[11px] text-neutral-400 capitalize truncate mt-0.5">
                    {partner?.role || 'Member'} {partner?.institution ? `• ${partner.institution}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleOpenBooking}
                  className="text-xs h-8 px-3 font-semibold hover:border-indigo-500/60"
                >
                  <Calendar className="h-3.5 w-3.5 mr-1 text-indigo-400" />
                  Book session
                </Button>
              </div>
            </header>

            {/* SCROLLABLE MESSAGE STREAM (ONLY THIS SECTION MOVES) */}
            <main
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 sm:px-6 space-y-1 overscroll-contain flex flex-col"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {msgQ.isLoading && (
                <div className="text-center text-xs text-neutral-500 py-10 flex flex-col items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                  Loading messages...
                </div>
              )}

              {/* End-to-end security / peer message badge */}
              <div className="my-3 flex justify-center">
                <span className="text-[10px] text-neutral-500 bg-neutral-900 border border-neutral-800/80 px-3 py-1 rounded-full text-center">
                  Direct peer-to-peer messaging with {partner?.name || 'partner'}
                </span>
              </div>

              {messages.map((msg) => (
                <MessageBubble
                  key={msg._id || msg.id || Math.random()}
                  message={msg}
                  isOwn={msg.sender === user?._id || msg.sender?._id === user?._id}
                />
              ))}

              <div ref={messagesEndRef} className="h-1" />
            </main>

            {/* FIXED BOTTOM INPUT BAR (WhatsApp/Telegram style) */}
            <footer className="border-t border-neutral-800 p-2.5 sm:p-3.5 bg-neutral-900/95 backdrop-blur-md shrink-0 z-20">
              <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto">
                <input
                  type="text"
                  className="flex-1 h-10 rounded-2xl border border-neutral-700 bg-neutral-950 px-4 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                  placeholder="Type a message..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  autoComplete="off"
                />

                <button
                  type="submit"
                  disabled={!text.trim() || sending}
                  className="h-10 w-10 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white flex items-center justify-center transition-all shadow-md active:scale-95 shrink-0"
                  aria-label="Send message"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 ml-0.5" />
                  )}
                </button>
              </form>
            </footer>
          </div>
        )}
      </div>

      {/* Book Session Modal Triggered from Chat Header */}
      {bookingMatch && (
        <BookSessionModal
          match={bookingMatch}
          onClose={() => setBookingMatch(null)}
        />
      )}
    </div>
  )
}
