import { motion } from 'framer-motion'

const WHATSAPP_NUMBER = '541126797094'

export default function CTASection() {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Hola, estoy interesado en contratar AutoStock360')
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`
    window.open(url, '_blank')
  }

  const handleLogin = () => {
    window.location.href = 'https://autostock360.com'
  }

  return (
    <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            ¿Listo para Transformar tu Agencia?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Únete a cientos de agencias que ya están usando AutoStock360 para optimizar su negocio.
            Contrata ahora y comienza a ver resultados desde el primer día.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              onClick={handleWhatsAppClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-colors shadow-lg hover:shadow-xl"
            >
              Contratar Ahora
            </motion.button>
            <motion.button
              onClick={handleLogin}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors"
            >
              Ya tengo cuenta - Iniciar Sesión
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

