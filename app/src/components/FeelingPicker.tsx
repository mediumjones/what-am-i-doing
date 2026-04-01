import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FEELINGS } from '../constants/feelings'
import { EMOJI_PALETTE, EMOJI_KEYWORDS } from '../constants/emojiPalette'
import { useCustomFeelings } from '../store/customFeelings'
import Tooltip from './Tooltip'

interface FeelingPickerProps {
  value: string | null
  onChange: (emoji: string | null) => void
  forceDirection?: 'above' | 'below'
}

export default function FeelingPicker({ value, onChange, forceDirection }: FeelingPickerProps) {
  const [open, setOpen] = useState(false)
  const [above, setAbove] = useState(true)
  const [customMode, setCustomMode] = useState(false)
  const [customEmoji, setCustomEmoji] = useState<string | null>(null)
  const [customLabel, setCustomLabel] = useState('')
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const labelInputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const { feelings: customFeelings, addFeeling, removeFeeling } = useCustomFeelings()

  const resetCustom = useCallback(() => {
    setCustomMode(false)
    setCustomEmoji(null)
    setCustomLabel('')
    setSearch('')
  }, [])

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
        resetCustom()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, resetCustom])

  const handleOpen = () => {
    measurePosition()
    setOpen(!open)
    if (open) resetCustom()
  }

  const handleSelect = (emoji: string) => {
    onChange(emoji === value ? null : emoji)
    setOpen(false)
    resetCustom()
  }

  const handleSaveCustom = () => {
    if (!customEmoji || !customLabel.trim()) return
    addFeeling({ emoji: customEmoji, label: customLabel.trim() })
    onChange(customEmoji)
    setOpen(false)
    resetCustom()
  }

  const handleEnterCustom = useCallback(() => {
    setCustomMode(true)
    setTimeout(() => searchInputRef.current?.focus(), 80)
  }, [])

  const filteredEmoji = useMemo(() => {
    if (!search.trim()) return EMOJI_PALETTE
    const q = search.toLowerCase().trim()
    return EMOJI_PALETTE.filter((e) => {
      if (e.includes(q)) return true
      const keywords = EMOJI_KEYWORDS[e]
      return keywords?.some((k) => k.includes(q))
    })
  }, [search])

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
            style={{ width: customMode ? '16.5rem' : '10.5rem' }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {customMode ? (
                <motion.div
                  key="custom"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="px-3 py-1.5"
                >
                  {/* Back button */}
                  <button
                    type="button"
                    onClick={resetCustom}
                    className="flex items-center gap-1 text-fg-3 hover:text-fg active:text-fg text-sm mb-2.5 -ml-0.5 py-1 pr-2 rounded-md"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 4L6 8l4 4" />
                    </svg>
                    Back
                  </button>

                  {/* Search input */}
                  <div className="relative mb-2">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search…"
                      autoComplete="off"
                      className="w-full text-sm bg-bg/80 rounded-lg outline-none text-fg placeholder:text-fg-3/50 px-2.5 py-1.5 border border-border/50 focus:border-border"
                    />
                  </div>

                  {/* 4-row emoji grid, scrolls horizontally */}
                  <div
                    className="overflow-x-auto overflow-y-hidden pb-1 mb-2 -mx-1 px-1"
                    style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
                  >
                    {filteredEmoji.length > 0 ? (
                      <div
                        className="grid grid-flow-col gap-0.5"
                        style={{ gridTemplateRows: 'repeat(4, 1fr)', width: 'max-content' }}
                      >
                        {filteredEmoji.map((e) => (
                          <button
                            key={e}
                            type="button"
                            onClick={() => {
                              setCustomEmoji(e)
                              setSearch('')
                              setTimeout(() => labelInputRef.current?.focus(), 50)
                            }}
                            className={`w-9 h-9 flex items-center justify-center rounded-lg text-xl flex-shrink-0 transition-colors ${
                              customEmoji === e
                                ? 'bg-border/60 scale-110'
                                : 'hover:bg-border/30 active:bg-border/50'
                            }`}
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-fg-3/60 py-2 px-1">No matches</p>
                    )}
                  </div>

                  {/* Selected emoji + label input */}
                  <div className="flex items-center gap-2 bg-bg/60 rounded-lg px-2.5 py-2 border border-border/40">
                    <span className={`text-xl leading-none flex-shrink-0 transition-opacity ${customEmoji ? 'opacity-100' : 'opacity-30'}`}>
                      {customEmoji ?? '🫥'}
                    </span>
                    <input
                      ref={labelInputRef}
                      type="text"
                      value={customLabel}
                      onChange={(e) => setCustomLabel(e.target.value.slice(0, 20))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleSaveCustom()
                        }
                      }}
                      placeholder="Name it…"
                      maxLength={20}
                      className="flex-1 min-w-0 text-sm bg-transparent outline-none text-fg placeholder:text-fg-3/40"
                    />
                  </div>

                  {/* Save button */}
                  <button
                    type="button"
                    onClick={handleSaveCustom}
                    disabled={!customEmoji || !customLabel.trim()}
                    className={`w-full mt-2.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      customEmoji && customLabel.trim()
                        ? 'bg-primary text-white active:scale-[0.98]'
                        : 'bg-border/30 text-fg-3/40 pointer-events-none'
                    }`}
                  >
                    That feels right
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                >
                  {/* ── Normal feeling list ── */}
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

                  {/* Something else */}
                  <button
                    type="button"
                    onClick={handleEnterCustom}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left transition-colors duration-75 hover:bg-bg active:bg-border/30"
                  >
                    <span className="text-lg leading-none">💭</span>
                    <span className="text-sm text-fg-3">Something else…</span>
                  </button>

                  {/* Saved custom feelings */}
                  {customFeelings.length > 0 && <div className="h-px bg-border mx-2 my-1" />}
                  {customFeelings.map((f) => (
                    <div
                      key={f.emoji}
                      className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-left transition-colors duration-75 hover:bg-bg active:bg-border/30 ${
                        value === f.emoji ? 'bg-border/30' : ''
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelect(f.emoji)}
                        className="flex items-center gap-2.5 flex-1 min-w-0"
                      >
                        <span className="text-lg leading-none">{f.emoji}</span>
                        <span className="text-sm text-fg-2 truncate">{f.label}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFeeling(f.emoji)}
                        className="text-fg-3/40 hover:text-fg-3 text-xs leading-none ml-auto flex-shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {value && (
                    <>
                      <div className="h-px bg-border mx-2 my-1" />
                      <button
                        type="button"
                        onClick={() => { onChange(null); setOpen(false); resetCustom() }}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left transition-colors duration-75 hover:bg-bg active:bg-border/30"
                      >
                        <span className="text-lg leading-none opacity-40">✕</span>
                        <span className="text-sm text-fg-3">Clear feeling</span>
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
