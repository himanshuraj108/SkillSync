import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Send, MessageSquare, Search, ArrowLeft, MoreVertical, Compass,
  Calendar, Check, CheckCheck, Loader2, Paperclip, Smile
} from 'lucide-react'
import { getConversations, getMessages, sendMessage, markRead } from '@/services/chat.service.js'
import { Button } from '@/components/ui/Button.jsx'
import { Avatar } from '@/components/ui/Avatar.jsx'
import { useAuthStore } from '@/store/authStore.js'
import { useSocketStore } from '@/store/socketStore.js'
import { formatRelativeTime, formatDate, truncateText, cn } from '@/lib/utils.js'
import BookSessionModal from '@/components/sessions/BookSessionModal.jsx'
import toast from 'react-hot-toast'

/**
 * WhatsApp-Style Message Bubble
 * - Right: My message (Indigo / Violet with checkmarks & right tail)
 * - Left: Their message (Dark Graphite / Slate with avatar & left tail)
 */
function MessageBubble({ message, isOwn, partner, showAvatar, showSenderName }) {
  const timeStr = message.timestamp || message.created_at
    ? new Date(message.timestamp || message.created_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  return (
    <div
      className={cn(
        'flex w-full my-1 px-2 items-end gap-2 group',
        isOwn ? 'justify-end' : 'justify-start'
      )}
    >
      {/* Left side partner avatar (Only shown for incoming messages) */}
      {!isOwn && (
        <div className="w-7 h-7 shrink-0 mb-0.5">
          {showAvatar ? (
            <Avatar src={partner?.avatar?.url} name={partner?.name} size="xs" />
          ) : (
            <div className="w-7 h-7" />
          )}
        </div>
      )}

      {/* Bubble Container */}
      <div
        className={cn(
          'max-w-[85%] sm:max-w-[70%] px-3.5 py-2 text-[13.5px] shadow-sm transition-all relative break-words',
          isOwn
            ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-xs shadow-indigo-950/20'
            : 'bg-neutral-800 dark:bg-[#1e293b] text-neutral-100 rounded-2xl rounded-tl-xs border border-neutral-700/60 shadow-black/20'
        )}
      >
        {/* Partner Name label if incoming first in group */}
        {!isOwn && showSenderName && partner?.name && (
          <p className="text-[11px] font-bold text-indigo-400 mb-1 leading-none">
            {partner.name}
          </p>
        )}

        {/* Message Content */}
        {message.type === 'code' ? (
          <pre className="font-mono text-xs whitespace-pre-wrap bg-black/40 p-2.5 rounded-xl my-1 overflow-x-auto text-emerald-400 border border-neutral-700/50">
            {message.content}
          </pre>
        ) : (
          <p className="whitespace-pre-wrap leading-relaxed select-text inline">
            {message.content}
          </p>
        )}

        {/* WhatsApp-style bottom-right inline timestamp + double tick */}
        <span
          className={cn(
            'inline-flex items-center gap-1 float-right ml-3.5 mt-1.5 select-none text-[10px] tabular-nums',
            isOwn ? 'text-indigo-200/85' : 'text-neutral-400'
          )}
        >
          {timeStr}
          {isOwn && (
            <CheckCheck className="h-3.5 w-3.5 text-sky-300 inline -mr-0.5" />
          )}
        </span>
      </div>
    </div>
  )
}

// Group messages by Calendar Date (WhatsApp style)
function groupMessagesByDate(msgs) {
  const groups = []
  let currentDate = null
  let currentGroup = []

  msgs.forEach((msg) => {
    const d = new Date(msg.timestamp || msg.created_at || Date.now())
    const dateStr = d.toDateString()
    if (dateStr !== currentDate) {
      if (currentGroup.length > 0) {
        groups.push({ date: currentDate, messages: currentGroup })
      }
      currentDate = dateStr
      currentGroup = [msg]
    } else {
      currentGroup.push(msg)
    }
  })

  if (currentGroup.length > 0) {
    groups.push({ date: currentDate, messages: currentGroup })
  }

  return groups
}

function formatDateHeader(dateStr) {
  const date = new Date(dateStr)
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()

  if (dateStr === today) return 'Today'
  if (dateStr === yesterday) return 'Yesterday'
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
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
    ? activeConv.participants?.find((p) => (p._id?.toString() || p.toString()) !== (user?._id?.toString() || user?.id?.toString()))
    : null

  // Auto-scroll to bottom
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
      setText(msgContent)
    } finally {
      setSending(false)
    }
  }

  const filteredConvs = conversations.filter((c) => {
    const p = c.participants?.find((p) => (p._id?.toString() || p.toString()) !== (user?._id?.toString() || user?.id?.toString()))
    return !convSearch || p?.name?.toLowerCase().includes(convSearch.toLowerCase())
  })

  // Prepare match dummy for booking from chat
  const handleOpenBooking = () => {
    if (!partner || !activeConv) return
    setBookingMatch({
      _id: activeConv.match_id || activeConv._id,
      user_a: { user: user, teaches_skill: user?.skills_teach?.[0]?.skill },
      user_b: { user: partner, teaches_skill: partner?.skills_teach?.[0]?.skill },
    })
  }

  // Grouped message structure for WhatsApp date pills
  const dateGroups = groupMessagesByDate(messages)

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-neutral-950 font-sans">
      {/* 1. Left Sidebar: Conversations List */}
      <div
        className={cn(
          'w-full md:w-80 lg:w-96 flex flex-col border-r border-neutral-800 bg-neutral-900/95 shrink-0 z-10 transition-all',
          activeId ? 'hidden md:flex' : 'flex'
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h1 className="text-lg font-extrabold text-neutral-100">Direct Messages</h1>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-neutral-800/60">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search chats..."
              value={convSearch}
              onChange={(e) => setConvSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/40">
          {convQ.isLoading ? (
            <div className="p-8 text-center text-xs text-neutral-500 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
              Loading conversations...
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 text-xs">
              No conversations found
            </div>
          ) : (
            filteredConvs.map((conv) => {
              const other = conv.participants?.find((p) => (p._id?.toString() || p.toString()) !== (user?._id?.toString() || user?.id?.toString()))
              const isActive = conv._id === activeId
              const lastMsg = conv.last_message?.content || 'Started a conversation'
              const time = conv.last_message?.timestamp || conv.updated_at

              return (
                <button
                  key={conv._id}
                  onClick={() => setActiveId(conv._id)}
                  className={cn(
                    'w-full p-3.5 text-left flex items-start gap-3 transition-colors relative',
                    isActive ? 'bg-indigo-950/40 border-l-2 border-indigo-500' : 'hover:bg-neutral-800/50'
                  )}
                >
                  <Avatar src={other?.avatar?.url} name={other?.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="text-xs font-bold text-neutral-100 truncate">
                        {other?.name || 'SkillSync Peer'}
                      </p>
                      {time && (
                        <span className="text-[10px] text-neutral-500 shrink-0">
                          {formatRelativeTime(time)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 truncate leading-relaxed">
                      {lastMsg}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* 2. Main Chat Area: WhatsApp Style Locked Stream */}
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
            {/* FIXED TOP HEADER */}
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

            {/* SCROLLABLE MESSAGE STREAM */}
            <main
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 overscroll-contain flex flex-col bg-[#0b0f19]"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {msgQ.isLoading && (
                <div className="text-center text-xs text-neutral-500 py-10 flex flex-col items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                  Loading messages...
                </div>
              )}

              {/* Peer Security Notice */}
              <div className="my-2 flex justify-center">
                <span className="text-[10px] text-neutral-400 bg-neutral-900/90 border border-neutral-800/80 px-3.5 py-1 rounded-full text-center shadow-sm">
                  Direct peer-to-peer messaging with {partner?.name || 'partner'}
                </span>
              </div>

              {/* Render Messages Grouped by Date (WhatsApp style) */}
              {dateGroups.map((group) => (
                <div key={group.date} className="space-y-1">
                  {/* WhatsApp-Style Date Pill */}
                  <div className="flex justify-center my-3">
                    <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-900/90 border border-neutral-800/80 px-3 py-0.5 rounded-full shadow-sm uppercase tracking-wider">
                      {formatDateHeader(group.date)}
                    </span>
                  </div>

                  {group.messages.map((msg, index) => {
                    const currentSenderId = msg.sender?._id?.toString() || msg.sender?.toString()
                    const myId = user?._id?.toString() || user?.id?.toString()
                    const isOwn = currentSenderId === myId

                    const nextMsg = group.messages[index + 1]
                    const nextSenderId = nextMsg?.sender?._id?.toString() || nextMsg?.sender?.toString()
                    const isLastInGroup = !nextMsg || nextSenderId !== currentSenderId

                    const prevMsg = group.messages[index - 1]
                    const prevSenderId = prevMsg?.sender?._id?.toString() || prevMsg?.sender?.toString()
                    const isFirstInGroup = !prevMsg || prevSenderId !== currentSenderId

                    return (
                      <MessageBubble
                        key={msg._id || msg.id || `${group.date}-${index}`}
                        message={msg}
                        isOwn={isOwn}
                        partner={partner}
                        showAvatar={isLastInGroup}
                        showSenderName={isFirstInGroup}
                      />
                    )
                  })}
                </div>
              ))}

              <div ref={messagesEndRef} className="h-1" />
            </main>

            {/* FIXED BOTTOM INPUT BAR (WhatsApp style) */}
            <footer className="border-t border-neutral-800 p-2.5 sm:p-3 bg-neutral-900/95 backdrop-blur-md shrink-0 z-20">
              <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto">
                <input
                  type="text"
                  className="flex-1 h-10 rounded-full border border-neutral-700/80 bg-neutral-950 px-4 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                  placeholder="Type a message..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  autoComplete="off"
                />

                <button
                  type="submit"
                  disabled={!text.trim() || sending}
                  className="h-10 w-10 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white flex items-center justify-center transition-all shadow-md active:scale-95 shrink-0"
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
