export function getMarketingSiteUrl(): URL | undefined {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!configuredUrl) return undefined;

  try {
    const url = new URL(configuredUrl);
    if (
      url.protocol !== 'https:' ||
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1' ||
      url.hostname.endsWith('.localhost')
    ) {
      return undefined;
    }

    return new URL('/', url);
  } catch {
    return undefined;
  }
}
