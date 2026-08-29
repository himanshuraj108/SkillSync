import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, ShieldAlert, ArrowRight,
  Monitor, MessageSquare, Code, FileText, CheckSquare, Send,
  Maximize2, Minimize2, Loader2, Sparkles, RefreshCw, CheckCircle2, RotateCcw, Clock
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore.js'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSession, completeSession, setRecordingConsent, uploadSessionRecording } from '@/services/session.service.js'
import { useSocketStore } from '@/store/socketStore.js'
import { Button } from '@/components/ui/Button.jsx'
import { Avatar } from '@/components/ui/Avatar.jsx'
import { RecordingConsentModal } from '@/components/video/RecordingConsentModal.jsx'
import { cn } from '@/lib/utils.js'
import { notify } from '@/lib/notify.jsx'

const CODE_LANGUAGES = ['cpp', 'java', 'python', 'javascript', 'typescript', 'sql', 'html', 'css']

const DEFAULT_STARTER_CODE = {
  cpp: `// 1-on-1 Peer Coding Session\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Welcome to our SkillSync session!" << endl;\n    return 0;\n}`,
  java: `// 1-on-1 Peer Coding Session\npublic class Solution {\n    public static void main(String[] args) {\n        System.out.println("Hello, welcome to our SkillSync session!");\n    }\n}`,
  python: `# 1-on-1 Peer Coding Session\ndef main():\n    print("Welcome to our SkillSync session!")\n\nif __name__ == "__main__":\n    main()`,
  javascript: `// 1-on-1 Peer Coding Session\nfunction main() {\n    console.log("Welcome to our SkillSync session!");\n}\nmain();`
}

export default function VideoSession() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { socket } = useSocketStore()
  const queryClient = useQueryClient()

  // Meeting state
  const [hasLeftMeeting, setHasLeftMeeting] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [localStream, setLocalStream] = useState(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  // 7-Day Recording State & Permissions
  const [showConsentModal, setShowConsentModal] = useState(true)
  const [myRecordingConsent, setMyRecordingConsent] = useState(null)
  const [partnerRecordingConsent, setPartnerRecordingConsent] = useState(null)
  const [isRecordingActive, setIsRecordingActive] = useState(false)

  // Interactive teaching studio state
  const [activeTab, setActiveTab] = useState('code') // 'code' | 'notes' | 'chat' | 'agenda'
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [codeLanguage, setCodeLanguage] = useState('cpp')
  const [codeContent, setCodeContent] = useState(DEFAULT_STARTER_CODE.cpp)
  const [notesContent, setNotesContent] = useState('')
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [agendaItems, setAgendaItems] = useState([
    { id: 1, text: 'Introduction & core concepts review', done: false },
    { id: 2, text: 'Hands-on coding exercise / live demo', done: false },
    { id: 3, text: 'Q&A, troubleshooting, and next steps', done: false },
  ])

  // Completion modal state
  const [showEndModal, setShowEndModal] = useState(false)
  const [teacherNotes, setTeacherNotes] = useState('')
  const [learnerConfidence, setLearnerConfidence] = useState(5)

  const localVideoRef = useRef(null)
  const localStreamRef = useRef(null)
  const screenStreamRef = useRef(null)
  const timerRef = useRef(null)
  const chatBottomRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const recordedChunksRef = useRef([])

  // Bulletproof media cleanup function
  const stopAllMedia = useCallback(() => {
    // 1. Stop all tracks on local camera & mic stream
    if (localStreamRef.current) {
      try {
        localStreamRef.current.getTracks().forEach(track => {
          track.stop()
          track.enabled = false
        })
      } catch (_) {}
      localStreamRef.current = null
    }

    // 2. Stop all screen share tracks
    if (screenStreamRef.current) {
      try {
        screenStreamRef.current.getTracks().forEach(track => {
          track.stop()
          track.enabled = false
        })
      } catch (_) {}
      screenStreamRef.current = null
    }

    // 3. Detach stream from video element
    if (localVideoRef.current) {
      try {
        localVideoRef.current.srcObject = null
      } catch (_) {}
    }

    // 4. Stop MediaRecorder if running
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop()
      } catch (_) {}
    }

    setLocalStream(null)
    setIsScreenSharing(false)
    setIsRecordingActive(false)
  }, [])

  const { data: sessionData } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => getSession(sessionId),
    enabled: !!sessionId,
  })
  const session = sessionData?.data || sessionData

  const isTeacher = session?.teacher?._id === user?._id || session?.teacher === user?._id
  const partner = session ? (isTeacher ? session.learner : session.teacher) : null

  // Handle user's personal recording consent selection
  const handleRecordingConsentChoice = async (consent) => {
    setMyRecordingConsent(consent)
    setShowConsentModal(false)
    try {
      await setRecordingConsent(sessionId, consent)
      if (socket && sessionId) {
        socket.emit('session_recording_consent', { sessionId, consent })
      }
      if (consent) {
        notify.success('Recording will be saved to your account for 7 days.', 'Recording Enabled')
      } else {
        notify.info('Recording will not be saved to your account.', 'Recording Preference')
      }
    } catch (err) {
      console.error('Failed to set recording consent:', err)
    }
  }

  // Start MediaRecorder if at least one user opted in
  const startRecording = useCallback((stream) => {
    if (!stream || mediaRecorderRef.current) return
    try {
      recordedChunksRef.current = []
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : (MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : '')
        
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }
      recorder.start(1000)
      mediaRecorderRef.current = recorder
      setIsRecordingActive(true)
    } catch (err) {
      console.warn('MediaRecorder error:', err)
    }
  }, [])

  // Stop recording and upload to backend if permitted
  const stopAndUploadRecording = useCallback(async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop()
      } catch (_) {}
      setIsRecordingActive(false)
    }

    const shouldUpload = myRecordingConsent === true || partnerRecordingConsent === true
    if (shouldUpload && recordedChunksRef.current.length > 0) {
      try {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
        const formData = new FormData()
        formData.append('video', blob, `session-${sessionId}.webm`)
        formData.append('duration_seconds', elapsedSeconds)
        await uploadSessionRecording(sessionId, formData)
      } catch (err) {
        console.warn('Recording upload error:', err)
      }
    }
  }, [myRecordingConsent, partnerRecordingConsent, sessionId, elapsedSeconds])

  // Complete session mutation
  const completeMutation = useMutation({
    mutationFn: async () => {
      await stopAndUploadRecording()
      stopAllMedia()
      return completeSession(sessionId, {
        teacher_post_notes: teacherNotes || 'Completed 1-on-1 exchange successfully.',
        learner_confidence_after: Number(learnerConfidence) || 5
      })
    },
    onSuccess: () => {
      stopAllMedia()
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] })
      notify.success('Session marked as completed! Gained exchange reputation.', 'Session Finished')
      navigate(`/sessions/${sessionId}`)
    },
    onError: () => {
      stopAllMedia()
      navigate(`/sessions/${sessionId}`)
    },
  })

  // Start local camera & mic
  const startMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      localStreamRef.current = stream
      setLocalStream(stream)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      if (!timerRef.current) {
        timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000)
      }
      // Start recording stream
      startRecording(stream)
    } catch (err) {
      console.warn('Camera/Mic permission warning:', err)
      notify.info('Camera or mic is muted or not accessible. You can still use code & chat tools.', 'Media Info')
    }
  }, [startRecording])

  // Socket room joining and collaborative event listeners
  useEffect(() => {
    if (!socket || !sessionId || hasLeftMeeting) return

    socket.emit('join_room', sessionId)

    socket.on('session_code_update', (data) => {
      if (data.userId !== user?._id) {
        setCodeContent(data.code)
        if (data.language) setCodeLanguage(data.language)
      }
    })

    socket.on('session_notes_update', (data) => {
      if (data.userId !== user?._id) {
        setNotesContent(data.notes)
      }
    })

    socket.on('session_chat_broadcast', (msg) => {
      setChatMessages(prev => [...prev, msg])
    })

    socket.on('session_recording_consent_update', (data) => {
      setPartnerRecordingConsent(data.consent)
    })

    return () => {
      socket.emit('leave_room', sessionId)
      socket.off('session_code_update')
      socket.off('session_notes_update')
      socket.off('session_chat_broadcast')
      socket.off('session_recording_consent_update')
    }
  }, [socket, sessionId, user?._id, hasLeftMeeting])

  useEffect(() => {
    if (!hasLeftMeeting) {
      startMedia()
    }
    return () => {
      stopAllMedia()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [hasLeftMeeting, startMedia, stopAllMedia])

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Broadcast code changes
  const handleCodeChange = (newCode) => {
    setCodeContent(newCode)
    if (socket && sessionId) {
      socket.emit('session_code_change', { sessionId, code: newCode, language: codeLanguage })
    }
  }

  // Broadcast notes changes
  const handleNotesChange = (newNotes) => {
    setNotesContent(newNotes)
    if (socket && sessionId) {
      socket.emit('session_notes_change', { sessionId, notes: newNotes })
    }
  }

  // Send in-room chat message
  const handleSendChat = (e) => {
    e?.preventDefault()
    if (!chatInput.trim() || !socket || !sessionId) return

    socket.emit('session_chat_message', { sessionId, text: chatInput.trim() })
    setChatInput('')
  }

  // Toggle Mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !t.enabled })
      setIsMuted(m => !m)
    }
  }

  // Toggle Video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(t => { t.enabled = !t.enabled })
      setIsVideoOff(v => !v)
    }
  }

  // Screen share
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop())
        screenStreamRef.current = null
      }
      setIsScreenSharing(false)
      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current
      }
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        screenStreamRef.current = screenStream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream
        }
        setIsScreenSharing(true)
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false)
          if (localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current
          }
        }
      } catch (err) {
        console.warn('Screen share cancelled/failed:', err)
      }
    }
  }

  // User clicked End Call -> Stop all camera/mic tracks completely
  const handleLeaveMeetingClick = () => {
    stopAllMedia()
    setHasLeftMeeting(true)
  }

  // Re-join meeting (Green Action)
  const handleRejoinMeeting = async () => {
    setHasLeftMeeting(false)
    setShowEndModal(false)
    await startMedia()
    notify.success('Reconnected to video room.', 'Rejoined Call')
  }

  // Confirm permanent completion (Red Action)
  const handleConfirmFinish = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    stopAllMedia()
    completeMutation.mutate()
  }

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  // SCREEN WHEN USER LEAVES MEETING: GREEN (RE-JOIN) & RED (END)
  if (hasLeftMeeting) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4 font-sans select-none">
        <div className="card-shine max-w-md w-full rounded-3xl p-7 sm:p-8 bg-neutral-900 border border-neutral-800 shadow-2xl text-center space-y-6">
          <div className="h-16 w-16 rounded-2xl bg-neutral-800/80 border border-neutral-700 flex items-center justify-center text-neutral-300 mx-auto shadow-lg">
            <PhoneOff className="h-8 w-8 text-red-400" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-neutral-800 text-neutral-400 border border-neutral-700 mb-2">
              Call Disconnected
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              You Left the Meeting
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
              Did you leave by mistake or have you finished your skill exchange session?
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {/* GREEN RE-JOIN BUTTON */}
            <button
              onClick={handleRejoinMeeting}
              className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/60 active:scale-[0.99]"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Re-join Meeting</span>
            </button>

            {/* RED END & COMPLETE BUTTON */}
            <button
              onClick={() => setShowEndModal(true)}
              className="w-full h-12 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-950/60 active:scale-[0.99]"
            >
              <PhoneOff className="h-4 w-4" />
              <span>End & Complete Session</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 pt-3 border-t border-neutral-800 text-xs">
            <Link to={`/sessions/${sessionId}`} className="text-neutral-400 hover:text-neutral-200 transition-colors">
              Session Details
            </Link>
            <span className="text-neutral-700">•</span>
            <Link to="/sessions" className="text-neutral-400 hover:text-neutral-200 transition-colors">
              All Sessions
            </Link>
          </div>
        </div>

        {/* POST-SESSION WRAP UP MODAL ON END CLICK */}
        {showEndModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="card-shine w-full max-w-md rounded-3xl p-6 bg-neutral-900 border border-neutral-800 shadow-2xl space-y-5 text-left">
              <div>
                <h3 className="text-lg font-bold text-neutral-100">Finish & Complete Exchange</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Wrap up and record your exchange on {session?.skill || 'Skills'}.
                </p>
              </div>

              {isTeacher ? (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-300">
                    Teacher Post-Session Notes <span className="text-neutral-500 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={teacherNotes}
                    onChange={e => setTeacherNotes(e.target.value)}
                    placeholder="Summary of topics covered and next steps for learner..."
                    rows={3}
                    className="w-full rounded-xl bg-neutral-950 border border-neutral-800 p-3 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-300">
                    Your Confidence After This Session (1 to 5)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setLearnerConfidence(rating)}
                        className={cn(
                          'flex-1 py-2 rounded-xl text-xs font-bold border transition-all',
                          learnerConfidence === rating
                            ? 'border-indigo-500 bg-indigo-600 text-white shadow-md'
                            : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                        )}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEndModal(false)}
                  disabled={completeMutation.isPending}
                  className="text-xs"
                >
                  Cancel
                </Button>

                <Button
                  size="sm"
                  onClick={handleConfirmFinish}
                  disabled={completeMutation.isPending}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4"
                >
                  {completeMutation.isPending ? (
                    <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Completing...</>
                  ) : (
                    'Confirm End'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ACTIVE LIVE STUDIO
  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100 overflow-hidden font-sans select-none">
      {/* MAIN VIDEO & TEACHING STUDIO AREA */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top App Bar */}
        <header className="h-14 px-4 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLeaveMeetingClick}
              title="Leave Room"
              className="h-8 w-8 rounded-xl bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="text-sm font-bold text-neutral-100 truncate max-w-[220px] sm:max-w-md">
                  {session?.title || `${session?.skill || 'SkillSync'} Session`}
                </h2>
              </div>
              <p className="text-[10px] text-neutral-500">
                {isTeacher ? 'You are Teaching' : 'You are Learning'} • {session?.skill}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-neutral-950 px-3 py-1 rounded-full border border-neutral-800 text-xs font-mono font-bold text-neutral-300">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              {formatTime(elapsedSeconds)}
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setSidebarOpen(o => !o)}
              className="h-8 text-xs font-semibold"
            >
              {sidebarOpen ? <Minimize2 className="h-3.5 w-3.5 mr-1" /> : <Maximize2 className="h-3.5 w-3.5 mr-1" />}
              {sidebarOpen ? 'Focus Video' : 'Open Workspace'}
            </Button>
          </div>
        </header>

        {/* Video Canvas & Remote Stage */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
          {/* Main Video View (Partner / Screen / Placeholder) */}
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
            {partner ? (
              <div className="flex flex-col items-center gap-4 max-w-sm">
                <Avatar
                  src={partner?.avatar?.url}
                  name={partner?.name}
                  size="xl"
                  className="h-28 w-28 text-3xl border-4 border-neutral-800 shadow-2xl"
                />
                <div>
                  <h3 className="text-base font-bold text-neutral-200">{partner?.name}</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {isTeacher ? `Learner (${session?.skill})` : `Teacher & Mentor (${session?.skill})`}
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-neutral-900/80 px-3.5 py-1.5 rounded-full border border-neutral-800 text-xs text-neutral-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live in-room studio active
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 text-neutral-600 animate-spin" />
                <p className="text-neutral-500 text-sm">Connecting to session room...</p>
              </div>
            )}
          </div>

          {/* Self Video PIP (Picture in Picture) */}
          <div className="absolute bottom-24 right-4 w-44 h-32 rounded-2xl border-2 border-neutral-700 bg-neutral-900 shadow-2xl overflow-hidden z-10">
            {isVideoOff ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900 text-neutral-400">
                <Avatar src={user?.avatar?.url} name={user?.name} size="md" />
                <span className="text-[10px] mt-1 font-semibold text-neutral-500">Camera Off</span>
              </div>
            ) : (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />
            )}
            <div className="absolute bottom-1.5 left-2 bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5">
              <span className="text-[9px] font-bold text-white uppercase tracking-wider">
                You ({isTeacher ? 'Teacher' : 'Learner'})
              </span>
            </div>
          </div>

          {/* Bottom Floating Control Bar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-neutral-900/95 backdrop-blur-xl px-5 py-3 rounded-full border border-neutral-800 shadow-2xl z-20">
            <button
              onClick={toggleMute}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              className={cn(
                'w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md',
                isMuted ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
              )}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            <button
              onClick={toggleVideo}
              title={isVideoOff ? 'Turn camera on' : 'Turn camera off'}
              className={cn(
                'w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md',
                isVideoOff ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
              )}
            >
              {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </button>

            <button
              onClick={toggleScreenShare}
              title={isScreenSharing ? 'Stop screen share' : 'Share your screen'}
              className={cn(
                'w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md',
                isScreenSharing ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
              )}
            >
              <Monitor className="h-5 w-5" />
            </button>

            <div className="h-6 w-px bg-neutral-800 mx-1" />

            <button
              onClick={handleLeaveMeetingClick}
              title="Leave / End Meeting"
              className="px-5 h-11 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-red-900/30"
            >
              <PhoneOff className="h-4 w-4" />
              <span>Leave / End</span>
            </button>
          </div>
        </div>
      </div>

      {/* INTERACTIVE WORKSPACE SIDEBAR (Code, Notes, Chat, Agenda) */}
      {sidebarOpen && (
        <aside className="w-full sm:w-[420px] lg:w-[460px] border-l border-neutral-800 bg-neutral-900/95 backdrop-blur-md flex flex-col shrink-0 z-20">
          {/* Workspace Tabs */}
          <div className="grid grid-cols-4 p-1.5 border-b border-neutral-800 bg-neutral-950 shrink-0 gap-1">
            <button
              onClick={() => setActiveTab('code')}
              className={cn(
                'py-2 px-1 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all',
                activeTab === 'code' ? 'bg-indigo-600 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
              )}
            >
              <Code className="h-3.5 w-3.5" /> Code
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={cn(
                'py-2 px-1 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all',
                activeTab === 'notes' ? 'bg-indigo-600 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
              )}
            >
              <FileText className="h-3.5 w-3.5" /> Notes
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={cn(
                'py-2 px-1 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all relative',
                activeTab === 'chat' ? 'bg-indigo-600 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
              )}
            >
              <MessageSquare className="h-3.5 w-3.5" /> Chat
              {chatMessages.length > 0 && (
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('agenda')}
              className={cn(
                'py-2 px-1 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all',
                activeTab === 'agenda' ? 'bg-indigo-600 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
              )}
            >
              <CheckSquare className="h-3.5 w-3.5" /> Goals
            </button>
          </div>

          {/* TAB 1: Real-time Code Editor */}
          {activeTab === 'code' && (
            <div className="flex-1 flex flex-col overflow-hidden p-3 space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-indigo-400" /> Live Shared Editor
                </span>
                <select
                  value={codeLanguage}
                  onChange={(e) => {
                    const lang = e.target.value
                    setCodeLanguage(lang)
                    if (DEFAULT_STARTER_CODE[lang]) setCodeContent(DEFAULT_STARTER_CODE[lang])
                  }}
                  className="bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {CODE_LANGUAGES.map(l => (
                    <option key={l} value={l}>{l.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <textarea
                value={codeContent}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="Type or paste code here to teach and solve together live..."
                className="flex-1 w-full bg-neutral-950 font-mono text-xs text-emerald-400 p-3.5 rounded-2xl border border-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
                spellCheck={false}
              />
              <p className="text-[10px] text-neutral-500 text-right px-1">
                Synced in real-time with {partner?.name || 'partner'}
              </p>
            </div>
          )}

          {/* TAB 2: Shared Whiteboard Notes */}
          {activeTab === 'notes' && (
            <div className="flex-1 flex flex-col overflow-hidden p-3 space-y-2">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1">
                Collaborative Session Scratchpad
              </span>
              <textarea
                value={notesContent}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Write lesson notes, bullet points, formula explanations, or links here..."
                className="flex-1 w-full bg-neutral-950 font-sans text-xs text-neutral-200 p-3.5 rounded-2xl border border-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
              />
              <p className="text-[10px] text-neutral-500 text-right px-1">
                Both of you can type and see notes simultaneously.
              </p>
            </div>
          )}

          {/* TAB 3: In-Room Live Chat */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 && (
                  <div className="py-12 text-center text-xs text-neutral-500">
                    <MessageSquare className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    No messages yet. Send a message to your partner!
                  </div>
                )}
                {chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex flex-col max-w-[85%] rounded-2xl p-3 text-xs',
                      msg.senderId === user?._id
                        ? 'ml-auto bg-indigo-600 text-white rounded-br-none'
                        : 'mr-auto bg-neutral-800 text-neutral-200 rounded-bl-none'
                    )}
                  >
                    <span className="text-[9px] font-bold opacity-75 mb-0.5">{msg.senderName} • {msg.time}</span>
                    <p className="leading-relaxed break-words">{msg.text}</p>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              <form onSubmit={handleSendChat} className="p-3 border-t border-neutral-800 bg-neutral-950 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Send a message or link..."
                  className="flex-1 h-9 rounded-xl bg-neutral-900 border border-neutral-800 px-3 text-xs text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <Button type="submit" size="sm" className="h-9 px-3 bg-indigo-600 hover:bg-indigo-500">
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </form>
            </div>
          )}

          {/* TAB 4: Learning Agenda & Goals Checklist */}
          {activeTab === 'agenda' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Session Learning Goals
                </h4>
                <p className="text-[11px] text-neutral-500">Check off topics as you teach/learn them:</p>
              </div>

              <div className="space-y-2">
                {agendaItems.map(item => (
                  <label
                    key={item.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all',
                      item.done
                        ? 'border-emerald-700/50 bg-emerald-950/20 text-emerald-300'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-300'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => {
                        setAgendaItems(items => items.map(i => i.id === item.id ? { ...i, done: !i.done } : i))
                      }}
                      className="mt-0.5 rounded border-neutral-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className={cn('text-xs font-medium leading-relaxed', item.done && 'line-through opacity-80')}>
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Topic Description
                </p>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {session?.agenda || session?.description || `Live 1-on-1 peer exchange on ${session?.skill}.`}
                </p>
              </div>
            </div>
          )}
        </aside>
      )}

      {/* 7-Day Recording Personal Choice Modal */}
      <RecordingConsentModal
        isOpen={showConsentModal && myRecordingConsent === null}
        onSelect={handleRecordingConsentChoice}
        partnerName={partner?.name}
      />
    </div>
  )
}
