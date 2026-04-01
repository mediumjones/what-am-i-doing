import { motion, AnimatePresence } from 'framer-motion'

interface ToastProps {
  message: string | null
}

export default function Toast({ message }: ToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key={message}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none inline-block bg-fg/85 backdrop-blur-sm text-bg text-sm font-medium px-4 py-3 rounded-xl"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
