import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { MessageSquare, Calendar, Users, Check, X, Compass, ShieldAlert } from 'lucide-react'
import { getMyMatches, respondToMatch, cancelMatch } from '@/services/match.service.js'
import { Button } from '@/components/ui/Button.jsx'
import { Avatar } from '@/components/ui/Avatar.jsx'
import { useAuthStore } from '@/store/authStore.js'
import BookSessionModal from '@/components/sessions/BookSessionModal.jsx'
import toast from 'react-hot-toast'

function MatchListItem({ match, currentUserId, isEmailVerified, onAccept, onDecline, onCancel, onBookSession, showActions }) {
  const isUserA = match.user_a?.user?._id === currentUserId
  const partner = isUserA ? match.user_b : match.user_a
  const partnerUser = partner?.user || {}

  const myTeaches = isUserA ? match.user_a?.teaches_skill : match.user_b?.teaches_skill
  const partnerTeaches = isUserA ? match.user_b?.teaches_skill : match.user_a?.teaches_skill

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-neutral-800 bg-neutral-900 shadow-sm">
      <div className="flex items-center gap-3.5 min-w-0">
        <Avatar src={partnerUser.avatar?.url} name={partnerUser.name} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-neutral-100 truncate">{partnerUser.name}</p>
            {partnerUser.role && (
              <span className="capitalize text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-medium">
                {partnerUser.role}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-1 truncate">
            <span className="text-neutral-400">You teach {myTeaches || 'Skill'}</span>
            <span>•</span>
            <span className="text-indigo-400">They teach {partnerTeaches || 'Skill'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800/80 justify-end shrink-0">
        {showActions === 'active' && (
          <>
            <Link to="/chat" className="flex-1 sm:flex-none">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <MessageSquare className="h-4 w-4" />
                Chat
              </Button>
            </Link>

            {isEmailVerified ? (
              <Button
                size="sm"
                className="flex-1 sm:flex-none w-full sm:w-auto"
                onClick={() => onBookSession(match)}
              >
                <Calendar className="h-4 w-4" />
                Book session
              </Button>
            ) : (
              <Link to="/profile/me" className="flex-1 sm:flex-none">
                <Button size="sm" className="w-full sm:w-auto bg-amber-500 text-neutral-950 hover:bg-amber-400 font-bold border-none">
                  <ShieldAlert className="h-4 w-4" />
                  Verify Email First
                </Button>
              </Link>
            )}
          </>
        )}

        {showActions === 'received' && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDecline(match._id)}
              className="flex-1 sm:flex-none"
            >
              <X className="h-4 w-4" />
              Decline
            </Button>
            <Button
              size="sm"
              onClick={() => onAccept(match._id)}
              className="flex-1 sm:flex-none"
            >
              <Check className="h-4 w-4" />
              Accept
            </Button>
          </>
        )}

        {showActions === 'sent' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCancel(match._id)}
            className="text-neutral-500 hover:text-red-400"
          >
            Cancel request
          </Button>
        )}

        {showActions === 'completed' && (
          <Link to={`/profile/${partnerUser._id}`}>
            <Button variant="ghost" size="sm">View profile</Button>
          </Link>
        )}
      </div>
    </div>
  )
}

export default function Matches() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('active')
  const [bookingMatch, setBookingMatch] = useState(null) // match to book session for

  const activeQ = useQuery({ queryKey: ['matches', 'accepted'], queryFn: () => getMyMatches({ status: 'accepted' }) })
  const pendingQ = useQuery({ queryKey: ['matches', 'pending'], queryFn: () => getMyMatches({ status: 'pending' }) })
  const completedQ = useQuery({ queryKey: ['matches', 'completed'], queryFn: () => getMyMatches({ status: 'completed' }) })

  const respondMutation = useMutation({
    mutationFn: ({ id, action }) => respondToMatch(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      toast.success('Match status updated!')
    },
    onError: () => toast.error('Failed to respond to match'),
  })

  const cancelMutation = useMutation({
    mutationFn: cancelMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] })
      toast.success('Request cancelled')
    },
  })

  const activeMatches = activeQ.data?.data || activeQ.data?.pagination?.docs || []
  const allPending = pendingQ.data?.data || pendingQ.data?.pagination?.docs || []
  const completedMatches = completedQ.data?.data || completedQ.data?.pagination?.docs || []

  const pendingReceived = allPending.filter((m) => m.initiated_by !== user?._id)
  const pendingSent = allPending.filter((m) => m.initiated_by === user?._id)

  const renderEmptyState = (title, description) => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-neutral-800 bg-neutral-900/50">
      <div className="h-12 w-12 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-400 mb-3">
        <Users className="h-6 w-6" />
      </div>
      <h3 className="text-base font-bold text-neutral-100 mb-1">{title}</h3>
      <p className="text-xs text-neutral-500 mb-5 max-w-sm">{description}</p>
      <Link to="/discover">
        <Button size="sm" variant="outline">
          <Compass className="h-4 w-4" />
          Explore matches
        </Button>
      </Link>
    </div>
  )

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl mx-auto min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100">
          My Matches
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage your active skill swaps and pending invitations.
        </p>
      </div>

      {/* Segmented Tabs (Fits 100% width on all phones with no cutoff) */}
      <div className="grid grid-cols-3 p-1 rounded-xl bg-neutral-900 border border-neutral-800 mb-5">
        {[
          { key: 'active', label: 'Active', count: activeMatches.length },
          { key: 'pending', label: 'Pending', count: pendingReceived.length },
          { key: 'completed', label: 'Completed', count: completedMatches.length },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`py-2 px-1 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1 ${
              tab === key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>{label}</span>
            {count > 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  tab === key ? 'bg-white/20 text-white' : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {tab === 'active' && (
          <>
            {activeQ.isLoading && <div className="p-8 text-center text-sm text-neutral-500">Loading active matches...</div>}
            {!activeQ.isLoading && activeMatches.length === 0 && renderEmptyState('No active exchanges', 'Discover partners and accept match requests to start exchanging skills.')}
            {activeMatches.map((m) => (
              <MatchListItem
                key={m._id}
                match={m}
                currentUserId={user?._id}
                isEmailVerified={user?.is_email_verified}
                showActions="active"
                onBookSession={(match) => setBookingMatch(match)}
              />
            ))}
          </>
        )}

        {tab === 'pending' && (
          <div className="space-y-6">
            {pendingReceived.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                  Received Requests ({pendingReceived.length})
                </p>
                <div className="space-y-3">
                  {pendingReceived.map((m) => (
                    <MatchListItem
                      key={m._id}
                      match={m}
                      currentUserId={user?._id}
                      showActions="received"
                      onAccept={(id) => respondMutation.mutate({ id, action: 'accept' })}
                      onDecline={(id) => respondMutation.mutate({ id, action: 'decline' })}
                    />
                  ))}
                </div>
              </div>
            )}

            {pendingSent.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                  Sent Requests ({pendingSent.length})
                </p>
                <div className="space-y-3">
                  {pendingSent.map((m) => (
                    <MatchListItem
                      key={m._id}
                      match={m}
                      currentUserId={user?._id}
                      showActions="sent"
                      onCancel={(id) => cancelMutation.mutate(id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {!pendingQ.isLoading && pendingReceived.length === 0 && pendingSent.length === 0 &&
              renderEmptyState('No pending requests', 'Find someone to exchange skills with on the Discover page.')}
          </div>
        )}

        {tab === 'completed' && (
          <>
            {completedQ.isLoading && <div className="p-8 text-center text-sm text-neutral-500">Loading history...</div>}
            {!completedQ.isLoading && completedMatches.length === 0 && renderEmptyState('No completed exchanges', 'Past matches and completed swaps will be stored here.')}
            {completedMatches.map((m) => (
              <MatchListItem key={m._id} match={m} currentUserId={user?._id} showActions="completed" />
            ))}
          </>
        )}
      </div>

      {/* Book Session Modal */}
      {bookingMatch && (
        <BookSessionModal
          match={bookingMatch}
          onClose={() => setBookingMatch(null)}
        />
      )}
    </div>
  )
}

