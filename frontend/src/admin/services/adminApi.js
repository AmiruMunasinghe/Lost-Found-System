const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085'

function normalizeAdminUser(data, username) {
  const user = data?.user || data || {}
  return {
    id: user.id || 'A-09',
    name: user.fullName || user.name || user.username || username || 'Admin',
    email: user.email || 'admin@uom.lk',
    role: 'ADMIN',
  }
}

function readUserToken() {
  try {
    const saved = JSON.parse(localStorage.getItem('lost_found_user') || localStorage.getItem('lostFoundUser') || 'null')
    return saved?.accessToken || saved?.token || null
  } catch {
    return null
  }
}

export async function loginAdmin({ username, password }) {
  const identifier = String(username || '').trim()
  const pass = String(password || '')
  if (!identifier || !pass) throw new Error('Enter admin username/email and password.')

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: identifier, email: identifier, password: pass }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Admin login failed. Make sure admin / admin123 exists in the database.')
  }

  const data = await response.json()
  const token = data.accessToken || data.token
  if (!token) throw new Error('Login succeeded but backend did not return an access token.')

  const adminUser = normalizeAdminUser(data, identifier)
  localStorage.setItem('adminToken', token)
  localStorage.setItem('adminUser', JSON.stringify(adminUser))
  return adminUser
}

export function logoutAdmin() {
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminUser')
  localStorage.removeItem('lost_found_user')
  localStorage.removeItem('lostFoundUser')
}

export function getCurrentAdmin() {
  const saved = localStorage.getItem('adminUser')
  if (saved) {
    try { return JSON.parse(saved) } catch { localStorage.removeItem('adminUser') }
  }

  try {
    const user = JSON.parse(localStorage.getItem('lost_found_user') || localStorage.getItem('lostFoundUser') || 'null')
    const role = String(user?.role || '').toLowerCase()
    if (role === 'admin') {
      const adminUser = normalizeAdminUser({ user }, user.username)
      localStorage.setItem('adminUser', JSON.stringify(adminUser))
      if (user.accessToken || user.token) localStorage.setItem('adminToken', user.accessToken || user.token)
      return adminUser
    }
  } catch {
    // ignore bad state
  }
  return null
}

async function getAdminToken() {
  return localStorage.getItem('adminToken') || readUserToken()
}

async function request(path, options = {}) {
  const token = await getAdminToken()
  if (!token) throw new Error('Please log in to the admin portal first.')

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  })

  if (response.status === 401 || response.status === 403) {
    throw new Error('Admin session expired or unauthorized. Make sure the logged-in user has ADMIN role.')
  }

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Admin API request failed with ${response.status}`)
  }

  if (response.status === 204) return null
  const text = await response.text()
  return text ? JSON.parse(text) : null
}

function mapItem(item) {
  if (!item) return null
  return {
    id: item.id,
    title: item.title || 'Untitled Item',
    description: item.description || '',
    category: item.category || 'Other',
    location: item.location || '',
    reportType: item.reportType || 'LOST',
    status: item.status || 'PENDING_REVIEW',
    userId: item.userId,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    imageUrls: item.imageUrls || [],
  }
}

function mapMatch(match) {
  if (!match) return null
  return {
    ...match,
    id: match.id,
    lostItem: mapItem(match.lostItem),
    foundItem: mapItem(match.foundItem),
    confidenceScore: match.confidenceScore ?? match.score ?? null,
    status: match.status || 'SUGGESTED',
    createdAt: match.createdAt,
    updatedAt: match.updatedAt,
  }
}

export async function getAllItems() {
  const data = await request('/items')
  return Array.isArray(data) ? data.map(mapItem) : []
}

export async function getAdminItems(type) {
  const data = type ? await request(`/items/type/${type}`) : await request('/items')
  return Array.isArray(data) ? data.map(mapItem) : []
}

export async function getPendingReports() {
  const data = await request('/items/status/PENDING_REVIEW')
  return Array.isArray(data) ? data.map(mapItem) : []
}

export async function updateItemStatus(itemId, status) {
  return mapItem(await request(`/items/${itemId}/status?status=${status}`, { method: 'PUT' }))
}

export async function approveReport(itemId) {
  return updateItemStatus(itemId, 'OPEN')
}

export async function rejectReport(itemId) {
  return updateItemStatus(itemId, 'CLOSED')
}

export async function deleteItem(itemId) {
  await request(`/items/${itemId}`, { method: 'DELETE' })
  return itemId
}

export async function getMatches(filters = {}) {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.itemId) params.set('itemId', filters.itemId)
  const qs = params.toString()
  const data = await request(`/matches${qs ? `?${qs}` : ''}`)
  return Array.isArray(data) ? data.map(mapMatch) : []
}

export async function getReviewQueue() {
  const data = await request('/matches/review-queue')
  return Array.isArray(data) ? data.map(mapMatch) : []
}

export async function approveMatch(matchId) {
  return mapMatch(await request(`/matches/review-queue/${matchId}/approve`, { method: 'POST' }))
}

export async function rejectMatch(matchId) {
  return mapMatch(await request(`/matches/review-queue/${matchId}/reject`, { method: 'POST' }))
}

export async function confirmMatch(matchId) {
  return mapMatch(await request(`/matches/${matchId}/confirm`, { method: 'POST' }))
}

export async function runMatchingForLostItem(lostItemId) {
  const data = await request(`/matches/run?lostItemId=${lostItemId}`, { method: 'POST' })
  return Array.isArray(data) ? data.map(mapMatch) : []
}

export async function getUserDetails(userId) {
  return request(`/users/${userId}`)
}

export async function getUsersFromItems() {
  const items = await getAllItems()
  const ids = Array.from(new Set(items.map((item) => item.userId).filter(Boolean)))
  const users = []
  for (const id of ids) {
    try { users.push(await getUserDetails(id)) } catch { users.push({ id, username: `User ${id}` }) }
  }
  return users
}

export async function getAuditLog() {
  try {
    const data = await request('/admin/audit-log?page=0&size=100')
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export async function getAnalytics() {
  const [items, matches] = await Promise.all([
    getAllItems().catch(() => []),
    getMatches().catch(() => []),
  ])

  const count = (fn) => items.filter(fn).length
  const categoryCounts = items.reduce((acc, item) => {
    const key = item.category || 'Other'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  const statusCounts = items.reduce((acc, item) => {
    const key = item.status || 'UNKNOWN'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  return {
    summary: {
      totalReports: items.length,
      pendingReports: count((item) => item.status === 'PENDING_REVIEW'),
      approvedReports: count((item) => item.status === 'OPEN' || item.status === 'MATCHED'),
      lostReports: count((item) => item.reportType === 'LOST'),
      foundReports: count((item) => item.reportType === 'FOUND'),
      totalMatches: matches.length,
      visibleMatches: matches.filter((match) => ['SUGGESTED', 'ACCEPTED'].includes(match.status)).length,
    },
    categoryBreakdown: Object.entries(categoryCounts).map(([label, value]) => ({ label, value })),
    statusBreakdown: Object.entries(statusCounts).map(([label, value]) => ({ label, value })),
  }
}

// Older admin claim functions kept as safe fallbacks so old buttons do not crash.
export async function getClaims() { return [] }
export async function approveClaim(claim) { return claim }
export async function rejectClaim(claim) { return claim }
export async function requestMoreEvidence(claim) { return claim }
export async function schedulePickup(claim) { return claim }
