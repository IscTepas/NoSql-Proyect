const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Fetcher compartido para SWR: usado como default global en SWRConfig (ver app/layout.tsx)
// y puede importarse directamente en componentes en vez de redefinir uno inline.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const swrFetcher = (url: string): Promise<any> =>
  fetch(url).then((r) => r.json()).then((j) => j.data ?? j);

export async function fetchApi<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`);
  if (!res.ok) {
    throw new Error(`Error ${res.status} fetching ${endpoint}`);
  }
  const json = await res.json();
  if (json.ok === false) {
    throw new Error(json.mensaje || `API error fetching ${endpoint}`);
  }
  return json.data ?? json;
}
