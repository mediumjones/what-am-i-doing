import { motion, AnimatePresence } from 'framer-motion'

interface DialogProps {
  open: boolean
  message: React.ReactNode
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

export default function Dialog({
  open,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: DialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-8"
          onClick={onCancel}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-fg/20" />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-white rounded-2xl shadow-lg border border-border px-5 py-4 w-full max-w-[280px]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-fg text-sm leading-snug mb-4">{message}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 text-sm font-medium text-fg-3 py-2 rounded-lg hover:bg-bg transition-colors"
              >
                Nevermind
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 text-sm font-medium text-fg bg-bg py-2 rounded-lg hover:bg-border transition-colors"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
