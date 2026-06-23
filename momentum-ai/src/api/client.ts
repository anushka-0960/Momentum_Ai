const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

interface RequestOptions extends RequestInit {
  authToken?: string;
}

// Thin fetch wrapper: injects the Firebase ID token and normalizes
// error handling so every api/* module doesn't repeat this logic.
export async function apiClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { authToken, headers, ...rest } = options;

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API error ${response.status}: ${errorBody}`);
  }

  return response.json() as Promise<T>;
}
