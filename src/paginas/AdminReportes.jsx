import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { contarProductosStockCritico } from '../servicios/stock.js'
import { listarPedidos } from '../servicios/compras.js'
import { obtenerReporteVentas, formatoPrecio } from '../servicios/reportes.js'

// Reportes con datos de la API: el resumen del mes viene de /api/reportes/ventas
// y la tabla de seguimiento de /api/pedidos (todos los pedidos guardados en MongoDB).
function AdminReportes({ productos = [] }) {
  const [reporte, setReporte] = useState(null)
  const [pedidos, setPedidos] = useState([])
  const [error, setError] = useState('')
  const stockBajo = contarProductosStockCritico(productos)

  useEffect(() => {
    Promise.all([obtenerReporteVentas(), listarPedidos()])
      .then(([reporteMes, todos]) => {
        setReporte(reporteMes)
        setPedidos(todos)
      })
      .catch(err => setError(err.message))
  }, [])

  return (
    <main className="container py-5">
      <p className="text-success fw-bold">Administrador</p>
      <h1>Reportes de ventas y seguimiento</h1>
      <p className="text-muted">Datos de las compras guardadas en la base de datos.</p>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {!error && !reporte && <p>Cargando reportes...</p>}

      <div className="row g-3 my-4">
        <div className="col-md-4">
          <article className="bg-white rounded p-4 h-100">
            <h2 className="h5">Ventas del mes</h2>
            <p className="fs-3 fw-bold">{formatoPrecio(reporte?.totalVendido ?? 0)}</p>
            <p>{reporte?.cantidadPedidos ?? 0} pedidos del mes</p>
          </article>
        </div>

        <div className="col-md-4">
          <article className="bg-white rounded p-4 h-100">
            <h2 className="h5">Pedidos registrados</h2>
            <p className="fs-3 fw-bold">{pedidos.length}</p>
            <p>Total de compras guardadas</p>
          </article>
        </div>

        <div className="col-md-4">
          <article className="bg-white rounded p-4 h-100">
            <h2 className="h5">Stock bajo</h2>
            <p className="fs-3 fw-bold">{stockBajo}</p>
            <p>Revisar reposición</p>
          </article>
        </div>
      </div>

      {reporte?.productosMasVendidos.length > 0 && (
        <>
          <h2 className="h4 mb-3">Productos más vendidos del mes</h2>
          <div className="table-responsive mb-4">
            <table className="table table-bordered bg-white" aria-label="Productos más vendidos">
              <thead className="table-success">
                <tr><th>Producto</th><th>Unidades</th><th>Total</th></tr>
              </thead>
              <tbody>
                {reporte.productosMasVendidos.map(producto => (
                  <tr key={producto.productoId}>
                    <td>{producto.nombre}</td>
                    <td>{producto.cantidad}</td>
                    <td>{formatoPrecio(producto.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h2 className="h4 mb-3">Seguimiento de ventas</h2>

      <div className="table-responsive">
        <table className="table table-bordered bg-white" aria-label="Seguimiento de ventas">
          <thead className="table-success">
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Entrega</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
              {pedidos.map(pedido => (
                <tr key={pedido.id}>
                  <td>#{pedido.id}</td>
                  <td>{pedido.cliente.nombre}</td>
                  <td>{new Date(pedido.fecha).toLocaleDateString("es-CL")}</td>
                  <td>{formatoPrecio(pedido.total)}</td>
                  <td>{pedido.entrega === "domicilio" ? "Domicilio" : "Retiro en tienda"}</td>
                  <td>
                    <Link className="btn btn-outline-success btn-sm" to={`/admin/pedidos/${pedido.id}`}>
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
              {reporte && pedidos.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No hay compras registradas.
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
    </main>
  )
}

export default AdminReportes
