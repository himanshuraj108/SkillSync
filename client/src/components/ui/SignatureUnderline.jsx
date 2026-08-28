import { motion } from 'framer-motion'

/**
 * SignatureUnderline component with multi-stage choreographed animation:
 * - 'first-temporary': Draws first in blue/indigo, then fades out.
 * - 'second-permanent': Draws second in clean white/silver and stays permanently.
 */
export function SignatureUnderline({
  variant = 'second-permanent',
  delay = 0.2,
  className = 'absolute -bottom-2.5 sm:-bottom-3.5 left-0 w-full h-4 sm:h-6 overflow-visible pointer-events-none',
}) {
  const isFirstTemp = variant === 'first-temporary'

  return (
    <motion.svg
      viewBox="0 0 280 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="none"
    >
      <defs>
        {/* Blue/Indigo gradient for first stroke */}
        <linearGradient id="sig-blue-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>

        {/* Crisp White/Silver gradient for second permanent stroke */}
        <linearGradient id="sig-white-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>

      {isFirstTemp ? (
        // First Signature Stroke (Draws under "Exchange skills," then fades away)
        <motion.path
          d="M 3 14 C 60 5, 130 4, 195 8.5 C 235 11, 260 14, 277 10.5 C 235 17.5, 155 21, 65 20.5"
          stroke="url(#sig-blue-grad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: [0, 1, 1, 1],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 2.6,
            times: [0, 0.35, 0.75, 1],
            ease: 'easeInOut',
            delay: delay,
          }}
        />
      ) : (
        // Second Signature Stroke (Draws under "not money." in White and stays)
        <motion.path
          d="M 3 14 C 60 5, 130 4, 195 8.5 C 235 11, 260 14, 277 10.5 C 235 17.5, 155 21, 65 20.5"
          stroke="url(#sig-white-grad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: 1,
            opacity: 1,
          }}
          transition={{
            pathLength: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: delay || 1.4 },
            opacity: { duration: 0.2, delay: delay || 1.4 },
          }}
        />
      )}
    </motion.svg>
  )
}

export default SignatureUnderline
