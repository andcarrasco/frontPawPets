import { render, screen, cleanup, fireEvent, waitForElementToBeRemoved } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import AdminUsuarios from '../paginas/AdminUsuarios.jsx'
import EditarUsuario from '../paginas/EditarUsuario.jsx'
import Registro from '../paginas/Registro.jsx'
import { simularApi } from './utilidades/simularApi.js'
import { rutasUsuarios } from './utilidades/usuariosSimulados.js'

function usuariosDemo() {
  return [
    { id: 1, nombre: 'Administrador Demo', email: 'administrador@duoc.cl', password: '1234', rol: 'administrador', region: 'Metropolitana' },
    { id: 3, nombre: 'Cliente Demo', email: 'cliente@gmail.com', password: '1234', rol: 'cliente', rut: '123456785', region: 'Valparaíso', comuna: 'Viña del Mar' }
  ]
}

// Revisa la administración de usuarios y el registro contra la API simulada.
describe('Usuarios con la API', () => {
  afterEach(() => cleanup())

  // Datos: La API tiene a Administrador Demo y Cliente Demo.
  // Acción: Abrir la administración de usuarios.
  // Resultado esperado: Aparecen ambos usuarios en la tabla.
  it('lista los usuarios que entrega la API', async () => {
    simularApi(rutasUsuarios(usuariosDemo()))
    render(<MemoryRouter><AdminUsuarios /></MemoryRouter>)

    expect(await screen.findByText('Cliente Demo')).toBeTruthy()
    expect(screen.getByText('Administrador Demo')).toBeTruthy()
  })

  // Datos: La API tiene a Cliente Demo.
  // Acción: Pulsar Eliminar en Cliente Demo y confirmar.
  // Resultado esperado: Se envía DELETE a /api/usuarios/3 y el usuario desaparece de la tabla.
  it('elimina un usuario y vuelve a pedir la lista', async () => {
    spyOn(window, 'confirm').and.returnValue(true)
    const api = simularApi(rutasUsuarios(usuariosDemo()))
    render(<MemoryRouter><AdminUsuarios /></MemoryRouter>)

    fireEvent.click(await screen.findByRole('button', { name: 'Eliminar Cliente Demo' }))

    await waitForElementToBeRemoved(() => screen.queryByText('Cliente Demo'))
    expect(api.llamadas.some(llamada => llamada.metodo === 'DELETE' && llamada.ruta === '/api/usuarios/3')).toBeTrue()
  })

  // Datos: Cliente Demo en la API y la contraseña del formulario vacía.
  // Acción: Abrir su edición, cambiar el nombre y guardar.
  // Resultado esperado: El PUT lleva el nombre nuevo, no envía contraseña y se vuelve a la lista.
  it('edita un usuario sin enviar la contraseña si no se cambia', async () => {
    const api = simularApi(rutasUsuarios(usuariosDemo()))
    const onActualizarUsuario = jasmine.createSpy('onActualizarUsuario')
    render(
      <MemoryRouter initialEntries={['/admin/usuarios/3']}>
        <Routes>
          <Route path="/admin/usuarios/:id" element={<EditarUsuario onActualizarUsuario={onActualizarUsuario} />} />
          <Route path="/admin/usuarios" element={<h1>Lista de usuarios</h1>} />
        </Routes>
      </MemoryRouter>
    )

    fireEvent.change(await screen.findByLabelText('Nombre completo'), { target: { value: 'Cliente Editado' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar usuario' }))

    expect(await screen.findByRole('heading', { name: 'Lista de usuarios' })).toBeTruthy()
    const put = api.llamadas.find(llamada => llamada.metodo === 'PUT')
    expect(put.cuerpo.nombre).toBe('Cliente Editado')
    expect('password' in put.cuerpo).toBeFalse()
    expect(onActualizarUsuario).toHaveBeenCalled()
  })

  // Datos: La API ya tiene registrado cliente@gmail.com.
  // Acción: Completar el registro con ese correo y pulsar Crear cuenta.
  // Resultado esperado: Se muestra bajo el correo el mensaje 409 del backend.
  it('avisa en el registro que el correo ya existe', async () => {
    simularApi(rutasUsuarios(usuariosDemo()))
    render(<MemoryRouter><Registro /></MemoryRouter>)

    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Persona Nueva' } })
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'cliente@gmail.com' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: '1234' } })
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: '1234' } })
    fireEvent.change(screen.getByLabelText(/RUT/), { target: { value: '123456785' } })
    fireEvent.change(screen.getByLabelText('Región'), { target: { value: 'Metropolitana' } })
    fireEvent.change(screen.getByLabelText('Comuna'), { target: { value: 'Santiago' } })
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('Ya existe un usuario con ese correo.')).toBeTruthy()
  })
})
