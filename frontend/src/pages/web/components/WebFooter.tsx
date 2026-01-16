import { FaWhatsapp, FaEnvelope } from 'react-icons/fa'

const WHATSAPP_NUMBER = '541126797094'

export default function WebFooter() {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Hola, necesito más información sobre AutoStock360')
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`
    window.open(url, '_blank')
  }

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">
              AutoStock<span className="text-primary-400">360</span>
            </h3>
            <p className="text-gray-400">
              La plataforma más completa para gestionar tu agencia de autos. 
              Conecta con una red de agencias y optimiza tu negocio.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="hover:text-primary-400 transition-colors">
                  Características
                </a>
              </li>
              <li>
                <a href="#benefits" className="hover:text-primary-400 transition-colors">
                  Beneficios
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-primary-400 transition-colors">
                  Planes y Precios
                </a>
              </li>
              <li>
                <a href="https://autostock360.com" className="hover:text-primary-400 transition-colors">
                  Iniciar Sesión
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={handleWhatsAppClick}
                  className="flex items-center gap-2 hover:text-primary-400 transition-colors"
                >
                  <FaWhatsapp className="w-5 h-5" />
                  <span>WhatsApp</span>
                </button>
              </li>
              <li>
                <a
                  href="mailto:info@autostock360.com"
                  className="flex items-center gap-2 hover:text-primary-400 transition-colors"
                >
                  <FaEnvelope className="w-5 h-5" />
                  <span>Email</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400">
            © {currentYear} AutoStock360. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

