import { useEffect, useMemo, useState } from 'react'
import './App.css'
import {
  getAdminItems,
  getMatches,
  updateItemStatus,
  deleteItem,
  deleteMatch,
  getUserDetails,
  getCurrentAdmin,
  getCurrentAdminAsync,
  adminLogin,
  clearAdminSession,
} from './services/adminApi'

import {
  formatConfidence,
  formatDateTime,
  formatStatus,
  getStatusTone,
  toKebabCase,
} from './utils/formatters'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'

const routes = [
  { path: '/admin/lost-items', label: 'Lost items', shortLabel: 'Lost' },
  { path: '/admin/found-items', label: 'Found items', shortLabel: 'Found' },
  { path: '/admin/match-results', label: 'Match results', shortLabel: 'Matches' },
]

const pageTitles = {
  '/admin/lost-items': 'Lost Items',
  '/admin/found-items': 'Found Items',
  '/admin/match-results': 'Match Results',
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

  return path === '/' ? '/admin/lost-items' : path
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
      padding: '20px',
    }}>
      <div className="panel" style={{
        maxWidth: '720px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }}>
        <div className="panel-heading" style={{ borderBottom: '1px solid var(--border)', padding: '20px 24px' }}>
          <div>
            <p className="eyebrow">{item.reportType} item detail</p>
            <h2>Item #{item.id}</h2>
          </div>
          <button
            className="ghost-button"
            style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0 }}
            type="button"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '24px', display: 'grid', gap: '20px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text)', display: 'block', marginBottom: '8px' }}>Images</span>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
              {imagesList.length > 0 ? (
                imagesList.map((imgUrl, index) => (
                  <img
                    key={index}
                    src={imgUrl.startsWith('http') ? imgUrl : `${API_BASE_URL}/uploads/${imgUrl}`}
                    alt={`Attachment ${index + 1}`}
                    style={{ height: '180px', width: '240px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80'
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
            <InfoBlock label="Item Name" value={item.title} />
            <InfoBlock label="Category" value={item.category} />
            <InfoBlock label="Report Type" value={item.reportType} />
            <InfoBlock label="Current Status" value={
              <Badge tone={getItemStatusTone(item.status)}>{item.status}</Badge>
            } />
            <InfoBlock label="Location" value={item.location || 'Not specified'} />
            <InfoBlock label="Submitted" value={formatDateTime(item.createdAt)} />
          </div>

          <div>
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text)', display: 'block', marginBottom: '6px' }}>Description</span>
            <div style={{ padding: '16px', background: '#fbfcfb', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-h)', whiteSpace: 'pre-wrap' }}>
              {item.description || 'No description provided by the submitter.'}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text)', display: 'block', marginBottom: '8px' }}>Submitted by</span>
            {user ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', padding: '14px', background: '#f4faf7', borderRadius: '8px', border: '1px solid #b7d8cc' }}>
                <InfoBlock label="Full Name" value={user.fullName || 'N/A'} />
                <InfoBlock label="Username" value={user.username || 'N/A'} />
                <InfoBlock label="Email" value={user.email || 'N/A'} />
                <InfoBlock label="Phone" value={user.phone || 'N/A'} />
              </div>
            ) : (
              <div style={{ color: 'var(--text)' }}>
                User details loading or unavailable for User ID: {item.userId}
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text)', display: 'block', marginBottom: '8px' }}>Quick status</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
            <button className="primary-button" style={{ padding: '10px 20px' }} type="button" onClick={onClose}>
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
      padding: '20px',
    }}>
      <div className="panel" style={{
        maxWidth: '440px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        animation: 'fadeIn 0.2s ease-out',
        padding: '24px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ fontSize: '20px', color: 'var(--text-h)', margin: '0 0 10px' }}>Confirm deletion</h2>
        <p style={{ fontSize: '14px', color: 'var(--text)', margin: '0 0 20px', lineHeight: '1.5' }}>
          Are you sure you want to permanently delete the item <strong>"{item.title}"</strong> (ID: {item.id})? This cannot be undone.
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
    setUserCache((prev) => ({ ...prev, [userId]: userData }))
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
        setError('Failed to fetch items from the backend.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadItems()
    setCurrentPage(1)
  }, [type])

  const categories = useMemo(() => [...new Set(items.map((item) => item.category).filter(Boolean))], [items])

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
      setItems((current) => current.map((item) => (item.id === itemId ? { ...item, status: newStatus } : item)))
      if (selectedItem?.id === itemId) {
        setSelectedItem((prev) => ({ ...prev, status: newStatus }))
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
      setItems((current) => current.filter((item) => item.id !== itemToDelete.id))
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
      result = result.filter((item) => item.status === statusFilter)
    }

    if (categoryFilter !== 'ALL') {
      result = result.filter((item) => item.category === categoryFilter)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((item) => {
        const titleMatch = (item.title || '').toLowerCase().includes(q)
        const descMatch = (item.description || '').toLowerCase().includes(q)
        const catMatch = (item.category || '').toLowerCase().includes(q)
        const locMatch = (item.location || '').toLowerCase().includes(q)
        const user = userCache[item.userId]
        const userMatch = user
          ? (user.fullName || '').toLowerCase().includes(q) ||
            (user.username || '').toLowerCase().includes(q) ||
            (user.email || '').toLowerCase().includes(q)
          : false

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
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
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
          <p className="eyebrow">Database registry</p>
          <h2>{type === 'LOST' ? 'Lost items' : 'Found items'}</h2>
        </div>
        <div className="segmented-control compact">
          <button className="active" type="button" onClick={loadItems}>
            Refresh data
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Item filters</p>
            <h2>Search and sort</h2>
          </div>
          <span className="count-pill">{filteredAndSortedItems.length} items</span>
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
              <option value="ALL">All statuses</option>
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
              <option value="ALL">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </label>
          <label className="search-field">
            <span>Sort by</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date_desc">Date (newest)</option>
              <option value="date_asc">Date (oldest)</option>
              <option value="title_asc">Title (A-Z)</option>
              <option value="title_desc">Title (Z-A)</option>
            </select>
          </label>
        </div>

        {loading ? (
          <div className="empty-state">Loading items...</div>
        ) : error ? (
          <div className="empty-state" style={{ color: '#b42318' }}>{error}</div>
        ) : paginatedItems.length === 0 ? (
          <div className="empty-state">No items match the selected filters.</div>
        ) : (
          <div className="audit-table-wrap">
            <table className="audit-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Image</th>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Submitted</th>
                  <th>Submitted by</th>
                  <th>Status</th>
                  <th style={{ width: '180px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden', background: '#e5e7eb', display: 'grid', placeItems: 'center' }}>
                        {item.imageUrls?.length ? (
                          <img
                            src={item.imageUrls[0].startsWith('http') ? item.imageUrls[0] : `${API_BASE_URL}/uploads/${item.imageUrls[0]}`}
                            alt={item.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=100&q=80'
                            }}
                          />
                        ) : (
                          <div style={{ fontSize: '20px', color: '#9ca3af' }}>📦</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <strong style={{ display: 'block', color: 'var(--text-h)' }}>{item.title}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--text)', opacity: 0.8, display: 'block', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.description || 'No description provided.'}
                      </span>
                    </td>
                    <td>{item.category}</td>
                    <td>{item.location || 'Unknown'}</td>
                    <td>{formatDateTime(item.createdAt)}</td>
                    <td><UserCell userId={item.userId} onUserLoaded={handleUserLoaded} /></td>
                    <td><Badge tone={getItemStatusTone(item.status)}>{item.status}</Badge></td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        <button className="ghost-button" style={{ padding: '6px 10px', fontSize: '12px' }} type="button" onClick={() => setSelectedItem(item)}>
                          Details
                        </button>
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          style={{ padding: '6px 10px', fontSize: '12px' }}
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
                        <button className="danger-button" style={{ padding: '6px 10px', fontSize: '12px', border: 'none' }} type="button" onClick={() => setItemToDelete(item)}>
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
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalItems} items)
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="segmented-control button" style={{ padding: '8px 14px', border: '1px solid #d7ded9', borderRadius: '8px', cursor: 'pointer', background: '#fff', fontWeight: 800 }} disabled={currentPage === 1} type="button" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>
                Previous
              </button>
              <button className="segmented-control button" style={{ padding: '8px 14px', border: '1px solid #d7ded9', borderRadius: '8px', cursor: 'pointer', background: '#fff', fontWeight: 800 }} disabled={currentPage === totalPages} type="button" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}>
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
        <DeleteConfirmModal item={itemToDelete} isDeleting={isDeleting} onClose={() => setItemToDelete(null)} onConfirm={handleDelete} />
      )}
    </section>
  )
}

function MatchResultsPage() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMatch, setSelectedMatch] = useState(null)

  const statusOptions = [
    { value: 'ALL', label: 'All' },
    { value: 'PENDING_REVIEW', label: 'Pending Review' },
    { value: 'SUGGESTED', label: 'Suggested' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'REJECTED', label: 'Rejected' },
  ]

  const loadMatches = () => {
    setLoading(true)
    setError('')
    getMatches(statusFilter)
      .then((data) => {
        setMatches(data)
        setSelectedMatch((current) => current || data[0] || null)
      })
      .catch((err) => {
        console.error(err)
        setError('Failed to load match results.')
      })
      .finally(() => setLoading(false))
  }

  const handleDeleteMatch = async (matchId) => {
    console.log('[App] handleDeleteMatch called with matchId:', matchId)
    if (!matchId) return
    if (!window.confirm(`Delete match entry #${matchId}? This will not delete the lost or found item.`)) return
    try {
      await deleteMatch(matchId)
      window.alert(`Deleted match entry #${matchId}.`)
      loadMatches()
    } catch (err) {
      console.error(err)
      window.alert(err.message || 'Failed to delete match entry.')
    }
  }

  useEffect(() => {
    loadMatches()
  }, [statusFilter])

  const filteredMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return matches

    return matches.filter((match) => {
      const lostTitle = match.lostItem?.title || ''
      const foundTitle = match.foundItem?.title || ''
      return [
        String(match.id),
        match.status || '',
        lostTitle,
        foundTitle,
      ].some((field) => field.toLowerCase().includes(q))
    })
  }, [matches, searchQuery])

  return (
    <section className="audit-layout">
      <div className="panel audit-table-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Match results</p>
            <h2>Match review</h2>
          </div>
          <span className="count-pill">{filteredMatches.length} results</span>
        </div>

        <div className="audit-filters">
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search ID, lost item, found item, or status"
          />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Match status filter">
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button className="ghost-button" type="button" onClick={loadMatches}>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="empty-state">Loading matches...</div>
        ) : error ? (
          <div className="empty-state" style={{ color: '#b42318' }}>{error}</div>
        ) : filteredMatches.length === 0 ? (
          <div className="empty-state">No matches found.</div>
        ) : (
          <div className="audit-table-wrap">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Lost item</th>
                  <th>Found item</th>
                  <th>Confidence</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredMatches.map((match) => (
                  <tr key={match.id} className={selectedMatch?.id === match.id ? 'selected' : ''} onClick={() => setSelectedMatch(match)}>
                    <td>{match.id}</td>
                    <td>{match.lostItem?.title || 'Unknown'}</td>
                    <td>{match.foundItem?.title || 'Unknown'}</td>
                    <td>{formatConfidence(match.confidenceScore)}</td>
                    <td><Badge tone={getStatusTone(match.status)}>{formatStatus(match.status)}</Badge></td>
                    <td>{formatDateTime(match.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <MatchDetailPanel match={selectedMatch} onDeleteMatch={handleDeleteMatch} />
    </section>
  )
}

function MatchDetailPanel({ match, onDeleteMatch }) {
  if (!match) {
    return (
      <div className="panel audit-detail">
        <div className="empty-state">Select a match to view details.</div>
      </div>
    )
  }

  return (
    <div className="panel audit-detail">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Match detail</p>
          <h2>Match #{match.id}</h2>
        </div>
        <Badge tone={getStatusTone(match.status)}>{formatStatus(match.status)}</Badge>
      </div>
      <div className="detail-grid single-column">
        <InfoBlock label="Match ID" value={match.id} />
        <InfoBlock label="Status" value={formatStatus(match.status)} />
        <InfoBlock label="Confidence" value={formatConfidence(match.confidenceScore)} />
        <InfoBlock label="Created" value={formatDateTime(match.createdAt)} />
        <InfoBlock label="Updated" value={formatDateTime(match.updatedAt)} />
      </div>

      <div className="detail-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="info-block">
          <span>Lost item</span>
          <strong>{match.lostItem?.title || 'Unknown'}</strong>
          <p>{match.lostItem?.description || 'No description available.'}</p>
          <p><strong>Location:</strong> {match.lostItem?.location || 'Unknown'}</p>
          <p><strong>Status:</strong> {match.lostItem?.status || 'Unknown'}</p>
        </div>
        <div className="info-block">
          <span>Found item</span>
          <strong>{match.foundItem?.title || 'Unknown'}</strong>
          <p>{match.foundItem?.description || 'No description available.'}</p>
          <p><strong>Location:</strong> {match.foundItem?.location || 'Unknown'}</p>
          <p><strong>Status:</strong> {match.foundItem?.status || 'Unknown'}</p>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 700 }}>Lost item images</span>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
              {match.lostItem?.imageUrls?.length ? (
                match.lostItem.imageUrls.map((image, index) => (
                  <img
                    key={`lost-${index}`}
                    src={image.startsWith('http') ? image : `${API_BASE_URL}/uploads/${image}`}
                    alt={`Lost item ${index + 1}`}
                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                ))
              ) : (
                <div style={{ color: 'var(--text)' }}>No images available.</div>
              )}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 700 }}>Found item images</span>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
              {match.foundItem?.imageUrls?.length ? (
                match.foundItem.imageUrls.map((image, index) => (
                  <img
                    key={`found-${index}`}
                    src={image.startsWith('http') ? image : `${API_BASE_URL}/uploads/${image}`}
                    alt={`Found item ${index + 1}`}
                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                ))
              ) : (
                <div style={{ color: 'var(--text)' }}>No images available.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          className="primary-button"
          type="button"
          onClick={() => onDeleteMatch(match.id)}
          disabled={!match.id}
          style={{ minWidth: '220px' }}
        >
          Delete Match
        </button>
      </div>
    </div>
  )
}

function AdminLoginPage({ onLogin }) {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const user = await adminLogin(username, password)
      onLogin(user)
      navigate('/admin/lost-items')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="panel" style={{ maxWidth: 420, margin: '40px auto', padding: 30 }}>
      <div className="panel-heading" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        <p className="eyebrow">Admin login</p>
        <h2>Sign in to LostFound admin</h2>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16, marginTop: 20 }}>
        <label className="search-field">
          <span>Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            autoComplete="username"
          />
        </label>
        <label className="search-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="admin123"
            autoComplete="current-password"
          />
        </label>
        {error && <div className="empty-state" style={{ color: '#b42318' }}>{error}</div>}
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </section>
  )
}

function App() {
  const route = useRoute()
  const [admin, setAdmin] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadAdmin = async () => {
      try {
        const adminUser = await getCurrentAdminAsync()
        if (mounted) {
          setAdmin(adminUser)
        }
      } catch (error) {
        console.error('Admin auth failed:', error)
        if (mounted) {
          setAdmin(null)
        }
      } finally {
        if (mounted) {
          setAuthLoading(false)
        }
      }
    }

    loadAdmin()

    const handleSessionChange = () => {
      const adminUser = getCurrentAdmin()
      setAdmin(adminUser)
    }

    window.addEventListener('adminSessionChanged', handleSessionChange)
    return () => {
      mounted = false
      window.removeEventListener('adminSessionChanged', handleSessionChange)
    }
  }, [])

  const isAdmin = admin?.role === 'ADMIN'
  const guardedRoute = isAdmin ? route : '/403'

  useEffect(() => {
    if (window.location.pathname === '/') navigate('/admin/lost-items')
  }, [route])

  const handleLogin = (user) => {
    setAdmin(user)
  }

  if (authLoading) {
    return (
      <div className="app-shell">
        <main className="main-panel">
          <div className="page-surface">
            <div className="panel"><div className="empty-state">Checking admin access...</div></div>
          </div>
        </main>
      </div>
    )
  }

  if (!admin) {
    return (
      <div className="app-shell">
        <main className="main-panel">
          <div className="page-surface">
            <AdminLoginPage onLogin={handleLogin} />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Sidebar activePath={guardedRoute} />
      <main className="main-panel">
        <Topbar title={pageTitles[guardedRoute] || 'Lost Items'} admin={admin} />
        <div className="page-surface">
          {!isAdmin ? (
            <ForbiddenPage />
          ) : guardedRoute === '/admin/lost-items' ? (
            <ItemsManagerPage type="LOST" />
          ) : guardedRoute === '/admin/found-items' ? (
            <ItemsManagerPage type="FOUND" />
          ) : guardedRoute === '/admin/match-results' ? (
            <MatchResultsPage />
          ) : (
            <ItemsManagerPage type="LOST" />
          )}
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
        <span>Backend mode</span>
        <strong>Connected to live API</strong>
      </div>
    </aside>
  )
}

function Topbar({ title, admin }) {
  function handleLogout() {
    clearAdminSession()
    navigate('/403')
  }

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Admin dashboard</p>
        <h1>{title}</h1>
      </div>
      <div className="admin-chip">
        <div className="avatar">T9</div>
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

function ForbiddenPage() {
  function restoreAdmin() {
    clearAdminSession()
    navigate('/admin/lost-items')
  }

  return (
    <section className="panel forbidden">
      <p className="eyebrow">403 Forbidden</p>
      <h2>Admin access is required</h2>
      <p>This route is guarded for users with the ADMIN role.</p>
      <button className="primary-button" type="button" onClick={restoreAdmin}>
        Restore admin session
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
