import { describe, it, expect } from "vitest";
import {
  CATEGORY_IDS,
  CATEGORIES,
  gearItemSchema,
  rentalDatesSchema,
  rentalRequestSchema,
  rentalConfirmationSchema,
  validateGearItem,
  validateRentalDates,
  isValidCategory,
  type GearItem,
  type CategoryId,
} from "./validation";

describe("validation", () => {
  describe("CATEGORY_IDS", () => {
    it("should contain 3 categories", () => {
      expect(CATEGORY_IDS).toHaveLength(3);
    });

    it("should include fotografia-video", () => {
      expect(CATEGORY_IDS).toContain("fotografia-video");
    });

    it("should include montana-camping", () => {
      expect(CATEGORY_IDS).toContain("montana-camping");
    });

    it("should include deportes-acuaticos", () => {
      expect(CATEGORY_IDS).toContain("deportes-acuaticos");
    });
  });

  describe("CATEGORIES", () => {
    it("should have info for all categories", () => {
      for (const id of CATEGORY_IDS) {
        expect(CATEGORIES[id]).toBeDefined();
        expect(CATEGORIES[id].name).toBeTruthy();
        expect(CATEGORIES[id].description).toBeTruthy();
      }
    });
  });

  describe("gearItemSchema", () => {
    const validItem: GearItem = {
      id: "test-001",
      name: "Test Camera",
      category: "fotografia-video",
      description: "A test camera",
      specs: { sensor: "45MP" },
      dailyRate: 500,
      imageURL: "https://example.com/image.jpg",
    };

    it("should accept a valid gear item", () => {
      const result = gearItemSchema.safeParse(validItem);
      expect(result.success).toBe(true);
    });

    it("should reject empty id", () => {
      const result = gearItemSchema.safeParse({ ...validItem, id: "" });
      expect(result.success).toBe(false);
    });

    it("should reject empty name", () => {
      const result = gearItemSchema.safeParse({ ...validItem, name: "" });
      expect(result.success).toBe(false);
    });

    it("should reject invalid category", () => {
      const result = gearItemSchema.safeParse({ ...validItem, category: "invalid" });
      expect(result.success).toBe(false);
    });

    it("should reject negative dailyRate", () => {
      const result = gearItemSchema.safeParse({ ...validItem, dailyRate: -100 });
      expect(result.success).toBe(false);
    });

    it("should reject invalid imageURL", () => {
      const result = gearItemSchema.safeParse({ ...validItem, imageURL: "not-a-url" });
      expect(result.success).toBe(false);
    });

    it("should accept null imageURL", () => {
      const result = gearItemSchema.safeParse({ ...validItem, imageURL: null });
      expect(result.success).toBe(true);
    });
  });

  describe("rentalDatesSchema", () => {
    it("should accept valid future dates", () => {
      const start = new Date();
      start.setDate(start.getDate() + 1);
      const end = new Date();
      end.setDate(end.getDate() + 3);
      const result = rentalDatesSchema.safeParse({ startDate: start, endDate: end });
      expect(result.success).toBe(true);
    });

    it("should reject past start date", () => {
      const start = new Date();
      start.setDate(start.getDate() - 1);
      const end = new Date();
      end.setDate(end.getDate() + 1);
      const result = rentalDatesSchema.safeParse({ startDate: start, endDate: end });
      expect(result.success).toBe(false);
    });

    it("should reject end date before start date", () => {
      const start = new Date();
      start.setDate(start.getDate() + 5);
      const end = new Date();
      end.setDate(end.getDate() + 1);
      const result = rentalDatesSchema.safeParse({ startDate: start, endDate: end });
      expect(result.success).toBe(false);
    });

    it("should accept same-day rental (start = end = today)", () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const result = rentalDatesSchema.safeParse({ startDate: today, endDate: today });
      expect(result.success).toBe(true);
    });
  });

  describe("rentalRequestSchema", () => {
    it("should accept valid request", () => {
      const result = rentalRequestSchema.safeParse({
        gearId: "gear-001",
        startDate: "2024-06-15T10:00:00.000Z",
        endDate: "2024-06-18T10:00:00.000Z",
        customerName: "Juan Perez",
        customerEmail: "juan@example.com",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty gearId", () => {
      const result = rentalRequestSchema.safeParse({
        gearId: "",
        startDate: "2024-06-15T10:00:00.000Z",
        endDate: "2024-06-18T10:00:00.000Z",
        customerName: "Juan",
        customerEmail: "juan@example.com",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid email", () => {
      const result = rentalRequestSchema.safeParse({
        gearId: "gear-001",
        startDate: "2024-06-15T10:00:00.000Z",
        endDate: "2024-06-18T10:00:00.000Z",
        customerName: "Juan",
        customerEmail: "not-an-email",
      });
      expect(result.success).toBe(false);
    });

    it("should reject short customer name", () => {
      const result = rentalRequestSchema.safeParse({
        gearId: "gear-001",
        startDate: "2024-06-15T10:00:00.000Z",
        endDate: "2024-06-18T10:00:00.000Z",
        customerName: "J",
        customerEmail: "juan@example.com",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("rentalConfirmationSchema", () => {
    it("should accept valid confirmation", () => {
      const result = rentalConfirmationSchema.safeParse({
        id: "RMG-123",
        gearId: "gear-001",
        gearName: "Camera",
        startDate: "2024-06-15T10:00:00.000Z",
        endDate: "2024-06-18T10:00:00.000Z",
        totalDays: 3,
        dailyRate: 500,
        totalPrice: 1500,
        status: "confirmed",
        createdAt: "2024-06-15T10:00:00.000Z",
      });
      expect(result.success).toBe(true);
    });

    it("should accept pending status", () => {
      const result = rentalConfirmationSchema.safeParse({
        id: "RMG-123",
        gearId: "gear-001",
        gearName: "Camera",
        startDate: "2024-06-15T10:00:00.000Z",
        endDate: "2024-06-18T10:00:00.000Z",
        totalDays: 3,
        dailyRate: 500,
        totalPrice: 1500,
        status: "pending",
        createdAt: "2024-06-15T10:00:00.000Z",
      });
      expect(result.success).toBe(true);
    });

    it("should accept cancelled status", () => {
      const result = rentalConfirmationSchema.safeParse({
        id: "RMG-123",
        gearId: "gear-001",
        gearName: "Camera",
        startDate: "2024-06-15T10:00:00.000Z",
        endDate: "2024-06-18T10:00:00.000Z",
        totalDays: 3,
        dailyRate: 500,
        totalPrice: 1500,
        status: "cancelled",
        createdAt: "2024-06-15T10:00:00.000Z",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid status", () => {
      const result = rentalConfirmationSchema.safeParse({
        id: "RMG-123",
        gearId: "gear-001",
        gearName: "Camera",
        startDate: "2024-06-15T10:00:00.000Z",
        endDate: "2024-06-18T10:00:00.000Z",
        totalDays: 3,
        dailyRate: 500,
        totalPrice: 1500,
        status: "unknown",
        createdAt: "2024-06-15T10:00:00.000Z",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("validateGearItem", () => {
    it("should return parsed item for valid data", () => {
      const data = {
        id: "test-001",
        name: "Camera",
        category: "fotografia-video",
        description: "A camera",
        specs: {},
        dailyRate: 500,
        imageURL: null,
      };
      expect(validateGearItem(data)).toEqual(data);
    });

    it("should throw for invalid data", () => {
      expect(() => validateGearItem({})).toThrow();
    });
  });

  describe("validateRentalDates", () => {
    it("should return success for valid dates", () => {
      const start = new Date();
      start.setDate(start.getDate() + 1);
      const end = new Date();
      end.setDate(end.getDate() + 3);
      const result = validateRentalDates(start, end);
      expect(result.success).toBe(true);
    });

    it("should return error for invalid dates", () => {
      const start = new Date();
      start.setDate(start.getDate() - 1);
      const end = new Date();
      end.setDate(end.getDate() + 1);
      const result = validateRentalDates(start, end);
      expect(result.success).toBe(false);
    });
  });

  describe("isValidCategory", () => {
    it("should return true for valid categories", () => {
      expect(isValidCategory("fotografia-video")).toBe(true);
      expect(isValidCategory("montana-camping")).toBe(true);
      expect(isValidCategory("deportes-acuaticos")).toBe(true);
    });

    it("should return false for invalid category", () => {
      expect(isValidCategory("invalid")).toBe(false);
      expect(isValidCategory("")).toBe(false);
    });
  });
});
