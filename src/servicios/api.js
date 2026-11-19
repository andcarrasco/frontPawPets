// Conexión con el backend Spring Boot (repositorio backPawPets).
// En desarrollo VITE_API_URL queda vacía: las rutas /api las reenvía el proxy de vite.config.js.
// En Railway, VITE_API_URL tiene la URL pública del backend.
const API_URL = import.meta.env?.VITE_API_URL || ''

export async function obtenerDatos(ruta, opciones = {}) {
  const respuesta = await fetch(`${API_URL}${ruta}`, opciones)
  if (!respuesta.ok) {
    throw new Error(`HTTP ${respuesta.status}`)
  }
  return respuesta.json()
} // fin obtenerDatos
