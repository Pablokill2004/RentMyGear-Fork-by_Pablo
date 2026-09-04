import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorPage from "./error";

describe("Error Page", () => {
  it("should render error message", () => {
    const error = new Error("Something went wrong");
    render(<ErrorPage error={error} reset={() => {}} />);
    expect(screen.getByText(/Algo salió mal/)).toBeInTheDocument();
  });

  it("should render error digest when provided", () => {
    const error = new Error("Server error");
    (error as any).digest = "ABC123";
    render(<ErrorPage error={error} reset={() => {}} />);
    expect(screen.getByText(/ABC123/)).toBeInTheDocument();
  });

  it("should not render digest when not provided", () => {
    const error = new Error("Client error");
    render(<ErrorPage error={error} reset={() => {}} />);
    expect(screen.queryByText(/Error ID/)).not.toBeInTheDocument();
  });

  it("should have a reset button", () => {
    const reset = vi.fn();
    render(<ErrorPage error={new Error("test")} reset={reset} />);
    const button = screen.getByRole("button", { name: /intentar de nuevo/i });
    button.click();
    expect(reset).toHaveBeenCalled();
  });

  it("should have a link to home", () => {
    render(<ErrorPage error={new Error("test")} reset={() => {}} />);
    const link = screen.getByRole("link", { name: /ir al inicio/i });
    expect(link).toHaveAttribute("href", "/");
  });
});
