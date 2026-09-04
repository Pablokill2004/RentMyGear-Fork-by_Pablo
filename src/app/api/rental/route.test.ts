import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/services/inventoryService", () => ({
  getGearById: vi.fn(),
}));

import { NextRequest } from "next/server";
import { POST, GET } from "./route";
import { getGearById } from "@/services/inventoryService";

function createRequest(body: object): NextRequest {
  return new NextRequest("http://localhost/api/rental", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/rental", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getGearById).mockResolvedValue({
      id: "gear-001",
      name: "Test Camera",
      category: "fotografia-video",
      description: "A camera",
      specs: {},
      dailyRate: 500,
      imageURL: null,
    });
  });

  it("should create a rental and return 201", async () => {
    const req = createRequest({
      gearId: "gear-001",
      startDate: "2024-06-15T10:00:00.000Z",
      endDate: "2024-06-18T10:00:00.000Z",
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.id).toMatch(/^RMG-/);
    expect(data.gearId).toBe("gear-001");
    expect(data.totalDays).toBe(4);
    expect(data.dailyRate).toBe(500);
    expect(data.totalPrice).toBe(2000);
    expect(data.status).toBe("confirmed");
  });

  it("should include insurance fee when insuranceSelected is true", async () => {
    const req = createRequest({
      gearId: "gear-001",
      startDate: "2024-06-15T10:00:00.000Z",
      endDate: "2024-06-18T10:00:00.000Z",
      insuranceSelected: true,
    });

    const res = await POST(req);
    const data = await res.json();
    expect(data.insuranceSelected).toBe(true);
    expect(data.insuranceFee).toBe(400); // 2000 * 0.2
    expect(data.totalPrice).toBe(2400);
  });

  it("should default insuranceSelected to false", async () => {
    const req = createRequest({
      gearId: "gear-001",
      startDate: "2024-06-15T10:00:00.000Z",
      endDate: "2024-06-18T10:00:00.000Z",
    });

    const res = await POST(req);
    const data = await res.json();
    expect(data.insuranceSelected).toBe(false);
    expect(data.insuranceFee).toBe(0);
  });

  it("should return 400 for invalid request", async () => {
    const req = createRequest({ gearId: "" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 404 for non-existent gear", async () => {
    vi.mocked(getGearById).mockResolvedValue(null);
    const req = createRequest({
      gearId: "non-existent",
      startDate: "2024-06-15T10:00:00.000Z",
      endDate: "2024-06-18T10:00:00.000Z",
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("should return 500 on internal error", async () => {
    vi.mocked(getGearById).mockRejectedValue(new Error("DB error"));
    const req = createRequest({
      gearId: "gear-001",
      startDate: "2024-06-15T10:00:00.000Z",
      endDate: "2024-06-18T10:00:00.000Z",
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});

describe("GET /api/rental", () => {
  it("should return 405", async () => {
    const res = await GET();
    expect(res.status).toBe(405);
  });
});
