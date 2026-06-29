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

  const [carrito, setCarrito] = useState([])
  const [carritoModal, setCarritoModal] = useState(false)
  const [cotNota, setCotNota] = useState('')
  const [cotError, setCotError] = useState('')
  const [cotSuccess, setCotSuccess] = useState('')
  const [misCotizaciones, setMisCotizaciones] = useState([])

  const [todasCotizaciones, setTodasCotizaciones] = useState([])
  const [filtroEstado, setFiltroEstado] = useState('todas')
  const [cotDetalleModal, setCotDetalleModal] = useState(false)
  const [cotDetalle, setCotDetalle] = useState(null)
  const [rechazoMotivo, setRechazoMotivo] = useState('')
  const [cotAdminError, setCotAdminError] = useState('')
  const [cotAdminSuccess, setCotAdminSuccess] = useState('')

  const [cancelModal, setCancelModal] = useState(false)
  const [cancelTarget, setCancelTarget] = useState(null)

  const [printCot, setPrintCot] = useState(null)

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

  const addToCarrito = (producto) => {
    if (carrito.find((p) => p.id === producto.id)) return
    setCarrito([...carrito, { id: producto.id, nombre: producto.nombre, precio: producto.precio }])
  }

  const removeFromCarrito = (id) => {
    setCarrito(carrito.filter((p) => p.id !== id))
  }

  const carritoTotal = carrito.reduce((sum, p) => sum + Number(p.precio), 0)

  const enviarCotizacion = async () => {
    setCotError('')
    setCotSuccess('')
    if (carrito.length === 0) {
      setCotError('Agrega al menos un estudio')
      return
    }
    const { error } = await supabase.from('Cotizaciones').insert({
      cliente_id: user.id,
      estudios: carrito,
      nota: cotNota || null,
      estado: 'Pendiente',
    })
    if (error) {
      setCotError('Error al enviar: ' + error.message)
      return
    }
    setCarrito([])
    setCotNota('')
    setCarritoModal(false)
    setCotSuccess('Cotización enviada exitosamente')
    fetchMisCotizaciones()
  }

  const fetchMisCotizaciones = async () => {
    const { data, error } = await supabase
      .from('Cotizaciones')
      .select('*')
      .eq('cliente_id', user.id)
      .order('created_at', { ascending: false })
    if (error) { console.error('Error fetching cotizaciones:', error); return }
    if (data) {
      const parsed = data.map((c) => ({
        ...c,
        estudios: typeof c.estudios === 'string' ? JSON.parse(c.estudios) : (c.estudios || []),
      }))
      setMisCotizaciones(parsed)
    }
  }

  const cancelarCotizacion = async (id) => {
    const { error } = await supabase.from('Cotizaciones').update({ estado: 'Cancelada' }).eq('id', id)
    if (!error) {
      setCancelModal(false)
      setCancelTarget(null)
      fetchMisCotizaciones()
    }
  }

  const handlePrint = (cot) => {
    setPrintCot(cot)
    setTimeout(() => {
      window.print()
      setPrintCot(null)
    }, 200)
  }

  const fetchTodasCotizaciones = async () => {
    const { data: cotData, error: cotError } = await supabase
      .from('Cotizaciones')
      .select('*')
      .order('created_at', { ascending: false })
    if (cotError) { console.error('Error fetching cotizaciones:', cotError); return }

    const { data: clientesData } = await supabase
      .from('Clientes')
      .select('id, Name, Email')

    const clientesMap = {}
    if (clientesData) {
      clientesData.forEach((c) => { clientesMap[c.id] = c })
    }

    if (cotData) {
      const parsed = cotData.map((c) => ({
        ...c,
        estudios: typeof c.estudios === 'string' ? JSON.parse(c.estudios) : (c.estudios || []),
        cliente: clientesMap[c.cliente_id] || null,
      }))
      setTodasCotizaciones(parsed)
    }
  }

  const actualizarEstadoCotizacion = async (id, nuevoEstado, motivo = null) => {
    setCotAdminError('')
    setCotAdminSuccess('')
    const update = { estado: nuevoEstado }
    if (motivo) update.motivo_rechazo = motivo
    const { error } = await supabase.from('Cotizaciones').update(update).eq('id', id)
    if (error) {
      setCotAdminError('Error al actualizar: ' + error.message)
      return
    }
    setCotAdminSuccess(`Cotización ${nuevoEstado.toLowerCase()} exitosamente`)
    setCotDetalleModal(false)
    setCotDetalle(null)
    setRechazoMotivo('')
    fetchTodasCotizaciones()
  }

  useEffect(() => {
    if (isAdmin && section === 'cotizaciones-admin') fetchTodasCotizaciones()
  }, [section, isAdmin])

  useEffect(() => {
    if (isAdmin) {
      const channel = supabase.channel('cotizaciones-admin-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'Cotizaciones' }, () => {
          if (section === 'cotizaciones-admin') fetchTodasCotizaciones()
        })
        .subscribe()
      return () => { supabase.removeChannel(channel) }
    }
  }, [isAdmin, section])

  useEffect(() => {
    if (!isAdmin && section === 'mis-cotizaciones') fetchMisCotizaciones()
  }, [section, isAdmin])

  useEffect(() => {
    if (!isAdmin) {
      const channel = supabase.channel('cotizaciones-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'Cotizaciones' }, () => {
          fetchMisCotizaciones()
        })
        .subscribe()
      return () => { supabase.removeChannel(channel) }
    }
  }, [isAdmin])

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
            <a href="#" className={`sidebar-link ${section === 'cotizaciones-admin' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setSection('cotizaciones-admin') }}>Cotizaciones</a>
          </nav>
        )}
        {!isAdmin && (
          <nav className="sidebar-nav">
            <a href="#" className={`sidebar-link ${section === 'cotizacion' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setSection('cotizacion') }}>Estudios</a>
            <a href="#" className={`sidebar-link ${section === 'mis-cotizaciones' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setSection('mis-cotizaciones') }}>Mis cotizaciones</a>
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
            <div className="catalogo-header">
              <h1 className="catalogo-title">Estudios de laboratorio</h1>
              <button className="carrito-btn" onClick={() => setCarritoModal(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                {carrito.length > 0 && <span className="carrito-badge">{carrito.length}</span>}
              </button>
            </div>
            {cotSuccess && <div className="admin-form-success">{cotSuccess}</div>}
            <div className="catalogo-grid">
              {productos.map((p) => (
                <div key={p.id} className="producto-card">
                  <h3 className="producto-nombre">{p.nombre}</h3>
                  {p.descripcion && <p className="producto-desc">{p.descripcion}</p>}
                  <div className="producto-footer">
                    <span className="producto-precio">${Number(p.precio).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    <button
                      className={`producto-btn-carrito ${carrito.find((c) => c.id === p.id) ? 'producto-btn-agregado' : ''}`}
                      onClick={() => addToCarrito(p)}
                      disabled={carrito.find((c) => c.id === p.id)}
                    >
                      {carrito.find((c) => c.id === p.id) ? 'Agregado' : 'Cotizar'}
                    </button>
                  </div>
                </div>
              ))}
              {productos.length === 0 && (
                <p className="catalogo-empty">No hay productos disponibles aún.</p>
              )}
            </div>
          </div>
        )}
        {!isAdmin && section === 'mis-cotizaciones' && (
          <div className="cotizaciones-container">
            <h1 className="cotizaciones-title">Mis cotizaciones</h1>
            {misCotizaciones.length === 0 ? (
              <div className="cotizaciones-vacia">
                <p className="cotizaciones-vacia-texto">Aún no tienes cotizaciones.</p>
                <p className="cotizaciones-vacia-sub">Ve a <strong>Estudios</strong> y presiona "Cotizar" para agregar estudios aquí.</p>
              </div>
            ) : (
              <div className="cotizaciones-lista">
                {misCotizaciones.map((cot) => (
                  <div key={cot.id} className="cotizacion-card">
                    <div className="cotizacion-header">
                      <span className="cotizacion-id">Cotización #{String(cot.id).slice(0, 8)}</span>
                      <span className={`cotizacion-estado estado-${(cot.estado || 'pendiente').toLowerCase()}`}>{cot.estado}</span>
                    </div>
                    <div className="cotizacion-body">
                      <p className="cotizacion-studies">{Array.isArray(cot.estudios) ? cot.estudios.length : 0} estudio(s) — ${Array.isArray(cot.estudios) ? Number(cot.estudios.reduce((s, e) => s + Number(e.precio || 0), 0)).toLocaleString('es-MX', { minimumFractionDigits: 2 }) : '0.00'}</p>
                      {cot.nota && <p className="cotizacion-nota">Nota: {cot.nota}</p>}
                      {cot.estado === 'Rechazada' && cot.motivo_rechazo && (
                        <div className="cotizacion-motivo-rechazo">
                          <p>Motivo de rechazo: {cot.motivo_rechazo}</p>
                        </div>
                      )}
                      <p className="cotizacion-fecha">{new Date(cot.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="cotizacion-actions">
                      {cot.estado === 'Pendiente' && (
                        <button className="cotizacion-btn-cancelar" onClick={() => { setCancelTarget(cot); setCancelModal(true) }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          Cancelar cotización
                        </button>
                      )}
                      {cot.estado === 'Aceptada' && (
                        <button className="cotizacion-btn-imprimir" onClick={() => handlePrint(cot)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                          Imprimir
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {isAdmin && section === 'cotizaciones-admin' && (
          <div className="cotizaciones-admin-container">
            <h1 className="cotizaciones-admin-title">Cotizaciones de Clientes</h1>
            {cotAdminSuccess && <div className="admin-form-success">{cotAdminSuccess}</div>}

            <div className="cotizaciones-admin-filtros">
              {['todas', 'Pendiente', 'Aceptada', 'Rechazada'].map((estado) => {
                const label = estado === 'todas' ? 'Todas' : estado
                const count = estado === 'todas'
                  ? todasCotizaciones.length
                  : todasCotizaciones.filter((c) => c.estado === estado).length
                return (
                  <button
                    key={estado}
                    className={`cotizaciones-admin-filtro-btn ${filtroEstado === estado ? 'activo' : ''}`}
                    onClick={() => setFiltroEstado(estado)}
                  >
                    {label} ({count})
                  </button>
                )
              })}
            </div>

            {todasCotizaciones.length === 0 ? (
              <div className="cotizaciones-admin-vacia">
                <p>No hay cotizaciones de clientes aún.</p>
              </div>
            ) : (
              <div className="cotizaciones-admin-grid">
                {todasCotizaciones
                  .filter((c) => filtroEstado === 'todas' || c.estado === filtroEstado)
                  .map((cot) => {
                    const total = Array.isArray(cot.estudios)
                      ? cot.estudios.reduce((s, e) => s + Number(e.precio || 0), 0)
                      : 0
                    const clienteNombre = cot.cliente?.Name || 'Cliente desconocido'
                    const clienteEmail = cot.cliente?.Email || ''
                    return (
                      <div key={cot.id} className="cotizaciones-admin-card">
                        <div className="cotizaciones-admin-card-header">
                          <span className="cotizaciones-admin-card-id">Cotización #{String(cot.id).slice(0, 8)}</span>
                          <span className={`cotizacion-estado estado-${(cot.estado || 'pendiente').toLowerCase()}`}>{cot.estado}</span>
                        </div>
                        <div className="cotizaciones-admin-card-body">
                          <div className="cotizaciones-admin-card-cliente">
                            <span className="cotizaciones-admin-card-label">Cliente:</span>
                            <span className="cotizaciones-admin-card-valor">{clienteNombre}</span>
                            {clienteEmail && <span className="cotizaciones-admin-card-email">{clienteEmail}</span>}
                          </div>
                          <div className="cotizaciones-admin-card-info">
                            <p>{Array.isArray(cot.estudios) ? cot.estudios.length : 0} estudio(s) — ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                            {cot.nota && <p className="cotizaciones-admin-card-nota">Nota: {cot.nota}</p>}
                            {cot.motivo_rechazo && <p className="cotizaciones-admin-card-rechazo">Motivo rechazo: {cot.motivo_rechazo}</p>}
                          </div>
                          <p className="cotizaciones-admin-card-fecha">{new Date(cot.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <button className="cotizaciones-admin-card-btn" onClick={() => { setCotDetalle(cot); setCotDetalleModal(true); setRechazoMotivo(''); setCotAdminError('') }}>Ver detalle</button>
                      </div>
                    )
                  })}
                {todasCotizaciones.filter((c) => filtroEstado === 'todas' || c.estado === filtroEstado).length === 0 && (
                  <div className="cotizaciones-admin-vacia">
                    <p>No hay cotizaciones con estado "{filtroEstado}".</p>
                  </div>
                )}
              </div>
            )}
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
      {carritoModal && (
        <div className="admin-modal-overlay" onClick={() => setCarritoModal(false)}>
          <div className="carrito-modal" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setCarritoModal(false)}>&times;</button>
            <h2 className="carrito-modal-title">Tu cotización</h2>
            {carrito.length === 0 ? (
              <p className="carrito-vacio">El carrito está vacío</p>
            ) : (
              <>
                <div className="carrito-lista">
                  {carrito.map((p) => (
                    <div key={p.id} className="carrito-item">
                      <div className="carrito-item-info">
                        <span className="carrito-item-nombre">{p.nombre}</span>
                        <span className="carrito-item-precio">${Number(p.precio).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <button className="carrito-item-remove" onClick={() => removeFromCarrito(p.id)}>&times;</button>
                    </div>
                  ))}
                </div>
                <div className="carrito-total">
                  <span>Total:</span>
                  <span>${carritoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="carrito-notas">
                  <label>Notas (opcional):</label>
                  <textarea value={cotNota} onChange={(e) => setCotNota(e.target.value)} rows={3} placeholder="Observaciones para la cotización..." />
                </div>
                {cotError && <div className="admin-form-error">{cotError}</div>}
                <div className="carrito-actions">
                  <button className="carrito-btn-limpiar" onClick={() => { setCarrito([]); setCotNota('') }}>Limpiar</button>
                  <button className="carrito-btn-enviar" onClick={enviarCotizacion}>Enviar cotización</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {cancelModal && cancelTarget && (
        <div className="admin-modal-overlay" onClick={() => setCancelModal(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setCancelModal(false)}>&times;</button>
            <h2>¿Cancelar cotización?</h2>
            <p>Se cancelará la cotización #{String(cancelTarget.id).slice(0, 8)} y no se podrá deshacer.</p>
            <div className="admin-modal-actions">
              <button className="admin-modal-cancel" onClick={() => setCancelModal(false)}>No, mantener</button>
              <button className="admin-modal-confirm" onClick={() => cancelarCotizacion(cancelTarget.id)}>Sí, cancelar</button>
            </div>
          </div>
        </div>
      )}
      {cotDetalleModal && cotDetalle && (
        <div className="admin-modal-overlay" onClick={() => setCotDetalleModal(false)}>
          <div className="cotizaciones-admin-modal" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setCotDetalleModal(false)}>&times;</button>
            <h2 className="cotizaciones-admin-modal-title">Cotización #{String(cotDetalle.id).slice(0, 8)}</h2>

            <div className="cotizaciones-admin-modal-info">
              <div className="cotizaciones-admin-modal-row">
                <span className="cotizaciones-admin-modal-label">Cliente:</span>
                <span>{cotDetalle.cliente?.Name || 'Desconocido'}</span>
              </div>
              <div className="cotizaciones-admin-modal-row">
                <span className="cotizaciones-admin-modal-label">Email:</span>
                <span>{cotDetalle.cliente?.Email || '-'}</span>
              </div>
              <div className="cotizaciones-admin-modal-row">
                <span className="cotizaciones-admin-modal-label">Fecha:</span>
                <span>{new Date(cotDetalle.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="cotizaciones-admin-modal-row">
                <span className="cotizaciones-admin-modal-label">Estado:</span>
                <span className={`cotizacion-estado estado-${(cotDetalle.estado || 'pendiente').toLowerCase()}`}>{cotDetalle.estado}</span>
              </div>
            </div>

            <h3 className="cotizaciones-admin-modal-subtitle">Estudios</h3>
            <div className="cotizaciones-admin-modal-estudios">
              {Array.isArray(cotDetalle.estudios) && cotDetalle.estudios.map((e, i) => (
                <div key={i} className="cotizaciones-admin-modal-estudio-item">
                  <span>{e.nombre}</span>
                  <span>${Number(e.precio || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
              <div className="cotizaciones-admin-modal-total">
                <span>Total:</span>
                <span>${Array.isArray(cotDetalle.estudios) ? cotDetalle.estudios.reduce((s, e) => s + Number(e.precio || 0), 0).toLocaleString('es-MX', { minimumFractionDigits: 2 }) : '0.00'}</span>
              </div>
            </div>

            {cotDetalle.nota && (
              <div className="cotizaciones-admin-modal-nota">
                <span className="cotizaciones-admin-modal-label">Nota del cliente:</span>
                <p>{cotDetalle.nota}</p>
              </div>
            )}

            {cotDetalle.motivo_rechazo && (
              <div className="cotizaciones-admin-modal-rechazo">
                <span className="cotizaciones-admin-modal-label">Motivo de rechazo:</span>
                <p>{cotDetalle.motivo_rechazo}</p>
              </div>
            )}

            {cotAdminError && <div className="admin-form-error">{cotAdminError}</div>}

            <div className="cotizaciones-admin-modal-acciones">
              {cotDetalle.estado !== 'Aceptada' && (
                <button className="cotizaciones-admin-btn-aceptar" onClick={() => actualizarEstadoCotizacion(cotDetalle.id, 'Aceptada')}>Aceptar</button>
              )}
              {cotDetalle.estado !== 'Rechazada' && (
                <button className="cotizaciones-admin-btn-rechazar" onClick={() => {
                  if (!rechazoMotivo.trim()) {
                    setCotAdminError('Debes escribir un motivo para rechazar')
                    return
                  }
                  setCotAdminError('')
                  actualizarEstadoCotizacion(cotDetalle.id, 'Rechazada', rechazoMotivo.trim())
                }}>Rechazar</button>
              )}
              {cotDetalle.estado !== 'Pendiente' && (
                <button className="cotizaciones-admin-btn-volver" onClick={() => actualizarEstadoCotizacion(cotDetalle.id, 'Pendiente')}>Volver a pendiente</button>
              )}
            </div>

            {cotDetalle.estado !== 'Rechazada' && (
              <div className="cotizaciones-admin-modal-rechazo-input">
                <label>Motivo de rechazo (requerido para rechazar):</label>
                <textarea
                  value={rechazoMotivo}
                  onChange={(e) => setRechazoMotivo(e.target.value)}
                  rows={3}
                  placeholder="Escribe el motivo del rechazo..."
                />
              </div>
            )}
          </div>
        </div>
      )}
      {printCot && (
        <div className="print-cotizacion">
          <div className="print-header">
            <h1>SUPP - Laboratorio Clínico</h1>
            <p>Cotización #{String(printCot.id).slice(0, 8)}</p>
          </div>
          <div className="print-info">
            <p><strong>Cliente:</strong> {user.Nombre || user.Name}</p>
            <p><strong>Email:</strong> {user.Email}</p>
            <p><strong>Fecha:</strong> {new Date(printCot.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p><strong>Estado:</strong> {printCot.estado}</p>
          </div>
          <table className="print-table">
            <thead>
              <tr>
                <th>Estudio</th>
                <th style={{ textAlign: 'right' }}>Precio</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(printCot.estudios) && printCot.estudios.map((e, i) => (
                <tr key={i}>
                  <td>{e.nombre}</td>
                  <td style={{ textAlign: 'right' }}>${Number(e.precio || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
              <tr className="print-total-row">
                <td>Total</td>
                <td style={{ textAlign: 'right' }}>${Array.isArray(printCot.estudios) ? printCot.estudios.reduce((s, e) => s + Number(e.precio || 0), 0).toLocaleString('es-MX', { minimumFractionDigits: 2 }) : '0.00'}</td>
              </tr>
            </tbody>
          </table>
          {printCot.nota && (
            <div className="print-nota">
              <p><strong>Nota:</strong> {printCot.nota}</p>
            </div>
          )}
          <div className="print-footer">
            <p>Gracias por confiar en SUPP</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
