const statusLabels = {
  PENDING: 'Pending',
  IN_CONFLICT: 'In Conflict',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  AWAITING_PICKUP: 'Awaiting Pickup',
  MORE_EVIDENCE: 'More Evidence',
}

export function formatDateTime(value) {
  if (!value) return 'Not set'

  return new Intl.DateTimeFormat('en-LK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function formatStatus(value) {
  return statusLabels[value] || value
}

export function formatConfidence(value) {
  if (typeof value !== 'number') return '0%'
  return `${Math.round(value * 100)}%`
}

export function getStatusTone(status) {
  const tones = {
    PENDING: 'warning',
    IN_CONFLICT: 'danger',
    APPROVED: 'success',
    REJECTED: 'muted',
    AWAITING_PICKUP: 'info',
    MORE_EVIDENCE: 'info',
  }

  return tones[status] || 'muted'
}

export function toKebabCase(value) {
  return String(value).toLowerCase().replaceAll('_', '-')
}
