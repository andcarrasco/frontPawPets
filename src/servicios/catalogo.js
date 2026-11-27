import { enviarDatos } from './api.js'

// Operaciones de escritura del catálogo (las lecturas las hace useDatosApi en App.jsx).
// Cada función devuelve lo que responde la API o lanza un Error con su mensaje.

export function crearProducto(producto) {
  return enviarDatos('/api/productos', 'POST', producto)
} // fin crearProducto

export function actualizarProducto(id, producto) {
  return enviarDatos(`/api/productos/${id}`, 'PUT', producto)
} // fin actualizarProducto

export function eliminarProducto(id) {
  return enviarDatos(`/api/productos/${id}`, 'DELETE')
} // fin eliminarProducto

export function crearCategoria(categoria) {
  return enviarDatos('/api/categorias', 'POST', categoria)
} // fin crearCategoria

export function actualizarCategoria(id, categoria) {
  return enviarDatos(`/api/categorias/${id}`, 'PUT', categoria)
} // fin actualizarCategoria

export function eliminarCategoria(id) {
  return enviarDatos(`/api/categorias/${id}`, 'DELETE')
} // fin eliminarCategoria
