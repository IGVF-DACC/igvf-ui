import { render } from "@testing-library/react";
import Status, { StatusPreviewDetail } from "../status";

describe("Test the status badges", () => {
  it("generates the correct status-badge Tailwind CSS classes for the current state", () => {
    const { container } = render(<Status status="current" />);
    expect(container.getElementsByClassName("bg-[#00a99d]").length).toBe(1);
    expect(container.getElementsByClassName("flex").length).toBe(1);
  });

  it("generates the correct status-badge Tailwind CSS classes for the deleted state", () => {
    const { container } = render(<Status status="deleted" />);
    expect(container.getElementsByClassName("bg-[#ed1c24]").length).toBe(1);
    expect(container.getElementsByClassName("flex").length).toBe(1);
  });

  it("generates the correct status-badge Tailwind CSS classes for an unsupported state", () => {
    const { container } = render(<Status status="unsupported" />);
    expect(container.getElementsByClassName("bg-[#d0d0d0]").length).toBe(1);
    expect(container.getElementsByClassName("flex").length).toBe(1);
  });

  it("generates the correct status-badge Tailwind CSS classes for an abbreviated current state", () => {
    const { container } = render(<Status status="current" isAbbreviated />);
    expect(container.getElementsByClassName("bg-[#00a99d]").length).toBe(1);
    expect(container.getElementsByClassName("flex").length).toBe(0);
  });
});

describe("Test the `StatusPreviewDetail` component", () => {
  it("shows the preview banner for items with the `preview` status", () => {
    const item = { status: "preview" };
    const { container } = render(<StatusPreviewDetail item={item} />);
    expect(container.textContent).toContain("This object is in preview status");
  });

  it("does not show the preview banner for items with a status other than `preview`", () => {
    const item = { status: "released" };
    const { container } = render(<StatusPreviewDetail item={item} />);
    expect(container.textContent).toBe("");
  });
});
