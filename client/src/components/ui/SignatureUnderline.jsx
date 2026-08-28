import { motion } from 'framer-motion'

export function SignatureUnderline({
  delay = 0.4,
  duration = 1.2,
  className = 'absolute -bottom-2.5 sm:-bottom-3.5 left-0 w-full h-4 sm:h-6 overflow-visible pointer-events-none',
}) {
  return (
    <motion.svg
      viewBox="0 0 280 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="none"
      initial="hidden"
      animate="visible"
    >
      <defs>
        <linearGradient id="sig-underline-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
      </defs>

      {/* Main sweeping handwritten signature underline path */}
      <motion.path
        d="M 3 14 C 60 5, 130 4, 195 8.5 C 235 11, 260 14, 277 10.5 C 235 17.5, 155 21, 65 20.5"
        stroke="url(#sig-underline-grad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
              pathLength: { duration, ease: [0.22, 1, 0.36, 1], delay },
              opacity: { duration: 0.15, delay },
            },
          },
        }}
      />
    </motion.svg>
  )
}

export default SignatureUnderline
