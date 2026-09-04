import { describe, it, expect, vi, beforeEach } from "vitest";
import type { GearItem } from "@/lib/validation";

const gearWithoutImage: GearItem = {
  id: "gear-no-image",
  name: "Canon EOS R5",
  category: "fotografia-video",
  description: "Professional mirrorless camera",
  specs: { sensor: "45MP" },
  dailyRate: 500,
  imageURL: null,
};

const gearWithImage: GearItem = {
  id: "gear-with-image",
  name: "North Face Tent",
  category: "montana-camping",
  description: "4-person tent",
  specs: { capacity: "4 persons" },
  dailyRate: 200,
  imageURL: "https://images.unsplash.com/photo-tent.jpg",
};

const mockGetGearById = vi.fn();
const mockUpdateGearImage = vi.fn();
const mockUploadImageFromBase64 = vi.fn();
const mockGetEnv = vi.fn(() => ({ NANO_BANANA_API_KEY: "test-api-key" }));
const mockGenerateContent = vi.fn();
const mockGetGenerativeModel = vi.fn(() => ({ generateContent: mockGenerateContent }));

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(function MockGenAI() {
    return {
      getGenerativeModel: mockGetGenerativeModel,
    };
  }),
}));

vi.mock("@/config/env", () => ({
  getEnv: () => mockGetEnv(),
}));

vi.mock("./storageService", () => ({
  uploadImageFromBase64: (...args: unknown[]) => mockUploadImageFromBase64(...args),
}));

vi.mock("./inventoryService", () => ({
  getGearById: (...args: unknown[]) => mockGetGearById(...args),
  updateGearImage: (...args: unknown[]) => mockUpdateGearImage(...args),
}));

describe("imageService", () => {
  beforeEach(() => {
    vi.resetModules();
    mockGetGearById.mockReset();
    mockUpdateGearImage.mockReset();
    mockUploadImageFromBase64.mockReset();
    mockGenerateContent.mockReset();
    mockGetGenerativeModel.mockReset();
    mockGetEnv.mockReset();
    mockGetEnv.mockReturnValue({ NANO_BANANA_API_KEY: "test-api-key" });
    mockGetGenerativeModel.mockReturnValue({ generateContent: mockGenerateContent });
  });

  describe("resolveImageUrl", () => {
    it("should return existing imageURL if available", async () => {
      const { resolveImageUrl } = await import("./imageService");
      expect(resolveImageUrl(gearWithImage)).toBe("https://images.unsplash.com/photo-tent.jpg");
    });

    it("should return API endpoint for items without imageURL", async () => {
      const { resolveImageUrl } = await import("./imageService");
      expect(resolveImageUrl(gearWithoutImage)).toBe("/api/generate-image?id=gear-no-image");
    });
  });

  describe("isImageUrlValid", () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    it("should return true for valid URL", async () => {
      vi.mocked(global.fetch).mockResolvedValue({ ok: true } as Response);
      const { isImageUrlValid } = await import("./imageService");
      expect(await isImageUrlValid("https://example.com/img.jpg")).toBe(true);
    });

    it("should return false for 404 response", async () => {
      vi.mocked(global.fetch).mockResolvedValue({ ok: false, status: 404 } as Response);
      const { isImageUrlValid } = await import("./imageService");
      expect(await isImageUrlValid("https://example.com/404.jpg")).toBe(false);
    });

    it("should return false for network error", async () => {
      vi.mocked(global.fetch).mockRejectedValue(new Error("Network Error"));
      const { isImageUrlValid } = await import("./imageService");
      expect(await isImageUrlValid("https://example.com/img.jpg")).toBe(false);
    });
  });

  describe("getOrGenerateImage", () => {
    it("should return imageURL when gear has an image", async () => {
      mockGetGearById.mockResolvedValue(gearWithImage);
      const { getOrGenerateImage } = await import("./imageService");
      const result = await getOrGenerateImage("gear-with-image");
      expect(result).toBe("https://images.unsplash.com/photo-tent.jpg");
      expect(mockUploadImageFromBase64).not.toHaveBeenCalled();
    });

    it("should return null when gear is not found", async () => {
      mockGetGearById.mockResolvedValue(null);
      const { getOrGenerateImage } = await import("./imageService");
      const result = await getOrGenerateImage("nonexistent");
      expect(result).toBeNull();
    });

    it("should generate and upload image when gear has no imageURL", async () => {
      mockGetGearById.mockResolvedValue(gearWithoutImage);
      mockGenerateContent.mockResolvedValue({
        response: {
          candidates: [
            {
              content: {
                parts: [{ inlineData: { data: "base64imagedata" } }],
              },
            },
          ],
        },
      });
      mockUploadImageFromBase64.mockResolvedValue("https://storage.googleapis.com/bucket/gear-image.png");
      mockUpdateGearImage.mockResolvedValue(gearWithoutImage);

      const { getOrGenerateImage } = await import("./imageService");
      const result = await getOrGenerateImage("gear-no-image");

      expect(result).toBe("https://storage.googleapis.com/bucket/gear-image.png");
      expect(mockUploadImageFromBase64).toHaveBeenCalledWith("base64imagedata", "gear-no-image", "image/png");
      expect(mockUpdateGearImage).toHaveBeenCalledWith("gear-no-image", "https://storage.googleapis.com/bucket/gear-image.png");
    });

    it("should return null when AI generation throws", async () => {
      mockGetGearById.mockResolvedValue(gearWithoutImage);
      mockGenerateContent.mockRejectedValue(new Error("API Error"));

      const { getOrGenerateImage } = await import("./imageService");
      const result = await getOrGenerateImage("gear-no-image");
      expect(result).toBeNull();
    });

    it("should return null when response has no parts", async () => {
      mockGetGearById.mockResolvedValue(gearWithoutImage);
      mockGenerateContent.mockResolvedValue({
        response: {
          candidates: [
            {
              content: {
                parts: [],
              },
            },
          ],
        },
      });

      const { getOrGenerateImage } = await import("./imageService");
      const result = await getOrGenerateImage("gear-no-image");
      expect(result).toBeNull();
    });

    it("should return null when response has no inlineData", async () => {
      mockGetGearById.mockResolvedValue(gearWithoutImage);
      mockGenerateContent.mockResolvedValue({
        response: {
          candidates: [
            {
              content: {
                parts: [{ text: "no image here" }],
              },
            },
          ],
        },
      });

      const { getOrGenerateImage } = await import("./imageService");
      const result = await getOrGenerateImage("gear-no-image");
      expect(result).toBeNull();
    });

    it("should return null when upload fails", async () => {
      mockGetGearById.mockResolvedValue(gearWithoutImage);
      mockGenerateContent.mockResolvedValue({
        response: {
          candidates: [
            {
              content: {
                parts: [{ inlineData: { data: "base64imagedata" } }],
              },
            },
          ],
        },
      });
      mockUploadImageFromBase64.mockRejectedValue(new Error("Upload failed"));

      const { getOrGenerateImage } = await import("./imageService");
      const result = await getOrGenerateImage("gear-no-image");
      expect(result).toBeNull();
    });
  });

  describe("batchGenerateImages", () => {
    it("should return empty arrays when all items have images", async () => {
      const itemsWithImage = [gearWithImage, { ...gearWithImage, id: "gear-2" }];
      const { batchGenerateImages } = await import("./imageService");
      const result = await batchGenerateImages(itemsWithImage);

      expect(result.success).toEqual([]);
      expect(result.failed).toEqual([]);
    });

    it("should process items without images and call progress callback", async () => {
      mockGetGearById.mockResolvedValue(gearWithoutImage);
      mockGenerateContent.mockResolvedValue({
        response: {
          candidates: [
            {
              content: {
                parts: [{ inlineData: { data: "base64imagedata" } }],
              },
            },
          ],
        },
      });
      mockUploadImageFromBase64.mockResolvedValue("https://storage.googleapis.com/bucket/gear-image.png");
      mockUpdateGearImage.mockResolvedValue(gearWithoutImage);

      const { batchGenerateImages } = await import("./imageService");
      const progressCallback = vi.fn();
      const result = await batchGenerateImages([gearWithoutImage], progressCallback);

      expect(result.success).toContain("gear-no-image");
      expect(result.failed).toEqual([]);
      expect(progressCallback).toHaveBeenCalledWith(1, 1, gearWithoutImage);
    });

    it("should report as success when getOrGenerateImage returns null (catches internally)", async () => {
      mockGetGearById.mockResolvedValue(gearWithoutImage);
      mockGenerateContent.mockRejectedValue(new Error("AI Error"));

      const { batchGenerateImages } = await import("./imageService");
      const result = await batchGenerateImages([gearWithoutImage]);

      expect(result.success).toContain("gear-no-image");
      expect(result.failed).toEqual([]);
    });

    it("should track failed items when getOrGenerateImage throws", async () => {
      mockGetGearById.mockRejectedValue(new Error("DB Error"));

      const { batchGenerateImages } = await import("./imageService");
      const result = await batchGenerateImages([gearWithoutImage]);

      expect(result.success).toEqual([]);
      expect(result.failed).toContain("gear-no-image");
    });

    it("should wait between generations when processing multiple items", async () => {
      mockGetGearById.mockResolvedValue(gearWithoutImage);
      mockGenerateContent.mockResolvedValue({
        response: {
          candidates: [
            {
              content: {
                parts: [{ inlineData: { data: "base64imagedata" } }],
              },
            },
          ],
        },
      });
      mockUploadImageFromBase64.mockResolvedValue(
        "https://storage.googleapis.com/bucket/gear-image.png"
      );
      mockUpdateGearImage.mockResolvedValue(gearWithoutImage);

      const { batchGenerateImages } = await import("./imageService");
      const result = await batchGenerateImages([
        gearWithoutImage,
        { ...gearWithoutImage, id: "gear-no-image-2" },
      ]);

      expect(result.success).toHaveLength(2);
      expect(result.success).toContain("gear-no-image");
      expect(result.success).toContain("gear-no-image-2");
    }, 30000);
  });

  describe("getGenAIClient singleton", () => {
    it("should reuse the cached Gemini client across calls", async () => {
      mockGetGearById.mockResolvedValue(gearWithoutImage);
      mockGenerateContent.mockResolvedValue({
        response: {
          candidates: [
            {
              content: {
                parts: [{ inlineData: { data: "base64imagedata" } }],
              },
            },
          ],
        },
      });
      mockUploadImageFromBase64.mockResolvedValue(
        "https://storage.googleapis.com/bucket/gear-image.png"
      );
      mockUpdateGearImage.mockResolvedValue(gearWithoutImage);

      const { getOrGenerateImage } = await import("./imageService");
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      vi.mocked(GoogleGenerativeAI).mockClear();

      await getOrGenerateImage("gear-no-image");
      await getOrGenerateImage("gear-no-image");

      expect(GoogleGenerativeAI).toHaveBeenCalledTimes(1);
    });
  });
});
