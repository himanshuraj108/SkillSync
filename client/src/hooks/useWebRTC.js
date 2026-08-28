import { useState, useEffect, useRef, useCallback } from 'react'

export function useWebRTC({ socket, sessionId }) {
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)
  const peerRef = useRef(null)
  const localStreamRef = useRef(null)

  useEffect(() => {
    let stream
    const initMedia = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        localStreamRef.current = stream
        setLocalStream(stream)
      } catch (err) {
        setError('Could not access camera or microphone. Please check permissions.')
      }
    }
    initMedia()
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (!socket || !sessionId) return

    socket.emit('join_room', sessionId)

    socket.on('user_joined', async ({ socketId }) => {
      if (!localStreamRef.current) return
      const SimplePeer = (await import('simple-peer')).default
      const peer = new SimplePeer({
        initiator: true,
        trickle: true,
        stream: localStreamRef.current,
      })

      peer.on('signal', (data) => {
        socket.emit('offer', { targetId: socketId, offer: data })
      })

      peer.on('stream', (remoteStr) => {
        setRemoteStream(remoteStr)
        setIsConnected(true)
      })

      peer.on('error', (err) => {
        setError('Connection error: ' + err.message)
      })

      peerRef.current = peer
    })

    socket.on('offer', async ({ offer, from }) => {
      if (!localStreamRef.current) return
      const SimplePeer = (await import('simple-peer')).default
      const peer = new SimplePeer({
        initiator: false,
        trickle: true,
        stream: localStreamRef.current,
      })

      peer.on('signal', (data) => {
        socket.emit('answer', { targetId: from, answer: data })
      })

      peer.on('stream', (remoteStr) => {
        setRemoteStream(remoteStr)
        setIsConnected(true)
      })

      peer.on('error', (err) => {
        setError('Connection error: ' + err.message)
      })

      peer.signal(offer)
      peerRef.current = peer
    })

    socket.on('answer', ({ answer }) => {
      peerRef.current?.signal(answer)
    })

    socket.on('ice_candidate', ({ candidate }) => {
      peerRef.current?.signal(candidate)
    })

    socket.on('user_left', () => {
      setRemoteStream(null)
      setIsConnected(false)
      peerRef.current?.destroy()
      peerRef.current = null
    })

    return () => {
      socket.emit('leave_room', sessionId)
      socket.off('user_joined')
      socket.off('offer')
      socket.off('answer')
      socket.off('ice_candidate')
      socket.off('user_left')
    }
  }, [socket, sessionId])

  const toggleAudio = useCallback(() => {
    if (!localStreamRef.current) return
    const audioTrack = localStreamRef.current.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      setIsMuted(!audioTrack.enabled)
    }
  }, [])

  const toggleVideo = useCallback(() => {
    if (!localStreamRef.current) return
    const videoTrack = localStreamRef.current.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      setIsVideoOff(!videoTrack.enabled)
    }
  }, [])

  const endCall = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop())
    }
    peerRef.current?.destroy()
    peerRef.current = null
    socket?.emit('leave_room', sessionId)
    setLocalStream(null)
    setRemoteStream(null)
    setIsConnected(false)
  }, [socket, sessionId])

  return { localStream, remoteStream, isMuted, isVideoOff, isConnected, error, toggleAudio, toggleVideo, endCall }
}
