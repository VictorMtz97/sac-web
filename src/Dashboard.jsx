import './Dashboard.css'

function Dashboard({ user, onLogout }) {
  const isAdmin = user.isAdmin
  const initial = user.Name ? user.Name.charAt(0).toUpperCase() : '?'

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initial}</div>
          <div className="sidebar-name">{user.Name}</div>
          <div className="sidebar-email">email</div>
          <div className="sidebar-role">{isAdmin ? 'Administrador' : 'Paciente'}</div>
        </div>
        {!isAdmin && (
          <nav className="sidebar-nav">
            <a href="#" className="sidebar-link active">Catálogo</a>
            <a href="#" className="sidebar-link">Mis estudios</a>
            <a href="#" className="sidebar-link">Cotización</a>
            <a href="#" className="sidebar-link">Soporte</a>
          </nav>
        )}
        <button className="sidebar-logout" onClick={onLogout}>Cerrar sesión</button>
      </aside>
      <main className="main-content">
        <h1>{isAdmin ? 'Entraste como admin' : 'Accediste correctamente'}</h1>
      </main>
    </div>
  )
}

export default Dashboard
