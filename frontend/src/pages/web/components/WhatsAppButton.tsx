import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaWhatsapp } from 'react-icons/fa'

const WHATSAPP_NUMBER = '541126797094'
const WHATSAPP_MESSAGE = 'Hola, estoy interesado en contratar AutoStock360'

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false)

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(WHATSAPP_MESSAGE)
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`
    window.open(url, '_blank')
    setIsOpen(false)
  }

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#20BA5A] transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: [
            '0 10px 25px rgba(37, 211, 102, 0.4)',
            '0 10px 35px rgba(37, 211, 102, 0.6)',
            '0 10px 25px rgba(37, 211, 102, 0.4)',
          ],
        }}
        transition={{
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        aria-label="Contactar por WhatsApp"
      >
        <FaWhatsapp className="w-6 h-6" />
      </motion.button>

      {/* Popup */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Popup Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="fixed bottom-24 right-6 z-50 bg-white rounded-lg shadow-xl p-6 max-w-xs"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#25D366] p-2 rounded-full">
                  <FaWhatsapp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Contáctanos</h3>
                  <p className="text-sm text-gray-600">Por WhatsApp</p>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-4">
                Hola, estoy interesado en contratar AutoStock360
              </p>

              <div className="flex gap-2">
                <button
                  onClick={handleWhatsAppClick}
                  className="flex-1 bg-[#25D366] text-white py-2 px-4 rounded-lg hover:bg-[#20BA5A] transition-colors font-medium"
                >
                  Abrir WhatsApp
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

