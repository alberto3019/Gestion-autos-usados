import { motion } from 'framer-motion'
import { FaArrowUp, FaNetworkWired, FaRobot, FaClock, FaUserShield } from 'react-icons/fa'

const benefits = [
  {
    icon: FaArrowUp,
    title: 'Aumenta la Rotación de Stock',
    description: 'Conecta con la red más grande de agencias y encuentra compradores más rápido. Reduce días en stock y aumenta tu rentabilidad.',
  },
  {
    icon: FaNetworkWired,
    title: 'Red Colaborativa Entre Agencias',
    description: 'Comparte inventario y accede al de otras agencias. Trabaja en conjunto para cerrar más operaciones y generar más ingresos.',
  },
  {
    icon: FaRobot,
    title: 'Automatización de Procesos',
    description: 'Reduce tareas manuales con procesos automatizados. Notificaciones inteligentes, alertas automáticas y reportes programados.',
  },
  {
    icon: FaClock,
    title: 'Reportes en Tiempo Real',
    description: 'Accede a información actualizada al instante. Dashboards interactivos con datos en tiempo real para decisiones informadas.',
  },
  {
    icon: FaUserShield,
    title: 'Multi-usuario con Permisos',
    description: 'Control de acceso granular por módulo y función. Asigna permisos específicos a cada usuario según su rol y responsabilidades.',
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

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
    },
  },
}

export default function Benefits() {
  return (
    <section id="benefits" className="py-20 bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Beneficios que <span className="text-primary-600">Transforman</span> tu Negocio
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubre cómo AutoStock360 puede revolucionar la gestión de tu agencia
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            const isEven = index % 2 === 0

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow`}
              >
                <div className="flex-shrink-0">
                  <div className="bg-primary-600 w-20 h-20 rounded-full flex items-center justify-center">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-lg text-gray-600">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

