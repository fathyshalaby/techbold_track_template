import { getEnv, resolveClientMode } from "../env.js";
import { PhoenixClient } from "./client.js";
import MockPhoenixClient from "./mock.js";

export function getPhoenixClient() {
  if (resolveClientMode("phoenix") === "mock") {
    return new MockPhoenixClient({ seedScenarios: getEnv().MOCK_SCENARIOS });
  }
  const env = getEnv();
  return new PhoenixClient(env.PHOENIX_API_BASE_URL, env.PHOENIX_API_TOKEN);
}
