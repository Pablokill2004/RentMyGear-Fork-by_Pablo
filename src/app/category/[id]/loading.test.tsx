import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import CategoryLoading from "./loading";

describe("Category Loading", () => {
  it("should render loading skeleton", () => {
    const { container } = render(<CategoryLoading />);
    expect(container.firstChild).toBeTruthy();
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
