import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LinkedTableCell } from "../matrix";
import { TooltipPortalRoot } from "../tooltip";

describe("LinkedTableCell", () => {
  it("preserves the default matrix border and link padding", () => {
    render(
      <table>
        <tbody>
          <tr>
            <LinkedTableCell href="/search/">Cell content</LinkedTableCell>
          </tr>
        </tbody>
      </table>
    );

    const link = screen.getByRole("link", { name: "Cell content" });
    expect(link.closest("td")).toHaveClass(
      "border-matrix-lines",
      "border-r",
      "border-b"
    );
    expect(link).toHaveClass("px-2", "whitespace-nowrap");
  });

  it("allows clients to override the default link padding and wrapping", () => {
    render(
      <table>
        <tbody>
          <tr>
            <LinkedTableCell
              href="/search/"
              linkClassName="px-0 whitespace-normal"
            >
              Cell content
            </LinkedTableCell>
          </tr>
        </tbody>
      </table>
    );

    const link = screen.getByRole("link", { name: "Cell content" });
    expect(link).toHaveClass("px-0", "whitespace-normal");
    expect(link).not.toHaveClass("px-2", "whitespace-nowrap");
  });

  it("uses the link as the keyboard-accessible tooltip trigger", async () => {
    const user = userEvent.setup();

    render(
      <>
        <table>
          <tbody>
            <tr>
              <LinkedTableCell
                href="/search/?assay=RNA-seq"
                tooltipContent="RNA sequencing description"
              >
                RNA-seq
              </LinkedTableCell>
            </tr>
          </tbody>
        </table>
        <TooltipPortalRoot />
      </>
    );

    const link = screen.getByRole("link", { name: "RNA-seq" });
    expect(link).toHaveAttribute(
      "aria-describedby",
      "tooltip-linked-table-cell-search-assay-rna-seq"
    );

    await user.tab();

    expect(link).toHaveFocus();
    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "RNA sequencing description"
    );
  });
});
