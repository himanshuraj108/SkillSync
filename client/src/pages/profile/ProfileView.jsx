import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Star,
  MapPin,
  Calendar,
  User,
  Award,
  BookOpen,
  ShieldCheck,
  AlertCircle,
  Mail,
  RefreshCw,
} from 'lucide-react'
import { getProfile, getUserReviews } from '@/services/user.service.js'
import { resendVerification } from '@/services/auth.service.js'
import { useAuthStore } from '@/store/authStore.js'
import { Button } from '@/components/ui/Button.jsx'
import { Avatar } from '@/components/ui/Avatar.jsx'
import { ReputationBadge } from '@/components/profile/ReputationBadge.jsx'
import { SkillTag } from '@/components/profile/SkillTag.jsx'
import { formatDate, formatTimeSlot } from '@/lib/utils.js'
import { DAYS_OF_WEEK } from '@/lib/constants.js'
import { notify } from '@/lib/notify.jsx'

function ReviewCard({ review }) {
  return (
    <div className="card-shine p-4 sm:p-5 rounded-2xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar src={review.reviewer?.avatar?.url} name={review.reviewer?.name} size="sm" />
          <div>
            <p className="text-sm font-bold text-neutral-900 dark:text-white">{review.reviewer?.name || 'Peer'}</p>
            <p className="text-xs text-neutral-500">{formatDate(review.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-amber-400">
          <Star className="h-4 w-4 fill-amber-400" />
          <span className="text-sm font-bold">{review.overall}</span>
        </div>
      </div>

      {review.written_feedback && (
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
          "{review.written_feedback}"
        </p>
      )}

      {review.ratings && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500">
          <div>Quality: <strong className="text-neutral-700 dark:text-neutral-300">{review.ratings.teaching_quality}/5</strong></div>
          <div>Punctuality: <strong className="text-neutral-700 dark:text-neutral-300">{review.ratings.punctuality}/5</strong></div>
          <div>Communication: <strong className="text-neutral-700 dark:text-neutral-300">{review.ratings.communication}/5</strong></div>
          <div>Prep: <strong className="text-neutral-700 dark:text-neutral-300">{review.ratings.preparation}/5</strong></div>
        </div>
      )}
    </div>
  )
}

export default function ProfileView() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const [resending, setResending] = useState(false)

  const profileId = !id || id === 'me' ? user?._id : id
  const isOwnProfile = !id || id === 'me' || id === user?._id

  const profileQ = useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => getProfile(profileId),
    enabled: !!profileId,
  })

  const reviewsQ = useQuery({
    queryKey: ['reviews', profileId],
    queryFn: () => getUserReviews(profileId, { page: 1, limit: 10 }),
    enabled: !!profileId,
  })

  const [directVerifyUrl, setDirectVerifyUrl] = useState(null)

  const handleResendVerification = async () => {
    setResending(true)
    try {
      const res = await resendVerification()
      const url = res?.data?.verifyUrl || res?.verifyUrl
      if (url) {
        setDirectVerifyUrl(url)
      }
      notify.success(
        `Verification email sent to ${profile?.email || user?.email}. Check Inbox or Spam.`,
        'Link Sent'
      )
    } catch (err) {
      notify.error(err.message || 'Failed to send verification link.', 'Error')
    } finally {
      setResending(false)
    }
  }

  if (profileQ.isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4 animate-pulse">
        <div className="h-44 rounded-3xl bg-neutral-200 dark:bg-neutral-800" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 rounded-3xl bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-32 rounded-3xl bg-neutral-200 dark:bg-neutral-800" />
        </div>
      </div>
    )
  }

  const profile = profileQ.data?.data || profileQ.data || (isOwnProfile ? user : null)
  const reviews = reviewsQ.data?.data?.docs || reviewsQ.data?.data || reviewsQ.data?.reviews || []

  if (!profile) {
    return (
      <div className="p-8 text-center max-w-md mx-auto my-12 card-shine rounded-3xl">
        <User className="h-12 w-12 mx-auto text-neutral-400 mb-3" />
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Profile not found</h2>
        <p className="text-xs text-neutral-500 mt-1 mb-4">The requested user profile does not exist or is inactive.</p>
        <Link to="/discover">
          <Button size="sm">Back to Discover</Button>
        </Link>
      </div>
    )
  }

  const teachSkills = profile.skills_teach || []
  const learnSkills = profile.skills_learn || []

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 max-w-4xl mx-auto space-y-5 min-h-screen">
      {/* Top Header Card */}
      <div className="card-shine p-6 sm:p-8 rounded-3xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <Avatar src={profile.avatar?.url} name={profile.name} size="xl" />

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                    {profile.name}
                  </h1>

                  {profile.is_email_verified ? (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs"
                      title="Verified Account"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-xs"
                      title="Unverified Account"
                    >
                      <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                      <span>Unverified</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mt-1.5 text-xs text-neutral-500">
                  <span className="capitalize px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold">
                    {profile.role || 'Student'}
                  </span>
                  {profile.institution && (
                    <>
                      <span className="text-neutral-400 hidden sm:inline">•</span>
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">{profile.institution}</span>
                    </>
                  )}
                  {profile.location && (
                    <>
                      <span className="text-neutral-400 hidden sm:inline">•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-neutral-400" /> {profile.location}
                      </span>
                    </>
                  )}
                  {profile.email && (
                    <>
                      <span className="text-neutral-400 hidden sm:inline">•</span>
                      <span className="flex items-center gap-1 text-neutral-600 dark:text-neutral-300 font-medium">
                        <Mail className="h-3.5 w-3.5 text-neutral-400" /> {profile.email}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {isOwnProfile ? (
                <Link to="/profile/edit" className="shrink-0 w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs font-bold h-9">
                    Edit profile
                  </Button>
                </Link>
              ) : (
                <Link to="/discover" className="shrink-0 w-full sm:w-auto">
                  <Button size="sm" className="w-full sm:w-auto text-xs font-bold h-9">
                    Send swap request
                  </Button>
                </Link>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 my-3">
              <ReputationBadge score={profile.reputation?.score ?? 0} />
              <span className="text-xs font-medium text-neutral-500">
                {profile.reputation?.sessions_completed || 0} sessions completed
              </span>
              {profile.reputation?.total_reviews > 0 && (
                <span className="text-xs font-medium text-neutral-500">
                  · {profile.reputation.total_reviews} reviews
                </span>
              )}
            </div>

            {profile.bio && (
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl mt-3">
                {profile.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Unverified Account Banner for Owner */}
      {isOwnProfile && !profile.is_email_verified && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-xs">
          <div className="flex items-start gap-3 min-w-0">
            <div className="h-8 w-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 shrink-0 mt-0.5">
              <Mail className="h-4 w-4" />
            </div>
            <div className="text-left space-y-1">
              <p className="font-bold text-neutral-900 dark:text-amber-100 text-sm">Verify your email address</p>
              <p className="text-neutral-600 dark:text-amber-200/80">
                Your account is currently unverified. Click below to receive a link or verify instantly:
              </p>
              {directVerifyUrl && (
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={directVerifyUrl}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verify Account Now (1-Click)
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(directVerifyUrl)
                      notify.success('Verification link copied to clipboard!', 'Copied')
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors"
                  >
                    Copy Link
                  </button>
                </div>
              )}
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleResendVerification}
            loading={resending}
            className="shrink-0 text-xs font-bold bg-amber-500 text-neutral-950 hover:bg-amber-400 border-none shadow-xs h-8"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            {directVerifyUrl ? 'Resend email' : 'Send verification link'}
          </Button>
        </div>
      )}

      {/* Skills Sections */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Can Teach */}
        <div className="card-shine p-5 sm:p-6 rounded-3xl space-y-3">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-indigo-500" />
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Can Teach ({teachSkills.length})</h2>
          </div>
          {teachSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {teachSkills.map((s, i) => (
                <SkillTag key={i} skill={s.skill} level={s.level} verified={s.verified} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-500 italic">No teaching skills listed.</p>
          )}
        </div>

        {/* Wants to Learn */}
        <div className="card-shine p-5 sm:p-6 rounded-3xl space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-emerald-500" />
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Wants to Learn ({learnSkills.length})</h2>
          </div>
          {learnSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {learnSkills.map((s, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
                >
                  <span>{s.skill}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 capitalize">({s.priority})</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-500 italic">No learning goals listed.</p>
          )}
        </div>
      </div>

      {/* Availability Schedule */}
      {profile.availability?.length > 0 && (
        <div className="card-shine p-5 sm:p-6 rounded-3xl space-y-3.5">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Weekly Availability</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {DAYS_OF_WEEK.filter((day) =>
              (profile.availability || []).some((a) => a.day === day)
            ).map((day) => {
              const daySlots = (profile.availability || []).filter((a) => a.day === day)
              return (
                <div
                  key={day}
                  className="p-3 rounded-2xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50/60 dark:bg-neutral-950/60 space-y-1.5"
                >
                  <p className="text-xs font-black text-indigo-600 dark:text-indigo-400">{day}</p>
                  <div className="space-y-1">
                    {daySlots.map((slot, sIdx) => (
                      <p key={sIdx} className="text-[11px] text-neutral-700 dark:text-neutral-300 font-medium">
                        {formatTimeSlot(slot.start)} – {formatTimeSlot(slot.end)}
                      </p>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center justify-between">
          <span>Peer Reviews ({reviews.length})</span>
        </h2>

        {reviews.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <ReviewCard key={r._id} review={r} />
            ))}
          </div>
        ) : (
          <div className="card-shine p-8 rounded-3xl text-center">
            <Star className="h-8 w-8 mx-auto text-neutral-300 dark:text-neutral-700 mb-2" />
            <p className="text-xs text-neutral-500 font-medium">No reviews yet. Complete your first swap session to receive peer ratings!</p>
          </div>
        )}
      </div>
    </div>
  )
}
