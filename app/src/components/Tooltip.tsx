import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TooltipProps {
  label: string
  children: React.ReactNode
}

export default function Tooltip({ label, children }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current)
    timeout.current = setTimeout(() => setVisible(true), 400)
  }, [])

  const hide = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current)
    setVisible(false)
  }, [])

  return (
    <div
      className="relative flex items-center justify-center"
      onPointerEnter={show}
      onPointerLeave={hide}
      onPointerDown={hide}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-fg text-bg text-xs font-medium rounded-lg whitespace-nowrap pointer-events-none z-50"
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
