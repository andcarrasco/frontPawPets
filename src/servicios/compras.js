import { obtenerLineas } from './carrito.js'
import { regionesCompra } from '../datos/regionesCompra.js'
import { obtenerDatos, enviarDatos } from './api.js'

export function validarCliente(cliente) {
  if (!cliente.nombre.trim()) return 'Ingresa el nombre del cliente.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.email.trim())) {
    return 'Ingresa un correo válido.'
  }
  if (!['domicilio', 'retiro'].includes(cliente.entrega)) return 'Selecciona una opción de entrega.'
  if (cliente.entrega === 'domicilio') {
    if (!cliente.direccion.trim()) return 'Ingresa la dirección de entrega.'
    if (!regionesCompra[cliente.region]?.includes(cliente.comuna)) {
      return 'Selecciona una región y comuna válidas.'
    }
  }
  return ''
}

export function validarCarritoCompra(carrito, productos) {
  if (carrito.length === 0) throw new Error('El carrito está vacío.')
  const lineas = obtenerLineas(carrito, productos)
  for (const linea of lineas) {
    if (!linea.disponible) throw new Error('Hay un producto que ya no está disponible. Retíralo del carrito.')
    if (!Number.isInteger(linea.cantidad) || linea.cantidad < 1 || linea.cantidad > linea.stock) {
      throw new Error('Revisa la cantidad de ' + linea.nombre + ': no hay stock suficiente.')
    }
  }
  return lineas
}

// Arma el cuerpo de POST /api/pedidos. Solo envía ids y cantidades:
// el backend pone nombre y precio desde la base de datos, calcula el total y descuenta el stock.
export function armarPedido(carrito, cliente, productos, usuarioId = null) {
  const error = validarCliente(cliente)
  if (error) throw new Error(error)
  validarCarritoCompra(carrito, productos)

  return {
    usuarioId,
    cliente: { nombre: cliente.nombre.trim(), email: cliente.email.trim() },
    entrega: cliente.entrega,
    direccion: cliente.entrega === 'domicilio'
      ? { calle: cliente.direccion.trim(), region: cliente.region, comuna: cliente.comuna }
      : null,
    items: carrito.map(item => ({ productoId: item.productoId, cantidad: item.cantidad }))
  }
}

// Envía la compra a la API y devuelve el pedido guardado (con número, fecha, líneas y total).
export function confirmarCompra(carrito, cliente, productos, usuarioId = null) {
  return enviarDatos('/api/pedidos', 'POST', armarPedido(carrito, cliente, productos, usuarioId))
}

export function obtenerPedido(id) {
  return obtenerDatos(`/api/pedidos/${id}`)
}

// Sin usuarioId: todos los pedidos (administración). Con usuarioId: historial de esa persona.
export function listarPedidos(usuarioId = null) {
  return obtenerDatos(usuarioId == null ? '/api/pedidos' : `/api/pedidos?usuarioId=${usuarioId}`)
}
