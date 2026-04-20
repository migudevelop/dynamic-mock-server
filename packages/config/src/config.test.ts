import { describe, it, expect } from "vitest";

import { Config } from "./config.js";
import { DEFAULT_CONFIG } from "./constants.js";

describe("Config", () => {
  it("should return default config when no config file exists", () => {
    const config = new Config();
    const result = config.getConfig();
    expect(result.server?.port).toBe(DEFAULT_CONFIG.server.port);
    expect(result.server?.host).toBe(DEFAULT_CONFIG.server.host);
  });

  it("should return a deep copy (not reference)", () => {
    const config = new Config();
    const a = config.getConfig();
    const b = config.getConfig();
    expect(a).toEqual(b);
    expect(a).not.toBe(b); // different reference
  });

  it("should have expected default structure", () => {
    const config = new Config();
    const result = config.getConfig();
    expect(result).toHaveProperty("server");
    expect(result).toHaveProperty("logLevel");
    expect(result).toHaveProperty("files");
  });
});
