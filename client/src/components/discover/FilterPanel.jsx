import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, SlidersHorizontal, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button.jsx'
import { SKILL_CATEGORIES, SKILL_LEVELS, DAYS_OF_WEEK } from '@/lib/constants.js'
import { cn } from '@/lib/utils.js'

function CheckItem({ checked, onChange, label }) {
  return (
    <div
      onClick={onChange}
      className="flex items-center gap-3 cursor-pointer py-2 px-1 rounded-lg hover:bg-neutral-800/50 transition-colors select-none"
    >
      <div
        className={cn(
          'h-5 w-5 rounded border-2 flex items-center justify-center transition-all shrink-0',
          checked
            ? 'bg-indigo-600 border-indigo-600 text-white'
            : 'border-neutral-600 bg-neutral-800'
        )}
      >
        {checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
      </div>
      <span className={cn('text-sm font-medium', checked ? 'text-neutral-100' : 'text-neutral-400')}>
        {label}
      </span>
    </div>
  )
}

export function FilterPanel({ isOpen, onClose, onApply, onReset, currentFilters }) {
  const [local, setLocal] = useState(currentFilters || {})

  useEffect(() => {
    setLocal(currentFilters || {})
  }, [currentFilters])

  // Lock body scroll when filter drawer / bottom-sheet is open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow
      const prevTouchAction = document.body.style.touchAction
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
      return () => {
        document.body.style.overflow = prevOverflow
        document.body.style.touchAction = prevTouchAction
      }
    }
  }, [isOpen])

  const toggleArray = (key, value) => {
    setLocal((prev) => {
      const arr = prev[key] || []
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      }
    })
  }

  const activeCount = Object.values(local).filter((v) =>
    Array.isArray(v) ? v.length > 0 : v > 0
  ).length

  const renderContent = () => (
    <div className="flex flex-col h-full min-h-0 select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 shrink-0 bg-neutral-900">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
          <h3 className="text-base font-bold text-neutral-100">Filters</h3>
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="h-8 w-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          aria-label="Close filters"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable Body with smooth touch scrolling and overscroll containment */}
      <div
        className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-6 overscroll-contain"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
      >
        {/* Skill Category */}
        <div>
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
            Skill Category
          </p>
          <div className="space-y-0.5">
            {SKILL_CATEGORIES.map(({ value, label }) => (
              <CheckItem
                key={value}
                checked={(local.categories || []).includes(value)}
                onChange={() => toggleArray('categories', value)}
                label={label}
              />
            ))}
          </div>
        </div>

        {/* Skill Level */}
        <div>
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
            Skill Level
          </p>
          <div className="space-y-0.5">
            {SKILL_LEVELS.map(({ value, label }) => (
              <CheckItem
                key={value}
                checked={(local.levels || []).includes(value)}
                onChange={() => toggleArray('levels', value)}
                label={label}
              />
            ))}
          </div>
        </div>

        {/* Available Days */}
        <div>
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
            Available Days
          </p>
          <div className="grid grid-cols-4 gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleArray('days', day)}
                className={cn(
                  'py-2 rounded-xl text-xs font-bold border transition-all',
                  (local.days || []).includes(day)
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                    : 'border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200 bg-neutral-800/80'
                )}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Min Reputation */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Min Reputation
            </p>
            <span className="text-sm font-bold text-neutral-200 tabular-nums">
              {local.minReputation || 0}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={local.minReputation || 0}
            onChange={(e) => setLocal((p) => ({ ...p, minReputation: Number(e.target.value) }))}
            className="w-full h-2 rounded-full accent-indigo-600 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-neutral-500 mt-1">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-4 border-t border-neutral-800 flex gap-3 shrink-0 bg-neutral-900">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-10 text-xs"
          onClick={() => {
            setLocal({})
            onReset()
          }}
        >
          Reset
        </Button>
        <Button
          size="sm"
          className="flex-1 h-10 text-xs"
          onClick={() => onApply(local)}
        >
          Apply filters
        </Button>
      </div>
    </div>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Mobile Bottom Sheet */}
          <motion.div
            key="mobile-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="sm:hidden absolute bottom-0 inset-x-0 h-[82vh] max-h-[82vh] rounded-t-3xl border-t border-neutral-800 bg-neutral-900 flex flex-col shadow-2xl overscroll-contain"
          >
            {/* Grab handle */}
            <div className="flex justify-center pt-2.5 pb-1 shrink-0 bg-neutral-900 rounded-t-3xl">
              <div className="h-1 w-10 rounded-full bg-neutral-700" />
            </div>
            {renderContent()}
          </motion.div>

          {/* Desktop Right Sidebar */}
          <motion.div
            key="desktop-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="hidden sm:flex absolute right-0 top-0 h-full w-80 border-l border-neutral-800 bg-neutral-900 flex-col shadow-2xl"
          >
            {renderContent()}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
