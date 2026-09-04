import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DateSelection } from "./DateSelection";
import type { RentalDates } from "./index";

vi.mock("@/components/ui/calendar", () => ({
  Calendar: ({ onSelect, ...props }: any) => (
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
      <button
        data-testid="select-invalid"
        onClick={() =>
          onSelect({
            from: new Date("2024-06-25"),
            to: new Date("2024-06-20"),
          })
        }
      >
        Select Invalid Range
      </button>
      <button data-testid="clear-range" onClick={() => onSelect(undefined)}>
        Clear
      </button>
    </div>
  ),
}));

vi.mock("@/lib/date-utils", () => ({
  getMinSelectableDate: vi.fn(() => new Date("2024-06-15")),
  formatDate: vi.fn((d: Date) => "20 de junio, 2024"),
  calculateRentalDays: vi.fn(() => 3),
}));

const mockValidateRentalDates = vi.fn((start: Date, end: Date) => {
  if (start >= end) {
    return {
      success: false,
      error: { issues: [{ message: "La fecha de fin debe ser posterior" }] },
    };
  }
  return { success: true, data: { startDate: start, endDate: end } };
});

vi.mock("@/lib/validation", () => ({
  validateRentalDates: (start: Date, end: Date) =>
    mockValidateRentalDates(start, end),
}));

describe("DateSelection", () => {
  const defaultProps = {
    initialDates: null,
    onSelect: vi.fn(),
    onBack: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockValidateRentalDates.mockImplementation((start: Date, end: Date) => {
      if (start >= end) {
        return {
          success: false,
          error: { issues: [{ message: "La fecha de fin debe ser posterior" }] },
        };
      }
      return { success: true, data: { startDate: start, endDate: end } };
    });
  });

  it("should render with no initial dates", () => {
    render(<DateSelection {...defaultProps} />);
    expect(screen.getByText("Seleccionar Fechas")).toBeInTheDocument();
    expect(screen.getByTestId("calendar")).toBeInTheDocument();
  });

  it("should render with initial dates", () => {
    const initialDates: RentalDates = {
      startDate: new Date("2024-06-20"),
      endDate: new Date("2024-06-22"),
    };
    render(<DateSelection {...defaultProps} initialDates={initialDates} />);
    expect(screen.getByText("Seleccionar Fechas")).toBeInTheDocument();
  });

  it("should disable continue button when no dates are selected", () => {
    render(<DateSelection {...defaultProps} />);

    const continueButton = screen.getByRole("button", { name: /continuar/i });
    expect(continueButton).toBeDisabled();
  });

  it("should enable continue button when a range is selected", async () => {
    const user = userEvent.setup();
    render(<DateSelection {...defaultProps} />);

    await user.click(screen.getByTestId("select-range"));

    const continueButton = screen.getByRole("button", { name: /continuar/i });
    expect(continueButton).not.toBeDisabled();
  });

  it("should call onSelect when continue clicked with valid range", async () => {
    const user = userEvent.setup();
    render(<DateSelection {...defaultProps} />);

    await user.click(screen.getByTestId("select-range"));
    await user.click(screen.getByRole("button", { name: /continuar/i }));

    expect(defaultProps.onSelect).toHaveBeenCalledWith({
      startDate: new Date("2024-06-20"),
      endDate: new Date("2024-06-22"),
    });
  });

  it("should call onBack when back button is clicked", async () => {
    const user = userEvent.setup();
    render(<DateSelection {...defaultProps} />);

    const buttons = screen.getAllByRole("button");
    await user.click(buttons[0]);

    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it("should show date summary when range is selected", async () => {
    const user = userEvent.setup();
    render(<DateSelection {...defaultProps} />);

    await user.click(screen.getByTestId("select-range"));

    expect(screen.getByText("Fecha inicio:")).toBeInTheDocument();
    expect(screen.getByText("Fecha fin:")).toBeInTheDocument();
    expect(screen.getByText("Total días:")).toBeInTheDocument();
  });

  it("should show validation error for invalid date range", async () => {
    const user = userEvent.setup();
    render(<DateSelection {...defaultProps} />);

    await user.click(screen.getByTestId("select-invalid"));
    await user.click(screen.getByRole("button", { name: /continuar/i }));

    expect(screen.getByText("La fecha de fin debe ser posterior")).toBeInTheDocument();
    expect(defaultProps.onSelect).not.toHaveBeenCalled();
  });

  it("should clear error when new range is selected", async () => {
    const user = userEvent.setup();
    render(<DateSelection {...defaultProps} />);

    await user.click(screen.getByTestId("select-invalid"));
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    expect(screen.getByText("La fecha de fin debe ser posterior")).toBeInTheDocument();

    await user.click(screen.getByTestId("select-range"));
    expect(screen.queryByText("La fecha de fin debe ser posterior")).not.toBeInTheDocument();
  });

  it("should show single date selection button works", async () => {
    const user = userEvent.setup();
    render(<DateSelection {...defaultProps} />);

    await user.click(screen.getByTestId("select-single"));

    const continueButton = screen.getByRole("button", { name: /continuar/i });
    expect(continueButton).toBeDisabled();
  });
});
