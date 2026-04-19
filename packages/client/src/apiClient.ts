import type { ContentItem, LogEntry, Program, QuickLogMutation, TodayPayload } from "@pmhc/types";

export type ApiResponse<T> = {
  accepted: true;
  log: LogEntry;
  today: T;
};

export type CoachPriorityExplanation = {
  title: string;
  explanation: string;
  nextStep: string;
  safetyNote: string;
};

export type SyncHealth = {
  status: "available";
  accepts: string[];
  mode: "mock";
};

type JsonResponse = {
  ok: boolean;
  status: number;
  statusText: string;
  json: () => Promise<unknown>;
};

export type ApiClientOptions = {
  baseUrl: string;
  fetcher?: (url: string, init?: RequestInit) => Promise<JsonResponse>;
};

export class ApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export type PmhcApiClient = {
  getToday: () => Promise<TodayPayload>;
  postQuickLog: (mutation: QuickLogMutation) => Promise<ApiResponse<TodayPayload | null>>;
  getPrograms: () => Promise<Program[]>;
  getFeaturedContent: () => Promise<ContentItem[]>;
  getSyncHealth: () => Promise<SyncHealth>;
  explainPriority: () => Promise<CoachPriorityExplanation>;
};

export function createApiClient(options: ApiClientOptions): PmhcApiClient {
  const baseUrl = options.baseUrl.replace(/\/+$/, "");
  const fetcher = options.fetcher ?? fetch;

  async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetcher(`${baseUrl}/${path.replace(/^\/+/, "")}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
    const body = await response.json();

    if (!response.ok) {
      throw new ApiError(extractErrorMessage(body, response.statusText), response.status, body);
    }

    return body as T;
  }

  return {
    getToday: () => requestJson<TodayPayload>("/today", { method: "GET" }),
    postQuickLog: (mutation) =>
      requestJson<ApiResponse<TodayPayload | null>>("/logs", {
        method: "POST",
        body: JSON.stringify(mutation),
      }),
    getPrograms: () => requestJson<Program[]>("/programs", { method: "GET" }),
    getFeaturedContent: () => requestJson<ContentItem[]>("/content/featured", { method: "GET" }),
    getSyncHealth: () => requestJson<SyncHealth>("/sync/health", { method: "GET" }),
    explainPriority: () => requestJson<CoachPriorityExplanation>("/coach/explain-priority", { method: "POST" }),
  };
}

function extractErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string") {
    return payload.error;
  }

  return fallback || "API request failed";
}
