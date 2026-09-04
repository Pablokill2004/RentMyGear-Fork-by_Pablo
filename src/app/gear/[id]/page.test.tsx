import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/services/inventoryService", () => ({
  getGearById: vi.fn().mockResolvedValue({
    id: "photo-001",
    name: "Canon EOS R5",
    category: "fotografia-video",
    description: "Professional mirrorless camera",
    specs: { sensor: "45MP", video: "8K" },
    dailyRate: 500,
    imageURL: "https://example.com/camera.jpg",
  }),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

import GearPage, { GearDetails } from "./page";
import { getGearById } from "@/services/inventoryService";

describe("Gear Page", () => {
  it("should render back link", async () => {
    const tree = await GearPage({
      params: Promise.resolve({ id: "photo-001" }),
    });
    render(tree);
    expect(screen.getByRole("link", { name: /volver al catálogo/i })).toHaveAttribute("href", "/");
  });

  it("should render Suspense fallback skeleton", async () => {
    const tree = await GearPage({
      params: Promise.resolve({ id: "photo-001" }),
    });
    render(tree);
    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should generate metadata for existing gear", async () => {
    const { generateMetadata } = await import("./page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "photo-001" }),
    });
    expect(metadata.title).toContain("Canon EOS R5");
  });

  it("should generate metadata for non-existent gear", async () => {
    vi.mocked(getGearById).mockResolvedValueOnce(null);
    const { generateMetadata } = await import("./page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "nonexistent" }),
    });
    expect(metadata.title).toBe("Equipo no encontrado");
  });

  it("should call notFound when gear does not exist", async () => {
    vi.mocked(getGearById).mockResolvedValueOnce(null);
    const { notFound } = await import("next/navigation");
    await expect(GearDetails({ id: "missing" })).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalled();
  });
});
