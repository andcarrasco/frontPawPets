import { useEffect, useState } from 'react'
import { obtenerDatos } from '../servicios/api.js'

// Pide una lista al backend (por ejemplo /api/productos).
// Mientras el backend no responda, se usan los datos de respaldo (JSON locales),
// así la tienda sigue funcionando durante la migración a la API.
export default function useDatosApi(ruta, respaldo) {
  const [estado, setEstado] = useState({ datos: respaldo, desdeApi: false, error: false })

  useEffect(() => {
    const controlador = new AbortController()

    async function cargar() {
      try {
        const datos = await obtenerDatos(ruta, { signal: controlador.signal })
        if (!Array.isArray(datos)) throw new Error('Respuesta inesperada')
        setEstado({ datos, desdeApi: true, error: false })
      } catch {
        // Si el backend no está disponible se mantienen los datos de respaldo.
        if (!controlador.signal.aborted) {
          setEstado(actual => ({ ...actual, error: true }))
        }
      }
    }

    cargar()
    // Cancela la petición si la vista se desmonta antes de recibir la respuesta.
    return () => controlador.abort()
  }, [ruta])

  return estado
} // fin useDatosApi
