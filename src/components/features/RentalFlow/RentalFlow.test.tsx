import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RentalFlow } from "./index";
import { GearItem } from "@/lib/validation";

const futureStart = new Date();
futureStart.setDate(futureStart.getDate() + 5);
const futureEnd = new Date();
futureEnd.setDate(futureEnd.getDate() + 7);

vi.mock("@/components/ui/calendar", () => ({
  Calendar: ({ onSelect }: any) => {
    const start = new Date();
    start.setDate(start.getDate() + 5);
    const end = new Date();
    end.setDate(end.getDate() + 7);
    return (
      <div data-testid="calendar">
        <button
          data-testid="mock-select-dates"
          onClick={() => onSelect({ from: start, to: end })}
        >
          Mock Select Dates
        </button>
      </div>
    );
  },
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

const photographyGear: GearItem = {
  id: "photo-001",
  name: "Canon EOS R5",
  category: "fotografia-video",
  description: "Professional mirrorless camera",
  specs: { sensor: "45MP", video: "8K" },
  dailyRate: 500,
  imageURL: "https://example.com/camera.jpg",
};

async function navigateToReviewing(user: ReturnType<typeof userEvent.setup>) {
  render(<RentalFlow item={photographyGear} />);
  await user.click(screen.getByText("Seleccionar Fechas"));
  await user.click(screen.getByTestId("mock-select-dates"));
  await user.click(screen.getByRole("button", { name: /continuar/i }));
  await waitFor(() => {
    expect(screen.getByText("Resumen de Renta")).toBeInTheDocument();
  });
}

describe("RentalFlow Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  describe("Initial State", () => {
    it("should render selecting step initially", () => {
      render(<RentalFlow item={photographyGear} />);
      expect(screen.getByText("Rentar este equipo")).toBeInTheDocument();
      expect(screen.getByText("Seleccionar Fechas")).toBeInTheDocument();
    });

    it("should transition to configuring step", async () => {
      const user = userEvent.setup();
      render(<RentalFlow item={photographyGear} />);
      await user.click(screen.getByText("Seleccionar Fechas"));
      expect(screen.getByTestId("calendar")).toBeInTheDocument();
    });
  });

  describe("Full Flow with Insurance Toggle", () => {
    it("should navigate to reviewing step and toggle insurance", async () => {
      const user = userEvent.setup();
      await navigateToReviewing(user);

      expect(screen.queryByText(/Protección de Daños \(/)).not.toBeInTheDocument();
      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);
      expect(screen.getByText(/Protección de Daños \(/)).toBeInTheDocument();
    });

    it("should send insuranceSelected=true in POST body", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "rental-123", status: "confirmed" }),
      });

      await navigateToReviewing(user);

      await user.click(screen.getByRole("checkbox"));
      await user.click(screen.getByRole("button", { name: /confirmar renta/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/rental",
          expect.objectContaining({
            method: "POST",
            body: expect.stringContaining('"insuranceSelected":true'),
          })
        );
      });
    });

    it("should send insuranceSelected=false when insurance not toggled", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "rental-456", status: "confirmed" }),
      });

      await navigateToReviewing(user);

      await user.click(screen.getByRole("button", { name: /confirmar renta/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/rental",
          expect.objectContaining({
            body: expect.stringContaining('"insuranceSelected":false'),
          })
        );
      });
    });
  });

  describe("Confirmation and Reset", () => {
    it("should show confirmation step after successful API call", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "rental-789", status: "confirmed" }),
      });

      await navigateToReviewing(user);
      await user.click(screen.getByRole("button", { name: /confirmar renta/i }));

      await waitFor(() => {
        expect(screen.getByText("¡Renta Confirmada!")).toBeInTheDocument();
      });
    });

    it("should reset to selecting step when reset is clicked", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "rental-reset", status: "confirmed" }),
      });

      await navigateToReviewing(user);
      await user.click(screen.getByRole("button", { name: /confirmar renta/i }));

      await waitFor(() => {
        expect(screen.getByText("¡Renta Confirmada!")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Rentar Otro Equipo"));

      await waitFor(() => {
        expect(screen.getByText("Rentar este equipo")).toBeInTheDocument();
      });
    });

    it("should clear insurance state on reset", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "rental-clear", status: "confirmed" }),
      });

      await navigateToReviewing(user);
      await user.click(screen.getByRole("checkbox"));

      expect(screen.getByText(/Protección de Daños \(/)).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /confirmar renta/i }));

      await waitFor(() => {
        expect(screen.getByText("¡Renta Confirmada!")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Rentar Otro Equipo"));

      await waitFor(() => {
        expect(screen.getByText("Rentar este equipo")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Seleccionar Fechas"));
      await user.click(screen.getByTestId("mock-select-dates"));
      await user.click(screen.getByRole("button", { name: /continuar/i }));

      await waitFor(() => {
        expect(screen.getByText("Resumen de Renta")).toBeInTheDocument();
      });

      expect(screen.queryByText(/Protección de Daños \(/)).not.toBeInTheDocument();
    });
  });

  describe("Back Navigation", () => {
    it("should navigate back from reviewing to configuring step", async () => {
      const user = userEvent.setup();
      await navigateToReviewing(user);

      const backButton = screen.getAllByRole("button")[0];
      await user.click(backButton);

      expect(screen.getByTestId("calendar")).toBeInTheDocument();
    });

    it("should navigate back from configuring to selecting step", async () => {
      const user = userEvent.setup();
      render(<RentalFlow item={photographyGear} />);

      await user.click(screen.getByText("Seleccionar Fechas"));
      expect(screen.getByTestId("calendar")).toBeInTheDocument();

      const backButton = screen.getAllByRole("button")[0];
      await user.click(backButton);

      expect(screen.getByText("Rentar este equipo")).toBeInTheDocument();
    });
  });

  describe("API Error Handling", () => {
    it("should handle API error gracefully", async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

      await navigateToReviewing(user);

      await user.click(screen.getByRole("button", { name: /confirmar renta/i }));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });
});
