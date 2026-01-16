import { useEffect } from 'react'
import WebHeader from './components/WebHeader'
import Hero from './components/Hero'
import Features from './components/Features'
import Benefits from './components/Benefits'
import PricingPlans from './components/PricingPlans'
import Testimonials from './components/Testimonials'
import CTASection from './components/CTASection'
import ContactForm from './components/ContactForm'
import WebFooter from './components/WebFooter'
import WhatsAppButton from './components/WhatsAppButton'

export default function WebLandingPage() {
  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0)

    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth'

    // Cleanup
    return () => {
      document.documentElement.style.scrollBehavior = 'auto'
    }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <WebHeader />
      
      <main>
        <Hero />
        <Features />
        <Benefits />
        <PricingPlans />
        <Testimonials />
        <CTASection />
        <ContactForm />
      </main>

      <WebFooter />
      <WhatsAppButton />
    </div>
  )
}

