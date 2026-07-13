import posthog from 'posthog-js'

/**
 * PostHog analytics — pageviews, device/browser breakdowns, and click
 * autocapture (heatmaps) for the Atlas.
 *
 * Configured via env so no key is hardcoded (the `phc_` project key is a
 * public client key, not a secret, but env keeps it swappable):
 *   VITE_POSTHOG_KEY   — the "Project API Key" from PostHog project settings
 *   VITE_POSTHOG_HOST  — ingestion host; defaults to EU cloud
 * Set both locally in `.env` and in Vercel → Settings → Environment Variables.
 */
const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined
const HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://eu.i.posthog.com'

let started = false

export function initAnalytics(): void {
  if (started || !KEY) return // no-op in dev / when unconfigured
  started = true
  posthog.init(KEY, {
    api_host: HOST,
    ui_host: 'https://eu.posthog.com',
    capture_pageview: true, // single-page app → one real pageview on load
    capture_pageleave: true, // time-on-page / bounce
    autocapture: true, // clicks & interactions → heatmaps
    person_profiles: 'identified_only', // anonymous marketing site, no logins
  })
}

/** true once PostHog is live — lets the analytics helper forward events */
export const analyticsReady = () => started

export { posthog }
