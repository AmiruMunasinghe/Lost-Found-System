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
            role: 'ADMIN'
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

function mapClaim(claim) {
  if (!claim) return null;
  const confidence = claim.match?.confidenceScore || 0.5;
  return {
    id: `CLM-${claim.id}`,
    status: claim.status,
    priority: confidence > 0.8 ? 'High' : confidence > 0.5 ? 'Normal' : 'Low',
    claimant: {
      id: `U-${claim.claimantId}`,
      name: claim.claimantUsername || 'User',
      email: `${claim.claimantUsername || 'user'}@uom.lk`,
      department: 'Faculty of Engineering',
    },
    item: {
      id: `ITM-${claim.item?.itemId}`,
      title: claim.item?.title || 'Unknown Item',
      category: claim.item?.category || 'General',
      location: claim.item?.location || 'Campus',
      reportType: 'FOUND',
      description: claim.item?.description || '',
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80',
    },
    evidence: {
      summary: claim.evidence || 'No evidence provided.',
      attachments: ['Student ID verification'],
      submittedAt: claim.createdAt,
    },
    match: {
      lostItemId: `ITM-${claim.match?.lostItemId}`,
      foundItemId: `ITM-${claim.match?.foundItemId}`,
      confidenceScore: confidence,
      matchedTerms: ['Verification Required'],
    },
    pickup: claim.pickup ? {
      pickupAt: claim.pickup.pickupAt,
      location: claim.pickup.location,
    } : null,
    createdAt: claim.createdAt,
    updatedAt: claim.updatedAt,
  };
}

export async function getClaims({ status = 'ALL', q = '' } = {}) {
  const params = new URLSearchParams()
  const backendStatus = (status === 'ALL' || status === 'IN_CONFLICT') ? null : status
  if (backendStatus) {
    params.append('status', backendStatus)
  }
  params.append('page', '0')
  params.append('size', '1000') // Fetch all to allow full search

  const res = await request(`/admin/claims?${params.toString()}`)
  const claims = (res?.claims || []).map(mapClaim)

  // Apply filters client-side
  return claims.filter((claim) => {
    const matchesStatus = status === 'ALL' || claim.status === status
    const query = q.trim().toLowerCase()
    const searchable = [
      claim.id,
      claim.claimant.name,
      claim.claimant.email,
      claim.item.id,
      claim.item.title,
      claim.item.category,
      claim.item.location,
    ]
      .join(' ')
      .toLowerCase()

    return matchesStatus && (!query || searchable.includes(query))
  })
}

export async function getClaim(claimId) {
  const id = String(claimId).replace('CLM-', '')
  const res = await request(`/admin/claims/${id}`)
  return mapClaim(res)
}

export async function approveClaim(claimId) {
  const id = String(claimId).replace('CLM-', '')
  const res = await request(`/admin/claims/${id}/approve`, { method: 'POST' })
  return mapClaim(res)
}

export async function rejectClaim(claimId, reason) {
  const id = String(claimId).replace('CLM-', '')
  const res = await request(`/admin/claims/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
  return mapClaim(res)
}

export async function requestMoreEvidence(claimId, message) {
  const id = String(claimId).replace('CLM-', '')
  await request(`/admin/claims/${id}/request-evidence`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
  const updatedClaim = await request(`/admin/claims/${id}`)
  return mapClaim(updatedClaim)
}

export async function schedulePickup(claimId, pickup) {
  const id = String(claimId).replace('CLM-', '')
  await request(`/admin/claims/${id}/pickup-schedule`, {
    method: 'POST',
    body: JSON.stringify(pickup),
  })
  const updatedClaim = await request(`/admin/claims/${id}`)
  return mapClaim(updatedClaim)
}

export async function getAnalytics(range = '30d') {
  let days = 30
  if (range === '7d') days = 7
  else if (range === '30d') days = 30
  else if (range === 'semester') days = 120
  else if (range === 'all') days = 365

  const data = await request(`/admin/analytics?range=${days}`)
  
  // Map trends
  const trendSeries = (data.trendSeries || []).map(item => ({
    label: item.date ? item.date.substring(5) : '', // e.g. "06-18"
    lost: item.claimsSubmitted || 0, // Map claimsSubmitted to lost trend bar
    found: item.claimsApproved || 0, // Map claimsApproved to found trend bar
  }))

  // Map breakdowns
  const statusBreakdown = (data.statusBreakdown || []).map(item => ({
    label: item.status ? item.status.charAt(0) + item.status.slice(1).toLowerCase().replace('_', ' ') : '',
    value: item.count || 0
  }))

  const categoryBreakdown = (data.categoryBreakdown || []).map(item => ({
    label: item.category || 'General',
    value: item.count || 0
  }))

  const locationBreakdown = (data.locationBreakdown || []).map(item => ({
    label: item.location || 'Campus',
    value: item.count || 0
  }))

  // Generate confidence distribution from claims data (fallback/mock range)
  const confidenceDistribution = [
    { label: '0-40%', value: Math.round(categoryBreakdown.length * 0.1) },
    { label: '41-70%', value: Math.round(categoryBreakdown.length * 0.2) },
    { label: '71-90%', value: Math.round(categoryBreakdown.length * 0.4) },
    { label: '91-100%', value: Math.round(categoryBreakdown.length * 0.3) },
  ]

  return {
    summary: {
      totalReports: data.summary?.totalClaims || 0,
      pendingClaims: data.summary?.pendingClaims || 0,
      approvedClaims: data.summary?.approvedClaims || 0,
      rejectedClaims: data.summary?.rejectedClaims || 0,
      recoveredItems: data.summary?.approvedClaims || 0, // recovered maps to approved
      averageReviewTime: data.summary?.avgProcessingTimeHours 
        ? `${Math.round(data.summary.avgProcessingTimeHours)}h` 
        : '0h',
    },
    trendSeries,
    statusBreakdown,
    categoryBreakdown,
    locationBreakdown,
    confidenceDistribution,
  }
}

export async function getAuditLog(filters = {}) {
  const params = new URLSearchParams()
  if (filters.action) params.append('action', filters.action)
  if (filters.adminId) params.append('adminId', filters.adminId)
  if (filters.entityType) params.append('entityType', filters.entityType)
  params.append('page', '0')
  params.append('size', '100')

  const res = await request(`/admin/audit-log?${params.toString()}`)
  return (res || []).map(event => ({
    id: `AUD-${event.id}`,
    timestamp: event.timestamp,
    admin: {
      id: `A-${event.adminId || '09'}`,
      name: event.adminUsername || 'Team 9 Admin',
    },
    action: event.action || 'UNKNOWN',
    entityType: event.entityType || 'CLAIM',
    entityId: event.entityId ? `CLM-${event.entityId}` : '',
    outcome: event.outcome || 'SUCCESS',
    notes: event.notes || '',
    payload: {
      entityId: event.entityId,
      action: event.action,
      notes: event.notes
    }
  }))
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
