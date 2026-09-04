import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/services/inventoryService", () => ({
  getGearByCategory: vi.fn().mockResolvedValue([
    {
      id: "photo-001",
      name: "Canon EOS R5",
      category: "fotografia-video",
      description: "Professional camera",
      specs: { sensor: "45MP" },
      dailyRate: 500,
      imageURL: "https://example.com/camera.jpg",
    },
  ]),
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

import CategoryPage from "./page";

describe("Category Page", () => {
  it("should render category name and description", async () => {
    const tree = await CategoryPage({
      params: Promise.resolve({ id: "fotografia-video" }),
    });
    render(tree);
    expect(screen.getByText("Fotografía y Video")).toBeInTheDocument();
    expect(screen.getByText(/Cámaras, lentes/)).toBeInTheDocument();
  });

  it("should render Suspense skeleton for gear items", async () => {
    const tree = await CategoryPage({
      params: Promise.resolve({ id: "fotografia-video" }),
    });
    render(tree);
    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should call generateMetadata for valid category", async () => {
    const { generateMetadata } = await import("./page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "fotografia-video" }),
    });
    expect(metadata.title).toContain("Fotografía y Video");
  });

  it("should call generateMetadata for invalid category", async () => {
    const { generateMetadata } = await import("./page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "invalid" }),
    });
    expect(metadata.title).toBe("Categoría no encontrada");
  });

  it("should call notFound for invalid category", async () => {
    const { notFound } = await import("next/navigation");
    await expect(
      CategoryPage({ params: Promise.resolve({ id: "invalid" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalled();
  });
});
