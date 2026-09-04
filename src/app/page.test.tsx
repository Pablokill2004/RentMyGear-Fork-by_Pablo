import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/services/inventoryService", () => ({
  getRandomGear: vi.fn().mockResolvedValue([]),
}));

import Home from "./page";

describe("Home Page", () => {
  it("should render hero section", async () => {
    render(await Home());
    expect(screen.getByText("Renta Equipo Premium")).toBeInTheDocument();
  });

  it("should render subtitle", async () => {
    render(await Home());
    expect(
      screen.getByText(/Encuentra el equipo profesional/)
    ).toBeInTheDocument();
  });

  it("should render category buttons", async () => {
    render(await Home());
    expect(screen.getByText("Fotografía y Video")).toBeInTheDocument();
    expect(screen.getByText("Montaña y Camping")).toBeInTheDocument();
    expect(screen.getByText("Deportes Acuáticos")).toBeInTheDocument();
  });

  it("should display pricing information in the initial (non-async) render", async () => {
    render(await Home());
    // Pricing must be visible statically, not gated behind the async carousel
    expect(screen.getByText(/\$100 MXN/)).toBeInTheDocument();
    expect(screen.getByText(/por día/i)).toBeInTheDocument();
  });

  it("should mention insurance (seguro) in the UI", async () => {
    render(await Home());
    expect(screen.getByText(/Seguro de Daños/i)).toBeInTheDocument();
    expect(screen.getByText(/Insurance/i)).toBeInTheDocument();
  });
});
