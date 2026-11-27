import { useState } from 'react'

// Formulario para crear o editar un producto. onGuardar recibe los datos ya convertidos a número.
function FormularioProducto({ productoInicial = null, categorias = [], onGuardar, onCancelar }) {
  const [formulario, setFormulario] = useState({
    nombre: productoInicial?.nombre || '',
    descripcion: productoInicial?.descripcion || '',
    precio: productoInicial ? String(productoInicial.precio) : '',
    stock: productoInicial ? String(productoInicial.stock) : '',
    categoriaId: productoInicial ? String(productoInicial.categoriaId) : '',
    imagen: productoInicial?.imagen || '',
    oferta: productoInicial?.oferta || false
  })
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  function cambiarCampo(evento) {
    const { name, value, type, checked } = evento.target
    setFormulario(anterior => ({ ...anterior, [name]: type === 'checkbox' ? checked : value }))
  } // fin cambiarCampo

  async function guardar(evento) {
    evento.preventDefault()
    setError('')
    setGuardando(true)
    try {
      await onGuardar({
        nombre: formulario.nombre.trim(),
        descripcion: formulario.descripcion.trim(),
        precio: Number(formulario.precio),
        stock: Number(formulario.stock),
        categoriaId: Number(formulario.categoriaId),
        imagen: formulario.imagen.trim(),
        oferta: formulario.oferta
      })
    } catch (err) {
      // Muestra el mensaje que devuelve la API (por ejemplo, 400 por datos inválidos).
      setError(err.message)
      setGuardando(false)
    }
  } // fin guardar

  return (
    <form onSubmit={guardar} className="card p-4 mb-4" aria-label="Formulario de producto">
      <h2 className="h4">{productoInicial ? 'Editar producto' : 'Nuevo producto'}</h2>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="row g-3">
        <div className="col-md-6">
          <label htmlFor="producto-nombre" className="form-label">Nombre</label>
          <input id="producto-nombre" name="nombre" className="form-control"
            value={formulario.nombre} onChange={cambiarCampo} />
        </div>
        <div className="col-md-6">
          <label htmlFor="producto-categoria" className="form-label">Categoría</label>
          <select id="producto-categoria" name="categoriaId" className="form-select"
            value={formulario.categoriaId} onChange={cambiarCampo}>
            <option value="">Selecciona una categoría</option>
            {categorias.map(categoria => (
              <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
            ))}
          </select>
        </div>
        <div className="col-12">
          <label htmlFor="producto-descripcion" className="form-label">Descripción</label>
          <input id="producto-descripcion" name="descripcion" className="form-control"
            value={formulario.descripcion} onChange={cambiarCampo} />
        </div>
        <div className="col-md-4">
          <label htmlFor="producto-precio" className="form-label">Precio</label>
          <input id="producto-precio" name="precio" type="number" min="0" className="form-control"
            value={formulario.precio} onChange={cambiarCampo} />
        </div>
        <div className="col-md-4">
          <label htmlFor="producto-stock" className="form-label">Stock</label>
          <input id="producto-stock" name="stock" type="number" min="0" className="form-control"
            value={formulario.stock} onChange={cambiarCampo} />
        </div>
        <div className="col-md-4 d-flex align-items-end">
          <div className="form-check">
            <input id="producto-oferta" name="oferta" type="checkbox" className="form-check-input"
              checked={formulario.oferta} onChange={cambiarCampo} />
            <label htmlFor="producto-oferta" className="form-check-label">En oferta</label>
          </div>
        </div>
        <div className="col-12">
          <label htmlFor="producto-imagen" className="form-label">URL de la imagen</label>
          <input id="producto-imagen" name="imagen" className="form-control"
            value={formulario.imagen} onChange={cambiarCampo} placeholder="https://..." />
        </div>
      </div>

      <div className="d-flex gap-2 mt-4">
        <button className="btn btn-success" type="submit" disabled={guardando}>Guardar producto</button>
        <button className="btn btn-outline-secondary" type="button" onClick={onCancelar}>Cancelar</button>
      </div>
    </form>
  )
} // fin FormularioProducto

export default FormularioProducto
