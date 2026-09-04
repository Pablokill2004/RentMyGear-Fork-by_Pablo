import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { GearImage } from "./GearImage";

describe("GearImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("should render image when initialImageURL is provided", () => {
    render(
      <GearImage
        gearId="gear-001"
        gearName="Camera"
        initialImageURL="https://example.com/image.jpg"
      />
    );
    expect(screen.getByRole("img")).toHaveAttribute("src", "https://example.com/image.jpg");
  });

  it("should fetch image when initialImageURL is null", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ imageURL: "https://gcs.example.com/generated.png" }),
    } as Response);

    render(
      <GearImage
        gearId="gear-001"
        gearName="Camera"
        initialImageURL={null}
      />
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gearId: "gear-001" }),
      });
    });

    await waitFor(() => {
      expect(screen.getByRole("img")).toHaveAttribute(
        "src",
        "https://gcs.example.com/generated.png"
      );
    });
  });

  it("should show error when fetch returns non-ok response", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Generation failed" }),
    } as Response);

    render(
      <GearImage
        gearId="gear-001"
        gearName="Camera"
        initialImageURL={null}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/No se pudo generar la imagen/)).toBeInTheDocument();
    });
  });

  it("should handle network error gracefully", async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error("Network error"));

    render(
      <GearImage
        gearId="gear-001"
        gearName="Camera"
        initialImageURL={null}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/No se pudo generar la imagen/)).toBeInTheDocument();
    });
  });

  it("should handle non-Error throw from fetch", async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce("string error");

    render(
      <GearImage
        gearId="gear-001"
        gearName="Camera"
        initialImageURL={null}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Error al cargar|Error generating image/)).toBeInTheDocument();
    });
  });

  it("should show generic message when error response has no error field", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response);

    render(
      <GearImage
        gearId="gear-001"
        gearName="Camera"
        initialImageURL={null}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Failed to generate image")).toBeInTheDocument();
    });
  });

  it("should show fallback when imageURL is null and not generating", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Failed" }),
    } as Response);

    render(
      <GearImage
        gearId="gear-001"
        gearName="Camera"
        initialImageURL={null}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/No se pudo generar la imagen/)).toBeInTheDocument();
    });
  });
});
