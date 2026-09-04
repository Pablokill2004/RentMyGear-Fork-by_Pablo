import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./carousel";

const mockApi = {
  canScrollPrev: vi.fn(() => false),
  canScrollNext: vi.fn(() => false),
  on: vi.fn(),
  off: vi.fn(),
  scrollPrev: vi.fn(),
  scrollNext: vi.fn(),
  scrollTo: vi.fn(),
  selectedScrollSnap: vi.fn(() => 0),
};

let currentApi: unknown = mockApi;

vi.mock("embla-carousel-react", () => ({
  default: () => [vi.fn(), currentApi],
}));

describe("Carousel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentApi = mockApi;
    mockApi.canScrollPrev.mockReturnValue(false);
    mockApi.canScrollNext.mockReturnValue(false);
  });

  it("should render carousel content", () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
          <CarouselItem>Item 2</CarouselItem>
        </CarouselContent>
      </Carousel>
    );
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("should render navigation buttons", () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    );
    expect(screen.getByRole("button", { name: /previous slide/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next slide/i })).toBeInTheDocument();
  });

  it("should apply orientation class", () => {
    const { container } = render(
      <Carousel orientation="vertical">
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
      </Carousel>
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("should disable prev button when cannot scroll prev", () => {
    mockApi.canScrollPrev.mockReturnValue(false);
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
      </Carousel>
    );
    expect(screen.getByRole("button", { name: /previous slide/i })).toBeDisabled();
  });

  it("should enable prev button when can scroll prev", () => {
    mockApi.canScrollPrev.mockReturnValue(true);
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
      </Carousel>
    );
    expect(screen.getByRole("button", { name: /previous slide/i })).not.toBeDisabled();
  });

  it("should disable next button when cannot scroll next", () => {
    mockApi.canScrollNext.mockReturnValue(false);
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
        <CarouselNext />
      </Carousel>
    );
    expect(screen.getByRole("button", { name: /next slide/i })).toBeDisabled();
  });

  it("should enable next button when can scroll next", () => {
    mockApi.canScrollNext.mockReturnValue(true);
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
        <CarouselNext />
      </Carousel>
    );
    expect(screen.getByRole("button", { name: /next slide/i })).not.toBeDisabled();
  });

  it("should call scrollPrev when previous button clicked", () => {
    mockApi.canScrollPrev.mockReturnValue(true);
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
      </Carousel>
    );
    fireEvent.click(screen.getByRole("button", { name: /previous slide/i }));
    expect(mockApi.scrollPrev).toHaveBeenCalled();
  });

  it("should call scrollNext when next button clicked", () => {
    mockApi.canScrollNext.mockReturnValue(true);
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
        <CarouselNext />
      </Carousel>
    );
    fireEvent.click(screen.getByRole("button", { name: /next slide/i }));
    expect(mockApi.scrollNext).toHaveBeenCalled();
  });

  it("should handle ArrowLeft keyboard event", () => {
    mockApi.canScrollPrev.mockReturnValue(true);
    const { container } = render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
      </Carousel>
    );
    const carouselRegion = container.querySelector('[role="region"]')!;
    fireEvent.keyDown(carouselRegion, { key: "ArrowLeft" });
    expect(mockApi.scrollPrev).toHaveBeenCalled();
  });

  it("should handle ArrowRight keyboard event", () => {
    mockApi.canScrollNext.mockReturnValue(true);
    const { container } = render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
      </Carousel>
    );
    const carouselRegion = container.querySelector('[role="region"]')!;
    fireEvent.keyDown(carouselRegion, { key: "ArrowRight" });
    expect(mockApi.scrollNext).toHaveBeenCalled();
  });

  it("should call setApi when provided", () => {
    const setApi = vi.fn();
    render(
      <Carousel setApi={setApi}>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
      </Carousel>
    );
    expect(setApi).toHaveBeenCalledWith(mockApi);
  });

  it("should register select event on api", () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
      </Carousel>
    );
    expect(mockApi.on).toHaveBeenCalledWith("select", expect.any(Function));
  });

  it("should apply vertical orientation styles to CarouselItem", () => {
    render(
      <Carousel orientation="vertical">
        <CarouselContent>
          <CarouselItem>Vertical Item</CarouselItem>
        </CarouselContent>
      </Carousel>
    );
    expect(screen.getByText("Vertical Item")).toBeInTheDocument();
  });

  it("should render carousel region with proper aria attributes", () => {
    const { container } = render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
      </Carousel>
    );
    const region = container.querySelector('[role="region"]');
    expect(region).toHaveAttribute("aria-roledescription", "carousel");
    expect(region).toHaveAttribute("data-slot", "carousel");
  });

  it("should throw when carousel subcomponent is used outside provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      render(
        <CarouselContent>
          <div>Orphan</div>
        </CarouselContent>
      )
    ).toThrow("useCarousel must be used within a <Carousel />");
    spy.mockRestore();
  });

  it("should skip api setup when embla returns no api", () => {
    currentApi = null;
    const setApi = vi.fn();
    render(
      <Carousel setApi={setApi}>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
      </Carousel>
    );
    expect(setApi).not.toHaveBeenCalled();
  });

  it("should ignore onSelect call when api is falsy", () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
      </Carousel>
    );
    const selectHandler = mockApi.on.mock.calls.find(
      (call: any[]) => call[0] === "select"
    )?.[1];
    expect(selectHandler).toBeDefined();
    expect(() => selectHandler(undefined)).not.toThrow();
  });

  it("should ignore other keys in keyboard handler", () => {
    const { container } = render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
      </Carousel>
    );
    const region = container.querySelector('[role="region"]')!;
    fireEvent.keyDown(region, { key: "x" });
    expect(mockApi.scrollPrev).not.toHaveBeenCalled();
    expect(mockApi.scrollNext).not.toHaveBeenCalled();
  });

  it("should derive vertical orientation from opts axis", () => {
    render(
      <Carousel orientation={"" as never} opts={{ axis: "y" }}>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
      </Carousel>
    );
    expect(screen.getByText("Item 1")).toBeInTheDocument();
  });

  it("should derive horizontal orientation when opts has no axis", () => {
    render(
      <Carousel orientation={"" as never}>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
      </Carousel>
    );
    expect(screen.getByText("Item 1")).toBeInTheDocument();
  });

  it("should render vertical navigation buttons", () => {
    render(
      <Carousel orientation="vertical">
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    );
    expect(screen.getByRole("button", { name: /previous slide/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next slide/i })).toBeInTheDocument();
  });
});
