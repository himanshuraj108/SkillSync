import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { getLearningOverview } from '@/services/learning.service.js'
import { EmptyState } from '@/components/ui/EmptyState.jsx'
import { Button } from '@/components/ui/Button.jsx'

function ProgressRing({ percentage, label, size = 'md', onClick }) {
  const sizes = { sm: 80, md: 120, lg: 160 }
  const dim = sizes[size]
  const radius = (dim - 16) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <button onClick={onClick} className="flex flex-col items-center gap-3 group">
      <svg width={dim} height={dim} className="rotate-[-90deg]">
        <circle cx={dim/2} cy={dim/2} r={radius} fill="none" stroke="#262626" strokeWidth={8} />
        <circle
          cx={dim/2} cy={dim/2} r={radius} fill="none"
          stroke="#6366f1" strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
        <text
          x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
          fill="#e5e5e5" fontSize={size === 'lg' ? 28 : 20} fontWeight={700}
          transform={`rotate(90, ${dim/2}, ${dim/2})`}
        >
          {Math.round(percentage)}%
        </text>
      </svg>
      <span className="text-sm font-medium text-neutral-400 group-hover:text-neutral-200 transition-colors text-center max-w-[140px] truncate">
        {label}
      </span>
    </button>
  )
}

export default function LearningHome() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['learning'],
    queryFn: getLearningOverview,
  })

  if (isLoading) return <div className="p-8 text-neutral-500 text-center">Loading...</div>

  const skillsInProgress = overview?.data?.skills || []

  if (skillsInProgress.length === 0) {
    return (
      <div className="px-6 py-8 max-w-5xl mx-auto min-h-[calc(100vh-80px)] flex items-center justify-center">
        <EmptyState 
          icon={BookOpen} 
          title="Start learning" 
          description="Complete your first session to begin tracking progress."
          action={<Link to="/discover"><Button>Discover Matches</Button></Link>}
        />
      </div>
    )
  }

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto min-h-screen bg-neutral-950 text-neutral-100">
      <h1 className="text-2xl font-bold text-neutral-100 mb-8">Learning Progress</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12 bg-neutral-900 border border-neutral-800 p-8 rounded-xl">
        {skillsInProgress.map((skill, i) => (
          <Link to={`/learning/${skill.id}`} key={i}>
            <ProgressRing 
              percentage={Math.min((skill.sessions_completed / 10) * 100, 100)} 
              label={skill.name} 
              size="md" 
            />
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold text-neutral-200 mb-4">Weak topics across all skills</h2>
          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50">
              <p className="text-neutral-500 text-sm">Keep taking sessions to generate weak topic reports.</p>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold text-neutral-200 mb-4">AI Recommendations</h2>
          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50">
            <p className="text-neutral-500 text-sm">Complete more sessions to receive AI recommendations on what to learn next.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
