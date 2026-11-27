import { useCallback, useEffect, useState } from 'react'
import { obtenerDatos } from '../servicios/api.js'

// Pide una lista al backend (por ejemplo /api/productos) y devuelve los datos con el estado de carga o error.
// recargar() vuelve a pedir la lista, por ejemplo después de crear o eliminar un producto.
export default function useDatosApi(ruta) {
  const [estado, setEstado] = useState({ datos: [], cargando: true, error: false })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const controlador = new AbortController()

    async function cargar() {
      try {
        const datos = await obtenerDatos(ruta, { signal: controlador.signal })
        setEstado({ datos, cargando: false, error: false })
      } catch {
        if (!controlador.signal.aborted) {
          setEstado({ datos: [], cargando: false, error: true })
        }
      }
    }

    cargar()
    // Cancela la petición si la vista se desmonta antes de recibir la respuesta.
    return () => controlador.abort()
  }, [ruta, version])

  const recargar = useCallback(() => setVersion(actual => actual + 1), [])

  return { ...estado, recargar }
} // fin useDatosApi
