import { useState } from 'react'
import ListaProductos from '../componentes/ListaProductos.jsx'

function Catalogo({ productos, cargando, error, onAgregar }) {
  const [busqueda, setBusqueda] = useState('')
  const filtrados = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())
  )

  return (
    <main className="container py-4">
      <h1>Productos PawPets</h1>
      <div className="mb-4">
        <label className="form-label" htmlFor="buscar-producto">Buscar por nombre</label>
        <input className="form-control" id="buscar-producto" type="search" value={busqueda}
          onChange={evento => setBusqueda(evento.target.value)} />
      </div>
      {error && <p role="alert">No se pudo cargar el catálogo.</p>}
      {!error && cargando && <p role="status">Cargando productos…</p>}
      <ListaProductos productos={filtrados} onAgregar={onAgregar} />
    </main>
  )
}

export default Catalogo
