import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("env", () => {
  const validEnv = {
    GCS_BUCKET_NAME: "test-bucket-123",
    GCS_PROJECT_ID: "test-project-123456",
    GOOGLE_APPLICATION_CREDENTIALS: ".gcp/service-account.json",
    NANO_BANANA_API_KEY: "test-api-key",
  };

  beforeEach(() => {
    // Set valid env vars
    for (const [key, value] of Object.entries(validEnv)) {
      process.env[key] = value;
    }
    // Reset the cached env
    vi.resetModules();
  });

  afterEach(() => {
    // Clean up env vars
    for (const key of Object.keys(validEnv)) {
      delete process.env[key];
    }
  });

  describe("getEnv", () => {
    it("should return validated env when all vars are set", async () => {
      const { getEnv } = await import("./env");
      const env = getEnv();
      expect(env.GCS_BUCKET_NAME).toBe("test-bucket-123");
      expect(env.GCS_PROJECT_ID).toBe("test-project-123456");
      expect(env.GOOGLE_APPLICATION_CREDENTIALS).toBe(".gcp/service-account.json");
      expect(env.NANO_BANANA_API_KEY).toBe("test-api-key");
    });

    it("should throw when GCS_BUCKET_NAME is missing", async () => {
      delete process.env.GCS_BUCKET_NAME;
      const { getEnv } = await import("./env");
      expect(() => getEnv()).toThrow("Environment validation failed");
    });

    it("should throw when GCS_PROJECT_ID is too short", async () => {
      process.env.GCS_PROJECT_ID = "abc";
      const { getEnv } = await import("./env");
      expect(() => getEnv()).toThrow("Environment validation failed");
    });

    it("should throw when NANO_BANANA_API_KEY is empty", async () => {
      process.env.NANO_BANANA_API_KEY = "";
      const { getEnv } = await import("./env");
      expect(() => getEnv()).toThrow("Environment validation failed");
    });

    it("should cache the result after first call", async () => {
      const { getEnv } = await import("./env");
      const env1 = getEnv();
      const env2 = getEnv();
      expect(env1).toBe(env2);
    });
  });

  describe("isEnvConfigured", () => {
    it("should return true when env is valid", async () => {
      const { isEnvConfigured } = await import("./env");
      expect(isEnvConfigured()).toBe(true);
    });

    it("should return false when env is invalid", async () => {
      delete process.env.GCS_BUCKET_NAME;
      const { isEnvConfigured } = await import("./env");
      expect(isEnvConfigured()).toBe(false);
    });
  });
});
