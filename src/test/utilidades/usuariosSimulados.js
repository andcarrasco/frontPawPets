import { errorApi, responder } from './simularApi.js'

// Arma las rutas de simularApi para /api/usuarios y /api/auth/login a partir de una lista.
// La lista se modifica igual que lo haría el backend (crear, editar, eliminar), y las respuestas
// no incluyen la contraseña. Uso: simularApi(rutasUsuarios([cliente, administrador]))

function sinPassword(usuario) {
  const copia = { ...usuario }
  delete copia.password
  return copia
} // fin sinPassword

export function rutasUsuarios(usuarios) {
  const rutas = {
    'GET /api/usuarios': () => usuarios.map(sinPassword),

    'POST /api/auth/login': ({ cuerpo }) => {
      const usuario = usuarios.find(u =>
        u.email.toLowerCase() === cuerpo.email.toLowerCase() && u.password === cuerpo.password)
      return usuario ? sinPassword(usuario) : errorApi(401, 'Correo o contraseña incorrectos.')
    },

    'POST /api/usuarios': ({ cuerpo }) => {
      if (usuarios.some(u => u.email.toLowerCase() === cuerpo.email.toLowerCase())) {
        return errorApi(409, 'Ya existe un usuario con ese correo.')
      }
      const nuevo = { rol: 'cliente', ...cuerpo, id: Math.max(0, ...usuarios.map(u => u.id)) + 1 }
      usuarios.push(nuevo)
      return responder(201, sinPassword(nuevo))
    }
  }

  for (const usuario of usuarios) {
    rutas[`GET /api/usuarios/${usuario.id}`] = () => sinPassword(usuario)
    rutas[`PUT /api/usuarios/${usuario.id}`] = ({ cuerpo }) => {
      Object.assign(usuario, cuerpo)
      return sinPassword(usuario)
    }
    rutas[`DELETE /api/usuarios/${usuario.id}`] = () => {
      usuarios.splice(usuarios.indexOf(usuario), 1)
      return responder(204)
    }
  }

  return rutas
} // fin rutasUsuarios
