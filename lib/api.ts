const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  // Read the JWT that useAuth.ts stores after login/session sync.
  // This is what Express's requireAuth() verifies via JWKS — cookies
  // alone no longer work since Express doesn't host Better Auth anymore.
  const token =
    typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const fullUrl = `${API_URL}${endpoint}`;
  console.log(`🔍 Fetching: ${fullUrl}`);
  console.log(`📋 Method: ${options.method || 'GET'}`);

  try {
    const res = await fetch(fullUrl, {
      ...options,
      headers,
      credentials: "include",
    });

    console.log(`📡 Response status: ${res.status} ${res.statusText}`);

    const text = await res.text();
    console.log(`📄 Response preview: ${text.substring(0, 300)}...`);

    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error("❌ Failed to parse JSON:", parseError);
      throw new Error(`Invalid JSON response from ${endpoint}`);
    }

    if (!res.ok) {
      console.error(`❌ API Error ${res.status} on ${endpoint}:`, data);
      // Don't throw for 401 on auth endpoints - handle gracefully
      if (res.status === 401 && endpoint.includes('/auth/')) {
        return data;
      }
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (error) {
    console.error(`❌ Fetch error for ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  get: (endpoint: string) => apiFetch(endpoint),
  post: (endpoint: string, body: any) =>
    apiFetch(endpoint, { method: "POST", body: JSON.stringify(body) }),
  patch: (endpoint: string, body: any) =>
    apiFetch(endpoint, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (endpoint: string) => apiFetch(endpoint, { method: "DELETE" }),
};