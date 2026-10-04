import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import process from "node:process";
import { isSoulMeshMessage, createSoulMeshMessage, type SoulMeshMessage } from "../src/soul-mesh/SoulMeshProtocol";
import { SOUL_MESH_CAPABILITIES } from "../src/soul-mesh/SoulMeshCapabilities";
import { SoulMeshCapabilityRegistry } from "../src/soul-mesh/SoulMeshCapabilityRegistry";
import { SoulMeshCapabilityExecutor } from "../src/soul-mesh/SoulMeshCapabilityExecutor";

const HOST = process.env.SOUL_MESH_HOST ?? "0.0.0.0";
const PORT = Number(process.env.SOUL_MESH_PORT ?? 3020);
const MAX_BYTES = Number(process.env.SOUL_MESH_MAX_REQUEST_BYTES ?? 2 * 1024 * 1024);
const nucleus = "N02" as const;

const registry = new SoulMeshCapabilityRegistry();
const executor = new SoulMeshCapabilityExecutor(registry);

function writeJson(res: ServerResponse, status: number, value: unknown) {
  const body = JSON.stringify(value);
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("content-length", Buffer.byteLength(body));
  res.end(body);
}

function readJson(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let total = 0;
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer | string) => {
      const b = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      total += b.length;
      if (total > MAX_BYTES) {
        reject(Object.assign(new Error("MESH_PAYLOAD_TOO_LARGE"), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(b);
    });
    req.on("end", () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))); }
      catch { reject(Object.assign(new Error("INVALID_JSON"), { statusCode: 400 })); }
    });
    req.on("error", reject);
  });
}

function discovery() {
  return {
    protocol: "soul-mesh/1",
    contractVersion: "1.1.0",
    nucleus,
    status: "AVAILABLE",
    evidenceState: "PROJECTED",
    capabilities: SOUL_MESH_CAPABILITIES.map(capability => ({
      id: capability.id,
      version: capability.version,
      owner: capability.owner,
      status: executor.has(capability.id) ? "EXECUTABLE" : "DECLARED",
      request: capability.request,
      response: capability.response,
      events: capability.events,
      tools: capability.tools ?? [],
      context: capability.context ?? []
    })),
    executableCapabilities: executor.listExecutable(),
    transport: { protocol: "http", endpoint: "http://" + HOST + ":" + PORT + "/mesh/in" },
    runtime: "Eternium-N02"
  };
}

function errorFor(message: SoulMeshMessage | undefined, code: string, detail?: string) {
  return createSoulMeshMessage({
    source: nucleus,
    target: message?.source ?? "N01",
    kind: "error",
    capability: message?.capability,
    correlationId: message?.correlationId ?? crypto.randomUUID(),
    payload: { code, ...(detail ? { detail } : {}) }
  });
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/ready") {
      const production = process.env.NODE_ENV === "production";
      const meshSecretConfigured = Boolean(process.env.SOUL_MESH_HMAC_SECRET?.trim());
      const ready = !production || meshSecretConfigured;
      writeJson(res, ready ? 200 : 503, {
        ready,
        nucleus,
        protocol: "soul-mesh/1",
        contractVersion: "1.1.0",
        checks: { process: true, meshSecretConfigured }
      });
      return;
    }

    if (req.method === "GET" && req.url === "/mesh/health") {
      writeJson(res, 200, {
        status: "ok",
        nucleus,
        protocol: "soul-mesh/1",
        contractVersion: "1.1.0",
        transport: "http",
        uptimeSeconds: Math.floor(process.uptime())
      });
      return;
    }

    if (req.method === "GET" && req.url === "/mesh/discovery") {
      writeJson(res, 200, discovery());
      return;
    }

    if (req.method !== "POST" || req.url !== "/mesh/in") {
      writeJson(res, 404, { code: "NOT_FOUND" });
      return;
    }

    let value: unknown;
    try {
      value = await readJson(req);
    } catch (error) {
      const e = error as Error & { statusCode?: number };
      writeJson(res, e.statusCode ?? 400, { code: e.message });
      return;
    }

    if (!isSoulMeshMessage(value)) {
      writeJson(res, 400, { code: "INVALID_MESH_MESSAGE" });
      return;
    }

    if (value.kind !== "request") {
      writeJson(res, 400, errorFor(value, "REQUEST_REQUIRED"));
      return;
    }

    if (!executor.has(value.capability ?? "")) {
      writeJson(res, 404, errorFor(value, "CAPABILITY_HANDLER_NOT_REGISTERED"));
      return;
    }

    const result = await executor.execute(value);
    const outbound = createSoulMeshMessage({
      source: nucleus,
      target: value.source,
      kind: "response",
      capability: value.capability,
      correlationId: value.correlationId,
      payload: result,
      meta: {
        runtime: "Eternium-N02",
        transport: "HTTP",
        encoding: "json",
        version: "1.1.0",
        traceId: value.meta?.traceId
      }
    });

    writeJson(res, 200, outbound);
  } catch (error) {
    writeJson(res, 500, { code: "MESH_INTERNAL_ERROR", detail: error instanceof Error ? error.message : String(error) });
  }
});

server.listen(PORT, HOST, () => {
  console.log(JSON.stringify({
    event: "soul.mesh.http.listening",
    nucleus,
    host: HOST,
    port: PORT,
    health: "/mesh/health",
    discovery: "/mesh/discovery",
    ingress: "/mesh/in"
  }));
});

function shutdown(signal: string) {
  console.log(JSON.stringify({ event: "soul.mesh.http.shutdown", signal }));
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
