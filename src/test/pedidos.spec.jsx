import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import DetallePedido from '../paginas/DetallePedido.jsx'
import MisPedidos from '../paginas/MisPedidos.jsx'
import { simularApi } from './utilidades/simularApi.js'
import { rutasPedidos } from './utilidades/pedidosSimulados.js'

const pedidoGuardado = {
  id: 103,
  usuarioId: 7,
  fecha: '2026-10-22T15:00:00',
  cliente: { nombre: 'Cliente Prueba', email: 'prueba@pawpets.cl' },
  entrega: 'retiro',
  direccion: null,
  productos: [
    { productoId: 3, nombre: 'Hueso de goma', cantidad: 2, precio: 3500, subtotal: 7000 }
  ],
  total: 7000
}

function mostrarDetalle(id) {
  render(
    <MemoryRouter initialEntries={['/admin/pedidos/' + id]}>
      <Routes><Route path="/admin/pedidos/:id" element={<DetallePedido />} /></Routes>
    </MemoryRouter>
  )
}

// Revisa el comprobante y el historial de compras con la API de pedidos simulada.
describe('Pedidos guardados en la API', () => {
  afterEach(() => cleanup())

  // Datos: La API no tiene el pedido 999 y responde 404.
  // Acción: Abrir /admin/pedidos/999.
  // Resultado esperado: Se muestra Pedido no disponible con el mensaje del backend.
  it('avisa cuando el número no corresponde a un pedido', async () => {
    simularApi(rutasPedidos([], []))
    mostrarDetalle(999)

    expect(await screen.findByRole('heading', { name: 'Pedido no disponible' })).toBeTruthy()
    expect(screen.getByText('No existe el pedido número 999.')).toBeTruthy()
  })

  // Datos: Pedido 103 de Cliente Prueba con dos Huesos de goma de $3.500.
  // Acción: Abrir /admin/pedidos/103.
  // Resultado esperado: Se ven pedido, cliente, correo, producto, total $7.000, botón de impresión y enlace a reportes.
  it('muestra el comprobante que entrega la API', async () => {
    simularApi(rutasPedidos([pedidoGuardado], []))
    mostrarDetalle(103)

    expect(await screen.findByRole('heading', { name: 'Detalle del pedido #103' })).toBeTruthy()
    expect(screen.getByText(/Cliente Prueba/)).toBeTruthy()
    expect(screen.getByText(/prueba@pawpets.cl/)).toBeTruthy()
    expect(screen.getByText(/Hueso de goma/)).toBeTruthy()
    expect(screen.getByTestId('total-compra').textContent).toContain('$7.000')
    expect(screen.getByRole('button', { name: 'Imprimir comprobante' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Volver a reportes' }).getAttribute('href')).toBe('/admin/reportes')
  })

  // Datos: Usuario 7 con el pedido 103 y otro usuario con el pedido 104.
  // Acción: Abrir Mis compras como usuario 7.
  // Resultado esperado: Se pide /api/pedidos?usuarioId=7 y solo aparece el pedido 103.
  it('muestra solo las compras del usuario con sesión', async () => {
    const api = simularApi(rutasPedidos([pedidoGuardado, { ...pedidoGuardado, id: 104, usuarioId: 8 }], []))
    render(<MemoryRouter><MisPedidos usuario={{ id: 7, nombre: 'Cliente Prueba' }} /></MemoryRouter>)

    expect(await screen.findByRole('heading', { name: 'Pedido #103' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Pedido #104' })).toBeNull()
    expect(api.llamadas[0].ruta).toBe('/api/pedidos?usuarioId=7')
  })

  // Datos: Visitante sin sesión.
  // Acción: Abrir Mis compras.
  // Resultado esperado: Se pide iniciar sesión y no se llama a la API.
  it('pide iniciar sesión para ver el historial', () => {
    const api = simularApi({})
    render(<MemoryRouter><MisPedidos usuario={null} /></MemoryRouter>)

    expect(screen.getByText(/Inicia sesión para ver tu historial/)).toBeTruthy()
    expect(api.espia).not.toHaveBeenCalled()
  })
})
