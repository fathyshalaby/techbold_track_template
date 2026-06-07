import { afterEach, describe, expect, it, vi } from "vitest";
import { registerProcessGuards, shouldRegisterProcessGuards } from "../process-guards.js";

describe("shouldRegisterProcessGuards", () => {
  const originalVitest = process.env.VITEST;
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    if (originalVitest === undefined) {
      delete process.env.VITEST;
    } else {
      process.env.VITEST = originalVitest;
    }
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
  });

  it("returns false when VITEST is set", () => {
    process.env.VITEST = "true";
    delete process.env.NODE_ENV;
    expect(shouldRegisterProcessGuards()).toBe(false);
  });

  it("returns false when NODE_ENV is test", () => {
    delete process.env.VITEST;
    process.env.NODE_ENV = "test";
    expect(shouldRegisterProcessGuards()).toBe(false);
  });

  it("returns true outside test mode", () => {
    delete process.env.VITEST;
    delete process.env.NODE_ENV;
    expect(shouldRegisterProcessGuards()).toBe(true);
  });
});

describe("registerProcessGuards", () => {
  const originalVitest = process.env.VITEST;
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    if (originalVitest === undefined) {
      delete process.env.VITEST;
    } else {
      process.env.VITEST = originalVitest;
    }
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
  });

  it("registers handlers outside test mode", () => {
    delete process.env.VITEST;
    delete process.env.NODE_ENV;
    const on = vi.spyOn(process, "on").mockImplementation(() => process);
    registerProcessGuards();
    expect(on).toHaveBeenCalledWith("unhandledRejection", expect.any(Function));
    expect(on).toHaveBeenCalledWith("uncaughtException", expect.any(Function));
    on.mockRestore();
  });

  it("skips registration under Vitest", () => {
    process.env.VITEST = "true";
    const on = vi.spyOn(process, "on").mockImplementation(() => process);
    registerProcessGuards();
    expect(on).not.toHaveBeenCalled();
    on.mockRestore();
  });
});
