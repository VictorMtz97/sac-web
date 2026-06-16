import { useState, useRef, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Dashboard from './Dashboard'
import QuienesSomos from './pages/QuienesSomos'
import Sucursales from './pages/Sucursales'
import { version as appVersion } from '../package.json'
import './App.css'

function App() {
  const [page, setPage] = useState('login')
  const [isRegister, setIsRegister] = useState(false)
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [userData, setUserData] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showRegConfirm, setShowRegConfirm] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [verifyEmail, setVerifyEmail] = useState('')
  const [verifyCode, setVerifyCode] = useState(Array(8).fill(''))
  const [emailAlreadyExists, setEmailAlreadyExists] = useState(false)
  const codeRefs = useRef([])

  const reqs = {
    minLength: regPassword.length >= 10,
    hasUpper: /[A-Z]/.test(regPassword),
    hasLower: /[a-z]/.test(regPassword),
    hasNumber: /\d/.test(regPassword),
    hasSymbol: /[^A-Za-z0-9]/.test(regPassword),
  }

  const allReqsMet = Object.values(reqs).every(Boolean)

  const SESSION_KEY = 'sac_session'
  const INACTIVITY_TIMEOUT = 5 * 60 * 1000

  const saveSession = (user) => {
    const { Password, ...safeUser } = user
    const session = { user: safeUser, lastActivity: Date.now() }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }

  const clearSession = () => {
    localStorage.removeItem(SESSION_KEY)
  }

  const updateActivity = () => {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return
    const session = JSON.parse(raw)
    session.lastActivity = Date.now()
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY)
    if (raw) {
      const session = JSON.parse(raw)
      const elapsed = Date.now() - session.lastActivity
      if (elapsed < INACTIVITY_TIMEOUT) {
        setUserData(session.user)
      } else {
        clearSession()
      }
    }

    const onActivity = () => updateActivity()
    window.addEventListener('mousedown', onActivity)
    window.addEventListener('keydown', onActivity)
    window.addEventListener('touchstart', onActivity)
    window.addEventListener('scroll', onActivity)

    const checkInactivity = setInterval(() => {
      const stored = localStorage.getItem(SESSION_KEY)
      if (!stored) return
      const s = JSON.parse(stored)
      if (Date.now() - s.lastActivity > INACTIVITY_TIMEOUT) {
        clearSession()
        setUserData(null)
      }
    }, 10000)

    return () => {
      window.removeEventListener('mousedown', onActivity)
      window.removeEventListener('keydown', onActivity)
      window.removeEventListener('touchstart', onActivity)
      window.removeEventListener('scroll', onActivity)
      clearInterval(checkInactivity)
    }
  }, [])

  const checkEmailExists = async (email) => {
    if (!email) return
    const { data } = await supabase
      .from('Clientes')
      .select('id')
      .eq('Email', email)
      .maybeSingle()
    setEmailAlreadyExists(!!data)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    const { data: adminData, error: adminError } = await supabase
      .from('Admins')
      .select('*')
      .ilike('Usuario', user)
      .eq('Password', password)

    if (adminError) {
      setErrorMsg('Error de conexión: ' + adminError.message)
      return
    }

    if (adminData && adminData.length > 0) {
      const admin = adminData[0]
      const userWithName = { ...admin, Name: admin.Nombre || admin.Usuario, isAdmin: true }
      setUserData(userWithName)
      saveSession(userWithName)
      return
    }

    const { data: clientData, error: clientError } = await supabase
      .from('Clientes')
      .select('*')
      .ilike('Name', user)
      .eq('Password', password)

    if (clientError) {
      setErrorMsg('Error de conexión: ' + clientError.message)
    } else if (!clientData || clientData.length === 0) {
      setErrorMsg('Usuario o contraseña incorrectos')
    } else {
      const client = clientData[0]
      setUserData(client)
      saveSession(client)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    if (!allReqsMet) {
      setErrorMsg('La contraseña no cumple los requisitos de seguridad')
      return
    }
    if (regPassword !== regConfirm) {
      setErrorMsg('Las contraseñas no coinciden')
      return
    }

    const { data: existing } = await supabase
      .from('Clientes')
      .select('id')
      .eq('Email', regEmail)
      .maybeSingle()

    if (existing) {
      setEmailAlreadyExists(true)
      setErrorMsg('Este correo ya está registrado')
      return
    }

    const { data, error } = await supabase
      .from('Clientes')
      .insert({ Name: regName, Email: regEmail, Password: regPassword })
      .select()

    if (error) {
      console.error('Error completo:', error)
      setErrorMsg('Error al registrarse: ' + error.message + ' (detalles en consola F12)')
      return
    }

    const { error: otpError } = await supabase.auth.signInWithOtp({ email: regEmail })

    if (otpError) {
      setErrorMsg('Error al enviar código: ' + otpError.message)
      return
    }

    setVerifyEmail(regEmail)
    setVerifyCode(Array(8).fill(''))
    setIsRegister(false)
    setPage('verify')
    setRegName('')
    setRegEmail('')
    setRegPassword('')
    setRegConfirm('')
    setPasswordTouched(false)
  }

  const switchMode = () => {
    setIsRegister(!isRegister)
    setErrorMsg('')
  }

  const handleLogout = () => {
    clearSession()
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

  const handleVerifyCode = async () => {
    setErrorMsg('')
    const code = verifyCode.join('')
    if (code.length !== 8) {
      setErrorMsg('Ingresa el código completo de 8 dígitos')
      return
    }

    const { error } = await supabase.auth.verifyOtp({
      email: verifyEmail,
      token: code,
      type: 'email',
    })

    if (error) {
      setErrorMsg('Código incorrecto o expirado')
      return
    }

    setSuccessMsg('Correo verificado exitosamente. Ahora puedes iniciar sesión.')
    setPage('login')
    setVerifyEmail('')
    setVerifyCode(Array(6).fill(''))
  }

  const handleCodeChange = (index, value) => {
    if (!/^\d$/.test(value) && value !== '') return
    const newCode = [...verifyCode]
    newCode[index] = value
    setVerifyCode(newCode)
    if (value && index < 7) {
      codeRefs.current[index + 1].focus()
    }
  }

  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verifyCode[index] && index > 0) {
      codeRefs.current[index - 1].focus()
    }
  }

  function EyeIcon() {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }

  function EyeOffIcon() {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    )
  }

  return (
    <>
      {userData ? (
        <Dashboard user={userData} onLogout={handleLogout} />
      ) : (
        <>
          <header>
            <div className="logo" onClick={() => setPage('login')} style={{ cursor: 'pointer' }}>SAC</div>
            <nav>
              <a href="#" onClick={(e) => { e.preventDefault(); setPage('quienes-somos') }}>Quiénes somos</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setPage('sucursales') }}>Sucursales</a>
            </nav>
          </header>
          {page === 'quienes-somos' && <QuienesSomos />}
          {page === 'sucursales' && <Sucursales />}
          {page === 'login' && (
          <div className="container">
            <div className="image-box"></div>
            {isRegister ? (
              <form onSubmit={handleRegister} autoComplete="off">
                <h2 className="form-title">Registrarse</h2>
                <label htmlFor="reg-nombre">Nombre:</label>
                <input
                  type="text"
                  id="reg-nombre"
                  value={regName}
                  onChange={(e) => { setRegName(e.target.value); setErrorMsg('') }}
                  required
                />
                <label htmlFor="reg-email">Correo electrónico:</label>
                <input
                  type="email"
                  id="reg-email"
                  value={regEmail}
                  onChange={(e) => { setRegEmail(e.target.value); setEmailAlreadyExists(false); setErrorMsg('') }}
                  onBlur={(e) => checkEmailExists(e.target.value)}
                  required
                />
                {emailAlreadyExists && <div className="email-taken">Este correo ya está registrado</div>}
                <label htmlFor="reg-password">Contraseña:</label>
                <div className="password-wrapper">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    id="reg-password"
                    value={regPassword}
                    onChange={(e) => { setRegPassword(e.target.value); setPasswordTouched(true); setErrorMsg('') }}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    tabIndex={-1}
                  >
                    {showRegPassword ? EyeOffIcon() : EyeIcon()}
                  </button>
                </div>
                {passwordTouched && (
                <ul className="req-list">
                  <li className={reqs.minLength ? 'req-met' : 'req-unmet'}>
                    {regPassword.length}/10 caracteres
                  </li>
                  <li className={reqs.hasUpper && reqs.hasLower ? 'req-met' : 'req-unmet'}>
                    Mayúsculas y minúsculas
                  </li>
                  <li className={reqs.hasNumber ? 'req-met' : 'req-unmet'}>
                    Al menos un número
                  </li>
                  <li className={reqs.hasSymbol ? 'req-met' : 'req-unmet'}>
                    Al menos un signo/símbolo
                  </li>
                </ul>
                )}
                <label htmlFor="reg-confirm">Confirmar contraseña:</label>
                <div className="password-wrapper">
                  <input
                    type={showRegConfirm ? 'text' : 'password'}
                    id="reg-confirm"
                    value={regConfirm}
                    onChange={(e) => { setRegConfirm(e.target.value); setErrorMsg('') }}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowRegConfirm(!showRegConfirm)}
                    tabIndex={-1}
                  >
                    {showRegConfirm ? EyeOffIcon() : EyeIcon()}
                  </button>
                </div>
                {errorMsg && <div className="error-msg">{errorMsg}</div>}
                {successMsg && <div className="success-msg">{successMsg}</div>}
                <button type="submit">Crear cuenta</button>
                <a href="#" onClick={(e) => { e.preventDefault(); switchMode() }}>¿Ya tienes cuenta? Inicia sesión</a>
              </form>
              ) : (
              <form onSubmit={handleLogin} autoComplete="off">
                <h2 className="form-title">Iniciar sesión</h2>
                <label htmlFor="usuario">Usuario:</label>
                <input
                  type="text"
                  id="usuario"
                  name="usuario"
                  value={user}
                  onChange={(e) => { setUser(e.target.value); setErrorMsg('') }}
                  required
                />
                <label htmlFor="contrasena">Contraseña:</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="contrasena"
                    name="contrasena"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrorMsg('') }}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? EyeOffIcon() : EyeIcon()}
                  </button>
                </div>
                {errorMsg && <div className="error-msg">{errorMsg}</div>}
                {successMsg && <div className="success-msg">{successMsg}</div>}
                <button type="submit">Iniciar sesión</button>
                <a href="#" onClick={(e) => { e.preventDefault(); setShowModal(true) }}>¿Olvidaste tu contraseña?</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setSuccessMsg(''); switchMode() }}>¿No tienes cuenta? Regístrate</a>
              </form>
              )}
          </div>
          )}
          {page === 'verify' && (
          <div className="container">
            <div className="image-box"></div>
            <div className="verify-box">
              <h2 className="form-title">Verifica tu correo</h2>
              <p className="verify-text">
                Ingresa el código de 8 dígitos enviado a:<br />
                <strong>{verifyEmail}</strong>
              </p>
              <div className="code-inputs">
                {verifyCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (codeRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              {errorMsg && <div className="error-msg">{errorMsg}</div>}
              <button onClick={handleVerifyCode}>Verificar código</button>
              <a href="#" onClick={(e) => { e.preventDefault(); setPage('login'); setVerifyEmail(''); setVerifyCode(Array(8).fill('')) }}>
                Volver al inicio de sesión
              </a>
            </div>
          </div>
          )}
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
      )}
      <div className="env-badge">
        <span className="env-badge-label">Staging</span>
        <span className="env-badge-version">v{appVersion}</span>
      </div>
    </>
  )
}

export default App
