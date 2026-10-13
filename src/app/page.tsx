'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { previewCategories, previewRestaurants, type PreviewRestaurant } from '@/lib/catalog-preview';

type Panel = 'cliente' | 'administrador' | 'restaurante' | 'repartidor';
type SignedInUser = { id: string; email: string; displayName: string };

const panelLabels: Record<Panel, string> = {
  cliente: 'Cliente',
  administrador: 'Administrador',
  restaurante: 'Restaurante',
  repartidor: 'Repartidor',
};

const operations = [
  ['Pedidos', 'Supervisa estados, excepciones y asignaciones.', '5 pendientes'],
  ['Restaurantes', 'Administra comercios, horarios y publicación.', '3 afiliados'],
  ['Repartidores', 'Controla disponibilidad, rutas y entregas.', '3 conectados'],
  ['Clientes', 'Consulta cuentas y direcciones protegidas.', '128 activos'],
];

export default function Home() {
  const [panel, setPanel] = useState<Panel>('cliente');
  const [pickup, setPickup] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof previewCategories)[number]>('Todos');
  const [selectedRestaurant, setSelectedRestaurant] = useState<PreviewRestaurant | null>(null);
  const [currentUser, setCurrentUser] = useState<SignedInUser | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);
  const [restaurantApplicationOpen, setRestaurantApplicationOpen] = useState(false);
  const visibleRestaurants = useMemo(() => previewRestaurants.filter((restaurant) => {
    const matchesText = `${restaurant.name} ${restaurant.cuisine} ${restaurant.zone}`.toLocaleLowerCase().includes(query.toLocaleLowerCase());
    return matchesText && (category === 'Todos' || restaurant.category === category);
  }), [category, query]);

  useEffect(() => {
    fetch('/api/auth/me').then(async (response) => response.ok ? response.json() : null).then((result: { user: SignedInUser | null } | null) => setCurrentUser(result?.user ?? null)).catch(() => setCurrentUser(null));
  }, []);

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
  }

  return (
    <main className="app-shell">
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="ComeYa, inicio"><span>c</span> Come<span>Y</span>a</a>
        <nav className="public-nav" aria-label="Navegación de ComeYa">
          <button className={panel === 'cliente' ? 'active' : ''} onClick={() => setPanel('cliente')}>Explorar</button>
          <a href="#como-funciona">Cómo funciona</a>
          <button className={panel === 'restaurante' ? 'active' : ''} onClick={() => setPanel('restaurante')}>Para comercios</button>
          <button className={panel === 'repartidor' ? 'active' : ''} onClick={() => setPanel('repartidor')}>Reparte con nosotros</button>
        </nav>
        <div className="site-actions"><span className="location">Puno, Perú</span>{currentUser ? <><span className="signed-in-name">Hola, {currentUser.displayName}</span><button className="account" onClick={signOut}>Salir</button></> : <button className="account" onClick={() => setAuthMode('login')}>Ingresar</button>}</div>
      </header>

      <section className="workspace">
        <nav className="preview-switch" aria-label="Previsualización de producto">
          <div><span>PREVISUALIZACIÓN</span><small>Recorre los flujos; no representa una sesión iniciada.</small></div>
          <div className="preview-options">
          {(Object.keys(panelLabels) as Panel[]).map((item) => (
            <button key={item} className={panel === item ? 'selected' : ''} onClick={() => setPanel(item)}>{panelLabels[item]}</button>
          ))}
          </div>
        </nav>

        {panel === 'cliente' && <CustomerView pickup={pickup} setPickup={setPickup} query={query} setQuery={setQuery} category={category} setCategory={setCategory} restaurants={visibleRestaurants} onChoose={setSelectedRestaurant} />}
        {panel === 'administrador' && <AdminView />}
        {panel === 'restaurante' && <RestaurantView currentUser={currentUser} onApply={() => currentUser ? setRestaurantApplicationOpen(true) : setAuthMode('login')} />}
        {panel === 'repartidor' && <CourierView />}
      </section>
      {selectedRestaurant && <RestaurantReferenceDialog restaurant={selectedRestaurant} onClose={() => setSelectedRestaurant(null)} />}
      {authMode && <AuthDialog mode={authMode} onClose={() => setAuthMode(null)} onSwitch={setAuthMode} onAuthenticated={(user) => { setCurrentUser(user); setAuthMode(null); }} />}
      {restaurantApplicationOpen && <RestaurantApplicationDialog onClose={() => setRestaurantApplicationOpen(false)} />}
    </main>
  );
}

function CustomerView({ pickup, setPickup, query, setQuery, category, setCategory, restaurants, onChoose }: { pickup: boolean; setPickup: (value: boolean) => void; query: string; setQuery: (value: string) => void; category: (typeof previewCategories)[number]; setCategory: (value: (typeof previewCategories)[number]) => void; restaurants: PreviewRestaurant[]; onChoose: (restaurant: PreviewRestaurant) => void }) {
  return <>
    <section className="hero">
      <p className="eyebrow">COMIDA LOCAL · PUNO</p>
      <h1>¿Qué se te antoja<br />hoy?</h1>
      <p>Encuentra sabores de Puno y ordénalos para recoger o recibir cuando la cobertura esté disponible.</p>
      <div className="mode-control" role="group" aria-label="Modo de pedido">
        <button className={pickup ? 'selected' : ''} onClick={() => setPickup(true)}>Recojo en local</button>
        <button className={!pickup ? 'selected' : ''} onClick={() => setPickup(false)}>Delivery ComeYa</button>
      </div>
    </section>
    <section className="content-section">
      <div className="section-heading"><div><p className="eyebrow">EXPLORAR</p><h2>Sabores de Puno</h2></div><span className="coverage">● Padrón de referencia</span></div>
      <label className="search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busca restaurantes, platos o categorías" /></label>
      {!pickup && <div className="notice"><strong>Delivery en activación.</strong> Mostraremos esta opción únicamente cuando haya cobertura y un repartidor elegible; por ahora puedes elegir recojo.</div>}
      <div className="category-row" aria-label="Filtrar categorías">{previewCategories.map((item) => <button key={item} className={category === item ? 'selected' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <div className="reference-notice"><strong>Catálogo en preparación.</strong> Estos locales provienen del padrón de mercado de Puno y aún requieren afiliación y validación antes de que ComeYa los publique o reciba pedidos.</div>
      <div className="restaurant-grid">
        {restaurants.map((restaurant) => <article className="restaurant-card" key={restaurant.id}><div className="restaurant-art">{restaurant.visual}</div><div className="restaurant-copy"><p>{restaurant.cuisine}</p><h3>{restaurant.name}</h3><small>{restaurant.zone}</small><button onClick={() => onChoose(restaurant)}>Ver ficha de referencia →</button></div></article>)}
      </div>
      {!restaurants.length && <p className="empty-state">No encontramos referencias con esos filtros.</p>}
    </section>
  </>;
}

function RestaurantReferenceDialog({ restaurant, onClose }: { restaurant: PreviewRestaurant; onClose: () => void }) {
  return <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}><section className="reference-dialog" role="dialog" aria-modal="true" aria-labelledby="reference-title" onMouseDown={(event) => event.stopPropagation()}><button className="dialog-close" onClick={onClose} aria-label="Cerrar">×</button><div className="dialog-art">{restaurant.visual}</div><p className="eyebrow">REFERENCIA DE MERCADO · PUNO</p><h2 id="reference-title">{restaurant.name}</h2><p>{restaurant.cuisine}</p><dl><div><dt>Zona</dt><dd>{restaurant.zone}</dd></div><div><dt>Estado</dt><dd>Afiliación pendiente</dd></div></dl><div className="dialog-warning">No mostramos menú, precio, horario, teléfono ni disponibilidad hasta que el comercio sea validado y autorice su publicación.</div><button className="primary" onClick={onClose}>Entendido</button></section></div>;
}

function AuthDialog({ mode, onClose, onSwitch, onAuthenticated }: { mode: 'login' | 'register'; onClose: () => void; onSwitch: (mode: 'login' | 'register') => void; onAuthenticated: (user: SignedInUser) => void }) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/auth/${mode === 'login' ? 'login' : 'register'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const result = await response.json() as { user?: SignedInUser; error?: string };
      if (!response.ok || !result.user) { setError(result.error ?? 'No pudimos completar esta acción.'); return; }
      onAuthenticated(result.user);
    } catch {
      setError('No pudimos conectar con ComeYa. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const isRegister = mode === 'register';
  return <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}><section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title" onMouseDown={(event) => event.stopPropagation()}><button className="dialog-close" onClick={onClose} aria-label="Cerrar">×</button><span className="auth-mark">c</span><p className="eyebrow">CUENTA COMEYA</p><h2 id="auth-title">{isRegister ? 'Crea tu cuenta' : 'Qué bueno verte de nuevo'}</h2><p className="auth-intro">{isRegister ? 'Empieza a guardar tus pedidos y preferencias en Puno.' : 'Ingresa para continuar con ComeYa.'}</p><form onSubmit={submit} className="auth-form">{isRegister && <label>Tu nombre<input required name="displayName" minLength={2} maxLength={80} autoComplete="name" /></label>}<label>Correo electrónico<input required name="email" type="email" autoComplete="email" /></label><label>Contraseña<input required name="password" type="password" minLength={isRegister ? 10 : 1} maxLength={128} autoComplete={isRegister ? 'new-password' : 'current-password'} />{isRegister && <small>Usa al menos 10 caracteres.</small>}</label>{error && <p className="auth-error" role="alert">{error}</p>}<button className="primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Un momento…' : isRegister ? 'Crear cuenta' : 'Ingresar'}</button></form><p className="auth-switch">{isRegister ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?'} <button onClick={() => onSwitch(isRegister ? 'login' : 'register')}>{isRegister ? 'Ingresa' : 'Crea una'}</button></p></section></div>;
}

function RestaurantApplicationDialog({ onClose }: { onClose: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const body = Object.fromEntries(new FormData(event.currentTarget).entries());
      const response = await fetch('/api/restaurant-applications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const result = await response.json() as { error?: string };
      if (!response.ok) { setError(result.error ?? 'No pudimos enviar la solicitud.'); return; }
      setSubmitted(true);
    } catch { setError('No pudimos conectar con ComeYa. Inténtalo de nuevo.'); } finally { setIsSubmitting(false); }
  }

  return <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}><section className="auth-dialog application-dialog" role="dialog" aria-modal="true" aria-labelledby="application-title" onMouseDown={(event) => event.stopPropagation()}><button className="dialog-close" onClick={onClose} aria-label="Cerrar">×</button>{submitted ? <><span className="auth-mark">✓</span><p className="eyebrow">SOLICITUD RECIBIDA</p><h2 id="application-title">Gracias por postular</h2><p className="auth-intro">Revisaremos la información del negocio antes de crear una membresía. Hasta entonces no se publicará ni recibirá pedidos.</p><button className="primary" onClick={onClose}>Entendido</button></> : <><p className="eyebrow">AFILIACIÓN DE COMERCIOS</p><h2 id="application-title">Cuéntanos sobre tu negocio</h2><p className="auth-intro">Esta solicitud no publica el restaurante ni concede acceso al portal.</p><form onSubmit={submit} className="auth-form"><label>Nombre del negocio<input required name="businessName" minLength={2} maxLength={120} /></label><label>Tipo de cocina<input required name="cuisine" minLength={2} maxLength={100} placeholder="Ej. comida puneña" /></label><label>Zona<input required name="zone" minLength={2} maxLength={120} placeholder="Ej. Centro / Plaza de Armas" /></label><label>Dirección<input required name="address" minLength={5} maxLength={180} /></label><label>Tu relación con el negocio<select required name="applicantRole" defaultValue=""><option value="" disabled>Selecciona una opción</option><option>Propietario(a)</option><option>Representante legal</option><option>Administrador(a) autorizado(a)</option></select></label>{error && <p className="auth-error" role="alert">{error}</p>}<button className="primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Enviando…' : 'Enviar solicitud'}</button></form></>}</section></div>;
}

function AdminView() {
  return <section className="admin-page"><div className="page-title"><div><p className="eyebrow">OPERACIÓN · PUNO</p><h1>Administrador</h1></div><span>Actualizado ahora</span></div><div className="metric-grid">{[['Pedidos del día', '128', '↑ 12.3% vs. ayer'], ['Ventas totales', 'S/ 5,842', '↑ 8.6% vs. ayer'], ['Comisión ComeYa', 'S/ 0', 'Sin tarifas activas'], ['Tiempo de entrega', '32 min', '↓ 4 min vs. ayer']].map(([label, value, delta]) => <article className="metric" key={label}><p>{label}</p><strong>{value}</strong><span>{delta}</span></article>)}</div><div className="admin-grid"><article className="chart-card"><h2>Ritmo de pedidos</h2><p>Pedidos procesados durante el día</p><div className="bars">{[30, 48, 62, 44, 75, 88, 65, 105, 80, 112, 90, 120].map((height, index) => <i key={index} style={{ height }} />)}</div></article><article className="coverage-card"><h2>Cobertura de ComeYa</h2><p>Puno · activación por zonas</p><div className="coverage-map"><span>🏪</span><b>↝</b><span>🛵</span><b>↝</b><span>⌂</span></div></article></div><article className="operations"><div className="operation-head"><div><h2>Módulos de ComeYa</h2><p>Accede a cada área de la operación desde una lista clara.</p></div><span>Estado</span></div>{operations.map(([title, detail, status]) => <div className="operation" key={title}><div><h3>{title}</h3><p>{detail}</p></div><small>{status}</small><a href="#">Abrir →</a></div>)}</article></section>;
}

function RestaurantView({ currentUser, onApply }: { currentUser: SignedInUser | null; onApply: () => void }) {
  return <section className="portal-page"><div className="page-title"><div><p className="eyebrow">PARA COMERCIOS</p><h1>Haz crecer tu restaurante con ComeYa</h1></div><button className="primary" onClick={onApply}>{currentUser ? 'Solicitar afiliación' : 'Ingresa para afiliarte'}</button></div><div className="portal-preview-notice"><strong>Portal en construcción.</strong> El panel que sigue es una previsualización del flujo. Solo una membresía aprobada permitirá acceder a pedidos, menú y horarios reales.</div><div className="portal-status"><span className="status-dot" /> Vista de referencia · no representa un restaurante conectado</div><div className="two-columns"><article className="panel"><h2>Pedidos por aceptar</h2><div className="order-row"><div><strong>#CY-1048</strong><p>2 platos · Recojo · S/ 38.00</p></div><button className="primary" disabled>Aceptar</button></div><div className="order-row"><div><strong>#CY-1049</strong><p>1 plato · Recojo · S/ 22.00</p></div><button className="outline" disabled>Revisar</button></div></article><article className="panel"><h2>Menú de hoy</h2><p>La publicación de menú se habilitará después de aprobar la afiliación.</p><button className="outline" disabled>Administrar menú →</button></article></div></section>;
}

function CourierView() {
  return <section className="portal-page"><div className="page-title"><div><p className="eyebrow">RED DE REPARTIDORES</p><h1>Mi jornada</h1></div><button className="primary">Estoy disponible</button></div><div className="courier-card"><p>ESTADO DE ENTREGA</p><h2>Aún no tienes una entrega asignada</h2><span>Cuando la operación confirme una zona y un pedido compatible, verás los datos mínimos necesarios para cumplirlo.</span></div><div className="two-columns"><article className="panel"><h2>Ganancias</h2><strong className="large-number">S/ 0.00</strong><p>Las ganancias se calculan por pedido y se liquidan en ciclos; esta vista no ejecuta pagos reales.</p></article><article className="panel"><h2>Zona de trabajo</h2><p>Puno · pendiente de activación operativa</p><button className="outline">Ver cobertura →</button></article></div></section>;
}
