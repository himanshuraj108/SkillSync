import { useEffect, useRef, useState } from 'react'

export function useIntersection(options = {}) {
  const ref = useRef(null)
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)
    observer.observe(el)
    return () => observer.disconnect()
  }, [options.root, options.rootMargin, options.threshold])

  return { ref, isIntersecting }
}
