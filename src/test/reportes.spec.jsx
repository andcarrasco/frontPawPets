import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AdminReportes from '../paginas/AdminReportes.jsx'

// Revisa las sumas de ventas del reporte. Las pruebas del comprobante están en pedidos.spec.jsx.
describe('Reportes', () => {
  afterEach(() => cleanup())

  // Datos: Listas vacías de productos y pedidos.
  // Acción: Abrir los reportes administrativos.
  // Resultado esperado: Las ventas muestran $0 y aparece el mensaje de que no hay compras en la sesión.
  it('muestra ventas en cero y un mensaje cuando no existen pedidos', () => {
    render(<MemoryRouter><AdminReportes productos={[]} pedidos={[]} /></MemoryRouter>)

    expect(screen.getByText('$0')).toBeTruthy()
    expect(screen.getByText('No hay compras registradas en esta sesión.')).toBeTruthy()
  })

  // Datos: Dos pedidos del mes actual, uno de $10.000 y otro de $15.000.
  // Acción: Abrir los reportes con ambos pedidos.
  // Resultado esperado: Se muestran $25.000, los nombres de los dos clientes y dos enlaces Ver detalle.
  it('suma dos pedidos del mes y muestra un enlace al detalle de cada uno', () => {
    const fecha = new Date().toISOString()
    const pedidos = [
      { id: 101, cliente: { nombre: 'Cliente Uno' }, fecha, total: 10000, entrega: 'retiro' },
      { id: 102, cliente: { nombre: 'Cliente Dos' }, fecha, total: 15000, entrega: 'domicilio' }
    ]
    render(<MemoryRouter><AdminReportes productos={[]} pedidos={pedidos} /></MemoryRouter>)

    expect(screen.getByText('$25.000')).toBeTruthy()
    expect(screen.getByText('Cliente Uno')).toBeTruthy()
    expect(screen.getByText('Cliente Dos')).toBeTruthy()
    expect(screen.getAllByRole('link', { name: 'Ver detalle' }).length).toBe(2)
  })
})
