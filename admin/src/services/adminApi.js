const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'
const USE_MOCKS = false

async function getAdminToken() {
  let token = localStorage.getItem('adminToken')
  if (!token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin123' })
      });
      if (response.ok) {
        const data = await response.json();
        token = data.accessToken || data.token;
        if (token) {
          localStorage.setItem('adminToken', token);
          localStorage.setItem('adminUser', JSON.stringify({
            id: data.user?.id || 'A-09',
            name: data.user?.fullName || 'Team 9 Admin',
            email: data.user?.email || 'admin@uom.lk',
            role: data.user?.role || 'ADMIN'
          }));
        }
      }
    } catch (e) {
      console.error('Failed to perform silent admin login:', e);
    }
  }
  return token;
}

function getAuthHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {}
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

export function getCurrentAdmin() {
  const saved = localStorage.getItem('adminUser')

  if (saved) {
    return JSON.parse(saved)
  }

  return {
    id: 'A-09',
    name: 'Team 9 Admin',
    email: 'admin.team9@uom.lk',
    role: 'ADMIN',
  }
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
