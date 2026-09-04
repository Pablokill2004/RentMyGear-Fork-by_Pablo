import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategoryButtons } from "./CategoryButtons";

describe("CategoryButtons", () => {
  it("should render 3 category buttons", () => {
    render(<CategoryButtons />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
  });

  it("should have correct hrefs for each category", () => {
    render(<CategoryButtons />);
    expect(screen.getByText("Fotografía y Video").closest("a")).toHaveAttribute(
      "href",
      "/category/fotografia-video"
    );
    expect(screen.getByText("Montaña y Camping").closest("a")).toHaveAttribute(
      "href",
      "/category/montana-camping"
    );
    expect(screen.getByText("Deportes Acuáticos").closest("a")).toHaveAttribute(
      "href",
      "/category/deportes-acuaticos"
    );
  });

  it("should display category descriptions", () => {
    render(<CategoryButtons />);
    expect(screen.getByText(/Cámaras, lentes/)).toBeInTheDocument();
    expect(screen.getByText(/Tiendas, mochilas/)).toBeInTheDocument();
    expect(screen.getByText(/Kayaks, SUP/)).toBeInTheDocument();
  });
});
