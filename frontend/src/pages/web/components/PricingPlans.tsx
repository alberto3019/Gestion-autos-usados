import { motion } from 'framer-motion'
import { FaCheck, FaStar } from 'react-icons/fa'

const WHATSAPP_NUMBER = '541126797094'

const plans = [
  {
    name: 'Básico',
    price: 30,
    currency: 'USD',
    period: 'mes',
    description: 'Perfecto para agencias pequeñas que están comenzando',
    features: [
      'Gestión de inventario básica',
      'Búsqueda en red de agencias',
      'Hasta 50 vehículos',
      'Alertas de stock',
      'Contacto por WhatsApp',
      'Soporte por email',
    ],
    popular: false,
  },
  {
    name: 'Premium',
    price: 70,
    currency: 'USD',
    period: 'mes',
    description: 'Ideal para agencias en crecimiento',
    features: [
      'Todo lo del plan Básico',
      'Módulos avanzados (CRM, Finanzas)',
      'Inspecciones vehiculares',
      'Estadísticas y métricas',
      'Gestión de clientes',
      'Flujo de caja completo',
      'Hasta 200 vehículos',
      'Soporte prioritario',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 100,
    currency: 'USD',
    period: 'mes',
    description: 'Para agencias grandes que necesitan todo',
    features: [
      'Todo lo del plan Premium',
      'Todos los módulos disponibles',
      'Facturación AFIP integrada',
      'Seguimiento de financiamientos',
      'Balances y rentabilidad',
      'Métricas avanzadas',
      'Vehículos ilimitados',
      'Soporte dedicado 24/7',
      'Personalización avanzada',
    ],
    popular: false,
  },
]

export default function PricingPlans() {
  const handleWhatsAppClick = (planName: string) => {
    const message = encodeURIComponent(`Hola, estoy interesado en contratar el plan ${planName} de AutoStock360`)
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`
    window.open(url, '_blank')
  }

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

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Planes y <span className="text-primary-600">Precios</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a las necesidades de tu agencia
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`relative rounded-xl p-8 ${
                plan.popular
                  ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-2xl scale-105 z-10'
                  : 'bg-gray-50 text-gray-900 shadow-lg hover:shadow-xl'
              } transition-shadow`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <FaStar className="w-3 h-3" />
                    Recomendado
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className={`text-sm mb-4 ${plan.popular ? 'text-primary-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    ${plan.price}
                  </span>
                  <span className={`text-lg ${plan.popular ? 'text-primary-100' : 'text-gray-600'}`}>
                    /{plan.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <FaCheck
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        plan.popular ? 'text-yellow-400' : 'text-primary-600'
                      }`}
                    />
                    <span className={plan.popular ? 'text-white' : 'text-gray-700'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleWhatsAppClick(plan.name)}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                  plan.popular
                    ? 'bg-white text-primary-600 hover:bg-primary-50'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                } shadow-lg`}
              >
                Contratar Ahora
              </button>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center text-gray-600 mt-12"
        >
          Todos los planes incluyen actualizaciones gratuitas y sin permanencia mínima.
          <br />
          ¿Necesitas un plan personalizado?{' '}
          <button
            onClick={() => handleWhatsAppClick('personalizado')}
            className="text-primary-600 hover:text-primary-700 font-semibold underline"
          >
            Contáctanos
          </button>
        </motion.p>
      </div>
    </section>
  )
}

