import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ResumenCompra from '../componentes/ResumenCompra.jsx'
import { obtenerPedido } from '../servicios/compras.js'

// Comprobante de un pedido guardado en la API (GET /api/pedidos/{id}).
function DetallePedido() {
  const { id } = useParams()
  const [pedido, setPedido] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    obtenerPedido(id)
      .then(setPedido)
      .catch(err => setError(err.message))
  }, [id])

  if (error) {
    return (
      <main className="container py-5">
        <h1>Pedido no disponible</h1>
        <p>{error}</p>
        <Link to="/admin/reportes">Volver a reportes</Link>
      </main>
    )
  }

  if (!pedido) {
    return <main className="container py-5"><p>Cargando pedido...</p></main>
  }

  return (
    <main className="container py-5">
        <p className="text-muted fw-bold">PAWPETS — COMPROBANTE DE COMPRA SIMULADA (SIN VALIDEZ TRIBUTARIA)</p>
        <h1>Detalle del pedido #{pedido.id}</h1>
        <p><strong>Fecha:</strong> {new Date(pedido.fecha).toLocaleString("es-CL")}</p>
        <p><strong>Cliente:</strong> {pedido.cliente.nombre}</p>
        <p><strong>Correo:</strong> {pedido.cliente.email}</p>
        <p><strong>Entrega:</strong> {pedido.entrega === "domicilio" ? "Despacho a domicilio" : "Retiro en tienda"}</p>
        {pedido.direccion && (
          <p><strong>Dirección:</strong> {pedido.direccion.calle}, {pedido.direccion.comuna}, {pedido.direccion.region}</p>
        )}
        <ResumenCompra lineas={pedido.productos} />
        <div className="d-flex gap-3 mt-4 d-print-none">
          <Link className="btn btn-outline-success" to="/admin/reportes">Volver a reportes</Link>
          <button className="btn btn-success" type="button" onClick={() => window.print()}>
            Imprimir comprobante
          </button>
        </div>
    </main>
  )
}

export default DetallePedido
