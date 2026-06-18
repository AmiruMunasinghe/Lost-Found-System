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
  getAdminItems,
  updateItemStatus,
  deleteItem,
  getUserDetails
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
  { path: '/admin/lost-items', label: 'Lost Items Queue', shortLabel: 'Lost Items' },
  { path: '/admin/found-items', label: 'Found Items Queue', shortLabel: 'Found Items' },
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
  '/admin/lost-items': 'Lost Items Queue',
  '/admin/found-items': 'Found Items Queue',
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

function UserCell({ userId, onUserLoaded }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    getUserDetails(userId)
      .then((data) => {
        setUser(data)
        if (onUserLoaded) onUserLoaded(userId, data)
      })
      .catch((err) => {
        console.error('Failed to load user info:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [userId])

  if (!userId) return <span>Unknown User</span>
  if (loading) return <span style={{ color: 'var(--text)', opacity: 0.7 }}>Loading...</span>
  if (user) {
    return (
      <div className="user-cell">
        <strong>{user.fullName || user.username || 'User'}</strong>
        <span style={{ display: 'block', fontSize: '11px', color: 'var(--text)', opacity: 0.8 }}>
          {user.email || 'No email'}
        </span>
      </div>
    )
  }
  return <span>User ID: {userId}</span>
}

function ItemDetailModal({ item, userCache, onClose, onStatusChange, getItemStatusTone }) {
  const user = userCache[item.userId]
  const imagesList = item.imageUrls || []

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div className="panel" style={{
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        <div className="panel-heading" style={{ borderBottom: '1px solid var(--border)', padding: '20px 24px' }}>
          <div>
            <p className="eyebrow">{item.reportType} Item Registry</p>
            <h2>Item #{item.id} Details</h2>
          </div>
          <button
            className="ghost-button"
            style={{ borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
            type="button"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text)', display: 'block', marginBottom: '8px' }}>Images</span>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
              {imagesList.length > 0 ? (
                imagesList.map((imgUrl, index) => (
                  <img
                    key={index}
                    src={imgUrl.startsWith('http') ? imgUrl : `http://localhost:8081/uploads/${imgUrl}`}
                    alt={`Attachment ${index + 1}`}
                    style={{ height: '180px', width: '240px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                ))
              ) : (
                <div style={{ padding: '40px', background: '#f3f4f6', borderRadius: '8px', textAlign: 'center', width: '100%', color: 'var(--text)' }}>
                  No images submitted for this item.
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <InfoBlock label="Item Name" value={item.title} />
            <InfoBlock label="Category" value={item.category} />
            <InfoBlock label="Report Type" value={item.reportType} />
            <InfoBlock label="Current Status" value={
              <Badge tone={getItemStatusTone(item.status)}>{item.status}</Badge>
            } />
            <InfoBlock label="Location Found/Lost" value={item.location || 'Not specified'} />
            <InfoBlock label="Date & Time Reported" value={formatDateTime(item.createdAt)} />
          </div>

          <div>
            <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text)', display: 'block', marginBottom: '6px' }}>Description</span>
            <div style={{ padding: '16px', background: '#fbfcfb', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-h)', whiteSpace: 'pre-wrap' }}>
              {item.description || 'No description provided by the submitter.'}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text)', display: 'block', marginBottom: '8px' }}>Submitted By</span>
            {user ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', padding: '14px', background: '#f4faf7', borderRadius: '8px', border: '1px solid #b7d8cc' }}>
                <InfoBlock label="Full Name" value={user.fullName || 'N/A'} />
                <InfoBlock label="Username" value={user.username || 'N/A'} />
                <InfoBlock label="Email Address" value={user.email || 'N/A'} />
                <InfoBlock label="Contact Number" value={user.phone || 'N/A'} />
              </div>
            ) : (
              <div style={{ color: 'var(--text)' }}>
                User details loading or unavailable for User ID: {item.userId}
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text)', display: 'block', marginBottom: '8px' }}>Quick Status Transition</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="secondary-button"
                  style={{ padding: '6px 12px', fontSize: '13px' }}
                  type="button"
                  onClick={() => onStatusChange(item.id, 'UNDER_REVIEW')}
                  disabled={item.status === 'UNDER_REVIEW'}
                >
                  Under Review
                </button>
                <button
                  className="primary-button"
                  style={{ padding: '6px 12px', fontSize: '13px' }}
                  type="button"
                  onClick={() => onStatusChange(item.id, 'MATCHED')}
                  disabled={item.status === 'MATCHED'}
                >
                  Matched
                </button>
                <button
                  className="ghost-button"
                  style={{ padding: '6px 12px', fontSize: '13px' }}
                  type="button"
                  onClick={() => onStatusChange(item.id, 'CLOSED')}
                  disabled={item.status === 'CLOSED'}
                >
                  Closed
                </button>
              </div>
            </div>
            <button className="primary-button" style={{ padding: '10px 20px', alignSelf: 'flex-end' }} type="button" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DeleteConfirmModal({ item, isDeleting, onClose, onConfirm }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110,
      padding: '20px'
    }}>
      <div className="panel" style={{
        maxWidth: '440px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        animation: 'fadeIn 0.2s ease-out',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ fontSize: '20px', color: 'var(--text-h)', margin: '0 0 10px' }}>Confirm Deletion</h2>
        <p style={{ fontSize: '14px', color: 'var(--text)', margin: '0 0 20px', lineHeight: '1.5' }}>
          Are you sure you want to permanently delete the item <strong>"{item.title}"</strong> (ID: {item.id})? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            className="ghost-button"
            style={{ padding: '10px 20px', minWidth: '100px' }}
            type="button"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="danger-button"
            style={{ padding: '10px 20px', minWidth: '100px', border: 'none' }}
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ItemsManagerPage({ type }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('date_desc')
  
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [selectedItem, setSelectedItem] = useState(null)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [userCache, setUserCache] = useState({})

  function handleUserLoaded(userId, userData) {
    setUserCache(prev => ({ ...prev, [userId]: userData }))
  }

  const loadItems = () => {
    setLoading(true)
    setError('')
    getAdminItems(type)
      .then((data) => {
        setItems(data)
      })
      .catch((err) => {
        console.error(err)
        setError('Failed to fetch items from the backend database.')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    loadItems()
    setCurrentPage(1)
  }, [type])

  const categories = useMemo(() => {
    return [...new Set(items.map(item => item.category).filter(Boolean))]
  }, [items])

  const getItemStatusTone = (status) => {
    const tones = {
      OPEN: 'info',
      UNDER_REVIEW: 'warning',
      PENDING_REVIEW: 'warning',
      MATCHED: 'success',
      CLAIMED: 'success',
      AWAITING_PICKUP: 'info',
      SCHEDULED_FOR_AUCTION: 'muted',
      SCHEDULED_FOR_DONATION: 'muted',
      CLOSED: 'muted',
    }
    return tones[status] || 'muted'
  }

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      await updateItemStatus(itemId, newStatus)
      setItems(current => 
        current.map(item => item.id === itemId ? { ...item, status: newStatus } : item)
      )
      if (selectedItem && selectedItem.id === itemId) {
        setSelectedItem(prev => ({ ...prev, status: newStatus }))
      }
    } catch (err) {
      alert(`Failed to update status: ${err.message}`)
    }
  }

  const handleDelete = async () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      await deleteItem(itemToDelete.id)
      setItems(current => current.filter(item => item.id !== itemToDelete.id))
      setItemToDelete(null)
    } catch (err) {
      alert(`Failed to delete item: ${err.message}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items]

    if (statusFilter !== 'ALL') {
      result = result.filter(item => item.status === statusFilter)
    }

    if (categoryFilter !== 'ALL') {
      result = result.filter(item => item.category === categoryFilter)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(item => {
        const titleMatch = (item.title || '').toLowerCase().includes(q)
        const descMatch = (item.description || '').toLowerCase().includes(q)
        const catMatch = (item.category || '').toLowerCase().includes(q)
        const locMatch = (item.location || '').toLowerCase().includes(q)
        
        const user = userCache[item.userId]
        const userMatch = user ? (
          (user.fullName || '').toLowerCase().includes(q) || 
          (user.username || '').toLowerCase().includes(q) || 
          (user.email || '').toLowerCase().includes(q)
        ) : false

        return titleMatch || descMatch || catMatch || locMatch || userMatch
      })
    }

    result.sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.createdAt) - new Date(a.createdAt)
      }
      if (sortBy === 'date_asc') {
        return new Date(a.createdAt) - new Date(b.createdAt)
      }
      if (sortBy === 'title_asc') {
        return (a.title || '').localeCompare(b.title || '')
      }
      if (sortBy === 'title_desc') {
        return (b.title || '').localeCompare(a.title || '')
      }
      return 0
    })

    return result
  }, [items, statusFilter, categoryFilter, searchQuery, sortBy, userCache])

  const totalItems = filteredAndSortedItems.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredAndSortedItems.slice(start, start + itemsPerPage)
  }, [filteredAndSortedItems, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, categoryFilter, searchQuery, sortBy])

  return (
    <section className="analytics-layout">
      <div className="page-actions">
        <div>
          <p className="eyebrow">Database Records</p>
          <h2>{type === 'LOST' ? 'Lost' : 'Found'} Items Registry</h2>
        </div>
        <div className="segmented-control compact">
          <button className="active" type="button" onClick={loadItems}>
            Refresh Data
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Listing Filters</p>
            <h2>Filter & Search Registry</h2>
          </div>
          <span className="count-pill">{filteredAndSortedItems.length} items found</span>
        </div>

        <div className="toolbar" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', padding: '16px 20px' }}>
          <label className="search-field">
            <span>Search items</span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Title, description, location, submitter..."
            />
          </label>
          <label className="search-field">
            <span>Status</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="MATCHED">Matched</option>
              <option value="CLAIMED">Claimed</option>
              <option value="AWAITING_PICKUP">Awaiting Pickup</option>
              <option value="SCHEDULED_FOR_AUCTION">Auction</option>
              <option value="SCHEDULED_FOR_DONATION">Donation</option>
              <option value="CLOSED">Closed</option>
            </select>
          </label>
          <label className="search-field">
            <span>Category</span>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="ALL">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </label>
          <label className="search-field">
            <span>Sort By</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date_desc">Date (Newest First)</option>
              <option value="date_asc">Date (Oldest First)</option>
              <option value="title_asc">Title (A-Z)</option>
              <option value="title_desc">Title (Z-A)</option>
            </select>
          </label>
        </div>

        {loading ? (
          <div className="empty-state">Loading items registry...</div>
        ) : error ? (
          <div className="empty-state" style={{ color: '#b42318' }}>{error}</div>
        ) : paginatedItems.length === 0 ? (
          <div className="empty-state">No items match the selected criteria.</div>
        ) : (
          <div className="audit-table-wrap">
            <table className="audit-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Image</th>
                  <th>Item Details</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Submitted</th>
                  <th>Submitted By</th>
                  <th>Status</th>
                  <th style={{ width: '180px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.imageUrls && item.imageUrls.length > 0 ? (
                          <img
                            src={item.imageUrls[0].startsWith('http') ? item.imageUrls[0] : `http://localhost:8081/uploads/${item.imageUrls[0]}`}
                            alt={item.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=100&q=80';
                            }}
                          />
                        ) : (
                          <div style={{ fontSize: '20px', color: '#9ca3af' }}>📦</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-h)', display: 'block' }}>{item.title}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--text)', opacity: 0.8, display: 'block', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.description || 'No description provided.'}
                      </span>
                    </td>
                    <td>
                      <span className="badge muted">{item.category}</span>
                    </td>
                    <td>{item.location || 'Unknown'}</td>
                    <td>{formatDateTime(item.createdAt)}</td>
                    <td>
                      <UserCell userId={item.userId} onUserLoaded={handleUserLoaded} />
                    </td>
                    <td>
                      <Badge tone={getItemStatusTone(item.status)}>{item.status}</Badge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          className="ghost-button"
                          style={{ padding: '6px 10px', fontSize: '12px' }}
                          type="button"
                          onClick={() => setSelectedItem(item)}
                        >
                          Details
                        </button>
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          style={{ padding: '4px 8px', fontSize: '12px', width: 'auto', flex: 'none' }}
                        >
                          <option value="OPEN">Open</option>
                          <option value="UNDER_REVIEW">Under Review</option>
                          <option value="PENDING_REVIEW">Pending Review</option>
                          <option value="MATCHED">Matched</option>
                          <option value="CLAIMED">Claimed</option>
                          <option value="AWAITING_PICKUP">Awaiting Pickup</option>
                          <option value="SCHEDULED_FOR_AUCTION">Auction</option>
                          <option value="SCHEDULED_FOR_DONATION">Donation</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                        <button
                          className="danger-button"
                          style={{ padding: '6px 10px', fontSize: '12px', border: 'none' }}
                          type="button"
                          onClick={() => setItemToDelete(item)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '13px', color: 'var(--text)' }}>
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalItems} items total)
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="segmented-control button"
                style={{ padding: '8px 14px', border: '1px solid #d7ded9', borderRadius: '8px', cursor: 'pointer', background: '#fff', fontWeight: '800' }}
                disabled={currentPage === 1}
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >
                Previous
              </button>
              <button
                className="segmented-control button"
                style={{ padding: '8px 14px', border: '1px solid #d7ded9', borderRadius: '8px', cursor: 'pointer', background: '#fff', fontWeight: '800' }}
                disabled={currentPage === totalPages}
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          userCache={userCache}
          onClose={() => setSelectedItem(null)}
          onStatusChange={handleStatusChange}
          getItemStatusTone={getItemStatusTone}
        />
      )}

      {itemToDelete && (
        <DeleteConfirmModal
          item={itemToDelete}
          isDeleting={isDeleting}
          onClose={() => setItemToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </section>
  )
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
          {isAdmin && guardedRoute === '/admin/lost-items' && <ItemsManagerPage type="LOST" />}
          {isAdmin && guardedRoute === '/admin/found-items' && <ItemsManagerPage type="FOUND" />}
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
        <span>Backend Mode</span>
        <strong>Connected to Live API</strong>
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
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    navigate('/admin/claims')
  }

  return (
    <section className="panel forbidden">
      <p className="eyebrow">403 Forbidden</p>
      <h2>Admin access is required</h2>
      <p>
        This route is guarded for users with the ADMIN role.
      </p>
      <button className="primary-button" type="button" onClick={restoreAdmin}>
        Restore Admin Session
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
