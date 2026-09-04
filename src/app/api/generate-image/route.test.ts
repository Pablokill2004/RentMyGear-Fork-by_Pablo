import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/services/imageService", () => ({
  getOrGenerateImage: vi.fn(),
}));

vi.mock("@/services/inventoryService", () => ({
  getGearById: vi.fn(),
}));

import { NextRequest } from "next/server";
import { GET, POST } from "./route";
import { getOrGenerateImage } from "@/services/imageService";
import { getGearById } from "@/services/inventoryService";

function createGetRequest(url: string): NextRequest {
  return new NextRequest(url);
}

function createPostRequest(body: object): NextRequest {
  return new NextRequest("http://localhost/api/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/generate-image", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 when id param is missing", async () => {
    const req = createGetRequest("http://localhost/api/generate-image");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("should return 404 when gear not found", async () => {
    vi.mocked(getGearById).mockResolvedValue(null);
    const req = createGetRequest("http://localhost/api/generate-image?id=nonexistent");
    const res = await GET(req);
    expect(res.status).toBe(404);
  });

  it("should redirect to existing imageURL", async () => {
    vi.mocked(getGearById).mockResolvedValue({
      id: "gear-001",
      name: "Camera",
      category: "fotografia-video",
      description: "A camera",
      specs: {},
      dailyRate: 500,
      imageURL: "https://example.com/image.jpg",
    });
    const req = createGetRequest("http://localhost/api/generate-image?id=gear-001");
    const res = await GET(req);
    expect([302, 307]).toContain(res.status);
  });

  it("should generate image when imageURL is null", async () => {
    vi.mocked(getGearById).mockResolvedValue({
      id: "gear-001",
      name: "Camera",
      category: "fotografia-video",
      description: "A camera",
      specs: {},
      dailyRate: 500,
      imageURL: null,
    });
    vi.mocked(getOrGenerateImage).mockResolvedValue("https://gcs.example.com/generated.png");
    const req = createGetRequest("http://localhost/api/generate-image?id=gear-001");
    const res = await GET(req);
    expect([302, 307]).toContain(res.status);
  });

  it("should return 500 when generation fails", async () => {
    vi.mocked(getGearById).mockResolvedValue({
      id: "gear-001",
      name: "Camera",
      category: "fotografia-video",
      description: "A camera",
      specs: {},
      dailyRate: 500,
      imageURL: null,
    });
    vi.mocked(getOrGenerateImage).mockResolvedValue(null);
    const req = createGetRequest("http://localhost/api/generate-image?id=gear-001");
    const res = await GET(req);
    expect(res.status).toBe(500);
  });

  it("should return 500 on internal error", async () => {
    vi.mocked(getGearById).mockRejectedValue(new Error("Unexpected"));
    const req = createGetRequest("http://localhost/api/generate-image?id=gear-001");
    const res = await GET(req);
    expect(res.status).toBe(500);
  });
});

describe("POST /api/generate-image", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 when gearId is missing", async () => {
    const req = createPostRequest({});
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 404 when gear not found", async () => {
    vi.mocked(getGearById).mockResolvedValue(null);
    const req = createPostRequest({ gearId: "nonexistent" });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("should return existing image when imageURL exists", async () => {
    vi.mocked(getGearById).mockResolvedValue({
      id: "gear-001",
      name: "Camera",
      category: "fotografia-video",
      description: "A camera",
      specs: {},
      dailyRate: 500,
      imageURL: "https://example.com/image.jpg",
    });
    const req = createPostRequest({ gearId: "gear-001" });
    const res = await POST(req);
    const data = await res.json();
    expect(data.generated).toBe(false);
    expect(data.imageURL).toBe("https://example.com/image.jpg");
  });

  it("should generate and return new image", async () => {
    vi.mocked(getGearById).mockResolvedValue({
      id: "gear-001",
      name: "Camera",
      category: "fotografia-video",
      description: "A camera",
      specs: {},
      dailyRate: 500,
      imageURL: null,
    });
    vi.mocked(getOrGenerateImage).mockResolvedValue("https://gcs.example.com/new.png");
    const req = createPostRequest({ gearId: "gear-001" });
    const res = await POST(req);
    const data = await res.json();
    expect(data.generated).toBe(true);
    expect(data.imageURL).toBe("https://gcs.example.com/new.png");
  });

  it("should return 500 when generation fails", async () => {
    vi.mocked(getGearById).mockResolvedValue({
      id: "gear-001",
      name: "Camera",
      category: "fotografia-video",
      description: "A camera",
      specs: {},
      dailyRate: 500,
      imageURL: null,
    });
    vi.mocked(getOrGenerateImage).mockResolvedValue(null);
    const req = createPostRequest({ gearId: "gear-001" });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it("should return 500 on internal error", async () => {
    vi.mocked(getGearById).mockRejectedValue(new Error("Unexpected"));
    const req = createPostRequest({ gearId: "gear-001" });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});
