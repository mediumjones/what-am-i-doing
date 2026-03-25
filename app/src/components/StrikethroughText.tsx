import { motion, AnimatePresence } from 'framer-motion'

interface StrikethroughTextProps {
  text: string
  completing: boolean
  uncompleting?: boolean
  done: boolean
  className?: string
}

export default function StrikethroughText({
  text,
  completing,
  uncompleting = false,
  done,
  className = '',
}: StrikethroughTextProps) {
  const showLine = completing || uncompleting || done

  return (
    <span className={`relative block ${className}`}>
      {/* Base text — invisible when strikethrough overlay is fully revealed */}
      <span className={showLine && !completing && !uncompleting ? 'invisible' : ''}>
        {text}
      </span>
      {/* Strikethrough overlay: same text with line-through, clipped to animate */}
      <AnimatePresence>
        {showLine && (
          <motion.span
            aria-hidden
            className="absolute inset-0 line-through decoration-fg-3"
            initial={completing ? { clipPath: 'inset(0 100% 0 0)' } : { clipPath: 'inset(0 0% 0 0)' }}
            animate={{ clipPath: uncompleting ? 'inset(0 100% 0 0)' : 'inset(0 0% 0 0)' }}
            exit={{ clipPath: 'inset(0 100% 0 0)' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}
