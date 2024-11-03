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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ 
              type: "spring",
              duration: 0.5,
              bounce: 0.3 
            }}
            className="fixed left-0 top-0 z-[100] w-[calc(100%-2rem)] md:w-full max-w-3xl m-4"
          >
            <div className="relative rounded-xl bg-zinc-900/95 border border-white/10 shadow-2xl backdrop-blur-sm">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-2 opacity-70 transition-all hover:opacity-100 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
              <div className="max-h-[80vh] overflow-y-auto">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 