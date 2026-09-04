import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DateSelection } from "./DateSelection";

vi.mock("@/components/ui/calendar", () => ({
  Calendar: ({ onSelect }: any) => (
    <div data-testid="calendar">
      <button
        data-testid="select-range"
        onClick={() =>
          onSelect({
            from: new Date("2024-06-20"),
            to: new Date("2024-06-22"),
          })
        }
      >
        Select Range
      </button>
      <button
        data-testid="select-single"
        onClick={() =>
          onSelect({
            from: new Date("2024-06-20"),
            to: undefined,
          })
        }
      >
        Select Single
      </button>
    </div>
  ),
}));

// Button mock that ignores the disabled attribute, so handleContinue can be
// invoked with an incomplete range (the real UI guards via disabled).
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick }: any) => (
    <button data-testid="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/lib/date-utils", () => ({
  getMinSelectableDate: vi.fn(() => new Date("2024-06-15")),
  formatDate: vi.fn(() => "20 de junio, 2024"),
  calculateRentalDays: vi.fn(() => 1),
}));

vi.mock("@/lib/validation", () => ({
  validateRentalDates: vi.fn(() => ({ success: true, data: {} })),
}));

describe("DateSelection guard branches", () => {
  const props = {
    initialDates: null,
    onSelect: vi.fn(),
    onBack: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show error when continue is clicked without selecting any dates", async () => {
    const user = userEvent.setup();
    render(<DateSelection {...props} />);

    await user.click(screen.getByText("Continuar al Resumen"));

    expect(screen.getByText("Por favor selecciona un rango de fechas")).toBeInTheDocument();
    expect(props.onSelect).not.toHaveBeenCalled();
  });

  it("should show error when continue is clicked with only a start date", async () => {
    const user = userEvent.setup();
    render(<DateSelection {...props} />);

    await user.click(screen.getByTestId("select-single"));
    await user.click(screen.getByText("Continuar al Resumen"));

    expect(screen.getByText("Por favor selecciona un rango de fechas")).toBeInTheDocument();
    expect(props.onSelect).not.toHaveBeenCalled();
  });

  it("should show singular day label for a one-day rental", async () => {
    const user = userEvent.setup();
    render(<DateSelection {...props} />);

    await user.click(screen.getByTestId("select-range"));

    expect(screen.getByText(/1 día/)).toBeInTheDocument();
  });
});
