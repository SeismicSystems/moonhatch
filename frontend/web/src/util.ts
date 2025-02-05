// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const stringifyBigInt = (_: any, value: any) =>
  typeof value === 'bigint' ? value.toString() : value

// Helper to format a timestamp (in milliseconds) as a relative time string.
export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) {
    return `${seconds}s ago`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes}m${remainingSeconds}s ago`
      : `${minutes}m ago`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (hours < 24) {
    return remainingMinutes > 0
      ? `${hours}h${remainingMinutes}m ago`
      : `${hours}h ago`
  }
  const days = Math.floor(hours / 24)
  let remainingHours = hours % 24
  // Per spec: if there are at least 30 extra minutes, subtract one hour
  if (remainingMinutes >= 30 && remainingHours > 0) {
    remainingHours = remainingHours - 1
  }
  return remainingHours > 0 ? `${days}d${remainingHours}h ago` : `${days}d ago`
}
