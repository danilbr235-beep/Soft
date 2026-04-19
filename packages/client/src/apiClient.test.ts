import { describe, expect, it } from "vitest";
import type { QuickLogMutation, TodayPayload } from "@pmhc/types";
import { ApiError, createApiClient } from "./apiClient";

function createJsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: async () => body,
  };
}

describe("createApiClient", () => {
  it("fetches today payload from the configured base URL", async () => {
    const today = {
      date: "2026-04-19",
      todayMode: "Light",
      syncStatus: "synced",
      activeProgram: null,
      currentPriority: {
        domain: "baseline",
        title: "Build a private baseline",
        whyItMatters: "A few calm logs make guidance more useful.",
        recommendedAction: "Record one check-in.",
        confidence: "low",
      },
      dailyState: [],
      alerts: [],
      actionCards: [],
      quickLogs: [],
      liveUpdates: [],
      insights: [],
    } satisfies TodayPayload;
    const calls: Array<{ url: string; method: string | undefined }> = [];
    const client = createApiClient({
      baseUrl: "https://api.example.test/mock/",
      fetcher: async (url, init) => {
        calls.push({ url: String(url), method: init?.method });
        return createJsonResponse(today);
      },
    });

    await expect(client.getToday()).resolves.toEqual(today);
    expect(calls).toEqual([{ url: "https://api.example.test/mock/today", method: "GET" }]);
  });

  it("posts a quick log mutation as JSON", async () => {
    const mutation = {
      type: "confidence",
      value: 7,
      occurredAt: "2026-04-19T08:00:00.000Z",
    } satisfies QuickLogMutation;
    const calls: Array<{ url: string; method: string | undefined; body: string | undefined }> = [];
    const client = createApiClient({
      baseUrl: "https://api.example.test",
      fetcher: async (url, init) => {
        calls.push({ url: String(url), method: init?.method, body: String(init?.body) });
        return createJsonResponse({ accepted: true, log: { ...mutation, id: "log-1", source: "manual" }, today: null }, 201);
      },
    });

    const result = await client.postQuickLog(mutation);

    expect(result.accepted).toBe(true);
    expect(calls).toEqual([
      {
        url: "https://api.example.test/logs",
        method: "POST",
        body: JSON.stringify(mutation),
      },
    ]);
  });

  it("throws an ApiError when the server rejects a request", async () => {
    const client = createApiClient({
      baseUrl: "https://api.example.test",
      fetcher: async () => createJsonResponse({ error: "Unsupported quick log type" }, 400),
    });

    await expect(client.getToday()).rejects.toMatchObject({
      name: "ApiError",
      status: 400,
      message: "Unsupported quick log type",
    } satisfies Partial<ApiError>);
  });
});
