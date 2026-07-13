import posthog from 'posthog-js'

/**
 * PostHog analytics — pageviews, device/browser breakdowns, and click
 * autocapture (heatmaps) for the Atlas.
 *
 * The default key below is the PUBLIC "Project API Key" (phc_…) for the
 * "Hello World Atlas" PostHog project on EU cloud. phc_ keys are publishable
 * client keys — designed to ship in the browser, not secrets. Override per
 * environment with VITE_POSTHOG_KEY / VITE_POSTHOG_HOST if you ever move it.
 */
const KEY =
  (import.meta.env.VITE_POSTHOG_KEY as string | undefined) ??
  'phc_kmyZgwfWfZaPXcMyyehSsfrWySE4KFkKms7Q3Pi7Zsqx'
const HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://eu.i.posthog.com'

let started = false

export function initAnalytics(): void {
  // only real deployments report — never send from local dev
  if (started || !KEY || import.meta.env.DEV) return
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
