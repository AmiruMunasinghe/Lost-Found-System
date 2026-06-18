import { useEffect, useMemo, useState } from 'react'
import './App.css'
import {
  approveMatch,
  approveReport,
  confirmMatch,
  getAdminItems,
  getAnalytics,
  getCurrentAdmin,
  getMatches,
  getPendingReports,
  getReviewQueue,
  getUsersFromItems,
  loginAdmin,
  logoutAdmin,
  rejectMatch,
  rejectReport,
  runMatchingForLostItem,
} from './services/adminApi'

const routes = [
  { path: '/admin/claims', label: 'Pending Reports', hint: 'Approve new lost/found reports' },
  { path: '/admin/items', label: 'Approved Items', hint: 'All approved lost/found items' },
  { path: '/admin/matches', label: 'Matches', hint: 'Review and confirm matches' },
  { path: '/admin/analytics', label: 'Analytics', hint: 'System overview' },
  { path: '/admin/users', label: 'Users', hint: 'Report submitters' },
]

function navigate(path) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function useRoute() {
  const [path, setPath] = useState(window.location.pathname)
  useEffect(() => {
    const handler = () => setPath(window.location.pathname)
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])
  if (path === '/' || path === '/admin' || path === '/admin/login') return '/admin/claims'
  return path
}

function formatDate(value) {
  if (!value) return '—'
  try { return new Date(value).toLocaleString() } catch { return String(value) }
}

function statusTone(status) {
  const s = String(status || '').toUpperCase()
  if (s === 'PENDING_REVIEW') return 'warning'
  if (s === 'OPEN' || s === 'SUGGESTED' || s === 'ACCEPTED') return 'success'
  if (s === 'CLOSED' || s === 'REJECTED') return 'danger'
  if (s === 'MATCHED') return 'info'
  return 'muted'
}

function scoreText(score) {
  if (score === null || score === undefined) return '—'
  const n = Number(score)
  if (Number.isNaN(n)) return String(score)
  return `${Math.round(n * 100)}%`
}

function Badge({ children, tone }) {
  return <span className={`badge ${tone || 'muted'}`}>{children}</span>
}

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const admin = await loginAdmin({ username, password })
      onLogin(admin)
      navigate('/admin/claims')
    } catch (err) {
      setError(err.message || 'Admin login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <div className="brand-row">
          <div className="brand-mark">LF</div>
          <div>
            <p className="eyebrow">Admin portal</p>
            <h1>Lost & Found Admin</h1>
          </div>
        </div>
        <p className="muted-copy">Sign in to approve pending reports, run matching, and review system analytics.</p>
        <form className="admin-login-form" onSubmit={handleSubmit}>
          <label><span>Username or email</span><input value={username} onChange={(e) => setUsername(e.target.value)} /></label>
          <label><span>Password</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          {error && <div className="error-box">{error}</div>}
          <button className="primary-button" disabled={loading}>{loading ? 'Signing in...' : 'Log in as Admin'}</button>
        </form>
        <p className="hint-box">Default local credentials: <strong>admin / admin123</strong></p>
      </section>
    </main>
  )
}

function Shell({ admin, activePath, onLogout, children }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="brand-row">
          <div className="brand-mark">LF</div>
          <div><strong>LostFound Admin</strong><span>Operations panel</span></div>
        </div>
        <nav className="admin-nav">
          {routes.map((route) => (
            <button key={route.path} className={activePath === route.path ? 'active' : ''} onClick={() => navigate(route.path)}>
              <strong>{route.label}</strong><small>{route.hint}</small>
            </button>
          ))}
        </nav>
        <div className="sidebar-card"><span>Signed in</span><strong>{admin?.name || 'Admin'}</strong><button onClick={onLogout}>Log out</button></div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar">
          <div><p className="eyebrow">University Lost & Found</p><h1>{routes.find((r) => r.path === activePath)?.label || 'Admin'}</h1></div>
          <button className="ghost-button" onClick={() => navigate('/dashboard')}>Student View</button>
        </header>
        <div className="admin-content">{children}</div>
      </main>
    </div>
  )
}

function PendingReportsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState(null)

  async function load() {
    setLoading(true)
    setNotice('')
    try { setItems(await getPendingReports()) }
    catch (err) { setNotice(err.message || 'Failed to load pending reports.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function approve(item) {
    setBusyId(item.id)
    setNotice('Approving report and running matching when applicable...')
    try {
      await approveReport(item.id)
      setNotice(`Approved item #${item.id}. Matching has been run for approved LOST reports.`)
      await load()
    } catch (err) { setNotice(err.message || 'Approval failed.') }
    finally { setBusyId(null) }
  }

  async function reject(item) {
    if (!confirm(`Reject/close item #${item.id}?`)) return
    setBusyId(item.id)
    setNotice('Rejecting report...')
    try { await rejectReport(item.id); setNotice(`Rejected item #${item.id}.`); await load() }
    catch (err) { setNotice(err.message || 'Reject failed.') }
    finally { setBusyId(null) }
  }

  return (
    <section className="panel-page">
      <div className="panel-heading"><div><p className="eyebrow">Admin approval</p><h2>Pending Lost/Found Reports</h2></div><span className="count-pill">{items.length} pending</span></div>
      {notice && <div className="notice-box">{notice}</div>}
      {loading ? <div className="empty-state">Loading pending reports...</div> : items.length === 0 ? <div className="empty-state">No pending reports. New user reports will appear here first.</div> : (
        <div className="card-grid">
          {items.map((item) => <ItemCard key={item.id} item={item} actions={<><button className="primary-button" disabled={busyId === item.id} onClick={() => approve(item)}>Approve & Run Matching</button><button className="danger-button" disabled={busyId === item.id} onClick={() => reject(item)}>Reject</button></>} />)}
        </div>
      )}
    </section>
  )
}

function ItemsPage() {
  const [items, setItems] = useState([])
  const [type, setType] = useState('ALL')
  const [status, setStatus] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')

  async function load() {
    setLoading(true)
    try { setItems(await getAdminItems(type === 'ALL' ? null : type)) }
    catch (err) { setNotice(err.message || 'Failed to load items.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [type])

  const filtered = items.filter((item) => status === 'ALL' || item.status === status)

  return (
    <section className="panel-page">
      <div className="panel-heading"><div><p className="eyebrow">Approved registry</p><h2>All Items</h2></div><button className="ghost-button" onClick={load}>Refresh</button></div>
      <div className="toolbar"><select value={type} onChange={(e) => setType(e.target.value)}><option value="ALL">All types</option><option value="LOST">Lost</option><option value="FOUND">Found</option></select><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="ALL">All statuses</option><option value="OPEN">Approved/Open</option><option value="MATCHED">Matched</option><option value="PENDING_REVIEW">Pending</option><option value="CLOSED">Closed</option></select></div>
      {notice && <div className="notice-box">{notice}</div>}
      {loading ? <div className="empty-state">Loading items...</div> : <div className="card-grid">{filtered.map((item) => <ItemCard key={item.id} item={item} />)}</div>}
    </section>
  )
}

function MatchesPage() {
  const [matches, setMatches] = useState([])
  const [lostItems, setLostItems] = useState([])
  const [selectedLostId, setSelectedLostId] = useState('')
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')

  async function load() {
    setLoading(true)
    setNotice('')
    try {
      const [allMatches, lost] = await Promise.all([getMatches(), getAdminItems('LOST')])
      setMatches(allMatches)
      const openLost = lost.filter((item) => item.status === 'OPEN')
      setLostItems(openLost)
      setSelectedLostId((current) => current || openLost[0]?.id || '')
    } catch (err) { setNotice(err.message || 'Failed to load matches.') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function runMatching() {
    if (!selectedLostId) return setNotice('Select an approved lost item first.')
    setNotice('Running matching...')
    try { const res = await runMatchingForLostItem(selectedLostId); setNotice(`Matching returned ${res.length} result(s).`); await load() }
    catch (err) { setNotice(err.message || 'Matching failed.') }
  }

  async function review(match, action) {
    setNotice('Saving match decision...')
    try {
      if (action === 'approve') await approveMatch(match.id)
      else if (action === 'reject') await rejectMatch(match.id)
      else await confirmMatch(match.id)
      setNotice('Match updated. User notifications are sent when a match becomes suggested.')
      await load()
    } catch (err) { setNotice(err.message || 'Match action failed.') }
  }

  return (
    <section className="panel-page">
      <div className="panel-heading"><div><p className="eyebrow">Match review</p><h2>Matching Results</h2></div><button className="ghost-button" onClick={load}>Refresh</button></div>
      <div className="toolbar"><select value={selectedLostId} onChange={(e) => setSelectedLostId(e.target.value)}><option value="">Select approved lost item</option>{lostItems.map((item) => <option key={item.id} value={item.id}>#{item.id} - {item.title}</option>)}</select><button className="primary-button" onClick={runMatching}>Run Matching</button></div>
      {notice && <div className="notice-box">{notice}</div>}
      {loading ? <div className="empty-state">Loading matches...</div> : matches.length === 0 ? <div className="empty-state">No matches yet.</div> : <div className="match-list">{matches.map((match) => <MatchCard key={match.id} match={match} onReview={review} />)}</div>}
    </section>
  )
}

function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [notice, setNotice] = useState('')
  useEffect(() => { getAnalytics().then(setData).catch((err) => setNotice(err.message || 'Analytics failed.')) }, [])
  const summary = data?.summary || {}
  return (
    <section className="panel-page">
      <div className="panel-heading"><div><p className="eyebrow">Live overview</p><h2>Analytics</h2></div></div>
      {notice && <div className="notice-box">{notice}</div>}
      {!data ? <div className="empty-state">Loading analytics...</div> : <>
        <div className="kpi-grid">{Object.entries(summary).map(([key, value]) => <div className="kpi-card" key={key}><span>{key.replace(/([A-Z])/g, ' $1')}</span><strong>{value}</strong></div>)}</div>
        <div className="analytics-grid"><Breakdown title="Reports by Category" rows={data.categoryBreakdown} /><Breakdown title="Reports by Status" rows={data.statusBreakdown} /></div>
      </>}
    </section>
  )
}

function UsersPage() {
  const [users, setUsers] = useState([])
  const [notice, setNotice] = useState('')
  useEffect(() => { getUsersFromItems().then(setUsers).catch((err) => setNotice(err.message || 'Failed to load users.')) }, [])
  return <section className="panel-page"><div className="panel-heading"><div><p className="eyebrow">Submitters</p><h2>Users from Reports</h2></div></div>{notice && <div className="notice-box">{notice}</div>}<div className="table-wrap"><table><thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Name</th></tr></thead><tbody>{users.map((u) => <tr key={u.id}><td>{u.id}</td><td>{u.username}</td><td>{u.email}</td><td>{u.fullName || u.name || '—'}</td></tr>)}</tbody></table></div></section>
}

function ItemCard({ item, actions }) {
  return <article className="item-card"><div className="item-card-head"><Badge tone={item.reportType === 'LOST' ? 'danger' : 'success'}>{item.reportType}</Badge><Badge tone={statusTone(item.status)}>{item.status}</Badge></div><h3>{item.title}</h3><p className="description">{item.description || 'No description'}</p><div className="meta"><span>#{item.id}</span><span>{item.category}</span><span>📍 {item.location || 'No location'}</span><span>User {item.userId}</span><span>{formatDate(item.createdAt)}</span></div>{actions && <div className="actions">{actions}</div>}</article>
}

function MatchCard({ match, onReview }) {
  const pending = match.status === 'PENDING_REVIEW'
  return <article className="match-card"><div className="match-top"><div><h3>Match #{match.id}</h3><p>Confidence: <strong>{scoreText(match.confidenceScore)}</strong></p></div><Badge tone={statusTone(match.status)}>{match.status}</Badge></div><div className="match-columns"><ItemMini title="Lost" item={match.lostItem} /><ItemMini title="Found" item={match.foundItem} /></div><div className="actions">{pending && <><button className="primary-button" onClick={() => onReview(match, 'approve')}>Approve for Users</button><button className="danger-button" onClick={() => onReview(match, 'reject')}>Reject</button></>}<button className="ghost-button" onClick={() => onReview(match, 'confirm')}>Confirm Returned</button></div></article>
}

function ItemMini({ title, item }) {
  return <div className="mini"><span>{title}</span><strong>{item?.title || 'Untitled'}</strong><p>{item?.description || 'No description'}</p><small>{item?.category || 'Other'} · {item?.location || 'No location'} · User {item?.userId}</small></div>
}

function Breakdown({ title, rows = [] }) {
  const max = Math.max(1, ...rows.map((r) => r.value || 0))
  return <div className="panel-block"><h3>{title}</h3>{rows.length === 0 ? <p className="muted-copy">No data yet.</p> : rows.map((row) => <div className="bar-row" key={row.label}><span>{row.label}</span><div><i style={{ width: `${((row.value || 0) / max) * 100}%` }} /></div><strong>{row.value}</strong></div>)}</div>
}

export default function App({ onLogout } = {}) {
  const route = useRoute()
  const [admin, setAdmin] = useState(() => getCurrentAdmin())
  const isAdmin = admin?.role === 'ADMIN'
  const activePath = routes.some((r) => r.path === route) ? route : '/admin/claims'

  if (!isAdmin) return <AdminLogin onLogin={setAdmin} />

  return <Shell admin={admin} activePath={activePath} onLogout={() => { logoutAdmin(); setAdmin(null); if (onLogout) onLogout(); else navigate('/login') }}>{activePath === '/admin/claims' && <PendingReportsPage />}{activePath === '/admin/items' && <ItemsPage />}{activePath === '/admin/matches' && <MatchesPage />}{activePath === '/admin/analytics' && <AnalyticsPage />}{activePath === '/admin/users' && <UsersPage />}</Shell>
}
