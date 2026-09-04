import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { Toaster } from "./sonner";

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light" }),
}));

describe("Sonner Toaster", () => {
  it("should render without crashing", () => {
    render(<Toaster />);
  });
});
