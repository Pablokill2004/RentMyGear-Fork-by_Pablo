import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GearGrid, GearGridSkeleton } from "./GearGrid";
import { GearItem } from "@/lib/validation";

const items: GearItem[] = [
  {
    id: "photo-001",
    name: "Canon EOS R5",
    category: "fotografia-video",
    description: "Professional mirrorless camera",
    specs: { sensor: "45MP" },
    dailyRate: 500,
    imageURL: "https://example.com/camera.jpg",
  },
  {
    id: "camp-001",
    name: "North Face Tent",
    category: "montana-camping",
    description: "4-person expedition tent",
    specs: { capacity: "4 persons" },
    dailyRate: 200,
    imageURL: null,
  },
];

describe("GearGrid", () => {
  it("should render all items", () => {
    render(<GearGrid items={items} />);
    expect(screen.getByText("Canon EOS R5")).toBeInTheDocument();
    expect(screen.getByText("North Face Tent")).toBeInTheDocument();
  });

  it("should display prices", () => {
    render(<GearGrid items={items} />);
    expect(screen.getByText(/\$500/)).toBeInTheDocument();
    expect(screen.getByText(/\$200/)).toBeInTheDocument();
  });

  it("should filter items by search query (name)", async () => {
    const user = userEvent.setup();
    render(<GearGrid items={items} showSearch />);

    const input = screen.getByPlaceholderText(/buscar/i);
    await user.type(input, "Canon");

    expect(screen.getByText("Canon EOS R5")).toBeInTheDocument();
    expect(screen.queryByText("North Face Tent")).not.toBeInTheDocument();
  });

  it("should filter items by search query (description)", async () => {
    const user = userEvent.setup();
    render(<GearGrid items={items} showSearch />);

    const input = screen.getByPlaceholderText(/buscar/i);
    await user.type(input, "tent");

    expect(screen.getByText("North Face Tent")).toBeInTheDocument();
    expect(screen.queryByText("Canon EOS R5")).not.toBeInTheDocument();
  });

  it("should show empty state when no matches", async () => {
    const user = userEvent.setup();
    render(<GearGrid items={items} showSearch />);

    const input = screen.getByPlaceholderText(/buscar/i);
    await user.type(input, "xyznonexistent");

    expect(screen.getByText(/No se encontró/)).toBeInTheDocument();
  });

  it("should hide search when showSearch is false", () => {
    render(<GearGrid items={items} showSearch={false} />);
    expect(screen.queryByPlaceholderText(/buscar/i)).not.toBeInTheDocument();
  });

  it("should show category badge when showCategory is true", () => {
    render(<GearGrid items={items} showCategory />);
    expect(screen.getByText("Fotografía y Video")).toBeInTheDocument();
  });

  it("should hide category badge when showCategory is false", () => {
    render(<GearGrid items={items} showCategory={false} />);
    expect(screen.queryByText("Fotografía y Video")).not.toBeInTheDocument();
  });

  it("should show image when imageURL is provided", () => {
    render(<GearGrid items={items} />);
    const img = screen.getAllByRole("img").find((el) => el.getAttribute("alt")?.includes("Canon"));
    expect(img).toBeTruthy();
  });

  it("should handle image error and show fallback", () => {
    render(<GearGrid items={items} />);
    const images = screen.getAllByRole("img");
    const cameraImg = images.find((img) => img.getAttribute("alt")?.includes("Canon"));
    if (cameraImg) {
      fireEvent.error(cameraImg);
    }
    // Both the errored image and the item with null imageURL show the fallback
    expect(screen.getAllByText(/Imagen no disponible/)).toHaveLength(2);
  });

  it("should reveal image when it finishes loading", () => {
    render(<GearGrid items={[items[0]]} />);
    const img = screen.getByRole("img");
    expect(img).toHaveClass("opacity-0");
    fireEvent.load(img);
    expect(img).toHaveClass("opacity-100");
  });
});

describe("GearGridSkeleton", () => {
  it("should render skeleton cards", () => {
    render(<GearGridSkeleton count={3} />);
    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
