import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AdminReportes from '../paginas/AdminReportes.jsx'
import Vendedor from '../paginas/Vendedor.jsx'
import { iniciarSesion } from '../servicios/sesion.js'
import { simularApi, errorApi } from './utilidades/simularApi.js'
import { rutasReportes } from './utilidades/reportesSimulados.js'

function pedidosDelMes() {
  const fecha = new Date().toISOString()
  return [
    {
      id: 101, cliente: { nombre: 'Cliente Uno' }, fecha, total: 10500, entrega: 'retiro',
      productos: [{ productoId: 3, nombre: 'Hueso de goma', cantidad: 3, precio: 3500, subtotal: 10500 }]
    },
    {
      id: 102, cliente: { nombre: 'Cliente Dos' }, fecha, total: 15000, entrega: 'domicilio',
      productos: [{ productoId: 4, nombre: 'Rascador para gatos', cantidad: 1, precio: 15000, subtotal: 15000 }]
    }
  ]
}

// Revisa los reportes y el panel del vendedor con la API de pedidos y reportes simulada.
describe('Reportes con la API', () => {
  afterEach(() => {
    cleanup()
    sessionStorage.removeItem('pawpets_sesion')
  })

  // Datos: La API no tiene pedidos.
  // Acción: Abrir los reportes administrativos.
  // Resultado esperado: Las ventas muestran $0 y aparece el mensaje de que no hay compras.
  it('muestra ventas en cero y un mensaje cuando no existen pedidos', async () => {
    simularApi({ 'GET /api/pedidos': [], ...rutasReportes([]) })
    render(<MemoryRouter><AdminReportes productos={[]} /></MemoryRouter>)

    expect(await screen.findByText('No hay compras registradas.')).toBeTruthy()
    expect(screen.getByText('$0')).toBeTruthy()
  })

  // Datos: Dos pedidos del mes, de $10.500 y $15.000.
  // Acción: Abrir los reportes.
  // Resultado esperado: Se muestran $25.500, los dos clientes, dos enlaces Ver detalle y Hueso de goma primero en el ranking.
  it('muestra el total del mes, los pedidos y los productos más vendidos', async () => {
    const pedidos = pedidosDelMes()
    simularApi({ 'GET /api/pedidos': pedidos, ...rutasReportes(pedidos) })
    render(<MemoryRouter><AdminReportes productos={[]} /></MemoryRouter>)

    expect(await screen.findByText('$25.500')).toBeTruthy()
    expect(screen.getByText('Cliente Uno')).toBeTruthy()
    expect(screen.getByText('Cliente Dos')).toBeTruthy()
    expect(screen.getAllByRole('link', { name: 'Ver detalle' }).length).toBe(2)
    const ranking = screen.getByRole('table', { name: 'Productos más vendidos' })
    expect(ranking.rows[1].textContent).toContain('Hueso de goma')
  })

  // Datos: La API de reportes responde con un error 500.
  // Acción: Abrir los reportes.
  // Resultado esperado: Se muestra el mensaje de error del backend.
  it('avisa cuando la API de reportes falla', async () => {
    simularApi({ 'GET /api/pedidos': [], 'GET /api/reportes/ventas': errorApi(500, 'No se pudo calcular el reporte.') })
    render(<MemoryRouter><AdminReportes productos={[]} /></MemoryRouter>)

    expect(await screen.findByText('No se pudo calcular el reporte.')).toBeTruthy()
  })

  // Datos: Vendedor con sesión y dos pedidos del mes por $25.500.
  // Acción: Abrir el panel del vendedor.
  // Resultado esperado: La sección Mis ventas muestra $25.500 y 2 pedidos este mes.
  it('muestra las ventas del mes en el panel del vendedor', async () => {
    iniciarSesion({ id: 2, nombre: 'Vendedor Demo', email: 'vendedor@duoc.cl', rol: 'vendedor' })
    const pedidos = pedidosDelMes()
    simularApi({ 'GET /api/usuarios': [], ...rutasReportes(pedidos) })
    render(<MemoryRouter><Vendedor productos={[]} onCerrarSesion={() => {}} /></MemoryRouter>)

    expect(await screen.findByText('$25.500')).toBeTruthy()
    expect(screen.getByText('2 pedidos este mes')).toBeTruthy()
  })
})
