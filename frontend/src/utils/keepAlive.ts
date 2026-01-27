/**
 * Keep-alive utility para mantener el servidor activo
 * Hace ping al endpoint de health check cada 4 minutos
 * (menos que el timeout de Render que es ~5 minutos)
 */

const KEEP_ALIVE_INTERVAL = 4 * 60 * 1000; // 4 minutos en milisegundos
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

let keepAliveInterval: number | null = null;

/**
 * Inicia el keep-alive para mantener el servidor activo
 * @returns Función de limpieza para detener el keep-alive
 */
export function startKeepAlive(): () => void {
  // Si ya hay un intervalo corriendo, no crear otro
  if (keepAliveInterval !== null) {
    return () => clearKeepAlive();
  }

  // Hacer el primer ping inmediatamente
  pingServer();

  // Configurar el intervalo para pings periódicos
  keepAliveInterval = window.setInterval(() => {
    pingServer();
  }, KEEP_ALIVE_INTERVAL);

  console.log('🔄 Keep-alive iniciado - manteniendo servidor activo cada 4 minutos');

  return clearKeepAlive;
}

/**
 * Detiene el keep-alive
 */
export function clearKeepAlive(): void {
  if (keepAliveInterval !== null) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    console.log('⏹️ Keep-alive detenido');
  }
}

/**
 * Hace ping al endpoint de health check
 */
async function pingServer(): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Keep-alive ping exitoso:', data.timestamp);
    } else {
      console.warn('⚠️ Keep-alive ping falló con status:', response.status);
    }
  } catch (error) {
    // No mostrar error en consola para no spamear, solo en desarrollo
    if (import.meta.env.DEV) {
      console.warn('⚠️ Keep-alive ping falló:', error);
    }
  }
}

