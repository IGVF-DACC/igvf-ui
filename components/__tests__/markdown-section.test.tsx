import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import MarkdownSection, { rehypeSanitizeSchema } from "../markdown-section";

let mockCopyButtonIsCopied = false;

/**
 * Tests for MarkdownSection. These focus on verifying that the component correctly configures
 * react-markdown with the expected plugins and renderers, and that the custom renderers behave as
 * intended when invoked with various props. The tests use a mocked version of react-markdown to
 * capture the props passed to it without invoking the full markdown parsing stack, allowing for
 * isolated testing of renderer behavior.
 *
 * If we intercept more HTML elements for markdown rendering in the future (e.g. images), add tests
 * for those renderers here as well.
 */
type MockedMarkedownProps = {
  children?: React.ReactNode;
  components?: {
    a: (props: {
      href?: string;
      children?: React.ReactNode;
      node?: unknown;
    }) => React.ReactNode;
    pre: (props: {
      children?: React.ReactNode;
      node?: unknown;
    }) => React.ReactNode;
    table: (props: {
      children?: React.ReactNode;
      node?: unknown;
    }) => React.ReactNode;
  };
  remarkPlugins?: unknown[];
  rehypePlugins?: unknown[];
};

let lastReactMarkdownProps: MockedMarkedownProps | null = null;

// Replace the real copy button with a tiny deterministic mock so PreRenderer can be tested
// without clipboard side effects or icon state complexity.
jest.mock("../copy-button", () => ({
  __esModule: true,
  CopyButton: {
    Icon: function MockCopyButtonIcon({
      target,
      children,
    }: {
      target: string;
      children: (isCopied: boolean) => React.ReactNode;
    }) {
      return (
        <button data-testid="copy-button-icon" data-target={target}>
          {children(mockCopyButtonIsCopied)}
        </button>
      );
    },
  },
}));

jest.mock("@heroicons/react/20/solid", () => ({
  CheckIcon: function MockCheckIcon() {
    return <svg data-testid="check-icon" />;
  },
  ClipboardDocumentCheckIcon: function MockClipboardIcon() {
    return <svg data-testid="clipboard-icon" />;
  },
}));

/**
 * Mock for the remark-gfm plugin used in MarkdownSection tests. This allows us to verify that the
 * plugin is correctly passed to react-markdown without invoking the actual plugin logic.
 */
jest.mock("remark-gfm", () => ({
  __esModule: true,
  default: jest.fn(),
}));

/**
 * Mock for the rehype-raw plugin used in MarkdownSection tests. This allows us to verify that the
 * plugin is correctly passed to react-markdown without invoking the actual plugin logic.
 */
jest.mock("rehype-raw", () => ({
  __esModule: true,
  default: jest.fn(),
}));

/**
 * Mock for the rehype-sanitize plugin used in MarkdownSection tests. This allows us to verify that
 * the plugin is correctly passed to react-markdown without invoking the actual plugin logic.
 */
jest.mock("rehype-sanitize", () => ({
  __esModule: true,
  default: jest.fn(),
  defaultSchema: {
    attributes: {
      span: ["class"],
    },
  },
}));

/**
 * Mock our own remark-heading-ids plugin used in MarkdownSection tests. This allows us to verify
 * that the plugin is correctly passed to react-markdown without invoking the actual plugin logic,
 * as Jest can't test the actual plugin behavior because it relies on the ESM-only
 * `unist-util-visit` package.
 */
jest.mock("../../lib/remark-heading-ids", () => ({
  __esModule: true,
  remarkHeadingIds: jest.fn(),
}));

/**
 * Mock for the react-markdown component used in MarkdownSection tests. This allows us to verify
 * that the component is correctly passed props without invoking the full markdown parsing stack.
 * You cannot test any markdown rendering behavior with this Jest test mock in place, but it allows
 * us to directly test the custom renderer functions that MarkdownSection registers with
 * react-markdown by calling them with test props and verifying their output.
 *
 * Note that this modifies `lastReactMarkdownProps` in tests, allowing tests to verify the props
 * passed to react-markdown and to access the custom renderer functions registered in those props.
 */
jest.mock("react-markdown", () => {
  const MockReactMarkdown = jest.fn(function MockReactMarkdown(props: {
    [key: string]: unknown;
    children?: React.ReactNode;
  }) {
    lastReactMarkdownProps = props;
    return <div data-testid="fake-markdown-wrapper">{props.children}</div>;
  });

  return {
    __esModule: true,
    default: MockReactMarkdown,
  };
});

/**
 * The other Jest tests mock MarkdownSection to isolate it from react-markdown and test its
 * behavior in isolation, so we need to unmock it here to test the real component with the mocked
 * react-markdown.
 */
jest.unmock("../markdown-section");

describe("Test the MarkdownSection component", () => {
  // Render MarkdownSection and capture the props it passes to the mocked react-markdown component.
  // Tests use this to verify plugin wiring and to access the renderer callbacks (a/pre/table).
  function capturePropsPassedToReactMarkdown(
    markdown = "Text"
  ): MockedMarkedownProps {
    lastReactMarkdownProps = null;
    render(<MarkdownSection>{markdown}</MarkdownSection>);
    expect(lastReactMarkdownProps).not.toBeNull();
    return lastReactMarkdownProps!;
  }

  // Return the custom renderer functions that MarkdownSection registers with react-markdown.
  // We call these directly to test LinkRenderer/PreRenderer/TableRenderer behavior in isolation.
  function getCustomRendererFunctions() {
    const components = capturePropsPassedToReactMarkdown().components;
    expect(components).toBeDefined();
    return components as NonNullable<typeof components>;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    lastReactMarkdownProps = null;
    mockCopyButtonIsCopied = false;
  });

  it("renders markdown content through react-markdown", () => {
    render(<MarkdownSection>Test markdown section</MarkdownSection>);

    expect(screen.getByTestId("fake-markdown-wrapper")).toBeInTheDocument();
    expect(screen.getByText("Test markdown section")).toBeInTheDocument();
  });

  it("applies direction and wrapper classes", () => {
    render(
      <MarkdownSection
        direction="rtl"
        className="test-class"
        suppressLeadingMargin
        testid="jest-test"
      >
        Test markdown section
      </MarkdownSection>
    );

    const contentWrapper = screen.getByTestId("jest-test").firstChild;
    expect(contentWrapper).toHaveAttribute("dir", "rtl");
    expect(contentWrapper).toHaveClass("test-class");
    expect(contentWrapper).toHaveClass("suppress-leading-margin");
  });

  it("renders internal links with the no-prefetch Link wrapper", () => {
    const { a: LinkRenderer } = getCustomRendererFunctions();

    render(<>{LinkRenderer({ href: "/internal", children: "Internal" })}</>);

    expect(screen.getByRole("link", { name: "Internal" })).toHaveAttribute(
      "href",
      "/internal"
    );
    expect(screen.getByRole("link", { name: "Internal" })).not.toHaveAttribute(
      "target"
    );
  });

  it("renders hash links as internal links", () => {
    const { a: LinkRenderer } = getCustomRendererFunctions();

    render(<>{LinkRenderer({ href: "#section", children: "Section" })}</>);

    expect(screen.getByRole("link", { name: "Section" })).toHaveAttribute(
      "href",
      "#section"
    );
  });

  it("renders external links with target and rel", () => {
    const { a: LinkRenderer } = getCustomRendererFunctions();

    render(
      <>{LinkRenderer({ href: "https://example.org", children: "External" })}</>
    );

    expect(screen.getByRole("link", { name: "External" })).toHaveAttribute(
      "href",
      "https://example.org"
    );
    expect(screen.getByRole("link", { name: "External" })).toHaveAttribute(
      "target",
      "_blank"
    );
    expect(screen.getByRole("link", { name: "External" })).toHaveAttribute(
      "rel",
      "noreferrer"
    );
  });

  it("renders plain children when link href is missing", () => {
    const { a: LinkRenderer } = getCustomRendererFunctions();

    render(<>{LinkRenderer({ children: "No href" })}</>);

    expect(screen.getByText("No href")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "No href" })).toBeNull();
  });

  it("wraps table output in overflow container", () => {
    const { table: TableRenderer } = getCustomRendererFunctions();

    render(
      <>
        {TableRenderer({
          children: (
            <tbody>
              <tr>
                <td>Row cell</td>
              </tr>
            </tbody>
          ),
        })}
      </>
    );

    expect(screen.getByRole("table").parentElement).toHaveClass(
      "overflow-x-auto"
    );
    expect(screen.getByText("Row cell")).toBeInTheDocument();
  });

  it("adds a copy button to pre blocks with extracted text", () => {
    const { pre: PreRenderer } = getCustomRendererFunctions();

    render(
      <>
        {PreRenderer({
          children: (
            <code>
              abc<span>def</span>
              {123}
            </code>
          ),
        })}
      </>
    );

    const pre = screen.getByTestId("copy-button-icon").closest("pre");
    expect(pre).toHaveTextContent("abcdef123");
    expect(screen.getByTestId("copy-button-icon")).toHaveAttribute(
      "data-target",
      "abcdef123"
    );
    expect(screen.getByTestId("clipboard-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("check-icon")).toBeNull();
  });

  it("renders check icon when copy state is true", () => {
    const { pre: PreRenderer } = getCustomRendererFunctions();
    mockCopyButtonIsCopied = true;

    render(
      <>
        {PreRenderer({
          children: <code>abc</code>,
        })}
      </>
    );

    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("clipboard-icon")).toBeNull();
  });

  it("uses an empty copy target for non-text pre children", () => {
    const { pre: PreRenderer } = getCustomRendererFunctions();

    render(<>{PreRenderer({ children: false })}</>);

    expect(screen.getByTestId("copy-button-icon")).toHaveAttribute(
      "data-target",
      ""
    );
  });

  it("has a schema property", () => {
    expect(rehypeSanitizeSchema.attributes.span).toContain("style");
  });
});

describe("rehypeSanitizeSchema", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("adds style when defaultSchema.attributes.span is missing", async () => {
    jest.doMock("rehype-sanitize", () => ({
      __esModule: true,
      default: jest.fn(),
      defaultSchema: {
        attributes: {},
      },
    }));

    const { rehypeSanitizeSchema } = await import("../markdown-section");

    expect(rehypeSanitizeSchema.attributes.span).toEqual(["style"]);
  });
});
