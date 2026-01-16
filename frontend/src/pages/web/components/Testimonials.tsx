import { motion } from 'framer-motion'
import { FaStar } from 'react-icons/fa'

const testimonials = [
  {
    name: 'Carlos Mendoza',
    company: 'AutoMendoza S.A.',
    rating: 5,
    comment: 'AutoStock360 transformó completamente nuestra gestión. La red de agencias nos ha permitido cerrar muchas más operaciones. Increíble plataforma.',
  },
  {
    name: 'María González',
    company: 'Concesionaria González',
    rating: 5,
    comment: 'El módulo de CRM y gestión de clientes es excelente. Las alertas automáticas nos ayudan a no perder oportunidades. Altamente recomendado.',
  },
  {
    name: 'Roberto Silva',
    company: 'Silva Motors',
    rating: 5,
    comment: 'La integración con AFIP simplifica mucho nuestro trabajo. Ya no tenemos que estar pendientes de la facturación manual. Ahorra muchísimo tiempo.',
  },
  {
    name: 'Ana Martínez',
    company: 'Martínez Autos Premium',
    rating: 5,
    comment: 'Las estadísticas en tiempo real nos permiten tomar decisiones más informadas. El dashboard es muy completo y fácil de usar. Excelente inversión.',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export default function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Lo que dicen nuestros <span className="text-primary-600">clientes</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Miles de agencias confían en AutoStock360 para gestionar su negocio
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FaStar key={i} className="w-5 h-5 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic text-lg">
                "{testimonial.comment}"
              </p>
              <div>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-600">{testimonial.company}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

