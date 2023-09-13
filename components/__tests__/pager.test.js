import { fireEvent, render, screen } from "@testing-library/react";
import Pager from "../pager";

describe("Test the pager component in different conditions", () => {
  it("renders a seven-page pager and reacts to clicks", () => {
    const onClick = jest.fn();
    render(<Pager currentPage={1} totalPages={7} onClick={onClick} />);

    // Test conditions for current page 1
    const pagerElements = screen.getAllByRole("button");
    expect(pagerElements).toHaveLength(9);
    expect(pagerElements[0]).toHaveAttribute("disabled");
    expect(pagerElements[1].textContent).toBe("1");
    expect(pagerElements[1]).toHaveAttribute("aria-current");

    // Clicks on the Next button should increment the current page
    const nextButton = screen.getByLabelText("Next page");
    expect(nextButton).not.toHaveAttribute("disabled");
    fireEvent.click(nextButton);
    expect(onClick).toHaveBeenCalledWith(2);

    // Clicks on a specific page button should go directly to that page
    const page3Button = screen.getByLabelText("Page 3");
    fireEvent.click(page3Button);
    expect(onClick).toHaveBeenCalledWith(3);
  });

  it("renders a pager with enough pages for one ellipsis after the selected page", () => {
    const onClick = jest.fn();
    render(<Pager currentPage={1} totalPages={20} onClick={onClick} />);

    // Test that the pager has 11 list items but only 10 buttons -- one list element has ellipsis.
    const pagerListElements = screen.getAllByRole("listitem");
    expect(pagerListElements).toHaveLength(9);
    const pagerButtonElements = screen.getAllByRole("button");
    expect(pagerButtonElements).toHaveLength(8);
  });

  it("renders a pager with enough pages for one ellipsis before the selected page", () => {
    const onClick = jest.fn();
    render(<Pager currentPage={20} totalPages={20} onClick={onClick} />);

    // Test that the pager has 11 list items but only 10 buttons -- one list element has ellipsis.
    const pagerListElements = screen.getAllByRole("listitem");
    expect(pagerListElements).toHaveLength(9);
    const pagerButtonElements = screen.getAllByRole("button");
    expect(pagerButtonElements).toHaveLength(8);
  });

  it("renders a pager with enough pages for two ellipses, and react to click", () => {
    const onClick = jest.fn();
    render(<Pager currentPage={7} totalPages={20} onClick={onClick} />);

    // Go to page 7 to bring up two ellipses.
    const pagerListElements = screen.getAllByRole("listitem");
    expect(pagerListElements).toHaveLength(9);
    const pagerButtonElements = screen.getAllByRole("button");
    expect(pagerButtonElements).toHaveLength(7);

    // Clicks on the previous page button should go directly to page 6.
    const previousButton = screen.getByLabelText("Previous page");
    fireEvent.click(previousButton);
    expect(onClick).toHaveBeenCalledWith(6);
  });
});
