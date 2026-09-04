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
});
