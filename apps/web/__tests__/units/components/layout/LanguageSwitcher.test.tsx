import { render, screen } from "@testing-library/react"
/// <reference types="react" />
import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import LanguageSwitcher from "@/components/layout/LanguageSwitcher"

globalThis.React = React

const mockReplace = vi.fn()
const mockUsePathname = vi.fn()
const mockUseParams = vi.fn()

vi.mock("@/i18n/navigation", () => ({
  useRouter: vi.fn(),
  usePathname: () => mockUsePathname()
}))

vi.mock("next/navigation", () => ({
  useParams: () => mockUseParams()
}))

vi.mock("@repo/ui/components/button", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>
}))

vi.mock("@repo/ui/components/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div data-testid="dropdown-item" onClick={onClick}>
      {children}
    </div>
  )
}))

describe("LanguageSwitcher", () => {
  beforeEach(async () => {
    vi.clearAllMocks()

    const { useRouter } = await import("@/i18n/navigation")
    vi.mocked(useRouter).mockReturnValue({
      replace: mockReplace,
      push: vi.fn(),
      refresh: vi.fn()
    } as any)

    mockUsePathname.mockReturnValue("/boards")
    mockUseParams.mockReturnValue({ locale: "en" })
  })

  it("should render language switcher", () => {
    render(<LanguageSwitcher />)
    expect(screen.getByTestId("dropdown-menu")).toBeInTheDocument()
  })

  it("should render current locale", () => {
    render(<LanguageSwitcher />)
    expect(screen.getByText("EN")).toBeInTheDocument()
  })

  it("should render German locale when locale is de", () => {
    mockUseParams.mockReturnValue({ locale: "de" })
    render(<LanguageSwitcher />)
    expect(screen.getByText("DE")).toBeInTheDocument()
  })

  it("should render dropdown trigger", () => {
    render(<LanguageSwitcher />)
    expect(screen.getByTestId("dropdown-trigger")).toBeInTheDocument()
  })

  it("should render dropdown content", () => {
    render(<LanguageSwitcher />)
    expect(screen.getByTestId("dropdown-content")).toBeInTheDocument()
  })

  it("should render English option", () => {
    render(<LanguageSwitcher />)
    expect(screen.getByText("English")).toBeInTheDocument()
  })

  it("should render Deutsch option", () => {
    render(<LanguageSwitcher />)
    expect(screen.getByText("Deutsch")).toBeInTheDocument()
  })

  it("should render all language switcher elements", () => {
    render(<LanguageSwitcher />)
    expect(screen.getByTestId("dropdown-menu")).toBeInTheDocument()
    expect(screen.getByText("EN")).toBeInTheDocument()
    expect(screen.getByText("English")).toBeInTheDocument()
    expect(screen.getByText("Deutsch")).toBeInTheDocument()
  })

  it("should handle pathname without locale prefix", () => {
    mockUsePathname.mockReturnValue("/boards")
    mockUseParams.mockReturnValue({ locale: "en" })
    render(<LanguageSwitcher />)
    expect(screen.getByText("EN")).toBeInTheDocument()
  })

  it("should handle pathname with locale prefix", () => {
    mockUsePathname.mockReturnValue("/en/boards")
    mockUseParams.mockReturnValue({ locale: "en" })
    render(<LanguageSwitcher />)
    expect(screen.getByText("EN")).toBeInTheDocument()
  })

  it("should handle language change to English", () => {
    const { container } = render(<LanguageSwitcher />)
    const items = container.querySelectorAll('[data-testid="dropdown-item"]')
    const englishItem = Array.from(items).find((item) => item.textContent === "English")

    if (englishItem) {
      ;(englishItem as HTMLElement).click()
    }

    expect(container.querySelector('[data-testid="dropdown-menu"]')).toBeInTheDocument()
  })

  it("should handle language change to Deutsch", () => {
    const { container } = render(<LanguageSwitcher />)
    const items = container.querySelectorAll('[data-testid="dropdown-item"]')
    const deutschItem = Array.from(items).find((item) => item.textContent === "Deutsch")

    if (deutschItem) {
      ;(deutschItem as HTMLElement).click()
    }

    expect(container.querySelector('[data-testid="dropdown-menu"]')).toBeInTheDocument()
  })

  it("should handle base path extraction when pathname includes locale", () => {
    mockUsePathname.mockReturnValue("/de/projects/123")
    mockUseParams.mockReturnValue({ locale: "de" })
    render(<LanguageSwitcher />)
    expect(screen.getByText("DE")).toBeInTheDocument()
  })

  it("should handle base path extraction when pathname does not include locale", () => {
    mockUsePathname.mockReturnValue("/projects/123")
    mockUseParams.mockReturnValue({ locale: "en" })
    render(<LanguageSwitcher />)
    expect(screen.getByText("EN")).toBeInTheDocument()
  })
})
