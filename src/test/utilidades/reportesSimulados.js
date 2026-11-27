// Ruta de simularApi para GET /api/reportes/ventas, calculada desde una lista de pedidos
// igual que ReporteService del backend (mes actual, total, cantidad y ranking de productos).
// Uso junto a rutasPedidos, compartiendo la misma lista:
//   const pedidos = []
//   simularApi({ ...rutasPedidos(pedidos, productos), ...rutasReportes(pedidos) })
export function rutasReportes(pedidos) {
  return {
    'GET /api/reportes/ventas': () => {
      const ahora = new Date()
      const delMes = pedidos.filter(pedido => {
        const fecha = new Date(pedido.fecha)
        return fecha.getFullYear() === ahora.getFullYear() && fecha.getMonth() === ahora.getMonth()
      })
      const porProducto = {}
      for (const pedido of delMes) {
        for (const linea of pedido.productos) {
          const vendido = porProducto[linea.productoId] ||
            (porProducto[linea.productoId] = { productoId: linea.productoId, nombre: linea.nombre, cantidad: 0, total: 0 })
          vendido.cantidad += linea.cantidad
          vendido.total += linea.subtotal
        }
      }
      return {
        mes: `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`,
        totalVendido: delMes.reduce((total, pedido) => total + pedido.total, 0),
        cantidadPedidos: delMes.length,
        productosMasVendidos: Object.values(porProducto).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5)
      }
    }
  }
} // fin rutasReportes
