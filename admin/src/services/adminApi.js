import {
  mockAnalyticsByRange,
  mockAuditEvents,
  mockClaims,
} from '../data/mockAdminData'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const USE_MOCKS = import.meta.env.VITE_USE_MOCK_ADMIN_API !== 'false'

let claimsStore = structuredClone(mockClaims)
let auditStore = structuredClone(mockAuditEvents)

function wait(ms = 180) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function getAuthHeaders() {
  const token = localStorage.getItem('adminToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
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

function addAuditEvent(action, entityType, entityId, notes, payload = {}) {
  const event = {
    id: `AUD-${Math.floor(9000 + Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    admin: { id: 'A-09', name: 'Team 9 Admin' },
    action,
    entityType,
    entityId,
    outcome: 'SUCCESS',
    notes,
    payload,
  }

  auditStore = [event, ...auditStore]
  return event
}

function updateClaim(claimId, updater) {
  claimsStore = claimsStore.map((claim) =>
    claim.id === claimId
      ? { ...updater(claim), updatedAt: new Date().toISOString() }
      : claim,
  )

  return claimsStore.find((claim) => claim.id === claimId)
}

export async function getClaims({ status = 'ALL', q = '' } = {}) {
  if (!USE_MOCKS) {
    const params = new URLSearchParams({ status, q, page: '0', size: '50' })
    return request(`/admin/claims?${params.toString()}`)
  }

  await wait()
  const query = q.trim().toLowerCase()

  return claimsStore.filter((claim) => {
    const matchesStatus = status === 'ALL' || claim.status === status
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
  if (!USE_MOCKS) {
    return request(`/admin/claims/${claimId}`)
  }

  await wait()
  return claimsStore.find((claim) => claim.id === claimId)
}

export async function approveClaim(claimId) {
  if (!USE_MOCKS) {
    return request(`/admin/claims/${claimId}/approve`, { method: 'POST' })
  }

  await wait()
  const claim = updateClaim(claimId, (current) => ({
    ...current,
    status: 'APPROVED',
    decisionReason: 'Evidence validated by admin.',
  }))

  addAuditEvent('APPROVE_CLAIM', 'CLAIM', claimId, 'Approved claim.', {
    claimId,
  })

  return claim
}

export async function rejectClaim(claimId, reason) {
  if (!USE_MOCKS) {
    return request(`/admin/claims/${claimId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  await wait()
  const claim = updateClaim(claimId, (current) => ({
    ...current,
    status: 'REJECTED',
    decisionReason: reason,
  }))

  addAuditEvent('REJECT_CLAIM', 'CLAIM', claimId, reason, { claimId, reason })

  return claim
}

export async function requestMoreEvidence(claimId, message) {
  if (!USE_MOCKS) {
    return request(`/admin/claims/${claimId}/request-evidence`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    })
  }

  await wait()
  const claim = updateClaim(claimId, (current) => ({
    ...current,
    status: 'MORE_EVIDENCE',
    decisionReason: message,
  }))

  addAuditEvent('REQUEST_EVIDENCE', 'CLAIM', claimId, message, {
    claimId,
    message,
  })

  return claim
}

export async function schedulePickup(claimId, pickup) {
  if (!USE_MOCKS) {
    return request(`/admin/claims/${claimId}/pickup-schedule`, {
      method: 'POST',
      body: JSON.stringify(pickup),
    })
  }

  await wait()
  const claim = updateClaim(claimId, (current) => ({
    ...current,
    status: 'AWAITING_PICKUP',
    pickup,
  }))

  addAuditEvent(
    'SCHEDULE_PICKUP',
    'CLAIM',
    claimId,
    `Pickup scheduled at ${pickup.location}.`,
    { claimId, ...pickup },
  )

  return claim
}

export async function getAnalytics(range = '30d') {
  if (!USE_MOCKS) {
    return request(`/admin/analytics?range=${encodeURIComponent(range)}`)
  }

  await wait()
  return mockAnalyticsByRange[range] || mockAnalyticsByRange['30d']
}

export async function getAuditLog(filters = {}) {
  if (!USE_MOCKS) {
    const params = new URLSearchParams({
      action: filters.action || '',
      adminId: filters.adminId || '',
      entityType: filters.entityType || '',
      from: filters.from || '',
      to: filters.to || '',
      page: '0',
      size: '50',
    })

    return request(`/admin/audit-log?${params.toString()}`)
  }

  await wait()
  return auditStore.filter((event) => {
    const matchesAction = !filters.action || event.action === filters.action
    const matchesEntity =
      !filters.entityType || event.entityType === filters.entityType
    const matchesAdmin =
      !filters.adminId ||
      event.admin.id.toLowerCase().includes(filters.adminId.toLowerCase()) ||
      event.admin.name.toLowerCase().includes(filters.adminId.toLowerCase())

    return matchesAction && matchesEntity && matchesAdmin
  })
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
