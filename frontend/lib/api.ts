const API_URL = "https://mundiabackend.vercel.app" || "http://localhost:3001";

export async function fetchApi<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`);
  if (!res.ok) {
    throw new Error(`Error fetching ${endpoint}: ${res.status}`);
  }
  const json = await res.json();
  return json.data ?? json;
}
