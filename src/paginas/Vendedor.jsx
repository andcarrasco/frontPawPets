import { useEffect, useState } from 'react'
import { obtenerSesion } from '../servicios/sesion.js'
import { listarUsuarios } from '../servicios/usuarios.js'
import { obtenerReporteVentas, formatoPrecio } from '../servicios/reportes.js'
import { Navigate, useNavigate } from 'react-router-dom'

function Vendedor({ productos, onCerrarSesion }) {
  const sesion = obtenerSesion()
  const navigate = useNavigate()
  const [clientes, setClientes] = useState([])
  const [errorClientes, setErrorClientes] = useState('')
  const [ventas, setVentas] = useState(null)
  const [errorVentas, setErrorVentas] = useState('')

  // Los clientes se piden a la API al abrir el panel.
  useEffect(() => {
    listarUsuarios()
      .then(usuarios => setClientes(usuarios.filter(u => u.rol === 'cliente')))
      .catch(err => setErrorClientes(err.message))
  }, [])

  // Ventas del mes desde GET /api/reportes/ventas.
  useEffect(() => {
    obtenerReporteVentas()
      .then(setVentas)
      .catch(err => setErrorVentas(err.message))
  }, [])

  if (!sesion) {
    return <Navigate to="/login" replace />
  } // fin if no sesion

  if (sesion.rol !== 'vendedor') {
    return <Navigate to="/" replace />
  } // fin if rol incorrecto

  function handleCerrarSesion() {
    onCerrarSesion()
    navigate('/login')
  } // fin handleCerrarSesion

  return (
    <main className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Panel Vendedor</h1>
          {sesion && (
            <p className="text-muted">Bienvenido, {sesion.nombre}</p>
          )}
        </div>
        <button
          className="btn btn-outline-danger"
          onClick={handleCerrarSesion}
        >
          Cerrar sesión
        </button>
      </div>

      <div className="row g-4">

        <div className="col-12">
          <div className="card p-4">
            <h3>Inventario</h3>
            <p className="text-muted">Productos disponibles en la tienda.</p>
            <div className="table-responsive">
              <table className="table table-striped table-bordered align-middle">
                <thead className="table-success">
                  <tr>
                    <th>ID</th>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map(producto => (
                    <tr key={producto.id}>
                      <td>{producto.id}</td>
                      <td>{producto.nombre}</td>
                      <td>${producto.precio.toLocaleString('es-CL')}</td>
                      <td>{producto.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* fin card inventario */}

        <div className="col-12">
          <div className="card p-4">
            <h3>Mis clientes</h3>
            <p className="text-muted">Listado de clientes registrados.</p>
            {errorClientes && <div className="alert alert-warning">{errorClientes}</div>}
            <div className="table-responsive">
              <table className="table table-striped table-bordered align-middle">
                <thead className="table-success">
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Región</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map(cliente => (
                    <tr key={cliente.id}>
                      <td>{cliente.id}</td>
                      <td>{cliente.nombre}</td>
                      <td>{cliente.email}</td>
                      <td>{cliente.region}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* fin card clientes */}

        <div className="col-12">
          <div className="card p-4">
            <h3>Mis ventas</h3>
            <p className="text-muted">Ventas de la tienda durante el mes actual.</p>
            {errorVentas && <div className="alert alert-warning">{errorVentas}</div>}
            {ventas && (
              <>
                <p className="fs-4 fw-bold mb-1">{formatoPrecio(ventas.totalVendido)}</p>
                <p>{ventas.cantidadPedidos} pedidos este mes</p>
                {ventas.productosMasVendidos.length > 0 && (
                  <ul className="list-group">
                    {ventas.productosMasVendidos.map(producto => (
                      <li key={producto.productoId} className="list-group-item d-flex justify-content-between">
                        <span>{producto.nombre}</span>
                        <span>{producto.cantidad} unidades</span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
        {/* fin card ventas */}

      </div>
    </main>
  )
} // fin Vendedor

export default Vendedor
