import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CategoryErrorPage from "./error";

describe("Category Error Page", () => {
  it("should render error message", () => {
    const error = new Error("Failed to load category");
    render(<CategoryErrorPage error={error} reset={() => {}} />);
    expect(screen.getByText("Error al cargar la categoría")).toBeInTheDocument();
  });

  it("should not render error digest", () => {
    const error = new Error("Failed");
    (error as any).digest = "CAT-ERR-001";
    render(<CategoryErrorPage error={error} reset={() => {}} />);
    expect(screen.queryByText("CAT-ERR-001")).not.toBeInTheDocument();
  });

  it("should call reset on button click", () => {
    const reset = vi.fn();
    render(<CategoryErrorPage error={new Error("test")} reset={reset} />);
    screen.getByRole("button", { name: /intentar de nuevo/i }).click();
    expect(reset).toHaveBeenCalled();
  });

  it("should have link to home", () => {
    render(<CategoryErrorPage error={new Error("test")} reset={() => {}} />);
    expect(screen.getByRole("link", { name: /volver al inicio/i })).toHaveAttribute("href", "/");
  });
});
