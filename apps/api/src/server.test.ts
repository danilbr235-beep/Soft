import { describe, expect, it } from "vitest";
import { createApiServer } from "./server";

describe("mock API contract", () => {
  it("returns a valid Today payload from GET /today", async () => {
    const app = createApiServer();
    const response = await app.inject({ method: "GET", url: "/today" });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.currentPriority.title).toBeTruthy();
    expect(Array.isArray(body.dailyState)).toBe(true);
    expect(Array.isArray(body.quickLogs)).toBe(true);
  });

  it("accepts supported quick logs with POST /logs", async () => {
    const app = createApiServer();
    const response = await app.inject({
      method: "POST",
      url: "/logs",
      payload: {
        type: "confidence",
        value: 7,
        occurredAt: "2026-04-19T08:00:00Z",
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(201);
    expect(body.accepted).toBe(true);
    expect(body.log.type).toBe("confidence");
  });

  it("reports sync health from GET /sync/health", async () => {
    const app = createApiServer();
    const response = await app.inject({ method: "GET", url: "/sync/health" });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.status).toBe("available");
    expect(body.accepts).toContain("quick_log");
  });
});
