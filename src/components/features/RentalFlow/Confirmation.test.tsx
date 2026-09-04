import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Confirmation } from "./Confirmation";
import { GearItem } from "@/lib/validation";
import type { RentalDates } from "./index";

vi.mock("@/lib/date-utils", () => ({
  formatDate: vi.fn((d: Date) => "15 de enero, 2024"),
  formatDateRange: vi.fn(() => "15 ene - 17 ene 2024"),
  formatPrice: vi.fn((n: number) => `$${n}`),
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
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
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

describe("Confirmation", () => {
  const defaultProps = {
    item,
    dates,
    insuranceSelected: false,
    confirmationId: "RENTAL-123-ABC",
    onReset: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render confirmation number", () => {
    render(<Confirmation {...defaultProps} />);
    expect(screen.getByText("¡Renta Confirmada!")).toBeInTheDocument();
    expect(screen.getByText("RENTAL-123-ABC")).toBeInTheDocument();
    expect(screen.getByText("Número de confirmación")).toBeInTheDocument();
  });

  it("should show insurance line when insuranceSelected is true", () => {
    render(<Confirmation {...defaultProps} insuranceSelected={true} />);
    expect(screen.getByText("Protección de Daños incluida")).toBeInTheDocument();
    expect(screen.getByText(/\$300/)).toBeInTheDocument();
  });

  it("should not show insurance line when insuranceSelected is false", () => {
    render(<Confirmation {...defaultProps} insuranceSelected={false} />);
    expect(screen.queryByText("Protección de Daños incluida")).not.toBeInTheDocument();
  });

  it("should call onReset when reset button is clicked", async () => {
    const user = userEvent.setup();
    render(<Confirmation {...defaultProps} />);

    await user.click(screen.getByText("Rentar Otro Equipo"));
    expect(defaultProps.onReset).toHaveBeenCalled();
  });

  it("should link to home page", () => {
    render(<Confirmation {...defaultProps} />);
    const homeLink = screen.getByRole("link", { name: /volver al inicio/i });
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("should show rental details", () => {
    render(<Confirmation {...defaultProps} />);
    expect(screen.getByText("Canon EOS R5")).toBeInTheDocument();
  });

  it("should show next steps section", () => {
    render(<Confirmation {...defaultProps} />);
    expect(screen.getByText("Próximos pasos")).toBeInTheDocument();
    expect(screen.getByText(/Recibirás un correo/)).toBeInTheDocument();
  });
});
