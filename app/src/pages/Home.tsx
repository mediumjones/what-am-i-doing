import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEntries } from '../store/entries'
import FeelingPicker from '../components/FeelingPicker'
import Checkbox from '../components/Checkbox'
import StrikethroughText from '../components/StrikethroughText'
import Toast from '../components/Toast'
import Dialog from '../components/Dialog'
import { CREATE_TOASTS, COMPLETE_TOASTS, UNCOMPLETE_TOASTS, FEELING_TOASTS, pickToast } from '../constants/toasts'
import { PLACEHOLDERS } from '../constants/feelings'
import Tooltip from '../components/Tooltip'
import DevMenu, { DEV_MENU_ENABLED } from '../dev/DevMenu'

function haptic() {
  if (navigator.vibrate) navigator.vibrate(8)
}

function getTimeString() {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

const TIME_FORMAT: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' }

function formatTime(iso: string) {
  const date = new Date(iso)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  return date.toLocaleTimeString([], TIME_FORMAT)
}

export default function Home() {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [pendingFeeling, setPendingFeeling] = useState<string | null>(null)
  const [placeholder, setPlaceholder] = useState(() => PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)])
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafHandle = useRef<number | null>(null)
  const [pendingUncompleteId, setPendingUncompleteId] = useState<string | null>(null)

  const { entries, addEntry, completeEntry, uncompleteEntry, setFeeling } = useEntries()

  // Keep the completing entry as "now" until the card animation finishes
  const nowEntry = entries.find((e) => e.is_now || e.id === completingId)
  // Show all non-active entries in timeline, plus the completing entry
  // (so it fades into the list while the card is still visible)
  const timeline = entries.filter((e) => !e.is_now || e.id === completingId).reverse()

  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    if (rafHandle.current) cancelAnimationFrame(rafHandle.current)
    setToast(null)
    rafHandle.current = requestAnimationFrame(() => {
      setToast(msg)
      toastTimer.current = setTimeout(() => setToast(null), 3750)
    })
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
      if (rafHandle.current) cancelAnimationFrame(rafHandle.current)
    }
  }, [])

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    })
  }, [])

  const handleFeelingChange = useCallback(
    (id: string, emoji: string | null) => {
      setFeeling(id, emoji)
      if (emoji && FEELING_TOASTS[emoji]) {
        showToast(pickToast(FEELING_TOASTS[emoji], getTimeString()))
      }
    },
    [setFeeling, showToast],
  )

  const doSubmit = useCallback(() => {
    const el = inputRef.current
    const text = (el?.value ?? input).trim()
    if (!text) return
    addEntry(text, pendingFeeling)
    setInput('')
    if (el) el.value = ''
    el?.focus()
    setPendingFeeling(null)
    setPlaceholder((prev) => {
      const options = PLACEHOLDERS.filter((p) => p !== prev)
      return options[Math.floor(Math.random() * options.length)]
    })
    showToast(pickToast(CREATE_TOASTS, getTimeString()))
    scrollToEnd()
  }, [input, pendingFeeling, addEntry, showToast, scrollToEnd])

  const handleComplete = useCallback(
    (id: string) => {
      if (completingId) return
      setCompletingId(id)
      haptic()
      showToast(pickToast(COMPLETE_TOASTS, getTimeString()))
      // 1. Entry appears in timeline immediately (via completingId filter)
      //    and starts its fade-in animation (300ms + 150ms delay)
      // 2. After 600ms: strikethrough done, mark complete in store
      //    (entry stays in timeline, card content fades to grey)
      setTimeout(() => {
        completeEntry(id)
      }, 600)
      // 3. After 900ms: clear completingId, card disappears
      //    (entry is already fully visible in timeline)
      setTimeout(() => {
        setCompletingId(null)
      }, 900)
    },
    [completingId, completeEntry, showToast],
  )

  const handleUncomplete = useCallback(
    (id: string) => {
      if (nowEntry) {
        setPendingUncompleteId(id)
      } else {
        uncompleteEntry(id)
        showToast(pickToast(UNCOMPLETE_TOASTS, getTimeString()))
      }
    },
    [nowEntry, uncompleteEntry, showToast],
  )

  const confirmUncomplete = useCallback(() => {
    if (pendingUncompleteId) {
      uncompleteEntry(pendingUncompleteId)
      setPendingUncompleteId(null)
      showToast(pickToast(UNCOMPLETE_TOASTS, getTimeString()))
    }
  }, [pendingUncompleteId, uncompleteEntry, showToast])

  const hasInput = input.trim().length > 0
  const pendingEntry = entries.find((e) => e.id === pendingUncompleteId)

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Toast */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-[calc(var(--spacing-safe-top)+0.75rem)] pointer-events-none text-center">
        <Toast message={toast} />
      </div>

      {/* Timeline */}
      <div className="flex-1 flex flex-col px-5 pt-[calc(var(--spacing-safe-top)+2rem)]">
        <AnimatePresence initial={false}>
        {timeline.map((entry) => {
          const isCompleting = completingId === entry.id
          const isDone = !!entry.completed_at

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="flex items-start gap-3 py-3 border-t border-border first:border-t-0"
            >
              <div className="flex-1 min-w-0">
                <p
                  className={`leading-snug transition-colors duration-300 ${
                    isDone || isCompleting ? 'text-fg-3' : 'text-fg'
                  }`}
                >
                  <StrikethroughText
                    text={entry.text}
                    completing={isCompleting}
                    done={isDone}
                  />
                </p>
                <span className="text-fg-3 text-xs">
                  {formatTime(entry.created_at)}
                  {entry.completed_at && (() => {
                    const doneTime = formatTime(entry.completed_at!)
                    return doneTime === 'Just now'
                      ? <> · Done just now</>
                      : <> · Done at {doneTime}</>
                  })()}
                </span>
              </div>

              <div className="flex items-center gap-3 h-[22px]">
                <FeelingPicker
                  value={entry.feeling}
                  onChange={(emoji) => handleFeelingChange(entry.id, emoji)}
                />
                <Checkbox
                  checked={isDone}
                  completing={isCompleting}
                  onClick={() =>
                    entry.completed_at
                      ? handleUncomplete(entry.id)
                      : handleComplete(entry.id)
                  }
                />
              </div>
            </motion.div>
          )
        })}
        </AnimatePresence>

        {timeline.length === 0 && !nowEntry && (
          <div className="mt-20 px-2 max-w-[280px] mx-auto">
            <p className="text-fg text-xl font-medium mb-4">Welcome. 👋🏽</p>
            <p className="text-fg-2 text-[15px] leading-relaxed mb-3">
              When you feel scattered, name the next tiny step in one line.
            </p>
            <p className="text-fg-2 text-[15px] leading-relaxed mb-3">
              We'll keep it here so you can come back and re‑anchor later if you need.
            </p>
            <p className="text-fg-3 text-[15px] leading-relaxed">
              Start by typing your line below.
            </p>
          </div>
        )}

      </div>

      {/* Bottom bar */}
      <div className="sticky bottom-0 px-4 pb-[calc(var(--spacing-safe-bottom)+0.75rem)] pt-2 bg-bg flex flex-col gap-2">
        {/* Active entry card — outer card dissolves slower, inner content dissolves faster */}
        <AnimatePresence>
          {nowEntry && (
            <motion.div
              key="active-card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-border px-4 pt-3 pb-2"
            >
              <p className="text-fg-3 text-xs font-medium tracking-wide uppercase mb-1.5">
                What am I doing?
              </p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={nowEntry.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-start gap-3"
                >
                  <p className={`flex-1 leading-snug transition-colors duration-300 ${
                    completingId === nowEntry.id ? 'text-fg-3' : 'text-fg'
                  }`}>
                    <StrikethroughText
                      text={nowEntry.text}
                      completing={completingId === nowEntry.id}
                      done={false}
                    />
                  </p>
                  <div className="flex items-center gap-3 h-[22px]">
                    <FeelingPicker
                      value={nowEntry.feeling}
                      onChange={(emoji) => handleFeelingChange(nowEntry.id, emoji)}
                    />
                    <Checkbox
                      checked={false}
                      completing={completingId === nowEntry.id}
                      onClick={() => handleComplete(nowEntry.id)}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input card */}
        <div className="bg-white rounded-2xl shadow-lg border border-border px-4 py-3 flex items-center gap-2">
          <input
            ref={inputRef}
            id="doing-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                doSubmit()
              }
            }}
            placeholder={placeholder}
            autoComplete="off"
            enterKeyHint="go"
            className="flex-1 min-w-0 bg-transparent outline-none text-fg text-base placeholder:text-fg-3"
          />
          <div className="flex items-center gap-3 flex-shrink-0">
            <FeelingPicker
              value={pendingFeeling}
              forceDirection="above"
              onChange={(emoji) => setPendingFeeling(emoji)}
            />
            <Tooltip label="Go do the thing.">
              <button
                type="button"
                onClick={doSubmit}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  hasInput
                    ? 'bg-primary text-white active:scale-95'
                    : 'bg-border/50 text-fg-3/40 pointer-events-none'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      <Dialog
        open={pendingUncompleteId !== null}
        message={<>Replace the current thing you're doing with "<span className="font-medium">{pendingEntry?.text}</span>"?</>}
        confirmLabel="Replace it 👍"
        onConfirm={confirmUncomplete}
        onCancel={() => setPendingUncompleteId(null)}
      />

      {DEV_MENU_ENABLED && <DevMenu />}
    </div>
  )
}
