import { useState } from 'react'
import { Link } from 'react-router-dom'
import { crearCategoria, actualizarCategoria, eliminarCategoria } from '../servicios/catalogo.js'

// Administración de categorías con CRUD contra la API.
// onCambio vuelve a pedir las categorías a la API (lo entrega App.jsx).
function AdminCategorias({ categorias = [], productos = [], onCambio = () => {} }) {
  const [nombre, setNombre] = useState('')
  const [editando, setEditando] = useState(null) // categoría en edición o null
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  function limpiarAvisos() {
    setMensaje('')
    setError('')
  }

  function empezarEdicion(categoria) {
    limpiarAvisos()
    setEditando(categoria)
    setNombre(categoria.nombre)
  }

  function cancelarEdicion() {
    setEditando(null)
    setNombre('')
  }

  async function guardar(evento) {
    evento.preventDefault()
    limpiarAvisos()
    try {
      if (editando) {
        await actualizarCategoria(editando.id, { nombre: nombre.trim() })
        setMensaje('Categoría actualizada.')
      } else {
        await crearCategoria({ nombre: nombre.trim() })
        setMensaje('Categoría creada.')
      }
      cancelarEdicion()
      onCambio()
    } catch (err) {
      setError(err.message)
    }
  }

  async function eliminar(categoria) {
    limpiarAvisos()
    if (!window.confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) return
    try {
      await eliminarCategoria(categoria.id)
      setMensaje('Categoría eliminada.')
      onCambio()
    } catch (err) {
      // Por ejemplo, 409 si la categoría todavía tiene productos.
      setError(err.message)
    }
  }

  return (
    <main className="container py-5">
      <h1>Administración de categorías</h1>
      <p>Crea, edita y elimina las categorías del catálogo de PawPets.</p>
      <Link className="btn btn-outline-success mb-4" to="/admin/productos">Administrar productos</Link>

      {mensaje && <div className="alert alert-success" role="status">{mensaje}</div>}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <form onSubmit={guardar} className="card p-4 mb-4" aria-label="Formulario de categoría">
        <label htmlFor="categoria-nombre" className="form-label">
          {editando ? `Nuevo nombre para la categoría ${editando.id}` : 'Nombre de la nueva categoría'}
        </label>
        <div className="d-flex flex-wrap gap-2">
          <input id="categoria-nombre" className="form-control w-auto flex-grow-1" value={nombre}
            onChange={evento => setNombre(evento.target.value)} />
          <button className="btn btn-success" type="submit">{editando ? 'Guardar cambios' : 'Agregar categoría'}</button>
          {editando && <button className="btn btn-outline-secondary" type="button" onClick={cancelarEdicion}>Cancelar</button>}
        </div>
      </form>

      <div className="table-responsive">
        <table className="table table-striped table-bordered align-middle">
          <caption>Categorías del catálogo de PawPets</caption>
          <thead className="table-success">
            <tr>
              <th scope="col">Código</th>
              <th scope="col">Categoría</th>
              <th scope="col">Productos</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map(categoria => (
              <tr key={categoria.id}>
                <th scope="row">{categoria.id}</th>
                <td>{categoria.nombre}</td>
                <td>{productos.filter(producto => producto.categoriaId === categoria.id).length}</td>
                <td className="text-nowrap">
                  <button className="btn btn-outline-primary btn-sm" type="button"
                    aria-label={'Editar ' + categoria.nombre} onClick={() => empezarEdicion(categoria)}>Editar</button>
                  <button className="btn btn-outline-danger btn-sm ms-2" type="button"
                    aria-label={'Eliminar ' + categoria.nombre} onClick={() => eliminar(categoria)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {categorias.length === 0 && (
              <tr><td colSpan="4">No hay categorías para mostrar.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}

export default AdminCategorias
