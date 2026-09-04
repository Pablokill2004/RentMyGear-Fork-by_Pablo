import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PriceSummary } from "./PriceSummary";
import { GearItem } from "@/lib/validation";
import { calculatePriceWithInsurance } from "@/lib/insurance";
import type { RentalDates } from "./index";

vi.mock("@/lib/date-utils", () => ({
  formatDate: vi.fn((d: Date) => `15 de enero, 2024`),
  formatPrice: vi.fn((n: number) => `$${n}`),
  calculateRentalPrice: vi.fn(() => ({
    days: 3,
    dailyRate: 500,
    subtotal: 1500,
    total: 1500,
  })),
}));

vi.mock("@/lib/insurance", () => ({
  calculatePriceWithInsurance: vi.fn((_, __, ___, selected) => ({
    days: 3,
    dailyRate: 500,
    subtotal: 1500,
    insuranceRate: 0.2,
    insuranceFee: selected ? 300 : 0,
    total: selected ? 1800 : 1500,
  })),
  getInsuranceRate: vi.fn(() => 0.2),
}));

const item: GearItem = {
  id: "photo-001",
  name: "Canon EOS R5",
  category: "fotografia-video",
  description: "Professional mirrorless camera",
  specs: {},
  dailyRate: 500,
  imageURL: "https://example.com/camera.jpg",
};

const dates: RentalDates = {
  startDate: new Date("2024-01-15"),
  endDate: new Date("2024-01-17"),
};

describe("PriceSummary", () => {
  const defaultProps = {
    item,
    dates,
    insuranceSelected: false,
    onInsuranceChange: vi.fn(),
    onConfirm: vi.fn().mockResolvedValue(undefined),
    onBack: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render subtotal and no insurance fee when insurance is off", () => {
    render(<PriceSummary {...defaultProps} />);
    expect(screen.getByText("Resumen de Renta")).toBeInTheDocument();
    expect(screen.getByText("Canon EOS R5")).toBeInTheDocument();
    expect(screen.getAllByText(/\$1500/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Protección de Daños \(/)).not.toBeInTheDocument();
  });

  it("should toggle insurance on and show insurance fee line", async () => {
    const user = userEvent.setup();
    render(<PriceSummary {...defaultProps} />);

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(defaultProps.onInsuranceChange).toHaveBeenCalledWith(true);
  });

  it("should toggle insurance off when already selected", async () => {
    const user = userEvent.setup();
    render(<PriceSummary {...defaultProps} insuranceSelected={true} />);

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(defaultProps.onInsuranceChange).toHaveBeenCalledWith(false);
  });

  it("should show insurance percentage text when selected", () => {
    render(<PriceSummary {...defaultProps} insuranceSelected={true} />);
    expect(screen.getByText("20% de la tarifa diaria")).toBeInTheDocument();
    expect(screen.getByText(/\$300/)).toBeInTheDocument();
    expect(screen.getByText(/\$1800/)).toBeInTheDocument();
  });

  it("should call onBack when back button is clicked", async () => {
    const user = userEvent.setup();
    render(<PriceSummary {...defaultProps} />);

    const backButton = screen.getAllByRole("button")[0];
    await user.click(backButton);

    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it("should call onConfirm when confirm button is clicked", async () => {
    const user = userEvent.setup();
    render(<PriceSummary {...defaultProps} />);

    const confirmButton = screen.getByRole("button", { name: /confirmar renta/i });
    await user.click(confirmButton);

    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it("should show loading state while confirming", async () => {
    let resolveConfirm: () => void;
    const confirmPromise = new Promise<void>((resolve) => {
      resolveConfirm = resolve;
    });
    const onConfirm = vi.fn().mockReturnValue(confirmPromise);

    const user = userEvent.setup();
    render(<PriceSummary {...defaultProps} onConfirm={onConfirm} />);

    const confirmButton = screen.getByRole("button", { name: /confirmar renta/i });
    await user.click(confirmButton);

    expect(screen.getByText("Procesando...")).toBeInTheDocument();
    expect(confirmButton).toBeDisabled();

    resolveConfirm!();
  });

  it("should display dates and duration", () => {
    render(<PriceSummary {...defaultProps} />);
    expect(screen.getByText("Fecha inicio")).toBeInTheDocument();
    expect(screen.getByText("Fecha fin")).toBeInTheDocument();
    expect(screen.getByText("Duración")).toBeInTheDocument();
  });

  it("should show singular day label for a one-day rental", () => {
    vi.mocked(calculatePriceWithInsurance).mockReturnValueOnce({
      days: 1,
      dailyRate: 500,
      subtotal: 500,
      insuranceRate: 0,
      insuranceFee: 0,
      total: 500,
    });
    render(<PriceSummary {...defaultProps} />);
    expect(screen.getByText("1 día")).toBeInTheDocument();
  });
});
