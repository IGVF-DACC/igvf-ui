import { render, screen, within } from "@testing-library/react";
import { UC } from "../../../lib/constants";
import PageComponent from "../index";

describe("Test CHEVRON_NAV page component", () => {
  it("renders chevron navigation with multiple kinds of links", () => {
    render(
      <PageComponent
        spec={`CHEVRON_NAV${UC.newline}First Topic=#first-topic|404040${UC.newline}Second Topic=https://www.genome.gov/|202020${UC.newline}Third Topic=/pages/help|f0f0f0`}
      />,
    );

    // Make sure a nav appears.
    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();

    // Make sure the nav has a ul.
    const ul = screen.getByRole("list");
    expect(ul).toBeInTheDocument();

    // Make sure the ul has the correct number of li as specified in the spec text.
    const lis = screen.getAllByRole("listitem");
    expect(lis).toHaveLength(3);

    // Make sure the first li has the correct text and href.
    const firstItem = within(lis[0]).getByRole("link");
    expect(firstItem).toHaveTextContent("First Topic");
    expect(firstItem).toHaveAttribute("href", "#first-topic");

    // Make sure the second li has the correct text and href.
    const secondItem = within(lis[1]).getByRole("link");
    expect(secondItem).toHaveTextContent("Second Topic");
    expect(secondItem).toHaveAttribute("href", "https://www.genome.gov/");

    // Make sure the third li has the correct text and href.
    const thirdItem = within(lis[2]).getByRole("link");
    expect(thirdItem).toHaveTextContent("Third Topic");
    expect(thirdItem).toHaveAttribute("href", "/pages/help");
  });

  it("renders nothing if no items given in the spec text", () => {
    render(<PageComponent spec={`CHEVRON_NAV${UC.newline}`} />);

    // Make sure a nav does not appear.
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});
