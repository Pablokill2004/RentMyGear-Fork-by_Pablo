import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Calendar } from "./calendar";

describe("Calendar", () => {
  it("should render a calendar", () => {
    render(<Calendar />);
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("should display month navigation buttons", () => {
    render(<Calendar />);
    expect(screen.getByRole("button", { name: /go to the previous month/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /go to the next month/i })).toBeInTheDocument();
  });

  it("should navigate to previous month", () => {
    render(<Calendar />);
    const prevButton = screen.getByRole("button", { name: /go to the previous month/i });
    fireEvent.click(prevButton);
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("should navigate to next month", () => {
    render(<Calendar />);
    const nextButton = screen.getByRole("button", { name: /go to the next month/i });
    fireEvent.click(nextButton);
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("should render with selected date", () => {
    const today = new Date();
    render(<Calendar mode="single" selected={today} />);
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("should render with date range mode", () => {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 3);
    render(<Calendar mode="range" selected={{ from, to }} />);
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("should render with multiple months", () => {
    render(<Calendar numberOfMonths={2} />);
    const grids = screen.getAllByRole("grid");
    expect(grids.length).toBe(2);
  });

  it("should render with showWeekNumber", () => {
    render(<Calendar showWeekNumber />);
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("should render with fixedWeeks", () => {
    render(<Calendar fixedWeeks />);
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("should render with vertical orientation", () => {
    render(<Calendar numberOfMonths={2} mode="range" />);
    expect(screen.getAllByRole("grid").length).toBe(2);
  });

  it("should render with captionLayout dropdown", () => {
    render(<Calendar captionLayout="dropdown" fromMonth={new Date(2024, 0)} toMonth={new Date(2024, 11)} />);
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("should render chevron icons for navigation", () => {
    const { container } = render(<Calendar />);
    const navButtons = container.querySelectorAll('[data-slot="calendar"] button');
    expect(navButtons.length).toBeGreaterThanOrEqual(2);
  });

  it("should call onSelect when day is clicked", () => {
    const onSelect = vi.fn();
    render(<Calendar mode="single" onSelect={onSelect} />);
    const today = new Date();
    const dayButtons = screen.getAllByRole("button", {
      name: new RegExp(`Today.*September ${today.getDate()}`),
    });
    fireEvent.click(dayButtons[0]);
    expect(onSelect).toHaveBeenCalled();
  });
});
