import { render, screen } from "@testing-library/react";
import { VersionNumber } from "../version-number";

describe("VersionNumber component", () => {
  describe("Basic rendering", () => {
    it("renders with default empty version", () => {
      render(<VersionNumber />);

      const versionElement = screen.getByText("No version available");
      expect(versionElement).toBeInTheDocument();
    });

    it("renders as a div when no path is provided", () => {
      render(<VersionNumber version="1.0.0" />);

      const versionElement = screen.getByText("v1.0.0");
      expect(versionElement).not.toHaveClass("rounded-xs");
    });

    it("renders as a link when path is provided", () => {
      render(
        <VersionNumber version="1.0.0" path="/measurement-set/IGVFDS0000AAAA" />
      );

      const versionLink = screen.getByRole("link", { name: "v1.0.0" });
      expect(versionLink).toBeInTheDocument();
      expect(versionLink).toHaveAttribute(
        "href",
        "/measurement-set/IGVFDS0000AAAA"
      );
      expect(versionLink).toHaveClass("rounded-xs");
    });
  });

  describe("Version formatting", () => {
    it("prepends 'v' to version number that doesn't start with 'v'", () => {
      render(<VersionNumber version="1.0.0" />);

      expect(screen.getByText("v1.0.0")).toBeInTheDocument();
    });

    it("does not prepend 'v' to version number that already starts with 'v' or 'V'", () => {
      const { unmount } = render(<VersionNumber version="v1.0.0" />);
      expect(screen.getByText("v1.0.0")).toBeInTheDocument();
      expect(screen.queryByText("vv1.0.0")).not.toBeInTheDocument();
      unmount();

      render(<VersionNumber version="V1.0.0" />);
      expect(screen.getByText("V1.0.0")).toBeInTheDocument();
      expect(screen.queryByText("vV1.0.0")).not.toBeInTheDocument();
    });

    it("handles version with different formats", () => {
      const testCases = [
        { input: "2.1.3", expected: "v2.1.3" },
        { input: "v3.0.0-beta", expected: "v3.0.0-beta" },
        { input: "1.0", expected: "v1.0" },
        { input: "v1.2.3-alpha.1", expected: "v1.2.3-alpha.1" },
        { input: "2023.1", expected: "v2023.1" },
        { input: "v10.0.0", expected: "v10.0.0" },
        { input: "V2.0.0", expected: "V2.0.0" },
        { input: "V1.0.0-rc1", expected: "V1.0.0-rc1" },
      ];

      testCases.forEach(({ input, expected }) => {
        const { unmount } = render(<VersionNumber version={input} />);
        expect(screen.getByText(expected)).toBeInTheDocument();
        unmount();
      });
    });

    it("handles empty string version", () => {
      render(<VersionNumber version="" />);

      expect(screen.getByText("No version available")).toBeInTheDocument();
    });

    it("handles whitespace-only version", () => {
      const { container } = render(<VersionNumber version="   " />);

      const versionElement = container.querySelector("div");
      expect(versionElement).toBeInTheDocument();
      expect(versionElement?.textContent).toBe("No version available");
    });

    it("handles mixed whitespace version", () => {
      const testCases = ["  ", "\t", "\n", " \t \n ", "     "];

      testCases.forEach((whitespaceVersion) => {
        const { unmount } = render(
          <VersionNumber version={whitespaceVersion} />
        );
        expect(screen.getByText("No version available")).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe("CSS classes and styling", () => {
    it("applies custom className", () => {
      render(<VersionNumber version="1.0.0" className="custom-class" />);

      const versionElement = screen.getByText("v1.0.0");
      expect(versionElement).toHaveClass("custom-class");
      expect(versionElement).toHaveClass("border-schema-version"); // Base classes still present
    });

    it("applies multiple custom classes", () => {
      render(
        <VersionNumber version="1.0.0" className="class1 class2 class3" />
      );

      const versionElement = screen.getByText("v1.0.0");
      expect(versionElement).toHaveClass("class1", "class2", "class3");
    });

    it("handles empty className", () => {
      render(<VersionNumber version="1.0.0" className="" />);

      const versionElement = screen.getByText("v1.0.0");
      expect(versionElement).toHaveClass("border-schema-version");
    });
  });

  describe("Link behavior", () => {
    it("handles empty path as no link", () => {
      render(<VersionNumber version="1.0.0" path="" />);

      expect(screen.queryByRole("link")).not.toBeInTheDocument();
      const versionElement = screen.getByText("v1.0.0");
      expect(versionElement.tagName).toBe("DIV");
    });

    it("combines path and custom className correctly", () => {
      render(
        <VersionNumber
          version="1.0.0"
          path="/test"
          className="custom-link-class"
        />
      );

      const link = screen.getByRole("link");
      expect(link).toHaveClass("custom-link-class", "rounded-xs");
      expect(link).toHaveClass("border-schema-version"); // Base classes
    });
  });

  describe("Edge cases and prop combinations", () => {
    it("handles all props provided", () => {
      render(
        <VersionNumber
          version="v2.1.0"
          path="/measurment-set/IGVFDS0000AAAA"
          className="full-props-class"
        />
      );

      const link = screen.getByRole("link", { name: "v2.1.0" });
      expect(link).toHaveAttribute("href", "/measurment-set/IGVFDS0000AAAA");
      expect(link).toHaveClass("full-props-class", "rounded-xs");
    });

    it("handles undefined props (should use defaults)", () => {
      render(
        <VersionNumber
          version={undefined}
          path={undefined}
          className={undefined}
        />
      );

      const versionElement = screen.getByText("No version available");
      expect(versionElement.tagName).toBe("DIV");
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("handles null-like values", () => {
      render(<VersionNumber version={null as any} path={null as any} />);

      expect(screen.getByText("No version available")).toBeInTheDocument();
    });

    it("preserves special characters in version", () => {
      render(<VersionNumber version="1.0.0-beta+build.123" />);

      expect(screen.getByText("v1.0.0-beta+build.123")).toBeInTheDocument();
    });

    it("handles very long version strings", () => {
      const longVersion =
        "1.0.0-very-long-version-string-with-many-parts.alpha.beta.gamma.delta";
      render(<VersionNumber version={longVersion} />);

      expect(screen.getByText(`v${longVersion}`)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("link has proper role", () => {
      render(<VersionNumber version="1.0.0" path="/help" />);

      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
    });

    it("link text is accessible", () => {
      render(<VersionNumber version="2.0.0" path="/help" />);

      const link = screen.getByRole("link", { name: "v2.0.0" });
      expect(link).toBeInTheDocument();
    });

    it("div element is accessible via text content", () => {
      render(<VersionNumber version="1.0.0" />);

      const versionText = screen.getByText("v1.0.0");
      expect(versionText).toBeInTheDocument();
    });
  });
});
