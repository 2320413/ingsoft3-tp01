import { useEffect, useState } from 'react'
import './App.css'

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
    '/autos/Southern San Andreas/Banshee/Banshee.png',
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
    setMostrarFavoritos(false)
    setMostrarConfirmarLogout(false)
    setSeleccionado(null)
  }


  useEffect(() => {
    const params = new URLSearchParams()

    if (buscar) {
      params.append('buscar', buscar)
    }

    if (concesionaria) {
      params.append('concesionaria', concesionaria)
    }

    fetch(`/api/vehiculos?${params.toString()}`)
      .then((response) => response.json())
      .then((data) => setVehiculos(data))
      .catch((error) =>
        console.error('Error cargando vehículos:', error)
      )
  }, [buscar, concesionaria])

  const toggleFavorito = (id) => {
    if (!usuario) {
      setMotivoLogin('Iniciá sesión para guardar vehículos en favoritos.')
      setMostrarLogin(true)
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
    const numero = '541156535589'

    const mensaje =
      'Hola, estoy interesado en publicar un vehículo en Los Santos Auto Market.'

    const url =
      `https://wa.me/${numero}?text=` +
      encodeURIComponent(mensaje)

    window.open(url, '_blank')
  }

  const vehiculosVisibles = mostrarFavoritos
    ? vehiculos.filter((vehiculo) => favoritos.includes(vehiculo.id))
    : vehiculos

  // ==================================================
  // DETALLE
  // ==================================================

  if (seleccionado) {
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
              <img
                className="imagen-detalle"
                src={imagenesVehiculos[seleccionado.nombre]?.[1]}
                alt={`${seleccionado.nombre} detalle`}
              />

              <button
                className={`favorito detalle-favorito ${
                  favoritos.includes(seleccionado.id)
                    ? 'favorito-activo'
                    : ''
                }`}
                onClick={() => toggleFavorito(seleccionado.id)}
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
                  const numero = '541156535589'

                  const mensaje =
                    `Hola, estoy interesado en comprar el ` +
                    `${seleccionado.marca} ${seleccionado.nombre} ` +
                    `por $${seleccionado.precio.toLocaleString()}.`

                  const url =
                    `https://wa.me/${numero}?text=` +
                    encodeURIComponent(mensaje)

                  window.open(url, '_blank')
                }}
              >
                Contactar por WhatsApp
              </button>

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

        {mostrarConfirmarLogout && (
          <ConfirmLogoutModal
            cancelar={() => setMostrarConfirmarLogout(false)}
            confirmar={cerrarSesion}
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

          <h2>{mostrarFavoritos ? 'Tus likeados' : 'Trending'}</h2>

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

                <img
                  className="imagen-principal"
                  src={vehiculo.imagenUrl}
                  alt={vehiculo.nombre}
                />

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

      {mostrarConfirmarLogout && (
        <ConfirmLogoutModal
          cancelar={() => setMostrarConfirmarLogout(false)}
          confirmar={cerrarSesion}
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
          Vas a salir de tu cuenta. Tus vehículos likeados quedarán guardados
          para la próxima vez que inicies sesión.
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

  const emailValido = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const hashPassword = async (password) => {
    const datos = new TextEncoder().encode(password)
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
      (cuenta) => cuenta.email === emailNormalizado
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
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

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

export default App