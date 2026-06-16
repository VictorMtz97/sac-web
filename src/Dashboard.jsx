import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import './Dashboard.css'

function Dashboard({ user, onLogout }) {
  const isAdmin = user.isAdmin
  const displayName = user.Nombre || user.Name || ''
  const initial = displayName ? displayName.charAt(0).toUpperCase() : '?'
  const [section, setSection] = useState('home')

  const [regName, setRegName] = useState('')
  const [regApellidos, setRegApellidos] = useState('')
  const [regUsuario, setRegUsuario] = useState('')
  const [regNacimiento, setRegNacimiento] = useState('')
  const [regIngreso, setRegIngreso] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [adminError, setAdminError] = useState('')
  const [adminSuccess, setAdminSuccess] = useState('')
  const [adminList, setAdminList] = useState([])
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [editingId, setEditingId] = useState(null)

  const [productos, setProductos] = useState([])
  const [prodNombre, setProdNombre] = useState('')
  const [prodDescripcion, setProdDescripcion] = useState('')
  const [prodPrecio, setProdPrecio] = useState('')
  const [editProductoId, setEditProductoId] = useState(null)
  const [prodError, setProdError] = useState('')
  const [prodSuccess, setProdSuccess] = useState('')
  const [prodDeleteModal, setProdDeleteModal] = useState(false)
  const [prodDeleteTarget, setProdDeleteTarget] = useState(null)

  const fetchAdmins = async () => {
    const { data } = await supabase.from('Admins').select('*')
    if (data) setAdminList(data)
  }

  useEffect(() => {
    if (section === 'registro') fetchAdmins()
  }, [section])

  const handleAdminRegister = async (e) => {
    e.preventDefault()
    setAdminError('')
    setAdminSuccess('')

    if (editingId) {
      const { error } = await supabase
        .from('Admins')
        .update({
          Usuario: regUsuario,
          Nombre: regName,
          Apellidos: regApellidos,
          Fecha_nacimiento: regNacimiento,
          Fecha_ingreso: regIngreso,
          Email: regEmail,
          Password: regPassword,
        })
        .eq('id', editingId)

      if (error) {
        setAdminError('Error al actualizar: ' + error.message)
        return
      }

      setAdminSuccess('Administrador actualizado exitosamente.')
    } else {
      const { error } = await supabase
        .from('Admins')
        .insert({
          Usuario: regUsuario,
          Nombre: regName,
          Apellidos: regApellidos,
          Fecha_nacimiento: regNacimiento,
          Fecha_ingreso: regIngreso,
          Email: regEmail,
          Password: regPassword,
        })

      if (error) {
        setAdminError('Error al crear admin: ' + error.message)
        return
      }

      setAdminSuccess('Administrador creado exitosamente.')
    }

    cancelEdit()
    fetchAdmins()
  }

  const cancelEdit = () => {
    setEditingId(null)
    setRegName('')
    setRegApellidos('')
    setRegUsuario('')
    setRegNacimiento('')
    setRegIngreso('')
    setRegEmail('')
    setRegPassword('')
    setAdminSuccess('')
  }

  const loadAdminToEdit = (admin) => {
    setRegName(admin.Nombre || '')
    setRegApellidos(admin.Apellidos || '')
    setRegUsuario(admin.Usuario || '')
    setRegNacimiento(admin.Fecha_nacimiento || '')
    setRegIngreso(admin.Fecha_ingreso || '')
    setRegEmail(admin.Email || '')
    setRegPassword(admin.Password || '')
    setEditingId(admin.id)
    setAdminError('')
    setAdminSuccess('')
  }

  const openDeleteModal = (id) => {
    setDeleteTargetId(id)
    setDeletePassword('')
    setDeleteError('')
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    setDeleteError('')

    if (!deletePassword) {
      setDeleteError('Ingresa tu contraseña')
      return
    }

    if (deletePassword !== user.Password) {
      setDeleteError('Contraseña incorrecta')
      return
    }

    const { error } = await supabase.from('Admins').delete().eq('id', deleteTargetId)

    if (error) {
      setDeleteError('Error al eliminar: ' + error.message)
      return
    }

    setDeleteModalOpen(false)
    setAdminSuccess('Administrador eliminado.')
    fetchAdmins()
  }

  const fetchProductos = async () => {
    const { data } = await supabase.from('Productos').select('*').order('id')
    if (data) setProductos(data)
  }

  useEffect(() => {
    fetchProductos()
    const channel = supabase.channel('productos-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Productos' }, () => {
        fetchProductos()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const handleProductSubmit = async (e) => {
    e.preventDefault()
    setProdError('')
    setProdSuccess('')
    if (editProductoId) {
      const { error } = await supabase
        .from('Productos')
        .update({ nombre: prodNombre, descripcion: prodDescripcion, precio: parseFloat(prodPrecio), updated_at: new Date() })
        .eq('id', editProductoId)
      if (error) { setProdError('Error al actualizar: ' + error.message); return }
      setProdSuccess('Producto actualizado.')
    } else {
      const { error } = await supabase
        .from('Productos')
        .insert({ nombre: prodNombre, descripcion: prodDescripcion, precio: parseFloat(prodPrecio) })
      if (error) { setProdError('Error al crear: ' + error.message); return }
      setProdSuccess('Producto creado.')
    }
    cancelProductEdit()
  }

  const loadProductToEdit = (p) => {
    setProdNombre(p.nombre)
    setProdDescripcion(p.descripcion || '')
    setProdPrecio(String(p.precio))
    setEditProductoId(p.id)
    setProdError('')
    setProdSuccess('')
  }

  const cancelProductEdit = () => {
    setProdNombre('')
    setProdDescripcion('')
    setProdPrecio('')
    setEditProductoId(null)
    setProdSuccess('')
  }

  const confirmDeleteProducto = async () => {
    const { error } = await supabase.from('Productos').delete().eq('id', prodDeleteTarget)
    if (error) { setProdError('Error al eliminar: ' + error.message); return }
    setProdDeleteModal(false)
    setProdDeleteTarget(null)
    setProdSuccess('Producto eliminado.')
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initial}</div>
          <div className="sidebar-name">{displayName}</div>
          <div className="sidebar-email">email</div>
          <div className="sidebar-role">{isAdmin ? 'Administrador' : 'Paciente'}</div>
        </div>
        {isAdmin && (
          <nav className="sidebar-nav">
            <a href="#" className={`sidebar-link ${section === 'registro' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setSection('registro') }}>Registro</a>
            <a href="#" className={`sidebar-link ${section === 'catalogo-admin' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setSection('catalogo-admin') }}>Catálogo</a>
          </nav>
        )}
        {!isAdmin && (
          <nav className="sidebar-nav">
            <a href="#" className={`sidebar-link ${section === 'cotizacion' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setSection('cotizacion') }}>Cotización</a>
            <a href="#" className="sidebar-link">Mis estudios</a>
            <a href="#" className="sidebar-link">Soporte</a>
          </nav>
        )}
        <button className="sidebar-logout" onClick={onLogout}>Cerrar sesión</button>
      </aside>
      <main className="main-content">
        {isAdmin && section === 'registro' && (
          <div className="admin-registro-container">
            <div className="admin-form-wrapper">
              <h2 className="admin-form-title">{editingId ? 'Editar Administrador' : 'Registrar Administrador'}</h2>
              <form onSubmit={handleAdminRegister} autoComplete="off">
                <label htmlFor="admin-nombre">Nombre(s):</label>
                <input id="admin-nombre" type="text" value={regName} onChange={(e) => setRegName(e.target.value)} required />

              <label htmlFor="admin-apellidos">Apellidos:</label>
              <input id="admin-apellidos" type="text" value={regApellidos} onChange={(e) => setRegApellidos(e.target.value)} required />

              <label htmlFor="admin-usuario">Usuario:</label>
              <input id="admin-usuario" type="text" value={regUsuario} onChange={(e) => setRegUsuario(e.target.value)} required />

              <label htmlFor="admin-nacimiento">Fecha de nacimiento:</label>
                <input id="admin-nacimiento" type="date" value={regNacimiento} onChange={(e) => setRegNacimiento(e.target.value)} required />

                <label htmlFor="admin-ingreso">Fecha de ingreso al trabajo:</label>
                <input id="admin-ingreso" type="date" value={regIngreso} onChange={(e) => setRegIngreso(e.target.value)} required />

                <label htmlFor="admin-email">Correo electrónico:</label>
                <input id="admin-email" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />

                <label htmlFor="admin-password">Contraseña:</label>
                <input id="admin-password" type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />

                {adminError && <div className="admin-form-error">{adminError}</div>}
                {adminSuccess && <div className="admin-form-success">{adminSuccess}</div>}

                <button type="submit">{editingId ? 'Actualizar administrador' : 'Crear administrador'}</button>
                {editingId && (
                  <a href="#" className="admin-cancel-edit" onClick={(e) => { e.preventDefault(); cancelEdit() }}>Cancelar edición</a>
                )}
              </form>
            </div>
            <div className="admin-table-wrapper">
              <h2 className="admin-table-title">Administradores Registrados</h2>
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Nombre</th>
                      <th>Apellidos</th>
                      <th>Email</th>
                      <th>Nacimiento</th>
                      <th>Ingreso</th>
                      <th className="admin-th-action">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminList.map((a) => (
                      <tr key={a.id}>
                        <td>{a.Usuario}</td>
                        <td>{a.Nombre}</td>
                        <td>{a.Apellidos}</td>
                        <td>{a.Email}</td>
                        <td>{a.Fecha_nacimiento}</td>
                        <td>{a.Fecha_ingreso}</td>
                        <td>
                          <div className="admin-action-btns">
                            <button className="admin-btn-edit" onClick={() => loadAdminToEdit(a)}>Editar</button>
                            <button className="admin-btn-delete" onClick={() => openDeleteModal(a.id)}>Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {adminList.length === 0 && (
                      <tr><td colSpan={7} className="admin-table-empty">No hay administradores registrados</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {isAdmin && section === 'home' && <h1>Entraste como admin</h1>}
        {!isAdmin && section === 'home' && <h1>Accediste correctamente</h1>}
        {isAdmin && section === 'catalogo-admin' && (
          <div className="admin-registro-container">
            <div className="admin-form-wrapper">
              <h2 className="admin-form-title">{editProductoId ? 'Editar Producto' : 'Agregar Producto'}</h2>
              <form onSubmit={handleProductSubmit} autoComplete="off">
                <label>Nombre del producto:</label>
                <input type="text" value={prodNombre} onChange={(e) => setProdNombre(e.target.value)} required />
                <label>Descripción:</label>
                <textarea className="producto-textarea" value={prodDescripcion} onChange={(e) => setProdDescripcion(e.target.value)} rows={3} />
                <label>Precio (MXN):</label>
                <input type="number" step="0.01" min="0" value={prodPrecio} onChange={(e) => setProdPrecio(e.target.value)} required />
                {prodError && <div className="admin-form-error">{prodError}</div>}
                {prodSuccess && <div className="admin-form-success">{prodSuccess}</div>}
                <button type="submit">{editProductoId ? 'Actualizar' : 'Crear producto'}</button>
                {editProductoId && (
                  <a href="#" className="admin-cancel-edit" onClick={(e) => { e.preventDefault(); cancelProductEdit() }}>Cancelar edición</a>
                )}
              </form>
            </div>
            <div className="admin-table-wrapper">
              <h2 className="admin-table-title">Productos</h2>
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Precio</th>
                      <th className="admin-th-action">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map((p) => (
                      <tr key={p.id}>
                        <td>{p.nombre}</td>
                        <td>{p.descripcion || '-'}</td>
                        <td>${Number(p.precio).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td>
                          <div className="admin-action-btns">
                            <button className="admin-btn-edit" onClick={() => loadProductToEdit(p)}>Editar</button>
                            <button className="admin-btn-delete" onClick={() => { setProdDeleteTarget(p.id); setProdDeleteModal(true) }}>Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {productos.length === 0 && (
                      <tr><td colSpan={4} className="admin-table-empty">No hay productos</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {!isAdmin && section === 'cotizacion' && (
          <div className="catalogo-container">
            <h1 className="catalogo-title">Estudios de laboratorio</h1>
            <div className="catalogo-grid">
              {productos.map((p) => (
                <div key={p.id} className="producto-card">
                  <h3 className="producto-nombre">{p.nombre}</h3>
                  {p.descripcion && <p className="producto-desc">{p.descripcion}</p>}
                  <div className="producto-footer">
                    <span className="producto-precio">${Number(p.precio).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    <button className="producto-btn-carrito">Cotizar</button>
                  </div>
                </div>
              ))}
              {productos.length === 0 && (
                <p className="catalogo-empty">No hay productos disponibles aún.</p>
              )}
            </div>
          </div>
        )}
      </main>
      {deleteModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setDeleteModalOpen(false)}>&times;</button>
            <h2>¿Estás seguro de borrar la cuenta?</h2>
            <p>Ingresa tu contraseña para confirmar:</p>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              autoFocus
            />
            {deleteError && <div className="admin-form-error">{deleteError}</div>}
            <div className="admin-modal-actions">
              <button className="admin-modal-cancel" onClick={() => setDeleteModalOpen(false)}>Cancelar</button>
              <button className="admin-modal-confirm" onClick={handleConfirmDelete}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
      {prodDeleteModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <button className="admin-modal-close" onClick={() => setProdDeleteModal(false)}>&times;</button>
            <h2>¿Eliminar producto?</h2>
            <p>Esta acción no se puede deshacer.</p>
            <div className="admin-modal-actions">
              <button className="admin-modal-cancel" onClick={() => setProdDeleteModal(false)}>Cancelar</button>
              <button className="admin-modal-confirm" onClick={confirmDeleteProducto}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
