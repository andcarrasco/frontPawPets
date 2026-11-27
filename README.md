# PawPets

Tienda de productos para mascotas hecha con React y Vite para la asignatura Desarrollo Full Stack II (DSY1104) de Duoc UC.
En la Evaluación 3 el frontend deja de usar datos fijos y pide el catálogo, los usuarios, los pedidos y los reportes a la API de
[backPawPets](https://github.com/andcarrasco/backPawPets), que trabaja con Spring Boot y MongoDB Atlas.

Sitio publicado: https://caso3pawpetsfinal-production.up.railway.app

## Integrantes

- María Pía Sepúlveda ([Piita3569](https://github.com/Piita3569))
- Andrés Carrasco ([andcarrasco](https://github.com/andcarrasco))
- Luis Veas ([luchovduoc](https://github.com/luchovduoc))
- Pablo Rojas ([pablorojas1983](https://github.com/pablorojas1983))

## Desarrollo

Necesitas Node.js y npm. Primero inicia la API en una terminal siguiendo las instrucciones de
[backPawPets](https://github.com/andcarrasco/backPawPets). En otra terminal, clona este repositorio e inicia Vite.

```sh
git clone https://github.com/andcarrasco/frontPawPets.git
cd frontPawPets
npm ci
npm run dev
```

Abre la dirección que indica Vite (normalmente http://localhost:5173). Durante el desarrollo, Vite reenvía `/api`
al backend en `http://localhost:8081`. Si cambias el puerto del backend, actualiza `server.proxy` en `vite.config.js`.

Para entrar como administrador se puede usar `administrador@duoc.cl` con la clave `1234`.

## Comprobaciones

```sh
npm run lint
npm run build
npm test -- --single-run
```

Las pruebas usan Jasmine y Karma y necesitan Chrome instalado. No hace falta tener el backend levantado, porque las
llamadas a la API se simulan con `src/test/utilidades/simularApi.js`. El informe de cobertura queda en
`coverage/html/index.html`.

## Conexión con la API

Todas las llamadas pasan por `src/servicios/api.js`, que usa `fetch`. Si la API responde con un error, se muestra en
pantalla el mensaje que manda el backend (por ejemplo, cuando un correo ya está registrado).

La dirección del backend no está escrita en el código. En desarrollo la variable `VITE_API_URL` queda vacía y se usa
el proxy de Vite. En Railway se define con la URL pública del backend (ver `.env.example`). Como Vite la incorpora al
compilar, si cambia hay que volver a desplegar el frontend.

## Organización

- `src/App.jsx`: rutas de la aplicación y carga del catálogo.
- `src/hooks/useDatosApi.js`: pide datos a la API y entrega la carga y el error a las páginas.
- `src/servicios/`: llamadas a la API (`api.js`, `usuarios.js`, `compras.js`, `reportes.js`), sesión, carrito y stock.
- `src/componentes/`: Header, Footer, tarjetas de producto, formulario de usuario y `RutaProtegida`.
- `src/paginas/`: tienda, carrito, checkout, login, registro, perfil, panel de vendedor y administración.
- `src/test/`: pruebas con Jasmine. Cada caso indica antes del `it` los datos, la acción y el resultado esperado.

## Usuarios y roles

Hay tres roles: cliente, vendedor y administrador. El cliente compra en la tienda, el vendedor revisa productos y
pedidos, y el administrador además gestiona productos, categorías y usuarios y revisa los reportes de ventas
del mes, que se calculan en el backend. La sesión se guarda en `sessionStorage` y `RutaProtegida` no deja entrar a páginas que no corresponden al rol.

El login revisa el correo y la clave contra la API, pero no usa tokens. El pago es una simulación: se puede elegir si
sale exitoso o fallido para probar los dos casos.

## Despliegue

El repositorio está conectado a Railway y cada push a `main` vuelve a publicar el sitio. Railway detecta el proyecto
Vite, ejecuta `npm run build` y sirve la carpeta `dist`.

## Historial

La Evaluación 2 se hizo en [Piita3569/Caso3_PawPets_React](https://github.com/Piita3569/Caso3_PawPets_React), donde
están los commits y aportes de esa etapa. Este repositorio parte de una copia de esa versión.
