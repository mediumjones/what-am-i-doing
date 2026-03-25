export const PLACEHOLDERS = [
  'Do the thing (just one).',
  'What am I doing?',
  'Name the next tiny thing…',
  'One line, one move.',
  "What's the very next step?",
  'What are your hands about to do?',
  "Where's your attention pointing?",
  'Type it, then go touch it.',
  'What are you really working on?',
  'What gets your next two minutes?',
  'Give this moment a headline.',
  'Give your attention a job.',
]

export interface Feeling {
  emoji: string
  label: string
}

export const FEELINGS: Feeling[] = [
  { emoji: '😌', label: 'Calm' },
  { emoji: '⚡', label: 'Energized' },
  { emoji: '😊', label: 'Good' },
  { emoji: '🎯', label: 'Focused' },
  { emoji: '😶‍🌫️', label: 'Foggy' },
  { emoji: '🌀', label: 'Scattered' },
  { emoji: '🔁', label: 'Stuck' },
  { emoji: '😔', label: 'Down' },
  { emoji: '😰', label: 'Anxious' },
  { emoji: '😩', label: 'Overwhelmed' },
]
