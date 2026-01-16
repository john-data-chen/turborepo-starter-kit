import { render, screen } from "@testing-library/react";
/// <reference types="react" />
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProjectForm } from "@/components/kanban/project/ProjectForm";

globalThis.React = React;

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}));

vi.mock("@repo/ui/components/form", () => ({
  Form: ({ children }: any) => <div data-testid="form">{children}</div>,
  FormField: ({ render }: any) => {
    const field = { value: "", onChange: vi.fn(), onBlur: vi.fn(), name: "test" };
    return render({ field });
  },
  FormItem: ({ children }: any) => <div data-testid="form-item">{children}</div>,
  FormLabel: ({ children }: any) => <label>{children}</label>,
  FormControl: ({ children }: any) => <div data-testid="form-control">{children}</div>,
  FormMessage: () => <span data-testid="form-message" />
}));

describe("ProjectForm", () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render project form", () => {
    render(<ProjectForm onSubmit={mockOnSubmit} />);
    expect(screen.getByTestId("form")).toBeInTheDocument();
  });

  it("should render title input", () => {
    render(<ProjectForm onSubmit={mockOnSubmit} />);
    expect(screen.getByText("titleLabel")).toBeInTheDocument();
  });

  it("should render description textarea", () => {
    render(<ProjectForm onSubmit={mockOnSubmit} />);
    expect(screen.getByText("descriptionLabel")).toBeInTheDocument();
  });

  it("should render with default values", () => {
    render(
      <ProjectForm
        defaultValues={{ title: "Test Project", description: "Test Description" }}
        onSubmit={mockOnSubmit}
      />
    );
    expect(screen.getByTestId("form")).toBeInTheDocument();
  });

  it("should render with children", () => {
    render(
      <ProjectForm onSubmit={mockOnSubmit}>
        <button data-testid="custom-button">Save</button>
      </ProjectForm>
    );
    expect(screen.getByTestId("custom-button")).toBeInTheDocument();
  });

  it("should render without default values", () => {
    render(<ProjectForm onSubmit={mockOnSubmit} />);
    expect(screen.getByTestId("form")).toBeInTheDocument();
  });

  it("should handle form structure", () => {
    const { container } = render(<ProjectForm onSubmit={mockOnSubmit} />);
    const form = container.querySelector("form");
    expect(form).toBeInTheDocument();
  });
});
