/* global spyOn */
// Reemplaza fetch por respuestas preparadas para probar sin levantar el backend.
// Las rutas que no estén en la lista responden 404.

// Respuesta con un código de estado distinto de 200.
export function responder(estado, datos = null) {
  return { simulada: true, estado, datos }
} // fin responder

// Error con el mismo formato que el GlobalExceptionHandler del backend.
export function errorApi(estado, mensaje) {
  return responder(estado, { estado, mensaje })
} // fin errorApi

// Compara 'GET /api/pedidos/:id' con GET /api/pedidos/15 y devuelve { id: '15' }, o null si no coincide.
function coincidir(clave, metodo, camino) {
  const [metodoClave, rutaClave] = clave.split(' ')
  if (metodoClave !== metodo || !rutaClave.includes(':')) return null
  const partesClave = rutaClave.split('/')
  const partes = camino.split('/')
  if (partesClave.length !== partes.length) return null
  const parametros = {}
  for (let i = 0; i < partes.length; i++) {
    if (partesClave[i].startsWith(':')) parametros[partesClave[i].slice(1)] = partes[i]
    else if (partesClave[i] !== partes[i]) return null
  }
  return parametros
} // fin coincidir

export function simularApi(rutas = {}) {
  const llamadas = []

  const espia = spyOn(window, 'fetch').and.callFake(async (url, opciones = {}) => {
    const metodo = (opciones.method || 'GET').toUpperCase()
    const direccion = new URL(String(url), 'http://localhost')
    const ruta = direccion.pathname + direccion.search
    const cuerpo = opciones.body ? JSON.parse(opciones.body) : undefined
    llamadas.push({ metodo, ruta, cuerpo })

    // Primero busca la ruta exacta (con ?parametros), luego sin parámetros
    // y por último las rutas con comodín, por ejemplo 'GET /api/pedidos/:id'.
    let parametros = {}
    let respuesta = rutas[`${metodo} ${ruta}`]
    if (respuesta === undefined) respuesta = rutas[`${metodo} ${direccion.pathname}`]
    if (respuesta === undefined) {
      for (const clave of Object.keys(rutas)) {
        const encontrados = coincidir(clave, metodo, direccion.pathname)
        if (encontrados) {
          respuesta = rutas[clave]
          parametros = encontrados
          break
        }
      }
    }
    if (typeof respuesta === 'function') respuesta = respuesta({ metodo, ruta, cuerpo, parametros })
    if (respuesta === undefined) respuesta = errorApi(404, `Ruta no simulada: ${metodo} ${ruta}`)

    const { estado, datos } = respuesta?.simulada ? respuesta : { estado: 200, datos: respuesta }
    if (estado === 204) return new Response(null, { status: 204 })
    return new Response(JSON.stringify(datos), {
      status: estado,
      headers: { 'Content-Type': 'application/json' }
    })
  })

  return { espia, llamadas }
} // fin simularApi
