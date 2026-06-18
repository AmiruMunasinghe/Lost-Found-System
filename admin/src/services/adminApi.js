const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'
const USE_MOCKS = false

async function getAdminToken() {
  return localStorage.getItem('adminToken')
}

function getAuthHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function adminLogin(username, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  if (!response.ok) {
    throw new Error('Unable to sign in. Check your credentials.')
  }

  const data = await response.json()
  const token = data.accessToken || data.token
  if (!token) {
    throw new Error('No token returned from admin login.')
  }

  const user = {
    id: data.user?.id || 'A-09',
    name: data.user?.fullName || data.user?.username || 'Team 9 Admin',
    email: data.user?.email || 'admin@uom.lk',
    role: data.user?.role || 'ADMIN',
  }

  localStorage.setItem('adminToken', token)
  localStorage.setItem('adminUser', JSON.stringify(user))
  window.dispatchEvent(new Event('adminSessionChanged'))
  return user
}

export function clearAdminSession() {
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminUser')
  window.dispatchEvent(new Event('adminSessionChanged'))
}

async function request(path, options = {}) {
  const token = await getAdminToken()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(token),
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAdminSession()
    }
    throw new Error(`Admin API request failed with ${response.status}`)
  }

  if (response.status === 204) return null
  return response.json()
}

function mapMatch(match) {
  if (!match) return null
  return {
    id: match.id,
    status: match.status,
    confidenceScore: typeof match.confidenceScore === 'number'
      ? match.confidenceScore
      : Number(match.confidenceScore || 0),
    createdAt: match.createdAt,
    updatedAt: match.updatedAt,
    lostItem: mapItem(match.lostItem),
    foundItem: mapItem(match.foundItem),
  }
}

export async function getMatches(status = 'ALL') {
  const params = new URLSearchParams()
  if (status && status !== 'ALL') {
    params.append('status', status)
  }

  const query = params.toString()
  const res = await request(`/matches${query ? `?${query}` : ''}`)
  return Array.isArray(res) ? res.map(mapMatch) : []
}

export async function getCurrentAdminAsync() {
  await getAdminToken()
  return getCurrentAdmin()
}

export function getCurrentAdmin() {
  const saved = localStorage.getItem('adminUser')

  if (saved) {
    const parsed = JSON.parse(saved)
    return {
      ...parsed,
      role: parsed?.role ? String(parsed.role) : null,
    }
  }

  return null
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
    status: item.status || 'OPEN',
    userId: item.userId,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    imageUrls: item.imageUrls || [],
  }
}

export async function getAdminItems(type) {
  const res = await request(`/items/type/${type}`)
  return Array.isArray(res) ? res.map(mapItem) : []
}

export async function updateItemStatus(itemId, status) {
  const res = await request(`/items/${itemId}/status?status=${status}`, {
    method: 'PUT',
  })
  return mapItem(res)
}

export async function deleteItem(itemId) {
  await request(`/items/${itemId}`, {
    method: 'DELETE',
  })
  return itemId
}

export async function getUserDetails(userId) {
  return request(`/users/${userId}`)
}
