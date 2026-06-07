import { config } from "./config";

export type CaseSourceSelection = "real_erp" | "sandbox_cases";
export type ErpSource = "real_erp" | "local_or_mock" | "sandbox_cases";

const localHosts = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1", "host.docker.internal", "phoenix-mock"]);
let selected: CaseSourceSelection = config.sandboxCaseCount > 0 ? "sandbox_cases" : "real_erp";

export function sandboxAvailable(): boolean {
  return config.sandboxCaseCount > 0;
}

export function selectedCaseSource(): CaseSourceSelection {
  return selected;
}

export function setCaseSource(source: string): CaseSourceSelection {
  if (source !== "real_erp" && source !== "sandbox_cases") {
    throw new Error("case source must be real_erp or sandbox_cases");
  }
  if (source === "sandbox_cases" && !sandboxAvailable()) {
    throw new Error("sandbox cases are not seeded; set SANDBOX_CASE_COUNT > 0 and restart compose");
  }
  selected = source;
  return selected;
}

export function activePhoenixBaseUrl(): string {
  return selected === "sandbox_cases" ? config.sandboxPhoenixBaseUrl : config.realPhoenixBaseUrl;
}

export function erpSource(): ErpSource {
  if (selected === "sandbox_cases") return "sandbox_cases";
  const host = new URL(config.realPhoenixBaseUrl || "http://localhost").hostname.toLowerCase();
  return localHosts.has(host) ? "local_or_mock" : "real_erp";
}

export function caseSourceStatus() {
  return {
    case_source: selected,
    erp_source: erpSource(),
    sandbox_case_count: config.sandboxCaseCount,
    sandbox_available: sandboxAvailable(),
  };
}
