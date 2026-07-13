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
 * Google Apps Script Web App URL that appends each submission as a row in the
 * sheet. Set via env so no endpoint is hardcoded:
 *   - local dev:  add `VITE_SHEETS_ENDPOINT=...` to a `.env` file (gitignored)
 *   - production: add the same var in Vercel → Project → Settings → Env Vars
 * See scripts/google-apps-script.gs for the script to paste into the sheet.
 * (This URL is a public write endpoint, not a secret/API key.)
 */
const SHEETS_ENDPOINT = import.meta.env.VITE_SHEETS_ENDPOINT as string | undefined

function persistLocally(request: BottleRequest): void {
  // always keep a local copy as a safety net so a lead is never lost
  try {
    const previous: BottleRequest[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...previous, request]))
  } catch {
    /* localStorage unavailable (private mode / quota) — ignore */
  }
}

/**
 * Submit a bottle request.
 *
 * Writes to the Google Sheet via the Apps Script Web App (when configured) and
 * always keeps a localStorage backup. The sheet gets readable place names.
 *
 * TO SWITCH BACKENDS (Supabase / Airtable / HubSpot / ...): replace the fetch
 * below and keep the same signature. Never put API keys in this file — the
 * Apps Script runs under your Google account, so nothing secret is shipped.
 */
export async function submitBottleRequest(request: BottleRequest): Promise<void> {
  persistLocally(request)

  if (!SHEETS_ENDPOINT) {
    // no sheet wired up yet — honest loading delay, local copy already saved
    await new Promise((resolve) => setTimeout(resolve, 650))
    return
  }

  // Payload shaped for the sheet columns. `text/plain` keeps this a CORS
  // "simple request" so the browser skips the preflight that Apps Script
  // can't answer; the script parses e.postData.contents as JSON.
  const payload = {
    submittedAt: request.submittedAt,
    email: request.email,
    locations: request.requestedLocations.map(locationDisplayName).join(', '),
    source: request.source,
  }
  const res = await fetch(SHEETS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
    redirect: 'follow',
  })
  if (!res.ok) throw new Error(`Sheet submission failed: ${res.status}`)
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
}
