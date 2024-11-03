import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface AnimatedModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function AnimatedModal({ isOpen, onClose, children }: AnimatedModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed left-8 top-8 z-50 w-full max-w-2xl max-h-[calc(100vh-4rem)] overflow-y-auto"
          >
            <div className="relative rounded-lg bg-zinc-900 border border-white/10 shadow-2xl">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 z-10"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 