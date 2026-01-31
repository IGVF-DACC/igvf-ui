import { render, screen } from "@testing-library/react";
import Status, {
  getStatusStyleAndIcon,
  StatusPreviewDetail,
  StatusTester,
} from "../status";

describe("Test the status badges", () => {
  it("generates the correct status-badge Tailwind CSS classes for the current state", () => {
    const { container } = render(<Status status="current" />);
    expect(
      container.getElementsByClassName("status status-current").length
    ).toBe(1);
    expect(container.getElementsByClassName("flex").length).toBe(1);
  });

  it("generates the correct status-badge Tailwind CSS classes for the deleted state", () => {
    const { container } = render(<Status status="deleted" />);
    expect(
      container.getElementsByClassName("status status-deleted").length
    ).toBe(1);
    expect(container.getElementsByClassName("flex").length).toBe(1);
  });

  it("generates the fallback status-badge Tailwind CSS classes for an unsupported state", () => {
    const { container } = render(<Status status="unsupported" />);
    expect(
      container.getElementsByClassName("status status-fallback").length
    ).toBe(1);
    expect(container.getElementsByClassName("flex").length).toBe(1);
  });

  it("generates the correct status-badge Tailwind CSS classes for an abbreviated current state", () => {
    const { container } = render(<Status status="current" isAbbreviated />);
    expect(
      container.getElementsByClassName("status status-current").length
    ).toBe(1);
    expect(container.getElementsByClassName("flex").length).toBe(0);
  });
});

describe("Test the `StatusPreviewDetail` component", () => {
  it("shows the preview banner for items with the `preview` status", () => {
    const item = { "@id": "/items/1", "@type": ["Item"], status: "preview" };
    const { container } = render(<StatusPreviewDetail item={item} />);
    expect(container.textContent).toContain("This object is in preview status");
  });

  it("does not show the preview banner for items with a status other than `preview`", () => {
    const item = { "@id": "/items/2", "@type": ["Item"], status: "released" };
    const { container } = render(<StatusPreviewDetail item={item} />);
    expect(container.textContent).toBe("");
  });
});

describe("Test the `StatusTester` component", () => {
  it("renders all status badges with their corresponding styles and icons", () => {
    render(<StatusTester />);

    // Check that all status badges are rendered.
    expect(screen.getByText("current")).toBeInTheDocument();
    expect(screen.getByText("released")).toBeInTheDocument();
    expect(screen.getByText("archived")).toBeInTheDocument();
    expect(screen.getByText("deleted")).toBeInTheDocument();
    expect(screen.getByText("fallback")).toBeInTheDocument();

    // Check that the abbreviated status badges are rendered by checking data-test-id status-abbr-*.
    expect(screen.getByTestId("status-abbr-current")).toBeInTheDocument();
    expect(screen.getByTestId("status-abbr-released")).toBeInTheDocument();
    expect(screen.getByTestId("status-abbr-archived")).toBeInTheDocument();
    expect(screen.getByTestId("status-abbr-deleted")).toBeInTheDocument();
    expect(screen.getByTestId("status-abbr-fallback")).toBeInTheDocument();
  });
});

describe("Test the `getStatusStyleAndIcon` function", () => {
  it("returns the correct style and icon for the `current` status", () => {
    const { styles, Icon } = getStatusStyleAndIcon("current");
    expect(styles).toBe("status status-current");
    expect(Icon).toBeDefined();
  });

  it("returns the correct style and icon for the `released` status", () => {
    const { styles, Icon } = getStatusStyleAndIcon("released");
    expect(styles).toBe("status status-released");
    expect(Icon).toBeDefined();
  });

  it("returns the correct style and icon for the `archived` status", () => {
    const { styles, Icon } = getStatusStyleAndIcon("archived");
    expect(styles).toBe("status status-archived");
    expect(Icon).toBeDefined();
  });

  it("returns the fallback style and icon for an unsupported status", () => {
    const { styles, Icon } = getStatusStyleAndIcon("unsupported");
    expect(styles).toBe("status status-fallback");
    expect(Icon).toBeDefined();
  });
});
