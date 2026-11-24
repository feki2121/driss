export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000')
  const url = new URL(configuredUrl)

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('NEXT_PUBLIC_SITE_URL must use HTTP or HTTPS.')
  }

  return url
}

export function absoluteUrl(path: string) {
  return new URL(path, getSiteUrl()).toString()
}
