import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore.js'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner.jsx'
import { RootLayout } from '@/components/layout/RootLayout.jsx'
import { AuthLayout } from '@/components/layout/AuthLayout.jsx'
import { DashboardLayout } from '@/components/layout/DashboardLayout.jsx'

const Landing = lazy(() => import('@/pages/Landing.jsx'))
const Login = lazy(() => import('@/pages/auth/Login.jsx'))
const Register = lazy(() => import('@/pages/auth/Register.jsx'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword.jsx'))
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword.jsx'))
const VerifyEmail = lazy(() => import('@/pages/auth/VerifyEmail.jsx'))
const Dashboard = lazy(() => import('@/pages/Dashboard.jsx'))
const Discover = lazy(() => import('@/pages/Discover.jsx'))
const Matches = lazy(() => import('@/pages/Matches.jsx'))
const ProfileView = lazy(() => import('@/pages/profile/ProfileView.jsx'))
const ProfileEdit = lazy(() => import('@/pages/profile/ProfileEdit.jsx'))
const SessionsList = lazy(() => import('@/pages/sessions/SessionsList.jsx'))
const SessionDetail = lazy(() => import('@/pages/sessions/SessionDetail.jsx'))
const Chat = lazy(() => import('@/pages/Chat.jsx'))
const VideoSession = lazy(() => import('@/pages/VideoSession.jsx'))
const LearningHome = lazy(() => import('@/pages/learning/LearningHome.jsx'))
const SkillRoadmap = lazy(() => import('@/pages/learning/SkillRoadmap.jsx'))
const Settings = lazy(() => import('@/pages/Settings.jsx'))
const NotFound = lazy(() => import('@/pages/NotFound.jsx'))

const PageLoader = () => <LoadingSpinner fullPage />

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />
  return children
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) return <PageLoader />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<RootLayout />}>
          {/* Public Landing & Verification Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Auth Flow Routes */}
          <Route element={<AuthLayout />}>
            <Route
              path="/auth/login"
              element={<PublicOnlyRoute><Login /></PublicOnlyRoute>}
            />
            <Route
              path="/auth/register"
              element={<PublicOnlyRoute><Register /></PublicOnlyRoute>}
            />
            <Route
              path="/auth/forgot-password"
              element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>}
            />
            <Route
              path="/auth/reset-password"
              element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>}
            />
            <Route
              path="/reset-password"
              element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>}
            />
          </Route>

          {/* Protected Application Routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/profile/:id" element={<ProfileView />} />
            <Route path="/profile/edit" element={<ProfileEdit />} />
            <Route path="/sessions" element={<SessionsList />} />
            <Route path="/sessions/:id" element={<SessionDetail />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/:conversationId" element={<Chat />} />
            <Route path="/learning" element={<LearningHome />} />
            <Route path="/learning/:skillId" element={<SkillRoadmap />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Standalone Video Room Route */}
          <Route
            path="/video/:sessionId"
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <VideoSession />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Global 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
