import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaEnvelope, FaPhone } from 'react-icons/fa'

const WHATSAPP_NUMBER = '541126797094'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Enviar a WhatsApp con el template
    const message = encodeURIComponent(
      `Hola, soy ${formData.name} (${formData.email}).\n\n${formData.message}\n\nMe gustaría contratar AutoStock360.`
    )
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`
    window.open(url, '_blank')

    // Reset form
    setFormData({ name: '', email: '', message: '' })
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Hola, necesito más información sobre AutoStock360')
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`
    window.open(url, '_blank')
  }

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Contáctanos
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            ¿Tienes preguntas? Estamos aquí para ayudarte. Escríbenos y te responderemos a la brevedad.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Información de Contacto
              </h3>
              <p className="text-gray-600 mb-8">
                Puedes contactarnos por WhatsApp o completar el formulario y te responderemos lo antes posible.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleWhatsAppClick}
                className="flex items-center gap-4 p-4 bg-[#25D366] text-white rounded-lg hover:bg-[#20BA5A] transition-colors shadow-lg hover:shadow-xl w-full"
              >
                <FaPhone className="w-6 h-6 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-semibold">WhatsApp</p>
                  <p className="text-sm opacity-90">+54 11 2679-7094</p>
                </div>
              </button>

              <a
                href="mailto:info@autostock360.com"
                className="flex items-center gap-4 p-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
              >
                <FaEnvelope className="w-6 h-6 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-semibold">Email</p>
                  <p className="text-sm opacity-90">info@autostock360.com</p>
                </div>
              </a>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Cuéntanos cómo podemos ayudarte..."
              />
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold text-lg hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Enviar Mensaje por WhatsApp
            </motion.button>
          </motion.form>
        </div>
      </div>
    </section>
  )
}

