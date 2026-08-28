import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { getSkillProgress, generateRoadmap, updateMilestone } from '@/services/learning.service.js'
import { Button } from '@/components/ui/Button.jsx'
import { Badge } from '@/components/ui/Badge.jsx'
import toast from 'react-hot-toast'

export default function SkillRoadmap() {
  const { skillId } = useParams()
  const queryClient = useQueryClient()

  const { data: progress, isLoading } = useQuery({
    queryKey: ['learning', skillId],
    queryFn: () => getSkillProgress(skillId),
  })

  const generateMutation = useMutation({
    mutationFn: () => generateRoadmap(skillId),
    onSuccess: () => {
      queryClient.invalidateQueries(['learning', skillId])
      toast.success('Roadmap generated successfully!')
    }
  })

  if (isLoading) return <div className="p-8 text-neutral-500 text-center">Loading...</div>

  const skillData = progress?.data || { name: 'Skill', current_level: 'beginner', sessions_completed: 0, total_hours: 0, roadmap: [] }

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto min-h-screen bg-neutral-950 text-neutral-100">
      <Link to="/learning" className="flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to learning
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 pb-6 border-b border-neutral-800">
        <div>
          <h1 className="text-3xl font-bold text-neutral-100 mb-3">{skillData.name} Roadmap</h1>
          <div className="flex items-center gap-3">
            <span className="bg-indigo-900/40 text-indigo-400 border border-indigo-700/50 px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider">
              {skillData.current_level}
            </span>
            <span className="text-sm text-neutral-400">
              {skillData.sessions_completed} sessions · {skillData.total_hours}h learned
            </span>
          </div>
        </div>
        
        <Button 
          onClick={() => generateMutation.mutate()} 
          loading={generateMutation.isPending}
          className="shrink-0"
        >
          {generateMutation.isPending ? 'Generating roadmap...' : 'Generate AI Roadmap'}
        </Button>
      </div>

      <div className="mb-12">
        {skillData.roadmap?.length === 0 ? (
          <div className="text-center py-12 border border-neutral-800 rounded-xl bg-neutral-900/50 flex flex-col items-center">
            <RefreshCw className="h-10 w-10 text-neutral-600 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-200">No roadmap generated</h3>
            <p className="text-sm text-neutral-500 mt-2 max-w-sm">Generate a personalized step-by-step roadmap tailored to your current level and goals.</p>
          </div>
        ) : (
          <div className="space-y-0 relative before:absolute before:inset-0 before:ml-[1.35rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-800 before:to-transparent">
            {skillData.roadmap?.map((step, idx) => (
              <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-neutral-950 bg-neutral-800 text-neutral-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                  <span className="text-sm font-semibold">{idx + 1}</span>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-neutral-800 bg-neutral-900 mb-6">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-neutral-200">{step.title || `Milestone ${idx + 1}`}</h4>
                  </div>
                  <p className="text-sm text-neutral-400 leading-relaxed mb-3">{step.description || 'Complete sessions to unlock details.'}</p>
                  <Button variant="outline" size="sm" className="w-full">Mark complete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-neutral-200 mb-4">Weak topics</h2>
        <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50">
          <p className="text-sm text-neutral-500">No weak topics detected yet.</p>
        </div>
      </div>
    </div>
  )
}
