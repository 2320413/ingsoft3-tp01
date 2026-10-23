import { useEffect, useState } from 'react'
import './App.css'
import {
  cargarVehiculos,
  filtrarVehiculosFavoritos,
} from './lib/vehiculos'
import {
  crearMensajeCompra,
  crearUrlWhatsApp,
} from './lib/contacto'

const imagenesVehiculos = {
  Adder: [
    '/autos/Legendary Motorsports/Adder/Adder1.png',
    '/autos/Legendary Motorsports/Adder/Adder2.png',
  ],

  Zentorno: [
    '/autos/Legendary Motorsports/Zentorno/Zentorno1.png',
    '/autos/Legendary Motorsports/Zentorno/Zentorno2.png',
  ],

  Banshee: [
    '/autos/Southern San Andreas/Banshee/Banshee1.png',
    '/autos/Southern San Andreas/Banshee/Banshee2.png',
  ],
}

function App() {
  const [vehiculos, setVehiculos] = useState([])
  const [buscar, setBuscar] = useState('')
  const [concesionaria, setConcesionaria] = useState('')
  const [seleccionado, setSeleccionado] = useState(null)

  const [favoritos, setFavoritos] = useState([])
  const [mostrarLogin, setMostrarLogin] = useState(false)
  const [mostrarConfirmarLogout, setMostrarConfirmarLogout] = useState(false)
  const [mostrarFavoritos, setMostrarFavoritos] = useState(false)
  const [usuario, setUsuario] = useState(null)
  const [motivoLogin, setMotivoLogin] = useState('')

  const [mostrarVenta, setMostrarVenta] = useState(false)
  const [publicacionesPropias, setPublicacionesPropias] = useState([])
  const [vehiculoAEliminar, setVehiculoAEliminar] = useState(null)

  useEffect(() => {
    const sesionGuardada = localStorage.getItem('losSantosSession')

    if (!sesionGuardada) return

    try {
      const sesion = JSON.parse(sesionGuardada)

      if (new Date(sesion.expira) > new Date()) {
        setUsuario(sesion.usuario)
      } else {
        localStorage.removeItem('losSantosSession')
      }
    } catch {
      localStorage.removeItem('losSantosSession')
    }
  }, [])

  useEffect(() => {
    if (!usuario?.email) {
      setFavoritos([])
      setMostrarFavoritos(false)
      return
    }

    try {
      const favoritosGuardados = JSON.parse(
        localStorage.getItem(`losSantosFavorites:${usuario.email}`)
      ) || []

      setFavoritos(favoritosGuardados)
    } catch {
      setFavoritos([])
    }
  }, [usuario])

  useEffect(() => {
    if (!usuario?.email) {
      setPublicacionesPropias([])
      return
    }

    try {
      const publicacionesGuardadas = JSON.parse(
        localStorage.getItem(`losSantosPublicaciones:${usuario.email}`)
      ) || []

      setPublicacionesPropias(publicacionesGuardadas)
    } catch {
      setPublicacionesPropias([])
    }
  }, [usuario])

  const guardarPublicacionesPropias = (nuevasPublicaciones) => {
    setPublicacionesPropias(nuevasPublicaciones)

    if (usuario?.email) {
      localStorage.setItem(
        `losSantosPublicaciones:${usuario.email}`,
        JSON.stringify(nuevasPublicaciones)
      )
    }
  }

  const iniciarSesion = (usuarioNuevo) => {
    const fechaExpiracion = new Date()
    fechaExpiracion.setMonth(fechaExpiracion.getMonth() + 3)

    localStorage.setItem(
      'losSantosSession',
      JSON.stringify({
        usuario: usuarioNuevo,
        expira: fechaExpiracion.toISOString(),
      })
    )

    setUsuario(usuarioNuevo)
  }

  const cerrarSesion = () => {
    localStorage.removeItem('losSantosSession')
    setUsuario(null)
    setFavoritos([])
    setPublicacionesPropias([])
    setMostrarFavoritos(false)
    setMostrarConfirmarLogout(false)
    setMostrarVenta(false)
    setVehiculoAEliminar(null)
    setSeleccionado(null)
  }

  useEffect(() => {
    cargarVehiculos(buscar, concesionaria)
      .then((data) => setVehiculos(data))
      .catch((error) =>
        console.error('Error cargando vehículos:', error)
      )
  }, [buscar, concesionaria])

  const exigirLogin = (mensaje) => {
    if (usuario) {
      return true
    }

    setMotivoLogin(mensaje)
    setMostrarLogin(true)
    return false
  }

  const toggleFavorito = (id) => {
    if (!exigirLogin('Iniciá sesión para guardar vehículos en favoritos.')) {
      return
    }

    setFavoritos((favoritosActuales) => {
      const nuevosFavoritos = favoritosActuales.includes(id)
        ? favoritosActuales.filter((favoritoId) => favoritoId !== id)
        : [...favoritosActuales, id]

      localStorage.setItem(
        `losSantosFavorites:${usuario.email}`,
        JSON.stringify(nuevosFavoritos)
      )

      return nuevosFavoritos
    })
  }

  const venderVehiculo = () => {
    if (!exigirLogin('Iniciá sesión para publicar un vehículo.')) {
      return
    }

    setMostrarVenta(true)
  }

  const publicarVehiculo = async (datos) => {
    if (!exigirLogin('Iniciá sesión para publicar un vehículo.')) {
      throw new Error('Debés iniciar sesión para publicar un vehículo.')
    }

    const respuesta = await fetch('/api/vehiculos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datos),
    })

    if (!respuesta.ok) {
      const error = await respuesta.json().catch(() => ({}))
      throw new Error(error.error || 'No se pudo publicar el vehículo.')
    }

    const creado = await respuesta.json()

    setVehiculos((actuales) =>
      [...actuales, creado].sort((a, b) => a.precio - b.precio)
    )

    guardarPublicacionesPropias([
      ...publicacionesPropias,
      creado.id,
    ])

    return creado
  }

  const eliminarPublicacion = async (id) => {
    if (!exigirLogin('Iniciá sesión para eliminar una publicación.')) {
      return
    }

    if (!publicacionesPropias.includes(id)) {
      throw new Error('No podés eliminar una publicación que no te pertenece.')
    }

    const respuesta = await fetch(`/api/vehiculos/${id}`, {
      method: 'DELETE',
    })

    if (!respuesta.ok) {
      throw new Error('No se pudo eliminar la publicación.')
    }

    setVehiculos((actuales) =>
      actuales.filter((vehiculo) => vehiculo.id !== id)
    )

    guardarPublicacionesPropias(
      publicacionesPropias.filter((vehiculoId) => vehiculoId !== id)
    )

    if (seleccionado?.id === id) {
      setSeleccionado(null)
    }
  }

  const vehiculosVisibles = filtrarVehiculosFavoritos(
    vehiculos,
    favoritos,
    mostrarFavoritos
  )

  // ==================================================
  // DETALLE
  // ==================================================

  if (seleccionado) {
    const imagenDetalle =
      seleccionado.imagenDetalleUrl ||
      imagenesVehiculos[seleccionado.nombre]?.[1] ||
      seleccionado.imagenUrl

    return (
      <div className="app">

        <header className="topbar">
          <button
            className="logo logo-button"
            onClick={() => setSeleccionado(null)}
          >
            <span>Los Santos</span>
            <small>AUTO MARKET</small>
          </button>

          <div className="search-container">
            <span className="search-icon">⌕</span>

            <input
              className="buscador-top"
              placeholder="Buscar autos..."
              value={buscar}
              onChange={(e) => {
                setBuscar(e.target.value)
                setSeleccionado(null)
              }}
            />
          </div>

          <div className="top-actions">
            <button
              className="top-link"
              onClick={venderVehiculo}
            >
              Sell With Us
            </button>

            <button
              className="login"
              onClick={() => {
                if (usuario) {
                  setMostrarConfirmarLogout(true)
                } else {
                  setMotivoLogin('')
                  setMostrarLogin(true)
                }
              }}
            >
              {usuario ? 'Log Out' : 'Log In or Sign Up'}
            </button>
          </div>
        </header>

        <main className="detalle-page">

          <button
            className="volver"
            onClick={() => setSeleccionado(null)}
          >
            ← Volver al catálogo
          </button>

          <div className="detalle-moderno">

            <div className="detalle-imagen-wrapper">
              {imagenDetalle ? (
                <img
                  className="imagen-detalle"
                  src={imagenDetalle}
                  alt={`${seleccionado.nombre} detalle`}
                />
              ) : (
                <div className="sin-imagen">
                  Sin imagen
                </div>
              )}

              <button
                className={`favorito detalle-favorito ${
                  favoritos.includes(seleccionado.id)
                    ? 'favorito-activo'
                    : ''
                }`}
                onClick={() => toggleFavorito(seleccionado.id)}
                aria-label="Favorito"
              >
                ♥
              </button>
            </div>

            <div className="detalle-info">

              <span className="detalle-categoria">
                {seleccionado.categoria}
              </span>

              <h1>
                {seleccionado.marca} {seleccionado.nombre}
              </h1>

              <p className="detalle-concesionaria">
                {seleccionado.concesionaria}
              </p>

              <div className="precio-detalle">
                ${seleccionado.precio.toLocaleString()}
              </div>

              <div className="estado">
                <span className="estado-punto"></span>

                {seleccionado.disponible
                  ? 'Disponible para compra'
                  : 'No disponible'}
              </div>

              <button
                className="comprar"
                onClick={() => {
                  const mensaje = crearMensajeCompra(seleccionado)
                  const url = crearUrlWhatsApp(mensaje)

                  window.open(url, '_blank')
                }}
              >
                Contactar por WhatsApp
              </button>

              {usuario &&
                publicacionesPropias.includes(seleccionado.id) && (
                  <button
                    type="button"
                    className="eliminar-publicacion"
                    aria-label={`Eliminar ${seleccionado.nombre}`}
                    onClick={() => setVehiculoAEliminar(seleccionado)}
                  >
                    Eliminar publicación
                  </button>
                )}

            </div>

          </div>

        </main>

        {mostrarLogin && (
          <LoginModal
            cerrar={() => {
              setMostrarLogin(false)
              setMotivoLogin('')
            }}
            iniciarSesion={iniciarSesion}
            mensajeInicial={motivoLogin}
          />
        )}

        {vehiculoAEliminar && (
          <ConfirmDeleteModal
            vehiculo={vehiculoAEliminar}
            cancelar={() => setVehiculoAEliminar(null)}
            confirmar={async () => {
              try {
                await eliminarPublicacion(vehiculoAEliminar.id)
                setVehiculoAEliminar(null)
              } catch (error) {
                console.error(error)
              }
            }}
          />
        )}

        {mostrarConfirmarLogout && (
          <ConfirmLogoutModal
            cancelar={() => setMostrarConfirmarLogout(false)}
            confirmar={cerrarSesion}
          />
        )}

        {mostrarVenta && (
          <VentaModal
            cerrar={() => setMostrarVenta(false)}
            publicar={publicarVehiculo}
          />
        )}

      </div>
    )
  }

  // ==================================================
  // CATÁLOGO
  // ==================================================

  return (
    <div className="app">

      <header className="topbar">

        <div className="logo">
          <span>LOS SANTOS</span>
          <small>AUTO MARKET</small>
        </div>

        <div className="search-container">
          <span className="search-icon">⌕</span>

          <input
            className="buscador-top"
            type="text"
            placeholder="Buscar autos..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
        </div>

        <div className="top-actions">

          <button
            className="top-link"
            onClick={venderVehiculo}
          >
            Sell With Us
          </button>

          <button
            className="login"
            onClick={() => {
              if (usuario) {
                setMostrarConfirmarLogout(true)
              } else {
                setMotivoLogin('')
                setMostrarLogin(true)
              }
            }}
          >
            {usuario ? 'Log Out' : 'Log In or Sign Up'}
          </button>

        </div>

      </header>

      {/* FILTRO POR CONCESIONARIA */}

      <nav className="categorias-nav">

        <button
          className={!mostrarFavoritos && concesionaria === '' ? 'activo' : ''}
          onClick={() => {
            setMostrarFavoritos(false)
            setConcesionaria('')
          }}
        >
          Todos
        </button>

        {usuario && (
          <button
            className={mostrarFavoritos ? 'activo' : ''}
            onClick={() => {
              setConcesionaria('')
              setMostrarFavoritos(true)
            }}
          >
            Tus likeados ({favoritos.length})
          </button>
        )}

        <button
          className={
            !mostrarFavoritos &&
            concesionaria === 'Legendary Motorsport'
              ? 'activo'
              : ''
          }
          onClick={() => {
            setMostrarFavoritos(false)
            setConcesionaria('Legendary Motorsport')
          }}
        >
          Legendary Motorsport
        </button>

        <button
          className={
            !mostrarFavoritos &&
            concesionaria ===
            'Southern San Andreas Super Autos'
              ? 'activo'
              : ''
          }
          onClick={() => {
            setMostrarFavoritos(false)
            setConcesionaria(
              'Southern San Andreas Super Autos'
            )
          }}
        >
          Southern San Andreas Super Autos
        </button>

      </nav>

      <main className="contenido">

        <div className="titulo-seccion">

          <h2>{mostrarFavoritos ? 'Tus likeados' : 'Featured Vehicles - New Version'}</h2>

          <span>
            {vehiculosVisibles.length}{' '}
            {vehiculosVisibles.length === 1
              ? 'vehículo'
              : 'vehículos'}
          </span>

        </div>

        {mostrarFavoritos && vehiculosVisibles.length === 0 && (
          <p className="sin-favoritos">
            Todavía no likeaste ningún vehículo.
          </p>
        )}

        <div className="vehiculos-grid">

          {vehiculosVisibles.map((vehiculo) => (

            <article
              className="vehiculo-card"
              key={vehiculo.id}
            >

              <div className="imagen-wrapper">

                {vehiculo.imagenUrl ? (
                  <img
                    className="imagen-principal"
                    src={vehiculo.imagenUrl}
                    alt={`${vehiculo.nombre} portada`}
                  />
                ) : (
                  <div className="sin-imagen">
                    Sin imagen
                  </div>
                )}

                <button
                  className={`favorito ${
                    favoritos.includes(vehiculo.id)
                      ? 'favorito-activo'
                      : ''
                  }`}
                  onClick={() => toggleFavorito(vehiculo.id)}
                  aria-label="Favorito"
                >
                  ♥
                </button>

              </div>

              <div className="vehiculo-info">

                <div className="card-superior">

                  <p className="precio">
                    ${vehiculo.precio.toLocaleString()}
                  </p>

                </div>

                <h3>
                  {vehiculo.marca} {vehiculo.nombre}
                </h3>

                <p className="categoria-card">
                  {vehiculo.categoria}
                </p>

                <p className="concesionaria-card">
                  {vehiculo.concesionaria}
                </p>

                <button
                  className="ver-vehiculo"
                  onClick={() =>
                    setSeleccionado(vehiculo)
                  }
                >
                  Ver vehículo
                </button>

                {usuario &&
                  publicacionesPropias.includes(vehiculo.id) && (
                    <button
                      type="button"
                      className="eliminar-publicacion"
                      aria-label={`Eliminar ${vehiculo.nombre}`}
                      onClick={() => setVehiculoAEliminar(vehiculo)}
                    >
                      Eliminar publicación
                    </button>
                  )}

              </div>

            </article>

          ))}

        </div>

      </main>

      {mostrarLogin && (
        <LoginModal
          cerrar={() => {
            setMostrarLogin(false)
            setMotivoLogin('')
          }}
          iniciarSesion={iniciarSesion}
          mensajeInicial={motivoLogin}
        />
      )}

      {vehiculoAEliminar && (
        <ConfirmDeleteModal
          vehiculo={vehiculoAEliminar}
          cancelar={() => setVehiculoAEliminar(null)}
          confirmar={async () => {
            try {
              await eliminarPublicacion(vehiculoAEliminar.id)
              setVehiculoAEliminar(null)
            } catch (error) {
              console.error(error)
            }
          }}
        />
      )}

      {mostrarConfirmarLogout && (
        <ConfirmLogoutModal
          cancelar={() => setMostrarConfirmarLogout(false)}
          confirmar={cerrarSesion}
        />
      )}

      {mostrarVenta && (
        <VentaModal
          cerrar={() => setMostrarVenta(false)}
          publicar={publicarVehiculo}
        />
      )}

    </div>
  )
}


// ==================================================
// CONFIRMACIÓN DE CIERRE DE SESIÓN
// ==================================================

function ConfirmLogoutModal({ cancelar, confirmar }) {
  return (
    <div
      className="modal-fondo"
      onClick={cancelar}
    >
      <div
        className="modal-login"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>¿Cerrar sesión?</h2>

        <p>
          Vas a salir de tu cuenta. Tus vehículos likeados y publicaciones
          quedarán guardados para la próxima vez que inicies sesión.
        </p>

        <button
          type="button"
          className="modal-submit"
          onClick={confirmar}
        >
          Sí, cerrar sesión
        </button>

        <button
          type="button"
          className="cambiar-login"
          onClick={cancelar}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}


// ==================================================
// MODAL LOGIN
// ==================================================

function LoginModal({ cerrar, iniciarSesion, mensajeInicial }) {
  const [registro, setRegistro] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState(mensajeInicial || '')

  const emailValido = (emailIngresado) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailIngresado)
  }

  const hashPassword = async (passwordIngresada) => {
    const datos = new TextEncoder().encode(passwordIngresada)
    const hash = await crypto.subtle.digest('SHA-256', datos)

    return Array.from(new Uint8Array(hash))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')
  }

  const obtenerCuentas = () => {
    try {
      return JSON.parse(localStorage.getItem('losSantosAccounts')) || []
    } catch {
      return []
    }
  }

  const manejarSubmit = async (e) => {
    e.preventDefault()
    setMensaje('')

    const emailNormalizado = email.trim().toLowerCase()

    if (!emailValido(emailNormalizado)) {
      setMensaje('Ingresá una dirección de email válida.')
      return
    }

    if (password.length < 8) {
      setMensaje('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    const cuentas = obtenerCuentas()
    const passwordHash = await hashPassword(password)

    if (registro) {
      const cuentaExistente = cuentas.find(
        (cuenta) => cuenta.email === emailNormalizado
      )

      if (cuentaExistente) {
        setMensaje('Ya existe una cuenta registrada con ese email.')
        return
      }

      const nuevasCuentas = [
        ...cuentas,
        {
          email: emailNormalizado,
          passwordHash,
        },
      ]

      localStorage.setItem(
        'losSantosAccounts',
        JSON.stringify(nuevasCuentas)
      )

      iniciarSesion({
        email: emailNormalizado,
      })

      cerrar()
      return
    }

    const cuenta = cuentas.find(
      (cuentaActual) => cuentaActual.email === emailNormalizado
    )

    if (!cuenta || cuenta.passwordHash !== passwordHash) {
      setMensaje('Email o contraseña incorrectos.')
      return
    }

    iniciarSesion({
      email: emailNormalizado,
    })

    cerrar()
  }

  const cambiarModo = () => {
    setRegistro(!registro)
    setMensaje('')
    setEmail('')
    setPassword('')
  }

  return (
    <div
      className="modal-fondo"
      onClick={cerrar}
    >
      <div
        className="modal-login"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-cerrar"
          onClick={cerrar}
          aria-label="Cerrar"
        >
          ×
        </button>

        <h2>
          {registro ? 'Crear cuenta' : 'Bienvenido'}
        </h2>

        <p>
          {registro
            ? 'Registrate en Los Santos Auto Market'
            : 'Iniciá sesión para continuar'}
        </p>

        {mensaje && (
          <div
            className="mensaje-login"
            role="alert"
            style={{
              marginBottom: '18px',
              padding: '12px 14px',
              border: '1px solid #d94343',
              borderRadius: '4px',
              background: '#341919',
              color: '#ff6b6b',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            {mensaje}
          </div>
        )}

        <form
          onSubmit={manejarSubmit}
          noValidate
        >
          <label>
            Email
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button
            type="submit"
            className="modal-submit"
          >
            {registro
              ? 'Crear cuenta'
              : 'Iniciar sesión'}
          </button>
        </form>

        <button
          className="cambiar-login"
          onClick={cambiarModo}
        >
          {registro
            ? '¿Ya tenés cuenta? Iniciar sesión'
            : '¿No tenés cuenta? Crear cuenta'}
        </button>
      </div>
    </div>
  )
}


// ==================================================
// MODAL PUBLICAR VEHÍCULO
// ==================================================

function VentaModal({ cerrar, publicar }) {
  const [nombre, setNombre] = useState('')
  const [marca, setMarca] = useState('')
  const [categoria, setCategoria] = useState('')
  const [concesionaria, setConcesionaria] = useState('')
  const [precio, setPrecio] = useState('')
  const [imagenUrl, setImagenUrl] = useState('')
  const [imagenDetalleUrl, setImagenDetalleUrl] = useState('')
  const [mensaje, setMensaje] = useState('')

  const manejarSubmit = async (e) => {
    e.preventDefault()
    setMensaje('')

    if (!nombre.trim()) {
      setMensaje('El nombre es obligatorio.')
      return
    }

    try {
      await publicar({
        nombre: nombre.trim(),
        marca: marca.trim() || 'Desconocida',
        categoria: categoria.trim() || 'Otros',
        concesionaria: concesionaria.trim() || 'Particular',
        precio: Number(precio) || 0,
        imagenUrl: imagenUrl.trim(),
        imagenDetalleUrl: imagenDetalleUrl.trim(),
        disponible: true,
      })

      cerrar()
    } catch (error) {
      setMensaje(error.message)
    }
  }

  return (
    <div
      className="modal-fondo"
      onClick={cerrar}
    >
      <div
        className="modal-login"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-cerrar"
          onClick={cerrar}
          aria-label="Cerrar"
        >
          ×
        </button>

        <h2>Publicar vehículo</h2>

        {mensaje && (
          <div role="alert" className="mensaje-login">
            {mensaje}
          </div>
        )}

        <form onSubmit={manejarSubmit}>
          <label>
            Nombre del vehículo
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </label>

          <label>
            Marca
            <input
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
            />
          </label>

          <label>
            Categoría
            <input
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            />
          </label>

          <label>
            Concesionaria
            <input
              value={concesionaria}
              onChange={(e) => setConcesionaria(e.target.value)}
            />
          </label>

          <label>
            Precio
            <input
              type="number"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
            />
          </label>

          <label>
            Imagen de portada (opcional)
            <input
              type="url"
              placeholder="https://ejemplo.com/auto-portada.jpg"
              value={imagenUrl}
              onChange={(e) => setImagenUrl(e.target.value)}
            />
          </label>

          <label>
            Imagen de detalle (opcional)
            <input
              type="url"
              placeholder="https://ejemplo.com/auto-detalle.jpg"
              value={imagenDetalleUrl}
              onChange={(e) => setImagenDetalleUrl(e.target.value)}
            />
          </label>

          <button
            type="submit"
            className="modal-submit"
          >
            Publicar vehículo
          </button>
        </form>
      </div>
    </div>
  )
}


// ==================================================
// CONFIRMACIÓN DE ELIMINACIÓN
// ==================================================

function ConfirmDeleteModal({ vehiculo, cancelar, confirmar }) {
  return (
    <div
      className="modal-fondo"
      onClick={cancelar}
    >
      <div
        className="modal-login"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Eliminar vehículo</h2>

        <p>
          ¿Seguro que querés eliminar el vehículo{' '}
          <strong>{vehiculo.nombre}</strong>?
        </p>

        <button
          type="button"
          className="modal-submit"
          onClick={confirmar}
        >
          Sí, eliminar vehículo
        </button>

        <button
          type="button"
          className="cambiar-login"
          onClick={cancelar}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default App
