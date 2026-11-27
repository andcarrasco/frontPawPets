import productos from '../datos/productos.json'
import { armarPedido, confirmarCompra, validarCliente } from '../servicios/compras.js'
import { agregarAlCarrito, cambiarCantidad, quitarDelCarrito } from '../servicios/carrito.js'
import { simularApi, errorApi } from './utilidades/simularApi.js'
import { rutasPedidos } from './utilidades/pedidosSimulados.js'

// Revisa cantidades, stock, el pedido que se envía a la API y la respuesta del backend.
describe('Carrito y compra', () => {
  const cliente = {
    nombre: 'Cliente de prueba', email: 'prueba@gmail.com', direccion: 'Calle de prueba 123',
    region: 'Metropolitana', comuna: 'Santiago', entrega: 'domicilio'
  }

  // Datos: Carrito vacío y el primer producto del JSON.
  // Acción: Agregar una unidad y luego quitarla.
  // Resultado esperado: La copia inicial sigue vacía, se agrega el ID con cantidad 1 y al quitarlo el carrito queda vacío.
  it('agrega y quita productos sin modificar el carrito original', () => {
    const original = []
    const carrito = agregarAlCarrito(original, productos[0])
    expect(original).toEqual([])
    expect(carrito).toEqual([{ productoId: productos[0].id, cantidad: 1 }])
    expect(quitarDelCarrito(carrito, productos[0].id)).toEqual([])
  })

  // Datos: Un producto agregado al carrito.
  // Acción: Pedir una cantidad mayor al stock, una cantidad 0 y una cantidad 1,5.
  // Resultado esperado: Cada intento lanza el error correspondiente: stock insuficiente o cantidad entera inválida.
  it('impide cantidades superiores al stock y cantidades inválidas', () => {
    const producto = productos[0]
    const carrito = [{ productoId: producto.id, cantidad: 1 }]
    expect(() => cambiarCantidad(carrito, producto, producto.stock + 1)).toThrowError(/stock/)
    expect(() => cambiarCantidad(carrito, producto, 0)).toThrowError(/entero/)
    expect(() => cambiarCantidad(carrito, producto, 1.5)).toThrowError(/entero/)
  })

  // Datos: Usuario 7 y dos unidades del primer producto, con despacho a domicilio.
  // Acción: Armar el pedido que se envía a la API.
  // Resultado esperado: Lleva el usuario, el cliente, la dirección y solo id y cantidad de cada producto.
  it('arma el pedido con ids y cantidades para enviarlo a la API', () => {
    const pedido = armarPedido([{ productoId: productos[0].id, cantidad: 2 }], cliente, productos, 7)

    expect(pedido.usuarioId).toBe(7)
    expect(pedido.cliente).toEqual({ nombre: 'Cliente de prueba', email: 'prueba@gmail.com' })
    expect(pedido.direccion).toEqual({ calle: 'Calle de prueba 123', region: 'Metropolitana', comuna: 'Santiago' })
    expect(pedido.items).toEqual([{ productoId: productos[0].id, cantidad: 2 }])
  })

  // Datos: Una API simulada que calcula el total con el precio del catálogo ($25.000).
  // Acción: Confirmar la compra de dos unidades del primer producto.
  // Resultado esperado: Se hace POST a /api/pedidos y se recibe el pedido con número 100 y total $50.000.
  it('envía la compra a la API y devuelve el pedido guardado', async () => {
    const api = simularApi(rutasPedidos([], productos))

    const pedido = await confirmarCompra([{ productoId: productos[0].id, cantidad: 2 }], cliente, productos, 7)

    expect(api.llamadas[0].metodo).toBe('POST')
    expect(api.llamadas[0].ruta).toBe('/api/pedidos')
    expect(pedido.id).toBe(100)
    expect(pedido.total).toBe(productos[0].precio * 2)
  })

  // Datos: La API responde 409 porque otro cliente compró las últimas unidades.
  // Acción: Confirmar la compra.
  // Resultado esperado: La promesa se rechaza con el mensaje del backend.
  it('entrega el error de stock que responde la API', async () => {
    simularApi({ 'POST /api/pedidos': errorApi(409, 'No hay stock suficiente de Master Dog Adulto 15 kg. Quedan 0 unidades.') })

    await expectAsync(confirmarCompra([{ productoId: productos[0].id, cantidad: 1 }], cliente, productos))
      .toBeRejectedWithError(/No hay stock suficiente/)
  })

  // Datos: Cliente válido y tres carritos: sin stock suficiente, vacío y con producto inexistente.
  // Acción: Armar cada pedido.
  // Resultado esperado: Los tres lanzan su error antes de llamar a la API.
  it('rechaza una compra inválida sin llamar a la API', () => {
    const api = simularApi({})
    expect(() => armarPedido([{ productoId: productos[0].id, cantidad: productos[0].stock + 1 }], cliente, productos)).toThrowError(/stock/)
    expect(() => armarPedido([], cliente, productos)).toThrowError(/vacío/)
    expect(() => armarPedido([{ productoId: -1, cantidad: 1 }], cliente, productos)).toThrowError(/disponible/)
    expect(api.espia).not.toHaveBeenCalled()
  })

  // Datos: Cliente con comuna incorrecta, cliente sin dirección y cliente con retiro en tienda.
  // Acción: Validar cada opción de entrega.
  // Resultado esperado: El domicilio informa errores de comuna o dirección; el retiro sin dirección no informa errores.
  it('valida el domicilio y permite retiro sin dirección', () => {
    expect(validarCliente({ ...cliente, comuna: 'Comuna no válida' })).toContain('comuna')
    expect(validarCliente({ ...cliente, direccion: '' })).toContain('dirección')
    expect(validarCliente({ ...cliente, entrega: 'retiro', direccion: '', region: '', comuna: '' })).toBe('')
  })
})
