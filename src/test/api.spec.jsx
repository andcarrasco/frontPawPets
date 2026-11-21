import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ContenidoApp } from '../App.jsx'
import { obtenerDatos, enviarDatos } from '../servicios/api.js'
import { simularApi, errorApi } from './utilidades/simularApi.js'
import productosLocales from '../datos/productos.json'

// Ejemplo del patrón simularApi: así se prueban las llamadas al backend sin levantarlo.
describe('Conexión con la API', () => {
  afterEach(() => cleanup())

  // Datos: La API simulada responde GET /api/productos con un producto.
  // Acción: Llamar a obtenerDatos('/api/productos').
  // Resultado esperado: Se recibe la misma lista que entregó la API.
  it('obtiene la lista que responde la API', async () => {
    simularApi({ 'GET /api/productos': [{ id: 1, nombre: 'Pelota' }] })

    const productos = await obtenerDatos('/api/productos')

    expect(productos).toEqual([{ id: 1, nombre: 'Pelota' }])
  })

  // Datos: Un producto nuevo con nombre Correa.
  // Acción: Enviarlo con enviarDatos usando POST.
  // Resultado esperado: La petición usa POST, lleva el JSON del producto y se recibe la respuesta del servidor.
  it('envía el método y el cuerpo en formato JSON', async () => {
    const api = simularApi({ 'POST /api/productos': ({ cuerpo }) => ({ id: 5, ...cuerpo }) })

    const creado = await enviarDatos('/api/productos', 'POST', { nombre: 'Correa' })

    expect(api.llamadas[0].metodo).toBe('POST')
    expect(api.llamadas[0].cuerpo).toEqual({ nombre: 'Correa' })
    expect(creado.id).toBe(5)
  })

  // Datos: La API responde 409 con el mensaje Ya existe un usuario con ese correo.
  // Acción: Intentar crear el usuario.
  // Resultado esperado: Se lanza un error con el mensaje del backend y el estado 409.
  it('lanza el mensaje de error que devuelve el backend', async () => {
    simularApi({ 'POST /api/usuarios': errorApi(409, 'Ya existe un usuario con ese correo.') })

    await expectAsync(enviarDatos('/api/usuarios', 'POST', { email: 'repetido@gmail.com' }))
      .toBeRejectedWithError('Ya existe un usuario con ese correo.')
  })

  // Datos: La API entrega un producto llamado Producto desde la API.
  // Acción: Abrir el catálogo de la tienda.
  // Resultado esperado: La tarjeta del producto de la API reemplaza a las del JSON local.
  it('muestra en el catálogo los productos que entrega la API', async () => {
    simularApi({
      'GET /api/productos': [{ ...productosLocales[0], id: 50, nombre: 'Producto desde la API' }]
    })
    render(<MemoryRouter initialEntries={['/productos']}><ContenidoApp /></MemoryRouter>)

    expect(await screen.findByRole('heading', { name: 'Producto desde la API' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: productosLocales[0].nombre })).toBeNull()
  })

  // Datos: La API no tiene la ruta de productos (responde 404).
  // Acción: Abrir el catálogo de la tienda.
  // Resultado esperado: Se siguen mostrando los productos del JSON local.
  it('usa el JSON local si la API no responde', async () => {
    const api = simularApi({})
    render(<MemoryRouter initialEntries={['/productos']}><ContenidoApp /></MemoryRouter>)

    await new Promise(resolver => setTimeout(resolver, 0))
    expect(api.espia).toHaveBeenCalled()
    expect(screen.getByRole('heading', { name: productosLocales[0].nombre })).toBeTruthy()
  })
})
