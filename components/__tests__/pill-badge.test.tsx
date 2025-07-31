import { render, screen } from "@testing-library/react";
import { PillBadge } from "../pill-badge";

function Icon() {
  return <svg data-testid="icon" />;
}

describe("Test PillBadge component", () => {
  describe("Regular (non-abbreviated) mode", () => {
    it("renders a badge with text", () => {
      render(<PillBadge testid="test-1">Hello</PillBadge>);
      const badge = screen.getByTestId("test-1");
      expect(badge).toHaveTextContent("Hello");
      expect(badge).toHaveAttribute("role", "status");
    });

    it("renders a badge with an icon on the left", () => {
      render(
        <PillBadge iconPosition="left" testid="test-2">
          <Icon />
          Hello
        </PillBadge>
      );
      const badge = screen.getByTestId("test-2");
      expect(badge).toHaveTextContent("Hello");
      expect(badge).toHaveClass("pl-0.5", "pr-1.5");
      expect(screen.getByTestId("icon")).toBeInTheDocument();
    });

    it("renders a badge with an icon on the right", () => {
      render(
        <PillBadge iconPosition="right" testid="test-3">
          <Icon />
          Hello
        </PillBadge>
      );

      const badge = screen.getByTestId("test-3");
      expect(badge).toHaveTextContent("Hello");
      expect(badge).toHaveClass("pl-1.5", "pr-0.5");
      expect(screen.getByTestId("icon")).toBeInTheDocument();
    });

    it("renders with default padding when no iconPosition specified", () => {
      render(
        <PillBadge testid="test-4">
          <Icon />
          Default
        </PillBadge>
      );

      const badge = screen.getByTestId("test-4");
      expect(badge).toHaveClass("px-1.5");
    });

    it("renders with empty iconPosition (default padding)", () => {
      render(
        <PillBadge iconPosition="" testid="test-5">
          <Icon />
          Empty Position
        </PillBadge>
      );

      const badge = screen.getByTestId("test-5");
      expect(badge).toHaveClass("px-1.5");
    });

    it("renders with custom className", () => {
      render(
        <PillBadge className="custom-class" testid="test-6">
          Custom Class
        </PillBadge>
      );

      const badge = screen.getByTestId("test-6");
      expect(badge).toHaveClass("custom-class");
    });

    it("has correct default styling classes", () => {
      render(<PillBadge testid="test-styling">Content</PillBadge>);

      const badge = screen.getByTestId("test-styling");
      expect(badge).toHaveClass(
        "flex",
        "h-5",
        "w-fit",
        "items-center",
        "rounded-full",
        "border",
        "border-white",
        "text-xs",
        "font-semibold",
        "whitespace-nowrap",
        "uppercase",
        "ring-1"
      );
    });
  });

  describe("Abbreviated mode", () => {
    it("renders abbreviated badge when abbreviatedLabel is provided", () => {
      render(
        <PillBadge testid="abbreviated-1" abbreviatedLabel="Full Label Text">
          <Icon />
        </PillBadge>
      );

      // Should render with abbreviated testid
      const badge = screen.getByTestId("abbreviated-1-abbreviated");
      expect(badge).toBeInTheDocument();

      // Should contain the icon
      expect(screen.getByTestId("icon")).toBeInTheDocument();

      // Should not have role="status" (that's only for regular badges)
      expect(badge).not.toHaveAttribute("role", "status");
    });

    it("renders tooltip with abbreviated label text", () => {
      render(
        <PillBadge
          testid="abbreviated-2"
          abbreviatedLabel="This is the full label"
        >
          <Icon />
        </PillBadge>
      );

      // The tooltip component should be rendered with the proper aria-describedby attribute
      const badge = screen.getByTestId("abbreviated-2-abbreviated");
      expect(badge).toHaveAttribute(
        "aria-describedby",
        "tooltip-pill-badge-abbreviated-2"
      );
    });

    it("renders abbreviated badge with custom className", () => {
      render(
        <PillBadge
          testid="abbreviated-3"
          className="abbreviated-custom"
          abbreviatedLabel="Full Label Text"
        >
          <Icon />
        </PillBadge>
      );

      const badge = screen.getByTestId("abbreviated-3-abbreviated");
      expect(badge).toHaveClass("abbreviated-custom");
    });

    it("has correct abbreviated styling classes", () => {
      render(
        <PillBadge testid="abbreviated-4" abbreviatedLabel="Full Label Text">
          <Icon />
        </PillBadge>
      );

      const badge = screen.getByTestId("abbreviated-4-abbreviated");
      expect(badge).toHaveClass(
        "h-4.5",
        "w-4.5",
        "rounded-full",
        "border-1",
        "border-white",
        "ring"
      );
    });

    it("ignores iconPosition when in abbreviated mode", () => {
      render(
        <PillBadge
          testid="abbreviated-5"
          iconPosition="left"
          abbreviatedLabel="Full Label Text"
        >
          <Icon />
        </PillBadge>
      );

      const badge = screen.getByTestId("abbreviated-5-abbreviated");
      // Should not have the icon position classes since it's abbreviated
      expect(badge).not.toHaveClass("pl-0.5", "pr-1.5");
      expect(badge).not.toHaveClass("px-1.5");
    });

    it("renders regular badge with empty abbreviatedLabel", () => {
      render(
        <PillBadge testid="abbreviated-6" abbreviatedLabel="">
          <Icon />
        </PillBadge>
      );

      // Empty string is falsy, so should render regular badge, not abbreviated
      const badge = screen.getByTestId("abbreviated-6");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute("role", "status");
    });

    it("renders abbreviated badge with default parameters", () => {
      render(
        <PillBadge abbreviatedLabel="Default params test">
          <Icon />
        </PillBadge>
      );

      // Should render abbreviated with default className="", testid="", abbreviatedLabel passed
      const badge = screen.getByTestId("-abbreviated");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute("aria-describedby", "tooltip-pill-badge");
    });

    it("renders abbreviated badge with all defaults (minimal props)", () => {
      // This should trigger the default parameter assignments in AbbreviatedPillBadge
      const { container } = render(
        <PillBadge abbreviatedLabel="Minimal">
          <span>Icon</span>
        </PillBadge>
      );

      // Should render with all default values: className="", testid=""
      const badge = container.querySelector('[data-testid="-abbreviated"]');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass(
        "h-4.5",
        "w-4.5",
        "rounded-full",
        "border-1",
        "border-white",
        "ring"
      );
      // Should not have any additional custom classes since className defaults to ""
      expect(badge?.className).not.toContain("custom");
    });

    it("renders abbreviated badge with only some parameters", () => {
      render(
        <PillBadge testid="partial-params" abbreviatedLabel="Partial params">
          <Icon />
        </PillBadge>
      );

      // Should use default className="" but provided testid and abbreviatedLabel
      const badge = screen.getByTestId("partial-params-abbreviated");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute(
        "aria-describedby",
        "tooltip-pill-badge-partial-params"
      );
      // Should not have any custom className since we didn't provide one (uses default "")
      expect(badge).toHaveClass("h-4.5", "w-4.5", "rounded-full");
    });

    it("covers default parameter branches with destructuring patterns", () => {
      // Test case 1: No className provided (should use default "")
      const { unmount: unmount1 } = render(
        <PillBadge testid="branch-test-1" abbreviatedLabel="Test 1">
          <Icon />
        </PillBadge>
      );

      const badge1 = screen.getByTestId("branch-test-1-abbreviated");
      expect(badge1).toBeInTheDocument();
      expect(badge1).toHaveClass("h-4.5", "w-4.5", "rounded-full");
      unmount1();

      // Test case 2: No testid provided (should use default "")
      const { unmount: unmount2 } = render(
        <PillBadge className="custom-branch" abbreviatedLabel="Test 2">
          <Icon />
        </PillBadge>
      );

      const badge2 = screen.getByTestId("-abbreviated");
      expect(badge2).toBeInTheDocument();
      expect(badge2).toHaveClass("custom-branch");
      unmount2();

      // Test case 3: No abbreviatedLabel (should use default "", renders regular badge)
      const { unmount: unmount3 } = render(
        <PillBadge testid="branch-test-3" className="custom-branch">
          <Icon />
        </PillBadge>
      );

      const badge3 = screen.getByTestId("branch-test-3");
      expect(badge3).toHaveAttribute("role", "status");
      expect(badge3).toHaveClass("custom-branch");
      unmount3();
    });

    it("handles null/undefined props for default value coverage", () => {
      // Test with explicitly null abbreviatedLabel to trigger the || "" fallback in AbbreviatedPillBadge
      const { unmount: unmount1 } = render(
        <PillBadge
          testid="null-test"
          className={null as any}
          abbreviatedLabel="Non-null label"
        >
          <Icon />
        </PillBadge>
      );

      const badge1 = screen.getByTestId("null-test-abbreviated");
      expect(badge1).toBeInTheDocument();
      unmount1();

      // Test with null testid to trigger the || "" fallback
      const { unmount: unmount2 } = render(
        <PillBadge testid={null as any} abbreviatedLabel="Null testid test">
          <Icon />
        </PillBadge>
      );

      const badge2 = screen.getByTestId("-abbreviated");
      expect(badge2).toBeInTheDocument();
      unmount2();
    });
  });

  describe("Edge cases", () => {
    it("renders without testid", () => {
      render(<PillBadge>No TestID</PillBadge>);

      // Should still render, just without testid
      expect(screen.getByText("No TestID")).toBeInTheDocument();
    });

    it("renders abbreviated without testid", () => {
      render(
        <PillBadge abbreviatedLabel="Full Text">
          <Icon />
        </PillBadge>
      );

      // Should render abbreviated version with empty testid
      const badge = screen.getByTestId("-abbreviated");
      expect(badge).toBeInTheDocument();
    });

    it("renders with undefined abbreviatedLabel (should be regular)", () => {
      render(
        <PillBadge testid="undefined-test" abbreviatedLabel={undefined}>
          <Icon />
          Undefined Label
        </PillBadge>
      );

      // undefined is falsy, so should render regular badge
      const badge = screen.getByTestId("undefined-test");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute("role", "status");
      expect(badge).toHaveTextContent("Undefined Label");
    });

    it("renders with all props combined (regular mode)", () => {
      render(
        <PillBadge
          testid="full-test"
          className="all-custom-classes"
          iconPosition="right"
        >
          <Icon />
          <span>Full Badge</span>
        </PillBadge>
      );

      const badge = screen.getByTestId("full-test");
      expect(badge).toHaveClass("all-custom-classes", "pl-1.5", "pr-0.5");
      expect(badge).toHaveTextContent("Full Badge");
      expect(screen.getByTestId("icon")).toBeInTheDocument();
    });

    it("renders with all props combined (abbreviated mode)", () => {
      render(
        <PillBadge
          testid="full-abbreviated-test"
          className="abbreviated-all-custom"
          iconPosition="left"
          abbreviatedLabel="Complete Full Label"
        >
          <Icon />
          <span>This text should not appear</span>
        </PillBadge>
      );

      const badge = screen.getByTestId("full-abbreviated-test-abbreviated");
      expect(badge).toHaveClass("abbreviated-all-custom");
      expect(screen.getByTestId("icon")).toBeInTheDocument();
      // Check tooltip is properly set up with aria-describedby
      expect(badge).toHaveAttribute(
        "aria-describedby",
        "tooltip-pill-badge-full-abbreviated-test"
      );
      // Text content should still appear as children in abbreviated mode (they're just not styled as text)
      expect(badge).toHaveTextContent("This text should not appear");
    });
  });
});
