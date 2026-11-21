import { useNavigate } from 'react-router-dom'
import FormularioUsuario from '../componentes/FormularioUsuario.jsx'
import { crearUsuario } from '../servicios/usuarios.js'

function NuevoUsuario() {
  const navigate = useNavigate()

  // Si la API responde con error, FormularioUsuario muestra el mensaje.
  async function guardar(datos) {
    await crearUsuario(datos)
    navigate('/admin/usuarios')
  } // fin guardar

  function cancelar() {
    navigate('/admin/usuarios')
  } // fin cancelar

  return (
    <main className="container py-5">
      <h1 className="mb-4">Nuevo usuario</h1>
      <FormularioUsuario
        onGuardar={guardar}
        onCancelar={cancelar}
      />
    </main>
  )
} // fin NuevoUsuario

export default NuevoUsuario
