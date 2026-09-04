import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("utils", () => {
  describe("cn", () => {
    it("should merge class names", () => {
      const result = cn("text-red-500", "text-blue-500");
      expect(result).toBe("text-blue-500");
    });

    it("should handle conditional classes", () => {
      const result = cn("base", false && "hidden", "extra");
      expect(result).toContain("base");
      expect(result).toContain("extra");
      expect(result).not.toContain("hidden");
    });

    it("should handle undefined and null", () => {
      const result = cn("base", undefined, null);
      expect(result).toBe("base");
    });

    it("should handle empty input", () => {
      const result = cn();
      expect(result).toBe("");
    });
  });
});
