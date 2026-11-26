import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Login from '../paginas/Login.jsx'
import { simularApi, errorApi } from './utilidades/simularApi.js'

// Revisa los campos del login, los mensajes ante datos incorrectos y el ingreso con la API.
describe('Login', () => {
  afterEach(() => {
    cleanup()
    sessionStorage.removeItem('pawpets_sesion')
  })

  function completar(rol, email, password) {
    if (rol) fireEvent.change(screen.getByLabelText('Rol'), { target: { value: rol } })
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: email } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: password } })
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }))
  }

  // Datos: Login sin datos ingresados.
  // Acción: Abrir el formulario de ingreso.
  // Resultado esperado: Se ven rol, correo, contraseña y el botón Ingresar.
  it('muestra los campos de rol, correo y contraseña junto al botón Ingresar', () => {
    render(<MemoryRouter><Login onLogin={() => {}} /></MemoryRouter>)

    expect(screen.getByLabelText('Rol')).toBeTruthy()
    expect(screen.getByLabelText('Correo electrónico')).toBeTruthy()
    expect(screen.getByLabelText('Contraseña')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeTruthy()
  })

  // Datos: Rol cliente, correo correo-invalido y contraseña 1234.
  // Acción: Pulsar Ingresar.
  // Resultado esperado: Se muestra el mensaje que pide un correo válido y no se llama a la API.
  it('rechaza un correo sin formato válido', () => {
    const api = simularApi({})
    render(<MemoryRouter><Login onLogin={() => {}} /></MemoryRouter>)
    completar('cliente', 'correo-invalido', '1234')

    expect(screen.getByText('Ingrese un correo válido (@duoc.cl, @gmail.com).')).toBeTruthy()
    expect(api.espia).not.toHaveBeenCalled()
  })

  // Datos: Correo cliente@gmail.com, contraseña 1234 y ningún rol seleccionado.
  // Acción: Pulsar Ingresar.
  // Resultado esperado: Se muestra el mensaje Seleccione un rol.
  it('pide seleccionar un rol antes de ingresar', () => {
    render(<MemoryRouter><Login onLogin={() => {}} /></MemoryRouter>)
    completar('', 'cliente@gmail.com', '1234')

    expect(screen.getByText('Seleccione un rol.')).toBeTruthy()
  })

  // Datos: La API acepta cliente@gmail.com con 1234 y devuelve a Cliente Demo.
  // Acción: Ingresar como cliente con esos datos.
  // Resultado esperado: Se envían correo y contraseña a /api/auth/login y se entrega la sesión de Cliente Demo.
  it('inicia sesión con el usuario que devuelve la API', async () => {
    const api = simularApi({
      'POST /api/auth/login': { id: 3, nombre: 'Cliente Demo', email: 'cliente@gmail.com', rol: 'cliente' }
    })
    const onLogin = jasmine.createSpy('onLogin')
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login onLogin={onLogin} />} />
          <Route path="/" element={<h1>Tienda</h1>} />
        </Routes>
      </MemoryRouter>
    )
    completar('cliente', 'cliente@gmail.com', '1234')

    // Después del login el cliente vuelve a la tienda.
    expect(await screen.findByRole('heading', { name: 'Tienda' })).toBeTruthy()
    expect(api.llamadas[0].cuerpo).toEqual({ email: 'cliente@gmail.com', password: '1234' })
    expect(onLogin.calls.mostRecent().args[0].nombre).toBe('Cliente Demo')
  })

  // Datos: La API responde 401 con Correo o contraseña incorrectos.
  // Acción: Ingresar con una contraseña equivocada.
  // Resultado esperado: Se muestra el mensaje del backend y no se inicia sesión.
  it('muestra el error 401 que devuelve la API', async () => {
    simularApi({ 'POST /api/auth/login': errorApi(401, 'Correo o contraseña incorrectos.') })
    const onLogin = jasmine.createSpy('onLogin')
    render(<MemoryRouter><Login onLogin={onLogin} /></MemoryRouter>)
    completar('cliente', 'cliente@gmail.com', '9999')

    expect(await screen.findByText('Correo o contraseña incorrectos.')).toBeTruthy()
    expect(onLogin).not.toHaveBeenCalled()
  })

  // Datos: La API devuelve un usuario con rol vendedor.
  // Acción: Ingresar seleccionando el rol cliente.
  // Resultado esperado: Se avisa que el rol no corresponde y no se inicia sesión.
  it('rechaza un rol distinto al del usuario', async () => {
    simularApi({
      'POST /api/auth/login': { id: 2, nombre: 'Vendedor Demo', email: 'vendedor@duoc.cl', rol: 'vendedor' }
    })
    const onLogin = jasmine.createSpy('onLogin')
    render(<MemoryRouter><Login onLogin={onLogin} /></MemoryRouter>)
    completar('cliente', 'vendedor@duoc.cl', '1234')

    expect(await screen.findByText('El rol seleccionado no corresponde a este usuario.')).toBeTruthy()
    expect(onLogin).not.toHaveBeenCalled()
  })
})
