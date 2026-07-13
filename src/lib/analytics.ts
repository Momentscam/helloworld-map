/**
 * Custom-event helper for the app's own funnels (bottle requests, tour
 * navigation, rides). Forwards to PostHog when configured, and always logs to
 * the console so events are inspectable locally without a key.
 * Autocapture (clicks, pageviews, devices) is handled separately in posthog.ts.
 */
import { analyticsReady, posthog } from './posthog'

export type AnalyticsProps = Record<string, string | number | boolean | string[] | undefined>

export function track(event: string, props: AnalyticsProps = {}): void {
  const payload = { source: 'hello-world-atlas', ...props }
  if (analyticsReady()) posthog.capture(event, payload)
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info(`[analytics] ${event}`, payload)
  }
}
