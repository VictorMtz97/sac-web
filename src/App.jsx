import { useState } from 'react'
import { supabase } from './lib/supabase'
import Dashboard from './Dashboard'
import './App.css'

function App() {
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [userData, setUserData] = useState(null)

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
          <a href="#">¿Olvidaste tu contraseña?</a>
        </form>
      </div>
    </>
  )
}

export default App
