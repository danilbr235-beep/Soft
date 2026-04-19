import Fastify from "fastify";
import { buildTodayPayload, explainPriority, supportedQuickLogs } from "@pmhc/rules";
import type { LogEntry, QuickLogMutation } from "@pmhc/types";
import { featuredContent, starterRuleInput } from "./seed";

const logs: LogEntry[] = [];

export function createApiServer() {
  const app = Fastify({ logger: false });

  app.get("/today", async () => {
    return buildTodayPayload({
      ...starterRuleInput,
      latestLogs: logs,
    });
  });

  app.post<{ Body: QuickLogMutation }>("/logs", async (request, reply) => {
    const mutation = request.body;

    if (!mutation || !supportedQuickLogs.includes(mutation.type)) {
      return reply.status(400).send({
        accepted: false,
        error: "Unsupported quick log type",
      });
    }

    const log: LogEntry = {
      id: `log-${logs.length + 1}`,
      type: mutation.type,
      value: mutation.value,
      occurredAt: mutation.occurredAt,
      source: "manual",
    };
    logs.push(log);

    return reply.status(201).send({
      accepted: true,
      log,
      today: buildTodayPayload({
        ...starterRuleInput,
        latestLogs: logs,
      }),
    });
  });

  app.get("/programs", async () => {
    return [
      starterRuleInput.activeProgram,
      {
        id: "pelvic-floor-starter",
        title: "Pelvic floor consistency starter",
        category: "pelvic_floor",
        durationDays: 14,
        dayIndex: 1,
      },
      {
        id: "sleep-environment-reset",
        title: "Sleep and environment reset",
        category: "sleep",
        durationDays: 14,
        dayIndex: 1,
      },
    ].filter(Boolean);
  });

  app.get("/content/featured", async () => featuredContent);

  app.get("/sync/health", async () => ({
    status: "available",
    accepts: ["quick_log"],
    mode: "mock",
  }));

  app.post("/coach/explain-priority", async () => {
    const today = buildTodayPayload({
      ...starterRuleInput,
      latestLogs: logs,
    });

    return explainPriority(today.currentPriority);
  });

  return app;
}
