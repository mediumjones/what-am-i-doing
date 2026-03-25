import { motion } from 'framer-motion'
import Tooltip from './Tooltip'

interface CheckboxProps {
  checked: boolean
  completing: boolean
  onClick: () => void
}

export default function Checkbox({
  checked,
  completing,
  onClick,
}: CheckboxProps) {
  const showCheck = checked || completing

  return (
    <Tooltip label={showCheck ? "It's done." : 'Done the thing?'}>
      <motion.button
        type="button"
        onClick={onClick}
        animate={completing ? { scale: [1, 1.4, 1] } : {}}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={`w-5 h-5 rounded-full flex-shrink-0 border-2 flex items-center justify-center transition-colors duration-200 ${
          showCheck
            ? 'border-emerald-500 bg-emerald-500'
            : 'border-fg-3 hover:border-fg bg-transparent'
        }`}
      >
        {showCheck && (
          <motion.svg
            viewBox="0 0 12 12"
            className="w-3 h-3"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path
              d="M2.5 6.5L5 9L9.5 3.5"
              initial={completing ? { pathLength: 0 } : { pathLength: 1 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.2, delay: completing ? 0.05 : 0 }}
            />
          </motion.svg>
        )}
      </motion.button>
    </Tooltip>
  )
}
