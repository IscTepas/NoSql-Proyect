const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
