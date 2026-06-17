import { useEffect, useMemo, useState } from 'react'
import './App.css'
import {
  approveClaim,
  getAnalytics,
  getAuditLog,
  getClaims,
  getCurrentAdmin,
  rejectClaim,
  requestMoreEvidence,
  schedulePickup,
} from './services/adminApi'
import {
  formatConfidence,
  formatDateTime,
  formatStatus,
  getStatusTone,
  toKebabCase,
} from './utils/formatters'

const routes = [
  { path: '/admin/claims', label: 'Claims Queue', shortLabel: 'Claims' },
  { path: '/admin/analytics', label: 'Analytics Views', shortLabel: 'Analytics' },
  { path: '/admin/audit-log', label: 'Audit Log', shortLabel: 'Audit' },
]

const claimStatuses = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_CONFLICT', label: 'In Conflict' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
]

const rangeOptions = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'semester', label: 'Semester' },
  { value: 'all', label: 'All' },
]

const pageTitles = {
  '/admin/claims': 'Claims Queue',
  '/admin/analytics': 'Analytics Views',
  '/admin/audit-log': 'Audit Log',
  '/403': 'Access Restricted',
}

function navigate(path) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function useRoute() {
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    const handleRouteChange = () => setPath(window.location.pathname)
    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  return path === '/' ? '/admin/claims' : path
}

function App() {
  const route = useRoute()
  const admin = getCurrentAdmin()
  const isAdmin = admin?.role === 'ADMIN'
  const guardedRoute = isAdmin ? route : '/403'

  useEffect(() => {
    if (window.location.pathname === '/') navigate('/admin/claims')
  }, [route])

  return (
    <div className="app-shell">
      <Sidebar activePath={guardedRoute} />
      <main className="main-panel">
        <Topbar title={pageTitles[guardedRoute] || 'Claims Queue'} admin={admin} />
        <div className="page-surface">
          {!isAdmin && <ForbiddenPage />}
          {isAdmin && guardedRoute === '/admin/claims' && <ClaimsPage />}
          {isAdmin && guardedRoute === '/admin/analytics' && <AnalyticsPage />}
          {isAdmin && guardedRoute === '/admin/audit-log' && <AuditLogPage />}
          {isAdmin && !pageTitles[guardedRoute] && <ClaimsPage />}
        </div>
      </main>
    </div>
  )
}

function Sidebar({ activePath }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">LF</div>
        <div>
          <strong>LostFound Admin</strong>
          <span>University operations</span>
        </div>
      </div>

      <nav className="nav-list" aria-label="Admin dashboard">
        {routes.map((route) => (
          <button
            key={route.path}
            className={activePath === route.path ? 'nav-item active' : 'nav-item'}
            type="button"
            onClick={() => navigate(route.path)}
          >
            <span>{route.shortLabel}</span>
            <small>{route.label}</small>
          </button>
        ))}
      </nav>

      <div className="sidebar-note">
        <span>Mock API mode</span>
        <strong>Ready for Team 7 endpoints</strong>
      </div>
    </aside>
  )
}

function Topbar({ title, admin }) {
  function handleLogout() {
    localStorage.setItem(
      'adminUser',
      JSON.stringify({ ...admin, role: 'USER', name: 'Signed out user' }),
    )
    navigate('/403')
  }

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Admin Dashboard UI</p>
        <h1>{title}</h1>
      </div>
      <div className="admin-chip">
        <div className="avatar" aria-hidden="true">
          T9
        </div>
        <div>
          <strong>{admin?.name || 'Admin'}</strong>
          <span>{admin?.role || 'UNKNOWN'}</span>
        </div>
        <button className="ghost-button" type="button" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </header>
  )
}

function ClaimsPage() {
  const [claims, setClaims] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [status, setStatus] = useState('ALL')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let cancelled = false
    getClaims({ status, q: query })
      .then((data) => {
        if (cancelled) return
        setClaims(data)
        setSelectedId((current) => current || data[0]?.id || '')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [status, query])

  const selectedClaim = useMemo(
    () => claims.find((claim) => claim.id === selectedId) || claims[0],
    [claims, selectedId],
  )

  async function runClaimAction(action, successMessage) {
    if (!selectedClaim) return
    setNotice('Saving review decision...')

    try {
      const updatedClaim = await action(selectedClaim.id)
      setClaims((current) =>
        current.map((claim) => (claim.id === updatedClaim.id ? updatedClaim : claim)),
      )
      setSelectedId(updatedClaim.id)
      setNotice(successMessage)
    } catch (error) {
      setNotice(error.message)
    }
  }

  return (
    <section className="claims-layout">
      <div className="panel list-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Review workflow</p>
            <h2>Claims queue</h2>
          </div>
          <span className="count-pill">{claims.length} visible</span>
        </div>

        <div className="toolbar">
          <label className="search-field">
            <span>Search claims</span>
            <input
              value={query}
              onChange={(event) => {
                setLoading(true)
                setQuery(event.target.value)
              }}
              placeholder="Name, item, category, location"
            />
          </label>

          <div className="segmented-control" aria-label="Claim status filter">
            {claimStatuses.map((option) => (
              <button
                key={option.value}
                className={status === option.value ? 'active' : ''}
                type="button"
                onClick={() => {
                  setLoading(true)
                  setStatus(option.value)
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {loading && <div className="empty-state">Loading claims...</div>}
        {!loading && claims.length === 0 && (
          <div className="empty-state">No claims match the selected filters.</div>
        )}
        {!loading && claims.length > 0 && (
          <div className="claim-list">
            {claims.map((claim) => (
              <button
                key={claim.id}
                className={claim.id === selectedClaim?.id ? 'claim-row active' : 'claim-row'}
                type="button"
                onClick={() => setSelectedId(claim.id)}
              >
                <div>
                  <strong>{claim.item.title}</strong>
                  <span>
                    {claim.id} by {claim.claimant.name}
                  </span>
                </div>
                <div className="row-meta">
                  <Badge tone={getStatusTone(claim.status)}>
                    {formatStatus(claim.status)}
                  </Badge>
                  <small>{formatConfidence(claim.match.confidenceScore)}</small>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <ClaimDetailPanel
        key={selectedClaim?.id || 'empty-claim'}
        claim={selectedClaim}
        notice={notice}
        onApprove={() =>
          runClaimAction(approveClaim, 'Claim approved and claimant notified.')
        }
        onReject={(reason) =>
          runClaimAction(
            (claimId) => rejectClaim(claimId, reason),
            'Claim rejected with reason saved.',
          )
        }
        onRequestEvidence={(message) =>
          runClaimAction(
            (claimId) => requestMoreEvidence(claimId, message),
            'Additional evidence request sent.',
          )
        }
        onSchedulePickup={(pickup) =>
          runClaimAction(
            (claimId) => schedulePickup(claimId, pickup),
            'Pickup schedule saved and status updated.',
          )
        }
      />
    </section>
  )
}

function ClaimDetailPanel({
  claim,
  notice,
  onApprove,
  onReject,
  onRequestEvidence,
  onSchedulePickup,
}) {
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')
  const [pickupAt, setPickupAt] = useState('')
  const [pickupLocation, setPickupLocation] = useState('Student Services Desk')

  if (!claim) {
    return (
      <div className="panel detail-panel">
        <div className="empty-state">Select a claim to review its evidence.</div>
      </div>
    )
  }

  const canDecide = ['PENDING', 'IN_CONFLICT', 'MORE_EVIDENCE'].includes(claim.status)
  const canSchedule = ['APPROVED', 'AWAITING_PICKUP'].includes(claim.status)

  return (
    <div className="panel detail-panel">
      <div className="detail-hero">
        <img src={claim.item.imageUrl} alt={claim.item.title} />
        <div>
          <div className="detail-title-row">
            <Badge tone={getStatusTone(claim.status)}>
              {formatStatus(claim.status)}
            </Badge>
            <span className="priority">{claim.priority} priority</span>
          </div>
          <h2>{claim.item.title}</h2>
          <p>{claim.item.description}</p>
        </div>
      </div>

      {notice && <div className="notice">{notice}</div>}

      <div className="detail-grid">
        <InfoBlock label="Claim ID" value={claim.id} />
        <InfoBlock label="Item ID" value={claim.item.id} />
        <InfoBlock label="Category" value={claim.item.category} />
        <InfoBlock label="Location" value={claim.item.location} />
        <InfoBlock label="Submitted" value={formatDateTime(claim.createdAt)} />
        <InfoBlock label="Updated" value={formatDateTime(claim.updatedAt)} />
      </div>

      <section className="review-section">
        <h3>Claimant evidence</h3>
        <p>{claim.evidence.summary}</p>
        <div className="attachment-list">
          {claim.evidence.attachments.map((attachment) => (
            <span key={attachment}>{attachment}</span>
          ))}
        </div>
      </section>

      <section className="review-section">
        <h3>Match review</h3>
        <div className="confidence-row">
          <div>
            <strong>{formatConfidence(claim.match.confidenceScore)}</strong>
            <span>matching confidence</span>
          </div>
          <div className="confidence-track">
            <span
              style={{ width: formatConfidence(claim.match.confidenceScore) }}
            />
          </div>
        </div>
        <div className="tag-list">
          {claim.match.matchedTerms.map((term) => (
            <span key={term}>{term}</span>
          ))}
        </div>
      </section>

      {claim.decisionReason && (
        <section className="review-section">
          <h3>Decision note</h3>
          <p>{claim.decisionReason}</p>
        </section>
      )}

      <section className="review-section action-stack">
        <h3>Admin actions</h3>
        <div className="button-row">
          <button
            className="primary-button"
            type="button"
            onClick={onApprove}
            disabled={!canDecide}
          >
            Approve
          </button>
          <button
            className="danger-button"
            type="button"
            onClick={() => reason.trim() && onReject(reason.trim())}
            disabled={!canDecide || !reason.trim()}
          >
            Reject
          </button>
        </div>
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Required rejection reason"
          rows="3"
        />
        <div className="button-row split-row">
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Message requesting more evidence"
          />
          <button
            className="secondary-button"
            type="button"
            onClick={() => message.trim() && onRequestEvidence(message.trim())}
            disabled={!canDecide || !message.trim()}
          >
            Request Evidence
          </button>
        </div>
        <div className="button-row split-row">
          <input
            type="datetime-local"
            value={pickupAt}
            onChange={(event) => setPickupAt(event.target.value)}
            aria-label="Pickup date and time"
          />
          <input
            value={pickupLocation}
            onChange={(event) => setPickupLocation(event.target.value)}
            aria-label="Pickup location"
          />
          <button
            className="secondary-button"
            type="button"
            onClick={() =>
              pickupAt &&
              pickupLocation.trim() &&
              onSchedulePickup({
                pickupAt,
                location: pickupLocation.trim(),
              })
            }
            disabled={!canSchedule || !pickupAt || !pickupLocation.trim()}
          >
            Schedule Pickup
          </button>
        </div>
      </section>
    </div>
  )
}

function AnalyticsPage() {
  const [range, setRange] = useState('30d')
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    let cancelled = false
    getAnalytics(range).then((data) => {
      if (!cancelled) setAnalytics(data)
    })

    return () => {
      cancelled = true
    }
  }, [range])

  if (!analytics) {
    return <div className="panel empty-state">Loading analytics...</div>
  }

  const kpis = [
    ['Total reports', analytics.summary.totalReports],
    ['Pending claims', analytics.summary.pendingClaims],
    ['Approved claims', analytics.summary.approvedClaims],
    ['Rejected claims', analytics.summary.rejectedClaims],
    ['Recovered items', analytics.summary.recoveredItems],
    ['Avg. review time', analytics.summary.averageReviewTime],
  ]

  return (
    <section className="analytics-layout">
      <div className="page-actions">
        <div>
          <p className="eyebrow">Operational metrics</p>
          <h2>Campus lost and found performance</h2>
        </div>
        <div className="segmented-control compact">
          {rangeOptions.map((option) => (
            <button
              key={option.value}
              className={range === option.value ? 'active' : ''}
              type="button"
              onClick={() => setRange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="kpi-grid">
        {kpis.map(([label, value]) => (
          <div className="panel kpi-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <div className="chart-grid">
        <TrendChart title="Lost vs found trends" data={analytics.trendSeries} />
        <BarChart title="Claims by status" data={analytics.statusBreakdown} />
        <BarChart title="Reports by category" data={analytics.categoryBreakdown} />
        <BarChart title="Reports by location" data={analytics.locationBreakdown} />
        <BarChart
          title="Matching confidence distribution"
          data={analytics.confidenceDistribution}
        />
      </div>
    </section>
  )
}

function TrendChart({ title, data }) {
  const maxValue = Math.max(...data.flatMap((item) => [item.lost, item.found]))

  return (
    <div className="panel chart-card wide-chart">
      <h3>{title}</h3>
      <div className="trend-chart">
        {data.map((item) => (
          <div className="trend-column" key={item.label}>
            <div className="trend-bars">
              <span
                className="lost-bar"
                style={{ height: `${(item.lost / maxValue) * 100}%` }}
                title={`${item.lost} lost reports`}
              />
              <span
                className="found-bar"
                style={{ height: `${(item.found / maxValue) * 100}%` }}
                title={`${item.found} found reports`}
              />
            </div>
            <small>{item.label}</small>
          </div>
        ))}
      </div>
      <div className="legend">
        <span className="legend-lost">Lost</span>
        <span className="legend-found">Found</span>
      </div>
    </div>
  )
}

function BarChart({ title, data }) {
  const maxValue = Math.max(...data.map((item) => item.value))

  return (
    <div className="panel chart-card">
      <h3>{title}</h3>
      <div className="bar-list">
        {data.map((item) => (
          <div className="bar-row" key={item.label}>
            <div>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
            <div className="bar-track">
              <span style={{ width: `${(item.value / maxValue) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AuditLogPage() {
  const [events, setEvents] = useState([])
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    adminId: '',
  })
  const [selectedEvent, setSelectedEvent] = useState(null)

  useEffect(() => {
    let cancelled = false
    getAuditLog(filters).then((data) => {
      if (!cancelled) {
        setEvents(data)
        setSelectedEvent((current) => current || data[0] || null)
      }
    })

    return () => {
      cancelled = true
    }
  }, [filters])

  const actionOptions = [...new Set(events.map((event) => event.action))]

  return (
    <section className="audit-layout">
      <div className="panel audit-table-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Immutable activity trail</p>
            <h2>Audit log</h2>
          </div>
          <Badge tone="info">Read-only</Badge>
        </div>

        <div className="audit-filters">
          <select
            value={filters.action}
            onChange={(event) =>
              setFilters((current) => ({ ...current, action: event.target.value }))
            }
            aria-label="Action type"
          >
            <option value="">All actions</option>
            {actionOptions.map((action) => (
              <option key={action} value={action}>
                {action.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
          <select
            value={filters.entityType}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                entityType: event.target.value,
              }))
            }
            aria-label="Entity type"
          >
            <option value="">All entities</option>
            <option value="CLAIM">Claim</option>
            <option value="ITEM">Item</option>
          </select>
          <input
            value={filters.adminId}
            onChange={(event) =>
              setFilters((current) => ({ ...current, adminId: event.target.value }))
            }
            placeholder="Admin name or ID"
          />
        </div>

        <div className="audit-table-wrap">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Admin</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr
                  key={event.id}
                  className={selectedEvent?.id === event.id ? 'selected' : ''}
                  onClick={() => setSelectedEvent(event)}
                >
                  <td>{formatDateTime(event.timestamp)}</td>
                  <td>{event.admin.name}</td>
                  <td>{event.action.replaceAll('_', ' ')}</td>
                  <td>
                    {event.entityType} {event.entityId}
                  </td>
                  <td>
                    <Badge tone="success">{event.outcome}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel audit-detail">
        {selectedEvent ? (
          <>
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Event detail</p>
                <h2>{selectedEvent.id}</h2>
              </div>
              <Badge tone="muted">{selectedEvent.entityType}</Badge>
            </div>
            <div className="detail-grid single-column">
              <InfoBlock label="Timestamp" value={formatDateTime(selectedEvent.timestamp)} />
              <InfoBlock label="Admin" value={selectedEvent.admin.name} />
              <InfoBlock label="Action" value={selectedEvent.action.replaceAll('_', ' ')} />
              <InfoBlock label="Entity" value={selectedEvent.entityId} />
              <InfoBlock label="Notes" value={selectedEvent.notes} />
            </div>
            <pre>{JSON.stringify(selectedEvent.payload, null, 2)}</pre>
          </>
        ) : (
          <div className="empty-state">Select an audit event to inspect.</div>
        )}
      </div>
    </section>
  )
}

function ForbiddenPage() {
  function restoreAdmin() {
    localStorage.setItem(
      'adminUser',
      JSON.stringify({
        id: 'A-09',
        name: 'Team 9 Admin',
        email: 'admin.team9@uom.lk',
        role: 'ADMIN',
      }),
    )
    navigate('/admin/claims')
  }

  return (
    <section className="panel forbidden">
      <p className="eyebrow">403 Forbidden</p>
      <h2>Admin access is required</h2>
      <p>
        This route is guarded for users with the ADMIN role. The temporary mock
        identity can be restored for local testing.
      </p>
      <button className="primary-button" type="button" onClick={restoreAdmin}>
        Restore Mock Admin
      </button>
    </section>
  )
}

function InfoBlock({ label, value }) {
  return (
    <div className="info-block">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function Badge({ tone = 'muted', children }) {
  return <span className={`badge ${toKebabCase(tone)}`}>{children}</span>
}

export default App
