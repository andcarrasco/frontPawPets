import { obtenerDatos } from './api.js'

// GET /api/reportes/ventas: total vendido, cantidad de pedidos y productos más vendidos del mes.
// Sin mes, el backend usa el mes actual. Con mes: obtenerReporteVentas('2026-11').
export function obtenerReporteVentas(mes = null) {
  return obtenerDatos(mes ? `/api/reportes/ventas?mes=${mes}` : '/api/reportes/ventas')
} // fin obtenerReporteVentas

export function formatoPrecio(valor) {
  return `$${valor.toLocaleString('es-CL')}`
} // fin formatoPrecio
