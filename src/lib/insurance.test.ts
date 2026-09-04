import { describe, it, expect } from "vitest";
import {
  getInsuranceRate,
  calculateInsuranceFee,
  calculatePriceWithInsurance,
  INSURANCE_RATE_HIGH_RISK,
  INSURANCE_RATE_STANDARD,
  HIGH_RISK_CATEGORY,
} from "./insurance";

describe("insurance", () => {
  describe("constants", () => {
    it("should define HIGH_RISK_CATEGORY as fotografia-video", () => {
      expect(HIGH_RISK_CATEGORY).toBe("fotografia-video");
    });

    it("should define INSURANCE_RATE_HIGH_RISK as 0.20", () => {
      expect(INSURANCE_RATE_HIGH_RISK).toBe(0.2);
    });

    it("should define INSURANCE_RATE_STANDARD as 0.10", () => {
      expect(INSURANCE_RATE_STANDARD).toBe(0.1);
    });
  });

  describe("getInsuranceRate", () => {
    it("should return 20% for fotografia-video (high risk)", () => {
      expect(getInsuranceRate("fotografia-video")).toBe(0.2);
    });

    it("should return 10% for montana-camping", () => {
      expect(getInsuranceRate("montana-camping")).toBe(0.1);
    });

    it("should return 10% for deportes-acuaticos", () => {
      expect(getInsuranceRate("deportes-acuaticos")).toBe(0.1);
    });
  });

  describe("calculateInsuranceFee", () => {
    it("should calculate 20% fee for photography gear", () => {
      const fee = calculateInsuranceFee(500, 3, "fotografia-video");
      expect(fee).toBe(300); // 500 * 3 * 0.2 = 300
    });

    it("should calculate 10% fee for camping gear", () => {
      const fee = calculateInsuranceFee(200, 5, "montana-camping");
      expect(fee).toBe(100); // 200 * 5 * 0.1 = 100
    });

    it("should calculate 10% fee for water sports gear", () => {
      const fee = calculateInsuranceFee(300, 2, "deportes-acuaticos");
      expect(fee).toBe(60); // 300 * 2 * 0.1 = 60
    });

    it("should calculate 1 day rental fee", () => {
      const fee = calculateInsuranceFee(100, 1, "fotografia-video");
      expect(fee).toBe(20); // 100 * 1 * 0.2 = 20
    });
  });

  describe("calculatePriceWithInsurance", () => {
    it("should return subtotal and zero fee when insurance is not selected", () => {
      const result = calculatePriceWithInsurance(
        500,
        3,
        "fotografia-video",
        false
      );
      expect(result.dailyRate).toBe(500);
      expect(result.days).toBe(3);
      expect(result.subtotal).toBe(1500);
      expect(result.insuranceFee).toBe(0);
      expect(result.insuranceRate).toBe(0);
      expect(result.total).toBe(1500);
    });

    it("should include 20% insurance fee for photography gear when selected", () => {
      const result = calculatePriceWithInsurance(
        500,
        3,
        "fotografia-video",
        true
      );
      expect(result.subtotal).toBe(1500);
      expect(result.insuranceFee).toBe(300);
      expect(result.insuranceRate).toBe(0.2);
      expect(result.total).toBe(1800);
    });

    it("should include 10% insurance fee for camping gear when selected", () => {
      const result = calculatePriceWithInsurance(
        200,
        4,
        "montana-camping",
        true
      );
      expect(result.subtotal).toBe(800);
      expect(result.insuranceFee).toBe(80);
      expect(result.insuranceRate).toBe(0.1);
      expect(result.total).toBe(880);
    });

    it("should include 10% insurance fee for water sports gear when selected", () => {
      const result = calculatePriceWithInsurance(
        300,
        2,
        "deportes-acuaticos",
        true
      );
      expect(result.subtotal).toBe(600);
      expect(result.insuranceFee).toBe(60);
      expect(result.insuranceRate).toBe(0.1);
      expect(result.total).toBe(660);
    });

    it("should handle 1-day rental with insurance", () => {
      const result = calculatePriceWithInsurance(
        100,
        1,
        "fotografia-video",
        true
      );
      expect(result.total).toBe(120); // 100 + 20
    });
  });
});
