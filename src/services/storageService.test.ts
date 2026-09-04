import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFileMethods = {
  save: vi.fn().mockResolvedValue(undefined),
  makePublic: vi.fn().mockResolvedValue(undefined),
  exists: vi.fn().mockResolvedValue([true]),
  delete: vi.fn().mockResolvedValue(undefined),
};

const mockBucketMethods = {
  file: vi.fn().mockReturnValue(mockFileMethods),
  getFiles: vi.fn().mockResolvedValue([
    [
      { name: "gear-images/photo-001-123.png" },
      { name: "gear-images/camp-001-456.jpg" },
    ],
  ]),
};

vi.mock("@google-cloud/storage", () => ({
  Storage: class {
    bucket() {
      return mockBucketMethods;
    }
  },
}));

vi.mock("@/config/env", () => ({
  getEnv: vi.fn().mockReturnValue({
    GCS_BUCKET_NAME: "test-bucket",
    GCS_PROJECT_ID: "test-project",
    GOOGLE_APPLICATION_CREDENTIALS: ".gcp/creds.json",
    NANO_BANANA_API_KEY: "test-key",
  }),
}));

import {
  uploadImage,
  uploadImageFromBase64,
  deleteImage,
  fileExists,
  listGearImages,
  extractFilenameFromUrl,
  getPublicUrl,
} from "./storageService";

describe("storageService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("uploadImage", () => {
    it("should upload and return public URL", async () => {
      const url = await uploadImage(Buffer.from("base64data"), "test-id", "image/png");
      expect(url).toContain("storage.googleapis.com");
      expect(url).toContain("test-bucket");
    });

    it("should handle content type without extension", async () => {
      const url = await uploadImage(Buffer.from("data"), "test-id", "no-slash-content-type");
      expect(url).toBeTruthy();
    });
  });

  describe("uploadImageFromBase64", () => {
    it("should strip data URI prefix and upload", async () => {
      const base64 = "data:image/png;base64,iVBORw0KGgo=";
      const url = await uploadImageFromBase64(base64, "test-id", "image/png");
      expect(url).toBeTruthy();
    });

    it("should handle raw base64 without prefix", async () => {
      const url = await uploadImageFromBase64("iVBORw0KGgo=", "test-id", "image/png");
      expect(url).toBeTruthy();
    });
  });

  describe("deleteImage", () => {
    it("should delete image by filename", async () => {
      await expect(deleteImage("gear-images/test-123.png")).resolves.toBeUndefined();
    });
  });

  describe("fileExists", () => {
    it("should return true when file exists", async () => {
      const exists = await fileExists("gear-images/test.png");
      expect(exists).toBe(true);
    });
  });

  describe("listGearImages", () => {
    it("should return list of image filenames", async () => {
      const images = await listGearImages();
      expect(images).toHaveLength(2);
      expect(images[0]).toContain("gear-images/");
    });
  });

  describe("extractFilenameFromUrl", () => {
    it("should extract filename from GCS URL", () => {
      const url = "https://storage.googleapis.com/test-bucket/gear-images/photo-001.png";
      const filename = extractFilenameFromUrl(url);
      expect(filename).toBe("gear-images/photo-001.png");
    });

    it("should return null for non-GCS URL", () => {
      const filename = extractFilenameFromUrl("https://example.com/image.png");
      expect(filename).toBeNull();
    });
  });

  describe("getPublicUrl", () => {
    it("should construct public URL", () => {
      const url = getPublicUrl("gear-images/photo-001.png");
      expect(url).toContain("storage.googleapis.com");
      expect(url).toContain("test-bucket");
      expect(url).toContain("gear-images/photo-001.png");
    });
  });

  describe("deleteImage error handling", () => {
    it("should throw when delete fails", async () => {
      mockFileMethods.delete.mockRejectedValueOnce(new Error("Not found"));
      await expect(deleteImage("gear-images/missing.png")).rejects.toThrow("Could not delete image");
    });
  });

  describe("fileExists error handling", () => {
    it("should return false when exists check throws", async () => {
      mockFileMethods.exists.mockRejectedValueOnce(new Error("Permission denied"));
      const exists = await fileExists("gear-images/blocked.png");
      expect(exists).toBe(false);
    });
  });

  describe("listGearImages error handling", () => {
    it("should return empty array when getFiles throws", async () => {
      mockBucketMethods.getFiles.mockRejectedValueOnce(new Error("Access denied"));
      const images = await listGearImages();
      expect(images).toEqual([]);
    });
  });
});
