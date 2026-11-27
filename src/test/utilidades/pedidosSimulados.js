import { errorApi, responder } from './simularApi.js'

// Arma las rutas de simularApi para /api/pedidos, imitando al backend:
// arma las líneas con nombre y precio del catálogo, calcula el total y responde 409 sin stock.
// Uso: simularApi(rutasPedidos(pedidos, productos)) — los pedidos creados se agregan a la lista.
export function rutasPedidos(pedidos, productos, primerId = 100) {
  return {
    'POST /api/pedidos': ({ cuerpo }) => {
      const lineas = []
      for (const item of cuerpo.items) {
        const producto = productos.find(p => p.id === item.productoId)
        if (!producto) return errorApi(400, `El producto ${item.productoId} ya no está disponible.`)
        if (item.cantidad > producto.stock) {
          return errorApi(409, `No hay stock suficiente de ${producto.nombre}. Quedan ${producto.stock} unidades.`)
        }
        lineas.push({
          productoId: producto.id, nombre: producto.nombre, cantidad: item.cantidad,
          precio: producto.precio, subtotal: producto.precio * item.cantidad
        })
      }
      const pedido = {
        id: primerId + pedidos.length,
        usuarioId: cuerpo.usuarioId,
        cliente: cuerpo.cliente,
        entrega: cuerpo.entrega,
        direccion: cuerpo.direccion,
        fecha: new Date().toISOString(),
        productos: lineas,
        total: lineas.reduce((total, linea) => total + linea.subtotal, 0)
      }
      pedidos.push(pedido)
      return responder(201, pedido)
    },

    'GET /api/pedidos': ({ ruta }) => {
      const usuarioId = new URL(ruta, 'http://localhost').searchParams.get('usuarioId')
      return usuarioId ? pedidos.filter(p => p.usuarioId === Number(usuarioId)) : pedidos
    },

    'GET /api/pedidos/:id': ({ parametros }) => {
      const pedido = pedidos.find(p => p.id === Number(parametros.id))
      return pedido || errorApi(404, `No existe el pedido número ${parametros.id}.`)
    }
  }
} // fin rutasPedidos
