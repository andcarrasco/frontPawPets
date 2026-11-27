import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AdminProductos from '../paginas/AdminProductos.jsx'
import AdminCategorias from '../paginas/AdminCategorias.jsx'
import productos from '../datos/productos.json'
import categorias from '../datos/categorias.json'
import { simularApi, errorApi, responder } from './utilidades/simularApi.js'

// Revisa la administración del catálogo: consulta, filtro de stock y CRUD contra la API simulada.
describe('Catálogo administrativo', () => {
  afterEach(() => cleanup())

  function mostrarProductos(lista = productos, onCambio = () => {}) {
    render(<MemoryRouter><AdminProductos productos={lista} categorias={categorias} onCambio={onCambio} /></MemoryRouter>)
  }

  // Datos: Productos y categorías de los archivos JSON.
  // Acción: Abrir la administración de productos.
  // Resultado esperado: Hay una fila por producto más el encabezado, y aparece el nombre del primer producto.
  it('muestra los productos recibidos', () => {
    mostrarProductos()

    expect(screen.getAllByRole('row').length).toBe(productos.length + 1)
    expect(screen.getByText(productos[0].nombre)).toBeTruthy()
  })

  // Datos: Administración de productos con el detalle cerrado.
  // Acción: Abrir el primer producto y luego pulsar Cerrar detalle.
  // Resultado esperado: Aparece su descripción al abrir y desaparece la sección de detalle al cerrar.
  it('abre el detalle al pulsar Ver detalle y lo oculta al pulsar Cerrar detalle', () => {
    mostrarProductos()

    expect(screen.queryByRole('region', { name: 'Detalle administrativo del producto' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Ver detalle de ' + productos[0].nombre }))
    expect(screen.getByText(productos[0].descripcion)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar detalle' }))
    expect(screen.queryByRole('region', { name: 'Detalle administrativo del producto' })).toBeNull()
  })

  // Datos: Tres productos con stock 8, 5 y 0.
  // Acción: Activar y desactivar el filtro de stock crítico.
  // Resultado esperado: El filtro muestra solo los de stock 5 y 0; al quitarlo vuelven los tres y el stock no cambia.
  it('filtra los productos críticos y agotados sin cambiar sus existencias', () => {
    const ejemplos = [
      { ...productos[0], id: 101, nombre: 'Normal', stock: 8 },
      { ...productos[0], id: 102, nombre: 'Crítico', stock: 5 },
      { ...productos[0], id: 103, nombre: 'Agotado', stock: 0 }
    ]
    mostrarProductos(ejemplos)

    fireEvent.click(screen.getByLabelText('Mostrar solo productos con stock crítico o agotado'))
    expect(screen.getAllByRole('row').length).toBe(3)
    expect(screen.queryByText('Normal', { selector: 'td' })).toBeNull()
    expect(ejemplos.map(producto => producto.stock)).toEqual([8, 5, 0])
    fireEvent.click(screen.getByLabelText('Mostrar solo productos con stock crítico o agotado'))
    expect(screen.getAllByRole('row').length).toBe(4)
  })

  // Datos: La API simulada crea el producto con el código 5.
  // Acción: Pulsar Nuevo producto, completar nombre Collar, categoría Accesorios, precio 5000 y stock 3, y guardar.
  // Resultado esperado: Se envía POST con los números convertidos, se avisa el código 5 y se pide recargar el catálogo.
  it('crea un producto con el formulario y lo envía a la API', async () => {
    const api = simularApi({ 'POST /api/productos': ({ cuerpo }) => responder(201, { id: 5, ...cuerpo }) })
    const onCambio = jasmine.createSpy('onCambio')
    mostrarProductos(productos, onCambio)

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo producto' }))
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Collar' } })
    fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: '4' } })
    fireEvent.change(screen.getByLabelText('Precio'), { target: { value: '5000' } })
    fireEvent.change(screen.getByLabelText('Stock'), { target: { value: '3' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar producto' }))

    expect(await screen.findByText('Producto creado con el código 5.')).toBeTruthy()
    expect(api.llamadas[0].metodo).toBe('POST')
    expect(api.llamadas[0].cuerpo).toEqual(jasmine.objectContaining({ nombre: 'Collar', categoriaId: 4, precio: 5000, stock: 3 }))
    expect(onCambio).toHaveBeenCalled()
  })

  // Datos: La API responde 400 con El nombre del producto es obligatorio.
  // Acción: Guardar el formulario de nuevo producto vacío.
  // Resultado esperado: El formulario sigue abierto y muestra el mensaje del backend.
  it('muestra el error de validación que devuelve la API', async () => {
    simularApi({ 'POST /api/productos': errorApi(400, 'El nombre del producto es obligatorio.') })
    mostrarProductos()

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo producto' }))
    fireEvent.click(screen.getByRole('button', { name: 'Guardar producto' }))

    expect(await screen.findByText('El nombre del producto es obligatorio.')).toBeTruthy()
    expect(screen.getByRole('form', { name: 'Formulario de producto' })).toBeTruthy()
  })

  // Datos: Primer producto del JSON y una API que acepta el DELETE.
  // Acción: Pulsar Eliminar y confirmar.
  // Resultado esperado: Se envía DELETE a /api/productos/1, se avisa la eliminación y se recarga el catálogo.
  it('elimina un producto después de confirmar', async () => {
    spyOn(window, 'confirm').and.returnValue(true)
    const api = simularApi({ [`DELETE /api/productos/${productos[0].id}`]: responder(204) })
    const onCambio = jasmine.createSpy('onCambio')
    mostrarProductos(productos, onCambio)

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar ' + productos[0].nombre }))

    expect(await screen.findByText('Producto eliminado.')).toBeTruthy()
    expect(api.llamadas[0].ruta).toBe(`/api/productos/${productos[0].id}`)
    expect(onCambio).toHaveBeenCalled()
  })

  // Datos: Productos y categorías del JSON.
  // Acción: Abrir la administración de categorías.
  // Resultado esperado: Hay una fila por categoría; la primera muestra su nombre y la cantidad de productos asociados.
  it('muestra cada categoría y la cantidad de productos asociados', () => {
    render(<MemoryRouter><AdminCategorias categorias={categorias} productos={productos} /></MemoryRouter>)

    const filas = screen.getAllByRole('row')
    expect(filas.length).toBe(categorias.length + 1)
    expect(filas[1].textContent).toContain(categorias[0].nombre)
    expect(filas[1].cells[2].textContent).toBe(String(productos.filter(producto => producto.categoriaId === categorias[0].id).length))
  })

  // Datos: Primera categoría, que tiene productos; la API responde 409.
  // Acción: Pulsar Eliminar y confirmar.
  // Resultado esperado: Se muestra el mensaje del backend y no se recargan las categorías.
  it('avisa que no se puede eliminar una categoría con productos', async () => {
    spyOn(window, 'confirm').and.returnValue(true)
    simularApi({
      [`DELETE /api/categorias/${categorias[0].id}`]: errorApi(409, 'No se puede eliminar la categoría porque tiene productos asociados.')
    })
    const onCambio = jasmine.createSpy('onCambio')
    render(<MemoryRouter><AdminCategorias categorias={categorias} productos={productos} onCambio={onCambio} /></MemoryRouter>)

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar ' + categorias[0].nombre }))

    expect(await screen.findByText('No se puede eliminar la categoría porque tiene productos asociados.')).toBeTruthy()
    expect(onCambio).not.toHaveBeenCalled()
  })

  // Datos: Una API que crea la categoría Higiene.
  // Acción: Escribir Higiene y pulsar Agregar categoría.
  // Resultado esperado: Se envía POST con ese nombre y se avisa que la categoría fue creada.
  it('crea una categoría nueva', async () => {
    const api = simularApi({ 'POST /api/categorias': ({ cuerpo }) => responder(201, { id: 5, ...cuerpo }) })
    render(<MemoryRouter><AdminCategorias categorias={categorias} productos={productos} /></MemoryRouter>)

    fireEvent.change(screen.getByLabelText('Nombre de la nueva categoría'), { target: { value: 'Higiene' } })
    fireEvent.click(screen.getByRole('button', { name: 'Agregar categoría' }))

    expect(await screen.findByText('Categoría creada.')).toBeTruthy()
    expect(api.llamadas[0].cuerpo).toEqual({ nombre: 'Higiene' })
  })
})
