// Conexión con el backend Spring Boot (repositorio backPawPets).
// En desarrollo VITE_API_URL queda vacía: las rutas /api las reenvía el proxy de vite.config.js.
// En Railway, VITE_API_URL tiene la URL pública del backend.
const API_URL = import.meta.env?.VITE_API_URL || ''

// Hace la petición y devuelve el JSON. Si la API responde con error, lanza un Error
// con el "mensaje" que envía el GlobalExceptionHandler del backend.
async function pedir(ruta, opciones = {}) {
  let respuesta
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, opciones)
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('No se pudo conectar con el servidor. Intenta nuevamente.', { cause: error })
  }

  // 204 No Content (por ejemplo, después de un DELETE) no trae cuerpo.
  if (respuesta.status === 204) return null

  const texto = await respuesta.text()
  let datos
  try {
    datos = texto ? JSON.parse(texto) : null
  } catch (error) {
    throw new Error('El servidor respondió algo inesperado.', { cause: error })
  }

  if (!respuesta.ok) {
    const error = new Error(datos?.mensaje || `Error ${respuesta.status} del servidor.`)
    error.estado = respuesta.status
    throw error
  }
  return datos
} // fin pedir

// GET: obtenerDatos('/api/productos')
export function obtenerDatos(ruta, opciones = {}) {
  return pedir(ruta, opciones)
} // fin obtenerDatos

// POST, PUT o DELETE con cuerpo JSON: enviarDatos('/api/productos', 'POST', producto)
export function enviarDatos(ruta, metodo, cuerpo) {
  const opciones = { method: metodo, headers: {} }
  if (cuerpo !== undefined) {
    opciones.headers['Content-Type'] = 'application/json'
    opciones.body = JSON.stringify(cuerpo)
  }
  return pedir(ruta, opciones)
} // fin enviarDatos
