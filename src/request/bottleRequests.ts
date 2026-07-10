/** "Request a New Bottle" data layer — locations catalog + submission. */

export interface RequestableLocation {
  /** stable internal id — used in submissions and analytics; do not rename */
  id: string
  name: string
}

export const REQUESTABLE_LOCATIONS: RequestableLocation[] = [
  { id: 'sagrada-familia', name: 'Sagrada Família' },
  { id: 'la-pedrera', name: 'La Pedrera' },
  { id: 'casa-vicens', name: 'Casa Vicens' },
  { id: 'aquarium-barcelona', name: 'L’Aquàrium de Barcelona' },
  { id: 'parc-guell', name: 'Parc Güell' },
  { id: 'fc-barcelona', name: 'FC Barcelona' },
  { id: 'rcd-espanyol', name: 'RCD Espanyol' },
]

/**
 * Free-text ("crazy idea") places are stored in `requestedLocations`
 * alongside the stable ids, prefixed so a CRM can tell them apart:
 * e.g. "custom:Tokyo Tower".
 */
export const CUSTOM_PREFIX = 'custom:'
export const customLocationId = (text: string) => CUSTOM_PREFIX + text.trim()
export const isCustomLocation = (id: string) => id.startsWith(CUSTOM_PREFIX)
export const locationDisplayName = (id: string): string =>
  isCustomLocation(id)
    ? id.slice(CUSTOM_PREFIX.length)
    : REQUESTABLE_LOCATIONS.find((l) => l.id === id)?.name ?? id

export interface BottleRequest {
  email: string
  requestedLocations: string[]
  source: 'hello-world-atlas'
  submittedAt: string
}

export function buildBottleRequest(email: string, locationIds: string[]): BottleRequest {
  return {
    email: email.trim(),
    requestedLocations: locationIds,
    source: 'hello-world-atlas',
    submittedAt: new Date().toISOString(),
  }
}

const STORAGE_KEY = 'hw-atlas-bottle-requests'

/**
 * Submit a bottle request.
 *
 * v1 has no backend: submissions are appended to localStorage under
 * `hw-atlas-bottle-requests` so they can be inspected and exported.
 *
 * TO CONNECT A REAL BACKEND (Supabase / Airtable / HubSpot / Klaviyo / ...):
 * replace the body below with a POST and keep the same signature, e.g.
 *
 *   const res = await fetch('/api/bottle-requests', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(request),
 *   })
 *   if (!res.ok) throw new Error('Submission failed')
 *
 * Never put API keys in this file — proxy through your own endpoint.
 */
export async function submitBottleRequest(request: BottleRequest): Promise<void> {
  // simulate a short network round-trip so the UI's loading state is honest
  await new Promise((resolve) => setTimeout(resolve, 650))
  const previous: BottleRequest[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...previous, request]))
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
}
