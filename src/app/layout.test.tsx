import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-geist-sans", className: "font-geist-sans" }),
  Geist_Mono: () => ({ variable: "--font-geist-mono", className: "font-geist-mono" }),
}));

vi.mock("sonner", () => ({
  Toaster: () => <div data-slot="toaster" />,
}));

import Layout from "./layout";

describe("Layout", () => {
  it("should render children", () => {
    render(
      <Layout>
        <div>Test content</div>
      </Layout>
    );
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("should render the site title", () => {
    render(
      <Layout>
        <div />
      </Layout>
    );
    expect(screen.getByText("Rent my Gear")).toBeInTheDocument();
  });

  it("should render navigation links", () => {
    render(
      <Layout>
        <div />
      </Layout>
    );
    expect(screen.getByRole("link", { name: /rent my gear/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /fotografía/i })).toHaveAttribute(
      "href",
      "/category/fotografia-video"
    );
    expect(screen.getByRole("link", { name: /montaña/i })).toHaveAttribute(
      "href",
      "/category/montana-camping"
    );
    expect(screen.getByRole("link", { name: /acuáticos/i })).toHaveAttribute(
      "href",
      "/category/deportes-acuaticos"
    );
  });

  it("should render footer with copyright", () => {
    render(
      <Layout>
        <div />
      </Layout>
    );
    expect(screen.getByText(/Todos los derechos reservados/)).toBeInTheDocument();
  });
});
