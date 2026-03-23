import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEntries } from '../store/entries'

export default function Home() {
  const [input, setInput] = useState('')
  const { entries, addEntry, completeEntry } = useEntries()

  const nowEntry = entries.find((e) => e.is_now)
  const timeline = entries.filter((e) => !e.is_now)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    addEntry(text)
    setInput('')
  }

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex flex-col min-h-svh px-5 pt-[calc(var(--spacing-safe-top)+1.5rem)] pb-[calc(var(--spacing-safe-bottom)+2rem)]">
      {/* Now line */}
      <div className="mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={nowEntry?.id ?? 'empty'}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="font-display text-ink text-lg tracking-wide"
          >
            <span className="text-ink-faint text-sm uppercase tracking-widest">
              Now
            </span>
            <p className="mt-1 leading-snug">
              {nowEntry?.text ?? 'not set yet'}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-paper-line mb-6" />

      {/* Input */}
      <form onSubmit={handleSubmit} className="mb-8">
        <label
          htmlFor="doing-input"
          className="block text-ink-faint text-sm mb-2 font-body"
        >
          What am I doing?
        </label>
        <input
          id="doing-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Name the next tiny step…"
          autoComplete="off"
          className="w-full bg-transparent border-b-2 border-ink/20 focus:border-ink/60 outline-none py-2 text-ink font-body text-lg placeholder:text-ink-faint/50 transition-colors duration-150"
        />
        <p className="text-ink-faint text-xs mt-2 italic opacity-70">
          Name it, then go do the thing.
        </p>
      </form>

      {/* Timeline */}
      <div className="flex-1">
        <AnimatePresence initial={false}>
          {timeline.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="flex items-start gap-3 py-3 border-b border-paper-line/60"
            >
              <button
                type="button"
                onClick={() => !entry.completed_at && completeEntry(entry.id)}
                className={`mt-0.5 w-5 h-5 rounded-sm border-2 flex-shrink-0 flex items-center justify-center transition-colors duration-100 ${
                  entry.completed_at
                    ? 'border-done bg-done/10 text-done'
                    : 'border-ink/30 hover:border-ink/60'
                }`}
              >
                {entry.completed_at && (
                  <motion.svg
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.1 }}
                    className="w-3 h-3"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <motion.path d="M2 6l3 3 5-5" />
                  </motion.svg>
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p
                  className={`font-body leading-snug transition-opacity duration-150 ${
                    entry.completed_at ? 'line-through opacity-50' : 'text-ink'
                  }`}
                >
                  {entry.text}
                </p>
                <span className="text-ink-faint text-xs">
                  {formatTime(entry.created_at)}
                </span>
              </div>

              <span className="text-lg flex-shrink-0 mt-0.5 cursor-pointer opacity-40 hover:opacity-80 transition-opacity">
                {entry.mood_emoji ?? '·'}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {timeline.length === 0 && (
          <p className="text-ink-faint/50 text-sm italic text-center mt-12">
            Your timeline will appear here.
          </p>
        )}
      </div>
    </div>
  )
}
