import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { staticApiService } from "./staticApiService";

// Check if we're in GitHub Pages environment
const isGitHubPages = window.location.hostname.includes('github.io');

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // For GitHub Pages, intercept API requests and use static data
  if (isGitHubPages && url.startsWith('/api/')) {
    let result;
    
    // Handle different API endpoints
    if (url === '/api/gestures') {
      result = await staticApiService.getAllGestures();
    } 
    else if (url.startsWith('/api/gestures/type/')) {
      const type = url.split('/').pop();
      if (type) {
        result = await staticApiService.getGesturesByType(type);
      }
    }
    else if (url.startsWith('/api/gestures/category/')) {
      const category = url.split('/').pop();
      if (category) {
        result = await staticApiService.getGesturesByCategory(category);
      }
    }
    else if (url.startsWith('/api/gestures/name/')) {
      const name = url.split('/').pop();
      if (name) {
        result = await staticApiService.getGestureByName(name);
      }
    }
    else if (url.startsWith('/api/gestures/id/')) {
      const id = parseInt(url.split('/').pop() || '0');
      if (id) {
        result = await staticApiService.getGesture(id);
      }
    }
    
    // Create a mock response
    const mockResponse = new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
    return mockResponse;
  }
  
  // Normal API request for local development
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // For GitHub Pages, intercept API requests and use static data
    if (isGitHubPages && (queryKey[0] as string).startsWith('/api/')) {
      const url = queryKey[0] as string;
      let result;
      
      // Handle different API endpoints
      if (url === '/api/gestures') {
        result = await staticApiService.getAllGestures();
      } 
      else if (url.startsWith('/api/gestures/type/')) {
        const type = url.split('/').pop();
        if (type) {
          result = await staticApiService.getGesturesByType(type);
        }
      }
      else if (url.startsWith('/api/gestures/category/')) {
        const category = url.split('/').pop();
        if (category) {
          result = await staticApiService.getGesturesByCategory(category);
        }
      }
      
      return result;
    }
    
    // Normal API request for local development
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
