import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FEELINGS } from '../constants/feelings'
import Tooltip from './Tooltip'

interface FeelingPickerProps {
  value: string | null
  onChange: (emoji: string | null) => void
  forceDirection?: 'above' | 'below'
}

export default function FeelingPicker({ value, onChange, forceDirection }: FeelingPickerProps) {
  const [open, setOpen] = useState(false)
  const [above, setAbove] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  const measurePosition = useCallback(() => {
    if (forceDirection) {
      setAbove(forceDirection === 'above')
      return
    }
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setAbove(rect.top > 340)
  }, [forceDirection])

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const handleOpen = () => {
    measurePosition()
    setOpen(!open)
  }

  const handleSelect = (emoji: string) => {
    onChange(emoji === value ? null : emoji)
    setOpen(false)
  }

  const yDir = above ? 4 : -4

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <Tooltip label="Currently feeling…">
        <button
          type="button"
          onClick={handleOpen}
          className={`w-8 h-8 flex items-center justify-center rounded-full text-lg transition-all duration-150 ${
            value
              ? 'hover:bg-border/50'
              : 'grayscale opacity-40 hover:opacity-70'
          }`}
        >
          {value ?? '🫥'}
        </button>
      </Tooltip>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: yDir }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: yDir }}
            transition={{ duration: 0.12 }}
            className={`absolute right-0 bg-white rounded-xl shadow-lg border border-border py-1.5 z-50 ${
              above ? 'bottom-full mb-2' : 'top-full mt-2'
            }`}
            style={{ width: '10.5rem' }}
          >
            <p className="px-3 pt-1 pb-2 text-xs font-medium text-fg-3 tracking-wide uppercase">
              I'm feeling…
            </p>
            {FEELINGS.map((f) => (
              <button
                key={f.emoji}
                type="button"
                onClick={() => handleSelect(f.emoji)}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-left transition-colors duration-75 hover:bg-bg active:bg-border/30 ${
                  value === f.emoji ? 'bg-border/30' : ''
                }`}
              >
                <span className="text-lg leading-none">{f.emoji}</span>
                <span className="text-sm text-fg-2">{f.label}</span>
              </button>
            ))}
            {value && (
              <>
                <div className="h-px bg-border mx-2 my-1" />
                <button
                  type="button"
                  onClick={() => { onChange(null); setOpen(false) }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left transition-colors duration-75 hover:bg-bg active:bg-border/30"
                >
                  <span className="text-lg leading-none opacity-40">✕</span>
                  <span className="text-sm text-fg-3">Clear</span>
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
