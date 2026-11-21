import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import FormularioUsuario from '../componentes/FormularioUsuario.jsx'
import { buscarUsuario, actualizarUsuario } from '../servicios/usuarios.js'

function EditarUsuario({ onActualizarUsuario }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [error, setError] = useState('')

  // Carga el usuario desde la API (GET /api/usuarios/{id}).
  useEffect(() => {
    buscarUsuario(id)
      .then(setUsuario)
      .catch(err => setError(err.message))
  }, [id])

  if (error) {
    return (
      <main className="container py-5">
        <div className="alert alert-danger">{error}</div>
      </main>
    )
  } // fin if error

  if (!usuario) {
    return <main className="container py-5"><p>Cargando usuario...</p></main>
  } // fin if cargando

  async function guardar(datos) {
    const actualizado = await actualizarUsuario(usuario.id, datos)
    onActualizarUsuario(actualizado)
    navigate('/admin/usuarios')
  } // fin guardar

  function cancelar() {
    navigate('/admin/usuarios')
  } // fin cancelar

  return (
    <main className="container py-5">
      <h1 className="mb-4">Editar usuario</h1>
      <FormularioUsuario
        usuarioInicial={usuario}
        onGuardar={guardar}
        onCancelar={cancelar}
      />
    </main>
  )
} // fin EditarUsuario

export default EditarUsuario
