import { motion } from 'framer-motion'
import {
  FaWarehouse,
  FaSearch,
  FaClipboardCheck,
  FaUsers,
  FaChartLine,
  FaFileInvoice,
  FaChartBar,
  FaHandHoldingUsd,
} from 'react-icons/fa'

const features = [
  {
    icon: FaWarehouse,
    title: 'Gestión de Inventario',
    description: 'Stock inteligente con alertas automáticas por días en stock. Control total de tu flota con estados personalizables.',
  },
  {
    icon: FaSearch,
    title: 'Búsqueda en Red de Agencias',
    description: 'Accede al inventario de todas las agencias de la red. Búsqueda avanzada con filtros múltiples y favoritos.',
  },
  {
    icon: FaClipboardCheck,
    title: 'Inspecciones Vehiculares',
    description: 'Sistema completo de inspección técnica con reportes PDF. Registro detallado del estado de cada vehículo.',
  },
  {
    icon: FaUsers,
    title: 'Gestión de Clientes y CRM',
    description: 'Base de datos completa de clientes con historial de ventas. Alertas automáticas para oportunidades de negocio.',
  },
  {
    icon: FaChartLine,
    title: 'Flujo de Caja y Finanzas',
    description: 'Control completo de ingresos y egresos. Categorización automática y reportes financieros en tiempo real.',
  },
  {
    icon: FaFileInvoice,
    title: 'Facturación AFIP',
    description: 'Integración directa con AFIP para facturación electrónica. Emisión de facturas A, B y C de forma sencilla.',
  },
  {
    icon: FaChartBar,
    title: 'Estadísticas y Métricas',
    description: 'Dashboard completo con métricas clave de tu negocio. Gráficos y reportes personalizables para toma de decisiones.',
  },
  {
    icon: FaHandHoldingUsd,
    title: 'Seguimiento de Financiamientos',
    description: 'Gestión de solicitudes de financiamiento. Seguimiento de estado y aprobaciones con notificaciones automáticas.',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Características <span className="text-primary-600">Potentes</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Todas las herramientas que necesitas para gestionar tu agencia de forma profesional
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="bg-primary-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

