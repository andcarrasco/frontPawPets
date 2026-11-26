import { obtenerDatos, enviarDatos } from './api.js'

// Usuarios desde la API (antes estaban en memoria, en src/datos/usuarios.js).
// Todas las funciones son asíncronas: se usan con await y lanzan un Error con el mensaje del backend.

export function listarUsuarios() {
  return obtenerDatos('/api/usuarios')
} // fin listarUsuarios

export function buscarUsuario(id) {
  return obtenerDatos(`/api/usuarios/${id}`)
} // fin buscarUsuario

export function crearUsuario(datosUsuario) {
  return enviarDatos('/api/usuarios', 'POST', datosUsuario)
} // fin crearUsuario

export function actualizarUsuario(id, datosActualizados) {
  return enviarDatos(`/api/usuarios/${id}`, 'PUT', datosActualizados)
} // fin actualizarUsuario

export function eliminarUsuario(id) {
  return enviarDatos(`/api/usuarios/${id}`, 'DELETE')
} // fin eliminarUsuario

// Valida correo y contraseña en el backend. Devuelve el usuario sin contraseña o lanza el error 401.
export function ingresar(email, password) {
  return enviarDatos('/api/auth/login', 'POST', { email, password })
} // fin ingresar
