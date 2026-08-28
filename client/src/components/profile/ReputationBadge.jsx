import { cn } from '@/lib/utils.js'
import { REPUTATION_TIERS } from '@/lib/constants.js'

export function ReputationBadge({ score = 0, showScore = true, size = 'md' }) {
  const tier = REPUTATION_TIERS.find((t) => score >= t.min && score <= t.max) || REPUTATION_TIERS[0]
  
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium border',
      tier.bg, tier.color,
      size === 'sm' ? 'text-xs border-transparent' : 'text-xs border-current/20'
    )}>
      {tier.label}
      {showScore && <span className="opacity-70">· {score}</span>}
    </span>
  )
}
