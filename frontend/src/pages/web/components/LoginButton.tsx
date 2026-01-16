interface LoginButtonProps {
  className?: string
}

export default function LoginButton({ className = '' }: LoginButtonProps) {
  const handleLogin = () => {
    window.location.href = 'https://autostock360.com'
  }

  return (
    <button
      onClick={handleLogin}
      className={`px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${className}`}
    >
      Iniciar Sesión
    </button>
  )
}

