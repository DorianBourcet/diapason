const PROXY_URL = 'https://diapason-proxy.dorianbourcet.workers.dev'

export function proxyUrl(url: string): string {
  if (import.meta.env.DEV) {
    const parsed = new URL(url)
    return `/proxy/${parsed.host}${parsed.pathname}${parsed.search}`
  }

  const parsed = new URL(url)
  return `${PROXY_URL}/${parsed.host}${parsed.pathname}${parsed.search}`
}
