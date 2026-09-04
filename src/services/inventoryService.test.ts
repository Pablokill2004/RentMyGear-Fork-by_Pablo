import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockReadFile, mockWriteFile } = vi.hoisted(() => ({
  mockReadFile: vi.fn(),
  mockWriteFile: vi.fn(),
}));

vi.mock("fs", () => ({
  default: {
    promises: {
      readFile: mockReadFile,
      writeFile: mockWriteFile,
    },
  },
  promises: {
    readFile: mockReadFile,
    writeFile: mockWriteFile,
  },
}));

import { promises as fs } from "fs";
import {
  loadInventory,
  saveInventory,
  getAllGear,
  getGearByCategory,
  getGearById,
  getRandomGear,
  searchGear,
  getGearWithoutImages,
  updateGearImage,
  getCategoryStats,
  clearInventoryCache,
} from "./inventoryService";
import { GearItem } from "@/lib/validation";

const mockItems: GearItem[] = [
  {
    id: "photo-001",
    name: "Canon EOS R5",
    category: "fotografia-video",
    description: "Professional camera",
    specs: { sensor: "45MP" },
    dailyRate: 500,
    imageURL: "https://example.com/camera.jpg",
  },
  {
    id: "camp-001",
    name: "North Face Tent",
    category: "montana-camping",
    description: "4-person tent",
    specs: { capacity: "4" },
    dailyRate: 200,
    imageURL: null,
  },
  {
    id: "water-001",
    name: "Kayak Pro",
    category: "deportes-acuaticos",
    description: "Sea kayak",
    specs: { length: "4.5m" },
    dailyRate: 300,
    imageURL: "https://example.com/kayak.jpg",
  },
];

describe("inventoryService", () => {
  beforeEach(() => {
    clearInventoryCache();
    vi.clearAllMocks();
    mockReadFile.mockResolvedValue(JSON.stringify(mockItems));
    mockWriteFile.mockResolvedValue(undefined);
  });

  describe("loadInventory", () => {
    it("should load and validate items from JSON", async () => {
      const items = await loadInventory();
      expect(items).toHaveLength(3);
      expect(items[0].id).toBe("photo-001");
    });

    it("should cache results on subsequent calls", async () => {
      await loadInventory();
      await loadInventory();
      expect(mockReadFile).toHaveBeenCalledTimes(1);
    });

    it("should throw on file read error", async () => {
      clearInventoryCache();
      mockReadFile.mockRejectedValue(new Error("File not found"));
      await expect(loadInventory()).rejects.toThrow("Could not load inventory data");
    });
  });

  describe("saveInventory", () => {
    it("should write items to file", async () => {
      await saveInventory(mockItems);
      expect(mockWriteFile).toHaveBeenCalledTimes(1);
      const written = JSON.parse(mockWriteFile.mock.calls[0][1] as string);
      expect(written).toHaveLength(3);
    });

    it("should throw on write error", async () => {
      mockWriteFile.mockRejectedValue(new Error("Permission denied"));
      await expect(saveInventory(mockItems)).rejects.toThrow("Could not save inventory data");
    });
  });

  describe("getAllGear", () => {
    it("should return all items", async () => {
      const items = await getAllGear();
      expect(items).toHaveLength(3);
    });
  });

  describe("getGearByCategory", () => {
    it("should return items for fotografia-video", async () => {
      const items = await getGearByCategory("fotografia-video");
      expect(items).toHaveLength(1);
      expect(items[0].id).toBe("photo-001");
    });

    it("should return items for montana-camping", async () => {
      const items = await getGearByCategory("montana-camping");
      expect(items).toHaveLength(1);
    });

    it("should throw for invalid category", async () => {
      await expect(getGearByCategory("invalid")).rejects.toThrow("Invalid category");
    });
  });

  describe("getGearById", () => {
    it("should return item by id", async () => {
      const item = await getGearById("photo-001");
      expect(item).not.toBeNull();
      expect(item!.id).toBe("photo-001");
    });

    it("should return null for non-existent id", async () => {
      const item = await getGearById("non-existent");
      expect(item).toBeNull();
    });
  });

  describe("getRandomGear", () => {
    it("should return requested count of items", async () => {
      const items = await getRandomGear(2);
      expect(items).toHaveLength(2);
    });

    it("should return all items when count exceeds inventory", async () => {
      const items = await getRandomGear(10);
      expect(items).toHaveLength(3);
    });

    it("should default to 5 items", async () => {
      clearInventoryCache();
      mockReadFile.mockResolvedValue(JSON.stringify(mockItems));
      const items = await getRandomGear();
      expect(items.length).toBeLessThanOrEqual(5);
    });
  });

  describe("searchGear", () => {
    it("should find items by name", async () => {
      const items = await searchGear("Canon");
      expect(items).toHaveLength(1);
      expect(items[0].id).toBe("photo-001");
    });

    it("should find items by description", async () => {
      const items = await searchGear("tent");
      expect(items).toHaveLength(1);
      expect(items[0].id).toBe("camp-001");
    });

    it("should return all items for empty query", async () => {
      const items = await searchGear("");
      expect(items).toHaveLength(3);
    });

    it("should return empty array for no matches", async () => {
      const items = await searchGear("xyznonexistent");
      expect(items).toHaveLength(0);
    });

    it("should be case-insensitive", async () => {
      const items = await searchGear("CANON");
      expect(items).toHaveLength(1);
    });
  });

  describe("getGearWithoutImages", () => {
    it("should return items with null imageURL", async () => {
      const items = await getGearWithoutImages();
      expect(items).toHaveLength(1);
      expect(items[0].id).toBe("camp-001");
    });
  });

  describe("updateGearImage", () => {
    it("should update imageURL for existing item", async () => {
      const updated = await updateGearImage("camp-001", "https://example.com/new.jpg");
      expect(updated).not.toBeNull();
      expect(updated!.imageURL).toBe("https://example.com/new.jpg");
      expect(mockWriteFile).toHaveBeenCalled();
    });

    it("should return null for non-existent item", async () => {
      const result = await updateGearImage("non-existent", "https://example.com/img.jpg");
      expect(result).toBeNull();
    });
  });

  describe("getCategoryStats", () => {
    it("should return stats for all categories", async () => {
      const stats = await getCategoryStats();
      expect(stats["fotografia-video"].count).toBe(1);
      expect(stats["fotografia-video"].withImages).toBe(1);
      expect(stats["fotografia-video"].withoutImages).toBe(0);
      expect(stats["montana-camping"].count).toBe(1);
      expect(stats["montana-camping"].withImages).toBe(0);
      expect(stats["montana-camping"].withoutImages).toBe(1);
      expect(stats["deportes-acuaticos"].count).toBe(1);
      expect(stats["deportes-acuaticos"].withImages).toBe(1);
    });
  });
});
