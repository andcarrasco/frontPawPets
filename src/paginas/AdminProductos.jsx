import { useState } from 'react'
import { Link } from 'react-router-dom'
import { obtenerEstadoStock, listarProductosStockCritico, UMBRAL_STOCK_CRITICO } from '../servicios/stock.js'
import { crearProducto, actualizarProducto, eliminarProducto } from '../servicios/catalogo.js'
import FormularioProducto from '../componentes/FormularioProducto.jsx'

// Administración del catálogo: consulta, detalle, filtro de stock y CRUD contra la API.
// onCambio vuelve a pedir los productos a la API (lo entrega App.jsx).
function AdminProductos({ productos = [], categorias = [], onCambio = () => {} }) {
  const [soloCriticos, setSoloCriticos] = useState(false)
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  // null: sin formulario; { producto: null }: crear; { producto }: editar
  const [edicion, setEdicion] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const criticos = listarProductosStockCritico(productos)
  const productosVisibles = soloCriticos ? criticos : productos

  function nombreCategoria(id) {
    const categoria = categorias.find(categoria => categoria.id === id)
    return categoria ? categoria.nombre : 'Sin categoría'
  }

  function abrirFormulario(producto = null) {
    setMensaje('')
    setError('')
    setProductoSeleccionado(null)
    setEdicion({ producto })
  }

  async function guardar(datos) {
    if (edicion.producto) {
      await actualizarProducto(edicion.producto.id, datos)
      setMensaje('Producto actualizado.')
    } else {
      const creado = await crearProducto(datos)
      setMensaje(`Producto creado con el código ${creado.id}.`)
    }
    setEdicion(null)
    onCambio()
  }

  async function eliminar(producto) {
    setMensaje('')
    setError('')
    if (!window.confirm(`¿Eliminar el producto "${producto.nombre}"?`)) return
    try {
      await eliminarProducto(producto.id)
      setMensaje('Producto eliminado.')
      setProductoSeleccionado(null)
      onCambio()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="container py-5">
      <h1>Administración de productos</h1>
      <p>Crea, edita y elimina los productos del catálogo de PawPets.</p>
      <div className="d-flex flex-wrap gap-2 mb-4">
        <button className="btn btn-success" type="button" onClick={() => abrirFormulario()}>Nuevo producto</button>
        <Link className="btn btn-outline-success" to="/admin/categorias">Administrar categorías</Link>
      </div>

      {mensaje && <div className="alert alert-success" role="status">{mensaje}</div>}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {edicion && (
        <FormularioProducto key={edicion.producto ? edicion.producto.id : 'nuevo'}
          productoInicial={edicion.producto} categorias={categorias}
          onGuardar={guardar} onCancelar={() => setEdicion(null)} />
      )}

      <div className={criticos.length > 0 ? 'alert alert-warning' : 'alert alert-success'} role="status">
        Productos con stock crítico o agotado: <strong>{criticos.length}</strong>
      </div>
      <div className="form-check mb-4">
        <input className="form-check-input" id="solo-criticos" type="checkbox" checked={soloCriticos}
          onChange={evento => setSoloCriticos(evento.target.checked)} />
        <label className="form-check-label" htmlFor="solo-criticos">Mostrar solo productos con stock crítico o agotado</label>
      </div>

      {productoSeleccionado && (
        <section className="card p-4 mb-4" aria-label="Detalle administrativo del producto">
          <h2 className="h4">{productoSeleccionado.nombre}</h2>
          <p>{productoSeleccionado.descripcion}</p>
          <p>Categoría: {nombreCategoria(productoSeleccionado.categoriaId)}</p>
          <p>Precio: ${productoSeleccionado.precio.toLocaleString('es-CL')}</p>
          <p>Stock: {productoSeleccionado.stock}</p>
          <p>Oferta: {productoSeleccionado.oferta ? 'Sí' : 'No'}</p>
          <button className="btn btn-outline-secondary align-self-start" type="button"
            onClick={() => setProductoSeleccionado(null)}>Cerrar detalle</button>
        </section>
      )}

      <div className="table-responsive">
        <table className="table table-striped table-bordered align-middle">
          <caption>Productos del catálogo de PawPets</caption>
          <thead className="table-success">
            <tr>
              <th scope="col">Código</th>
              <th scope="col">Producto</th>
              <th scope="col">Categoría</th>
              <th scope="col">Precio</th>
              <th scope="col">Stock</th>
              <th scope="col">Estado</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosVisibles.map(producto => (
              <tr key={producto.id}>
                <th scope="row">{producto.id}</th>
                <td>{producto.nombre}</td>
                <td>{nombreCategoria(producto.categoriaId)}</td>
                <td>${producto.precio.toLocaleString('es-CL')}</td>
                <td>{producto.stock}</td>
                <td>
                  <span className={producto.stock === 0 ? 'badge text-bg-danger'
                    : producto.stock <= UMBRAL_STOCK_CRITICO ? 'badge text-bg-warning' : 'badge text-bg-success'}>
                    {obtenerEstadoStock(producto.stock)}
                  </span>
                </td>
                <td className="text-nowrap">
                  <button className="btn btn-outline-success btn-sm" type="button"
                    aria-label={'Ver detalle de ' + producto.nombre}
                    onClick={() => setProductoSeleccionado(producto)}>Ver detalle</button>
                  <button className="btn btn-outline-primary btn-sm ms-2" type="button"
                    aria-label={'Editar ' + producto.nombre}
                    onClick={() => abrirFormulario(producto)}>Editar</button>
                  <button className="btn btn-outline-danger btn-sm ms-2" type="button"
                    aria-label={'Eliminar ' + producto.nombre}
                    onClick={() => eliminar(producto)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {productosVisibles.length === 0 && (
              <tr><td colSpan="7">{soloCriticos ? 'No hay productos con stock crítico o agotado.' : 'No hay productos para mostrar.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}

export default AdminProductos
