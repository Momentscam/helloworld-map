/**
 * Minimal analytics helper.
 *
 * Currently logs to the console so the funnel can be inspected locally.
 * To wire a real tool, replace the body of `track` with your provider call:
 *
 *   // PostHog:  posthog.capture(event, props)
 *   // GA4:      gtag('event', event, props)
 *   // Mixpanel: mixpanel.track(event, props)
 *
 * Keep the event names and property shapes — dashboards will be built on them.
 */
export type AnalyticsProps = Record<string, string | number | boolean | string[] | undefined>

export function track(event: string, props: AnalyticsProps = {}): void {
  const payload = { source: 'hello-world-atlas', ...props }
  // eslint-disable-next-line no-console
  console.info(`[analytics] ${event}`, payload)
}
