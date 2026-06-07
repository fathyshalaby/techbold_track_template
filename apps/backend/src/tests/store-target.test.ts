import { describe, expect, it } from "vitest";
import { parseSafeTarget, resolveSshTargetFromCustomerSystemId } from "../store/runs.js";

describe("parseSafeTarget", () => {
  it("parses legacy ip:port without username", () => {
    expect(parseSafeTarget("10.0.0.1:22")).toEqual({
      ip: "10.0.0.1",
      port: 22,
      username: "",
      os: "",
    });
  });

  it("parses username@ip:port", () => {
    expect(parseSafeTarget("azureuser@20.234.203.74:22")).toEqual({
      ip: "20.234.203.74",
      port: 22,
      username: "azureuser",
      os: "",
    });
  });

  it("returns null for malformed ids", () => {
    expect(parseSafeTarget("bad-value")).toBeNull();
  });
});

describe("resolveSshTargetFromCustomerSystemId", () => {
  it("prefers embedded username over env default", () => {
    const prev = process.env.SSH_USERNAME;
    process.env.SSH_USERNAME = "fallback";
    expect(resolveSshTargetFromCustomerSystemId("tech@10.0.0.5:2222")).toEqual({
      host: "10.0.0.5",
      port: 2222,
      username: "tech",
    });
    process.env.SSH_USERNAME = prev;
  });
});
