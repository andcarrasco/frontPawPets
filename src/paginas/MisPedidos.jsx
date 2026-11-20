import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ResumenCompra from '../componentes/ResumenCompra.jsx'
import { listarPedidos } from '../servicios/compras.js'

// Historial de compras del usuario con sesión (GET /api/pedidos?usuarioId=...).
function MisPedidos({ usuario }) {
  const [pedidos, setPedidos] = useState(null)
  const [error, setError] = useState('')
  const usuarioId = usuario?.id

  useEffect(() => {
    if (usuarioId == null) return
    listarPedidos(usuarioId)
      .then(setPedidos)
      .catch(err => setError(err.message))
  }, [usuarioId])

  if (!usuario) {
    return (
      <main className="container py-5">
        <h1>Mis compras</h1>
        <p>Inicia sesión para ver tu historial de compras. <Link to="/login">Ir al login</Link></p>
      </main>
    )
  }

  return (
    <main className="container py-5">
      <h1>Mis compras</h1>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {!error && pedidos === null && <p>Cargando tus compras...</p>}
      {pedidos?.length === 0 && (
        <p>Todavía no tienes compras. <Link to="/productos">Ir al catálogo</Link></p>
      )}
      {pedidos?.map(pedido => (
        <article key={pedido.id} className="card p-4 mb-4">
          <h2 className="h5">Pedido #{pedido.id}</h2>
          <p className="text-muted mb-2">
            {new Date(pedido.fecha).toLocaleString('es-CL')} · {pedido.entrega === 'domicilio' ? 'Despacho a domicilio' : 'Retiro en tienda'}
          </p>
          <ResumenCompra lineas={pedido.productos} />
        </article>
      ))}
    </main>
  )
}

export default MisPedidos
