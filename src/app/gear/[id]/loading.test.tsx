import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import GearLoading from "./loading";

describe("Gear Loading", () => {
  it("should render loading skeleton", () => {
    const { container } = render(<GearLoading />);
    expect(container.firstChild).toBeTruthy();
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
