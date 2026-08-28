import { useState } from 'react'
import { ArrowRight, Sparkles, Send, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button.jsx'
import { Avatar } from '@/components/ui/Avatar.jsx'
import { ReputationBadge } from '@/components/profile/ReputationBadge.jsx'
import { useAuthStore } from '@/store/authStore.js'
import { cn } from '@/lib/utils.js'

export function MatchCard({ match, onRequest, requested }) {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const isUserA = match.user_a?.user?._id === user?._id
  const me = isUserA ? match.user_a : match.user_b
  const partner = isUserA ? match.user_b : match.user_a
  const partnerUser = partner?.user || match.user || {}

  const myTeachSkill = me?.teaches_skill || user?.skills_teach?.[0]?.skill || 'Programming'
  const partnerTeachSkill = partner?.teaches_skill || partnerUser?.skills_teach?.[0]?.skill || 'Design'

  const handleRequest = async () => {
    setLoading(true)
    try {
      await onRequest(match)
    } finally {
      setLoading(false)
    }
  }

  const score = match.compatibility_score || 85
  const scoreColor = score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-indigo-500' : 'text-amber-500'
  const scoreBg = score >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50' 
    : score >= 60 ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/50' 
    : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50'

  return (
    <div className="card-shine rounded-3xl p-5 shadow-md transition-all hover:scale-[1.005]">
      {/* Top Row: User info & Compatibility Pill */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Avatar src={partnerUser.avatar?.url} name={partnerUser.name} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-neutral-100 leading-tight">
                {partnerUser.name}
              </h3>
              <span className="capitalize text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                {partnerUser.role || 'Student'}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5 truncate">
              {partnerUser.institution || 'SkillSync Member'}
              {partnerUser.location ? ` · ${partnerUser.location}` : ''}
            </p>
          </div>
        </div>

        {/* Match score badge */}
        <div className={cn('px-2.5 py-1 rounded-full border text-xs font-bold shrink-0 tabular-nums flex items-center gap-1', scoreBg)}>
          <Sparkles className="h-3 w-3" />
          <span>{score}% match</span>
        </div>
      </div>

      {/* Short Bio */}
      {partnerUser.bio && (
        <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mb-3">
          {partnerUser.bio}
        </p>
      )}

      {/* Compact Skill Exchange Bar */}
      <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl bg-neutral-950/50 border border-neutral-800/80 mb-3 text-xs">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider shrink-0">Teach</span>
          <span className="font-bold text-neutral-200 truncate">{myTeachSkill}</span>
        </div>

        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-900/30 text-indigo-400 shrink-0">
          <ArrowRight className="h-3.5 w-3.5" />
        </div>

        <div className="flex items-center justify-end gap-1.5 min-w-0 flex-1 text-right">
          <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider shrink-0">Learn</span>
          <span className="font-bold text-indigo-400 truncate">{partnerTeachSkill}</span>
        </div>
      </div>

      {/* Footer: Reputation & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-neutral-800/60">
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <ReputationBadge score={partnerUser.reputation?.score || 90} size="sm" />
          <span>·</span>
          <span>{partnerUser.reputation?.sessions_completed || 0} sessions</span>
        </div>

        <div className="w-full sm:w-auto">
          {requested ? (
            <Button variant="secondary" size="sm" disabled className="w-full sm:w-auto text-xs h-8">
              <Check className="h-3.5 w-3.5 mr-1" />
              Request sent
            </Button>
          ) : (
            <Button size="sm" onClick={handleRequest} loading={loading} className="w-full sm:w-auto text-xs h-8">
              <Send className="h-3.5 w-3.5 mr-1" />
              Send request
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
