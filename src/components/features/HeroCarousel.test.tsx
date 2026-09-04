import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useEffect } from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { HeroCarousel } from "./HeroCarousel";
import { GearItem } from "@/lib/validation";

let mockApi: {
  selectedScrollSnap: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  scrollTo: ReturnType<typeof vi.fn>;
  scrollNext: ReturnType<typeof vi.fn>;
};

let capturedSetApi: ((api: unknown) => void) | null = null;

beforeEach(() => {
  capturedSetApi = null;
  mockApi = {
    selectedScrollSnap: vi.fn(() => 0),
    on: vi.fn(),
    off: vi.fn(),
    scrollTo: vi.fn(),
    scrollNext: vi.fn(),
  };
});

vi.mock("@/components/ui/carousel", () => ({
  Carousel: ({ children, setApi, ...props }: any) => {
    capturedSetApi = setApi ?? null;
    useEffect(() => {
      setApi?.(mockApi);
    }, [setApi]);
    return (
      <div data-slot="carousel" {...props}>
        {children}
      </div>
    );
  },
  CarouselContent: ({ children }: any) => (
    <div data-slot="carousel-content">{children}</div>
  ),
  CarouselItem: ({ children }: any) => (
    <div data-slot="carousel-item">{children}</div>
  ),
  CarouselPrevious: (props: any) => <button data-slot="carousel-previous" {...props} />,
  CarouselNext: (props: any) => <button data-slot="carousel-next" {...props} />,
}));

const items: GearItem[] = [
  {
    id: "photo-001",
    name: "Canon EOS R5",
    category: "fotografia-video",
    description: "Professional camera",
    specs: {},
    dailyRate: 500,
    imageURL: "https://example.com/camera.jpg",
  },
  {
    id: "camp-001",
    name: "North Face Tent",
    category: "montana-camping",
    description: "4-person tent",
    specs: {},
    dailyRate: 200,
    imageURL: null,
  },
];

describe("HeroCarousel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render items", () => {
    render(<HeroCarousel items={items} />);
    expect(screen.getByText("Canon EOS R5")).toBeInTheDocument();
    expect(screen.getByText("North Face Tent")).toBeInTheDocument();
  });

  it("should display prices", () => {
    render(<HeroCarousel items={items} />);
    expect(screen.getByText(/\$500/)).toBeInTheDocument();
    expect(screen.getByText(/\$200/)).toBeInTheDocument();
  });

  it("should render category badges", () => {
    render(<HeroCarousel items={items} />);
    expect(screen.getByText("Fotografía y Video")).toBeInTheDocument();
    expect(screen.getByText("Montaña y Camping")).toBeInTheDocument();
  });

  it("should return null for empty items", () => {
    const { container } = render(<HeroCarousel items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render links to gear pages", () => {
    render(<HeroCarousel items={items} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "/gear/photo-001");
    expect(links[1]).toHaveAttribute("href", "/gear/camp-001");
  });

  it("should show placeholder for items without imageURL", () => {
    render(<HeroCarousel items={items} />);
    expect(screen.getByText(/Cargando imagen/)).toBeInTheDocument();
  });

  it("should render dots indicator for each item", () => {
    render(<HeroCarousel items={items} />);
    const dots = screen.getAllByRole("button", { name: /Ir al slide/i });
    expect(dots).toHaveLength(2);
  });

  it("should call api.scrollTo when dot is clicked", () => {
    render(<HeroCarousel items={items} />);
    const dots = screen.getAllByRole("button", { name: /Ir al slide/i });
    fireEvent.click(dots[1]);
    expect(mockApi.scrollTo).toHaveBeenCalledWith(1);
  });

  it("should call api.off on cleanup", () => {
    const { unmount } = render(<HeroCarousel items={items} />);
    unmount();
    expect(mockApi.off).toHaveBeenCalledWith("select", expect.any(Function));
  });

  it("should register select event on api", () => {
    render(<HeroCarousel items={items} />);
    expect(mockApi.on).toHaveBeenCalledWith("select", expect.any(Function));
  });

  it("should set up autoplay interval", () => {
    render(<HeroCarousel items={items} />);
    expect(mockApi.scrollNext).not.toHaveBeenCalled();
    vi.advanceTimersByTime(5000);
    expect(mockApi.scrollNext).toHaveBeenCalled();
  });

  it("should clear autoplay interval on unmount", () => {
    const { unmount } = render(<HeroCarousel items={items} />);
    unmount();
    vi.advanceTimersByTime(10000);
    expect(mockApi.scrollNext).not.toHaveBeenCalled();
  });

  it("should render section heading", () => {
    render(<HeroCarousel items={items} />);
    expect(screen.getByText("Equipo Destacado")).toBeInTheDocument();
  });

  it("should render descriptions", () => {
    render(<HeroCarousel items={items} />);
    expect(screen.getByText("Professional camera")).toBeInTheDocument();
    expect(screen.getByText("4-person tent")).toBeInTheDocument();
  });

  it("should render per-day price label", () => {
    render(<HeroCarousel items={items} />);
    const perDayLabels = screen.getAllByText("/día");
    expect(perDayLabels.length).toBeGreaterThan(0);
  });

  it("should update current index via onSelect callback", () => {
    render(<HeroCarousel items={items} />);
    const selectCallback = mockApi.on.mock.calls.find(
      (call: any[]) => call[0] === "select"
    )?.[1];
    mockApi.selectedScrollSnap.mockReturnValue(1);
    act(() => {
      selectCallback?.();
    });
    const dots = screen.getAllByRole("button", { name: /Ir al slide/i });
    expect(dots[1]).toHaveClass("bg-primary");
    expect(dots[0]).toHaveClass("bg-neutral-300");
  });

  it("should re-register handlers when api instance changes", () => {
    render(<HeroCarousel items={items} />);

    const mockApiB = {
      selectedScrollSnap: vi.fn(() => 0),
      on: vi.fn(),
      off: vi.fn(),
      scrollTo: vi.fn(),
      scrollNext: vi.fn(),
    };

    act(() => {
      capturedSetApi?.(mockApiB);
    });

    // New api gets handlers registered (skipping one-time init)
    expect(mockApiB.on).toHaveBeenCalledWith("select", expect.any(Function));
    // Previous api had its listener removed on cleanup
    expect(mockApi.off).toHaveBeenCalledWith("select", expect.any(Function));
  });
});
