import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEntries } from '../store/entries'
import FeelingPicker from '../components/FeelingPicker'
import Checkbox from '../components/Checkbox'
import StrikethroughText from '../components/StrikethroughText'
import Toast, { type ToastItem } from '../components/Toast'
import Dialog from '../components/Dialog'
import { CREATE_TOASTS, COMPLETE_TOASTS, UNCOMPLETE_TOASTS, FEELING_TOASTS, pickToast } from '../constants/toasts'
import { PLACEHOLDERS } from '../constants/feelings'
import Tooltip from '../components/Tooltip'
import DevMenu, { DEV_MENU_ENABLED } from '../dev/DevMenu'
import { useVisualViewport } from '../hooks/useVisualViewport'

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
  const viewportHeight = useVisualViewport()
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [pendingFeeling, setPendingFeeling] = useState<string | null>(null)
  const [placeholder, setPlaceholder] = useState(() => PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)])
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [completingWasActive, setCompletingWasActive] = useState(false)
  const [justDroppedId, setJustDroppedId] = useState<string | null>(null)
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const toastIdRef = useRef(0)
  const [pendingUncompleteId, setPendingUncompleteId] = useState<string | null>(null)

  const { entries, addEntry, completeEntry, uncompleteEntry, setFeeling, promoteLatestIncomplete } = useEntries()

  // On mount: if no active entry but there are incomplete ones, promote the newest
  useEffect(() => { promoteLatestIncomplete() }, [])

  // Keep the completing entry as "now" until the card animation finishes
  const nowEntry = entries.find((e) => e.is_now) ?? (completingWasActive ? entries.find((e) => e.id === completingId) : undefined)
  // Show all non-active, non-completing entries in timeline
  // Newest first (natural array order) — no .reverse()
  const timeline = entries.filter((e) => !e.is_now && e.id !== completingId)

  const showToast = useCallback((msg: string) => {
    const id = ++toastIdRef.current
    setToasts((prev) => [...prev, { id, message: msg }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3750)
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
  }, [input, pendingFeeling, addEntry, showToast])

  const handleComplete = useCallback(
    (id: string) => {
      if (completingId) return
      const wasActive = entries.some((e) => e.id === id && e.is_now)
      setCompletingId(id)
      setCompletingWasActive(wasActive)
      haptic()
      showToast(pickToast(COMPLETE_TOASTS, getTimeString()))
      setTimeout(() => {
        completeEntry(id)
      }, 600)
      setTimeout(() => {
        setCompletingId(null)
        setCompletingWasActive(false)
        setJustDroppedId(id)
        setTimeout(() => setJustDroppedId(null), 600)
        promoteLatestIncomplete()
      }, 900)
    },
    [completingId, entries, completeEntry, promoteLatestIncomplete, showToast],
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
    <>
    {DEV_MENU_ENABLED && <DevMenu />}

    <div className="fixed inset-x-0 top-0 flex flex-col overflow-hidden" style={{ height: viewportHeight }}>

      {/* Scroll area — active card + timeline */}
      <div className="flex-1 overflow-y-auto px-5 pt-[calc(var(--spacing-safe-top)+0.75rem)]">

        {/* Active entry — sticky at top */}
        <AnimatePresence>
          {nowEntry && (
            <motion.div
              key="active-card"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="sticky top-0 z-10 -mx-5 px-5 pb-1 border-b border-border bg-border/20"
            >
              <p className="text-fg-3 text-[10px] font-medium tracking-widest uppercase pt-3 mb-1">
                What am I doing?
              </p>
              <motion.div
                key={nowEntry.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-3 pb-3"
              >
                <div className="flex-1 min-w-0">
                  <p className={`text-[17px] font-medium leading-snug transition-colors duration-300 ${
                    completingId === nowEntry.id ? 'text-fg-3' : 'text-fg'
                  }`}>
                    <StrikethroughText
                      text={nowEntry.text}
                      completing={completingId === nowEntry.id}
                      done={false}
                    />
                  </p>
                  <span className="text-fg-3 text-xs">Just now</span>
                </div>
                <div className="flex items-center gap-3 h-[22px]">
                  <FeelingPicker
                    value={nowEntry.feeling}
                    forceDirection="below"
                    onChange={(emoji) => handleFeelingChange(nowEntry.id, emoji)}
                  />
                  <Checkbox
                    checked={false}
                    completing={completingId === nowEntry.id}
                    onClick={() => handleComplete(nowEntry.id)}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timeline — newest first */}
        <AnimatePresence initial={false}>
        {timeline.map((entry) => {
          const isCompleting = completingId === entry.id
          const isDone = !!entry.completed_at

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: entry.id === justDroppedId ? -10 : 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: entry.id === justDroppedId ? 0.25 : 0.1 }}
              className="flex items-start gap-3 py-3 border-b border-border last:border-b-0"
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
          <div className="mt-16 px-2 max-w-[280px] mx-auto">
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

      {/* Bottom bar — input with toasts floating above */}
      <div className="flex-shrink-0 relative px-4 pb-[calc(var(--spacing-safe-bottom)+0.75rem)] pt-2 bg-bg">
        {/* Toasts — float above the bottom bar, stack upward */}
        <div className="absolute bottom-full left-0 right-0 px-4 pb-2 flex flex-col-reverse items-center pointer-events-none">
          <Toast toasts={toasts} />
        </div>

        {/* Input card */}
        <div className="bg-white rounded-2xl shadow-lg border border-border px-4 py-3 flex items-center gap-2">
          <input
            ref={inputRef}
            id="doing-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => {
              // Prevent iOS from scrolling the page to reveal the input
              setTimeout(() => { window.scrollTo(0, 0); document.documentElement.scrollTop = 0 }, 50)
              setTimeout(() => { window.scrollTo(0, 0); document.documentElement.scrollTop = 0 }, 150)
            }}
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
    </div>
    </>
  )
}
