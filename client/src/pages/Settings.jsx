import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Shield, Bell, Trash2, Lock, User, AlertTriangle } from 'lucide-react'
import { updateProfile, deleteAccount } from '@/services/user.service.js'
import { useAuthStore } from '@/store/authStore.js'
import { Button } from '@/components/ui/Button.jsx'
import { Input } from '@/components/ui/Input.jsx'
import { Textarea } from '@/components/ui/Textarea.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog.jsx'
import { notify } from '@/lib/notify.jsx'
import { cn } from '@/lib/utils.js'

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-neutral-800/80 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-neutral-200">{label}</p>
        <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
          checked ? 'bg-indigo-600' : 'bg-neutral-700'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  )
}

export default function Settings() {
  const { user, setUser, clearUser } = useAuthStore()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('account')
  const [deleteInput, setDeleteInput] = useState('')
  const [showDelete, setShowDelete] = useState(false)

  const [basicForm, setBasicForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    institution: user?.institution || '',
    location: user?.location || '',
  })

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [notifPrefs, setNotifPrefs] = useState({
    match_requests: true,
    session_reminders: true,
    messages: true,
    reviews: true,
  })

  const [privacy, setPrivacy] = useState({
    show_profile: true,
    show_reviews: true,
  })

  const basicMutation = useMutation({
    mutationFn: () => updateProfile(basicForm),
    onSuccess: (res) => {
      setUser(res.data || res.user || user)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      notify.success('Your account preferences have been saved.', 'Settings Updated')
    },
    onError: (err) => notify.error(err.message || 'Failed to update settings.', 'Update Error'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      localStorage.removeItem('ss_access_token')
      clearUser()
      notify.success('Your account and all associated data have been permanently deleted from the database.', 'Account Purged')
      setTimeout(() => {
        window.location.href = '/'
      }, 400)
    },
    onError: (err) => notify.error(err.message || 'Delete operation failed.', 'Account Error'),
  })

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'danger', label: 'Danger Zone', icon: Trash2 },
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 max-w-3xl mx-auto min-h-screen">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
          Manage your account preferences, notifications, and profile details
        </p>
      </div>

      {/* Tabs Navigation (Responsive 4-tab grid on desktop, 2-column or scrolling pills on mobile) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-2xl bg-neutral-900 border border-neutral-800 mb-6">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all',
              activeTab === id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'account' && (
          <>
            {/* Basic Information Card */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-800 bg-neutral-900/60">
                <h2 className="text-sm font-bold text-neutral-100">Basic information</h2>
                <p className="text-xs text-neutral-500 mt-0.5">Update your display name, bio, and institution</p>
              </div>
              <div className="p-5 space-y-4">
                <Input
                  label="Full name"
                  value={basicForm.name}
                  onChange={(e) => setBasicForm((p) => ({ ...p, name: e.target.value }))}
                />
                <Textarea
                  label="Bio"
                  rows={3}
                  placeholder="Tell other learners about your skills and background..."
                  value={basicForm.bio}
                  onChange={(e) => setBasicForm((p) => ({ ...p, bio: e.target.value }))}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Institution / University"
                    placeholder="e.g. IIT Delhi, BITS Pilani"
                    value={basicForm.institution}
                    onChange={(e) => setBasicForm((p) => ({ ...p, institution: e.target.value }))}
                  />
                  <Input
                    label="Location"
                    placeholder="e.g. New Delhi, India"
                    value={basicForm.location}
                    onChange={(e) => setBasicForm((p) => ({ ...p, location: e.target.value }))}
                  />
                </div>
                <div className="pt-2">
                  <Button
                    onClick={() => basicMutation.mutate()}
                    loading={basicMutation.isPending}
                    className="w-full sm:w-auto text-xs h-9"
                  >
                    Save changes
                  </Button>
                </div>
              </div>
            </div>

            {/* Change Password Card */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-800 bg-neutral-900/60">
                <h2 className="text-sm font-bold text-neutral-100">Security & Password</h2>
                <p className="text-xs text-neutral-500 mt-0.5">Choose a secure password with at least 8 characters</p>
              </div>
              <div className="p-5 space-y-4">
                <Input
                  label="Current password"
                  type="password"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="New password"
                    type="password"
                    value={pwForm.newPassword}
                    onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                  />
                  <Input
                    label="Confirm new password"
                    type="password"
                    value={pwForm.confirmPassword}
                    onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    error={
                      pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword
                        ? "Passwords don't match"
                        : undefined
                    }
                  />
                </div>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    disabled={!pwForm.currentPassword || !pwForm.newPassword || pwForm.newPassword !== pwForm.confirmPassword}
                    className="w-full sm:w-auto text-xs h-9"
                  >
                    Update password
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'notifications' && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-800 bg-neutral-900/60">
              <h2 className="text-sm font-bold text-neutral-100">Notification preferences</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Choose which updates and alerts you receive</p>
            </div>
            <div className="px-5 py-2">
              <Toggle
                label="Match requests"
                description="Receive alerts when a user invites you to exchange skills"
                checked={notifPrefs.match_requests}
                onChange={(v) => setNotifPrefs((p) => ({ ...p, match_requests: v }))}
              />
              <Toggle
                label="Session reminders"
                description="Get notified 24 hours and 30 minutes before your booked sessions"
                checked={notifPrefs.session_reminders}
                onChange={(v) => setNotifPrefs((p) => ({ ...p, session_reminders: v }))}
              />
              <Toggle
                label="Direct messages"
                description="Instant notifications for new chat messages from swap partners"
                checked={notifPrefs.messages}
                onChange={(v) => setNotifPrefs((p) => ({ ...p, messages: v }))}
              />
              <Toggle
                label="Session reviews"
                description="Notifications when a partner posts feedback for a completed session"
                checked={notifPrefs.reviews}
                onChange={(v) => setNotifPrefs((p) => ({ ...p, reviews: v }))}
              />
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-800 bg-neutral-900/60">
              <h2 className="text-sm font-bold text-neutral-100">Profile & Privacy</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Manage your public profile visibility</p>
            </div>
            <div className="px-5 py-2">
              <Toggle
                label="Public profile visibility"
                description="Allow learners and professors to find your profile on Discover"
                checked={privacy.show_profile}
                onChange={(v) => setPrivacy((p) => ({ ...p, show_profile: v }))}
              />
              <Toggle
                label="Public reviews and reputation"
                description="Display your completed session ratings on your public profile"
                checked={privacy.show_reviews}
                onChange={(v) => setPrivacy((p) => ({ ...p, show_reviews: v }))}
              />
            </div>
          </div>
        )}

        {activeTab === 'danger' && (
          <div className="rounded-2xl border border-red-900/40 bg-red-950/10 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-red-900/30 bg-red-950/20">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <h2 className="text-sm font-bold text-red-400">Danger Zone</h2>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">Permanent account actions</p>
            </div>
            <div className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-neutral-200">Delete account</h3>
                  <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                    Permanently delete your SkillSync profile, match history, and completed session records.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDelete(true)}
                  className="shrink-0 w-full sm:w-auto text-xs"
                >
                  Delete account
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-neutral-100 font-bold">Delete Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs text-neutral-400">
            <p>
              This action cannot be undone. To confirm, please type <span className="font-bold text-red-400">DELETE</span> below:
            </p>
            <Input
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="Type DELETE to confirm"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteInput !== 'DELETE'}
              loading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              Permanently delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
