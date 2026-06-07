import { scenariosForHost } from "./registry.js";
import type { Archetype, Scenario, TicketPriority } from "./types.js";

export const DYNAMIC_TICKET_ID_MIN = 7200;
export const DYNAMIC_SSH_PORT_MIN = 2210;
export const MAX_GENERATE_COUNT = 10;

const ARCHETYPES: Archetype[] = [
  "service-health",
  "document-upload",
  "partner-sync",
  "erp-write-path",
  "monitoring-data",
];

const CUSTOMER_NAMES = [
  "Donaufeld Spedition GmbH",
  "Tauern Energie AG",
  "Marchfeld Handel KG",
  "Wachau Apotheke GmbH",
  "Kahlenberg Medien GmbH",
  "Semmering Logistik GmbH",
  "Neusiedler IT Services",
  "Salzkammergut Retail KG",
  "Innviertel Systems AG",
  "Bregenzer Cloud GmbH",
];

const SERVICE_WORDS = ["beacon", "relay", "hub", "gateway", "ingest", "portal", "sync", "agent"];

const SYMPTOM_TEMPLATES: Record<Archetype, { title: string; report: string }> = {
  "service-health": {
    title: "Status endpoint unavailable after restart",
    report:
      "The internal status page is down after the server was restarted. A manual check earlier showed the application can answer on localhost, but it does not come back on its own.",
  },
  "document-upload": {
    title: "Document upload returns server error",
    report:
      "The customer portal loads normally, but users get a server error when they upload a new document. Previously uploaded documents must remain untouched.",
  },
  "partner-sync": {
    title: "Order sync cannot reach partner service",
    report:
      "The order synchronisation worker is running, but it reports that the partner endpoint is unreachable. The local partner service should be reachable from the host.",
  },
  "erp-write-path": {
    title: "ERP order creation fails while reads work",
    report:
      "The ERP database accepts read queries from the application role, but creating a new order fails. Existing order data must be preserved.",
  },
  "monitoring-data": {
    title: "Dashboard shows stale monitoring data",
    report:
      "The application and dashboard health checks pass, but the monitoring dashboard is not receiving fresh heartbeat data. The ingest endpoint should continue counting new samples.",
  },
};

const PRIORITIES: TicketPriority[] = ["high", "medium", "low"];

export type GenerateOptions = {
  count: number;
  archetypes?: Archetype[];
  randomize?: boolean;
  host?: string;
  seed?: number;
  usedTicketIds?: Set<number>;
  usedPorts?: Set<number>;
};

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, items: T[]): T {
  return items[Math.floor(rng() * items.length)] as T;
}

function pickWord(rng: () => number): string {
  return pick(rng, SERVICE_WORDS);
}

function ticketDescription(report: string): string {
  return `## Customer report\n${report}\n\n## Public validation\nRun: sudo /opt/hackathon/public-test.sh\nThe test must pass.\n\n## Reset\nThe VM is reset when it is rebooted.`;
}

function nextTicketId(used: Set<number>): number {
  let id = DYNAMIC_TICKET_ID_MIN;
  while (used.has(id)) id += 1;
  used.add(id);
  return id;
}

function nextPort(used: Set<number>): number {
  let port = DYNAMIC_SSH_PORT_MIN;
  while (used.has(port)) port += 1;
  used.add(port);
  return port;
}

function buildParams(archetype: Archetype, rng: () => number): Scenario["params"] {
  const word = pickWord(rng);
  const portBase = 8000 + Math.floor(rng() * 200);

  switch (archetype) {
    case "service-health":
      return {
        serviceName: `${word}-svc`,
        port: portBase,
        healthPath: "/health",
      };
    case "document-upload":
      return {
        serviceName: `${word}-hub`,
        serviceUser: `${word}svc`,
        serviceUid: 1999 + Math.floor(rng() * 100),
        port: portBase + 1,
        rootDir: `/srv/${word}-hub`,
        uploadDir: `/srv/${word}-hub/uploads`,
        existingDir: `/srv/${word}-hub/existing`,
      };
    case "partner-sync": {
      const host = `${word}-api.internal`;
      return {
        partnerService: `${word}-gateway`,
        syncService: `${word}-relay`,
        partnerHost: host,
        goodIp: "127.0.0.1",
        badIp: "127.0.0.2",
        partnerPort: 9000 + Math.floor(rng() * 50),
        statusPath: `/var/lib/${word}-relay/status.json`,
      };
    }
    case "erp-write-path":
      return {
        databaseName: `${word}orders`,
        appRole: `${word}_writer`,
        appPassword: `local_${word}_password`,
        tableName: "orders",
        sequenceName: "orders_id_seq",
      };
    case "monitoring-data": {
      const ingestPort = 9090 + Math.floor(rng() * 20);
      return {
        customerAppService: `${word}-app`,
        customerAppPort: portBase + 8,
        dashboardService: `${word}-dashboard`,
        dashboardPort: 3000 + Math.floor(rng() * 10),
        ingestService: `${word}-ingest`,
        ingestPort,
        agentService: `${word}-agent`,
        configFile: `/etc/${word}-agent/config.env`,
        correctEndpoint: `http://127.0.0.1:${ingestPort}/ingest`,
        badEndpoint: `http://127.0.0.1:${ingestPort + 1}/ingest`,
      };
    }
  }
}

export function collectUsedIdsAndPorts(host = "127.0.0.1"): {
  ticketIds: Set<number>;
  ports: Set<number>;
} {
  const ticketIds = new Set<number>();
  const ports = new Set<number>();
  for (const scenario of scenariosForHost(host)) {
    ticketIds.add(scenario.ticket.id);
    ports.add(scenario.system.port);
  }
  return { ticketIds, ports };
}

export function generateScenarios(opts: GenerateOptions): Scenario[] {
  const count = Math.min(Math.max(1, opts.count), MAX_GENERATE_COUNT);
  const host = opts.host ?? "127.0.0.1";
  const rng = mulberry32(opts.seed ?? Date.now());
  const ticketIds = new Set(opts.usedTicketIds ?? collectUsedIdsAndPorts(host).ticketIds);
  const ports = new Set(opts.usedPorts ?? collectUsedIdsAndPorts(host).ports);
  const pool = opts.archetypes?.length ? opts.archetypes : ARCHETYPES;
  const scenarios: Scenario[] = [];

  for (let i = 0; i < count; i += 1) {
    const archetype = pick(rng, pool);
    const template = SYMPTOM_TEMPLATES[archetype];
    const ticketId = nextTicketId(ticketIds);
    const port = nextPort(ports);
    const customerIndex = Math.floor(rng() * CUSTOMER_NAMES.length);
    const customerName = CUSTOMER_NAMES[customerIndex] ?? CUSTOMER_NAMES[0];
    const customerId = 5200 + ticketId;

    scenarios.push({
      archetype,
      ticket: {
        id: ticketId,
        title: template.title,
        description: ticketDescription(template.report),
        priority: pick(rng, PRIORITIES),
        status: "OPEN",
        customer_id: customerId,
        customer_name: customerName,
        tags: ["generated"],
        created_at: new Date().toISOString(),
      },
      system: {
        ip: host,
        port,
        username: "azureuser",
        os: "Ubuntu 22.04 LTS",
        notes: `Practice VM for ${archetype}`,
      },
      params: buildParams(archetype, rng),
    } as Scenario);
  }

  return scenarios;
}
