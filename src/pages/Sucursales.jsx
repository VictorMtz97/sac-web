function Sucursales() {
  return (
    <div className="page sucursales-page">
      <h1>Sucursales</h1>
      <div className="sucursales-info">
        <div className="sucursal-card">
          <div className="sucursal-card-header">
            <svg className="sucursal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <h2>Sucursal Centro</h2>
          </div>
          <p className="sucursal-direccion">
            <svg className="sucursal-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Centro Histórico, 78000 San Luis Potosí, S.L.P.
          </p>
          <div className="sucursal-horarios">
            <div className="sucursal-horario-row">
              <svg className="sucursal-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span><strong>Lunes a Viernes:</strong> 7:00 am - 8:00 pm</span>
            </div>
            <div className="sucursal-horario-row">
              <svg className="sucursal-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span><strong>Sábados y Domingos:</strong> 10:00 am - 2:00 pm</span>
            </div>
          </div>
        </div>
        <div className="sucursal-mapa">
          <div className="sucursal-mapa-badge">Ver en Google Maps</div>
          <iframe
            title="Ubicación Sucursal"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d118801.94797752298!2d-101.01496621517061!3d22.1549096387703!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x842aa1bb0f9dda15%3A0x43facc0b8b7bafda!2sCentro%20Hist%C3%B3rico%2C%2078000%20San%20Luis%20Potos%C3%AD%2C%20S.L.P.!5e0!3m2!1ses!2smx!4v1"
            width="100%"
            height="400"
            style={{ border: 0, borderRadius: 12 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  )
}

export default Sucursales
