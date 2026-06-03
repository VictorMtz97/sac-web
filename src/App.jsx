import { useState } from 'react'
import { supabase } from './lib/supabase'
import Dashboard from './Dashboard'
import './App.css'

function App() {
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [userData, setUserData] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [resetEmail, setResetEmail] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    const { data, error } = await supabase
      .from('Usuarios')
      .select('*')
      .eq('Name', user)
      .eq('Password', password)
    if (error) {
      alert('Error de conexión: ' + error.message)
    } else if (!data || data.length === 0) {
      alert('Usuario o contraseña incorrectos')
    } else {
      setUserData(data[0])
    }
  }

  const handleLogout = () => {
    setUserData(null)
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: window.location.origin,
    })
    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert('Correo de recuperación enviado. Revisa tu bandeja de entrada.')
      setShowModal(false)
      setResetEmail('')
    }
  }

  if (userData) {
    return <Dashboard user={userData} onLogout={handleLogout} />
  }

  return (
    <>
      <header>
        <div className="logo">SAC</div>
        <nav>
          <a href="#">Quiénes somos</a>
          <a href="#">Catálogo</a>
        </nav>
      </header>
      <div className="container">
        <div className="image-box"></div>
        <form onSubmit={handleLogin} autoComplete="off">
          <label htmlFor="usuario">Usuario:</label>
          <input
            type="text"
            id="usuario"
            name="usuario"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            required
          />
          <label htmlFor="contrasena">Contraseña:</label>
          <input
            type="password"
            id="contrasena"
            name="contrasena"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Iniciar sesión</button>
          <a href="#" onClick={(e) => { e.preventDefault(); setShowModal(true) }}>¿Olvidaste tu contraseña?</a>
        </form>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            <h2>Recuperar contraseña</h2>
            <form onSubmit={handleResetPassword}>
              <label htmlFor="reset-email">Ingresa tu correo electrónico:</label>
              <input
                type="email"
                id="reset-email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
              <button type="submit">Enviar enlace</button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default App
