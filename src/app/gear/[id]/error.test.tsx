import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import GearErrorPage from "./error";

describe("Gear Error Page", () => {
  it("should render error message", () => {
    const error = new Error("Failed to load gear");
    render(<GearErrorPage error={error} reset={() => {}} />);
    expect(screen.getByText("Error al cargar el equipo")).toBeInTheDocument();
  });

  it("should not render error digest", () => {
    const error = new Error("Failed");
    (error as any).digest = "GEAR-ERR-001";
    render(<GearErrorPage error={error} reset={() => {}} />);
    expect(screen.queryByText("GEAR-ERR-001")).not.toBeInTheDocument();
  });

  it("should call reset on button click", () => {
    const reset = vi.fn();
    render(<GearErrorPage error={new Error("test")} reset={reset} />);
    screen.getByRole("button", { name: /intentar de nuevo/i }).click();
    expect(reset).toHaveBeenCalled();
  });

  it("should have link to home", () => {
    render(<GearErrorPage error={new Error("test")} reset={() => {}} />);
    expect(screen.getByRole("link", { name: /volver al inicio/i })).toHaveAttribute("href", "/");
  });
});
