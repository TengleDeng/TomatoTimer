import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { LocalStorageAPI } from "./localStorageAPI";

// Define the path patterns and corresponding local storage API methods
const API_ROUTES: Record<string, Record<string, Function>> = {
  "/api/tasks": {
    GET: LocalStorageAPI.tasks.getTasks,
    POST: LocalStorageAPI.tasks.createTask,
  },
  "/api/tasks/:id": {
    PUT: (id: number, data: any) => LocalStorageAPI.tasks.updateTask(id, data),
    DELETE: (id: number) => LocalStorageAPI.tasks.deleteTask(id),
  },
  "/api/sessions": {
    GET: (params?: any) => {
      if (params?.date) {
        return LocalStorageAPI.sessions.getSessionsByDate(undefined, new Date(params.date));
      }
      return LocalStorageAPI.sessions.getSessions();
    },
    POST: LocalStorageAPI.sessions.createSession,
  },
  "/api/sessions/:id/complete": {
    PUT: (id: number) => LocalStorageAPI.sessions.updateSession(id, new Date()),
  },
  "/api/settings": {
    GET: LocalStorageAPI.settings.getSettings,
    POST: LocalStorageAPI.settings.createSettings,
    PUT: (userId: number, data: any) => {
      return LocalStorageAPI.settings.updateSettings(userId || 1, data);
    },
  },
  "/api/stats/daily": {
    GET: LocalStorageAPI.dailyStats.getDailyStats,
  },
};

// Helper function to extract ID from a path
function extractIdFromPath(path: string): number {
  const parts = path.split('/');
  const idPart = parts[parts.length - 1];
  
  // Handle special case for complete sessions
  if (idPart === "complete") {
    return parseInt(parts[parts.length - 2], 10);
  }
  
  return parseInt(idPart, 10);
}

// Helper function to match a path pattern
function matchPath(pattern: string, path: string): boolean {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');
  
  if (patternParts.length !== pathParts.length) {
    return false;
  }
  
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      // This is a parameter part, we accept any value
      continue;
    }
    
    if (patternParts[i] !== pathParts[i]) {
      return false;
    }
  }
  
  return true;
}

// Mock Response class to mimic the browser's Response API
class MockResponse {
  private readonly _status: number;
  private readonly _statusText: string;
  private readonly _body: any;
  private readonly _ok: boolean;

  constructor(body: any, options: { status?: number; statusText?: string } = {}) {
    this._status = options.status || 200;
    this._statusText = options.statusText || 'OK';
    this._body = body;
    this._ok = this._status >= 200 && this._status < 300;
  }

  get status() { return this._status; }
  get statusText() { return this._statusText; }
  get ok() { return this._ok; }

  async json() { return this._body; }
  async text() { return JSON.stringify(this._body); }
}

async function handleLocalRequest(
  method: string,
  path: string,
  body?: any
): Promise<MockResponse> {
  console.log(`Local request: ${method} ${path}`);
  
  try {
    // Find the matching route
    let matchedRoute: string | null = null;
    let routePath = path;
    let queryParams: Record<string, string> = {};
    
    // Extract query parameters if any
    if (path.includes('?')) {
      const [basePath, queryString] = path.split('?');
      routePath = basePath;
      queryParams = Object.fromEntries(new URLSearchParams(queryString));
    }
    
    for (const route of Object.keys(API_ROUTES)) {
      if (route === routePath || matchPath(route, routePath)) {
        matchedRoute = route;
        break;
      }
    }
    
    if (!matchedRoute) {
      throw new Error(`Route not found: ${path}`);
    }
    
    // Get the appropriate handler
    const handlers = API_ROUTES[matchedRoute];
    const handler = handlers[method];
    
    if (!handler) {
      throw new Error(`Method ${method} not supported for route ${matchedRoute}`);
    }
    
    // Execute the handler with the appropriate parameters
    let result;
    
    if (matchedRoute.includes(':id')) {
      const id = extractIdFromPath(routePath);
      result = body ? await handler(id, body) : await handler(id);
    } else if (method === 'GET' && Object.keys(queryParams).length > 0) {
      result = await handler(queryParams);
    } else if (method === 'PUT' && routePath === '/api/settings') {
      result = await handler(body.userId, body);
    } else if (body) {
      result = await handler(body);
    } else {
      result = await handler();
    }
    
    return new MockResponse(result);
  } catch (error) {
    console.error("Local API request error:", error);
    return new MockResponse(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500, statusText: "Internal Server Error" }
    );
  }
}

async function throwIfResNotOk(res: Response | MockResponse) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response | MockResponse> {
  // Use local storage API instead of server
  const res = await handleLocalRequest(method, url, data);
  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Process query key
    const url = queryKey[0] as string;
    const params = queryKey.length > 1 ? queryKey[1] : undefined;
    
    // Build URL with query parameters
    let fullUrl = url;
    if (params && typeof params === 'object') {
      const queryString = new URLSearchParams(params as Record<string, string>).toString();
      fullUrl = `${url}?${queryString}`;
    }
    
    // Use local storage API instead of server
    const res = await handleLocalRequest('GET', fullUrl);

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
