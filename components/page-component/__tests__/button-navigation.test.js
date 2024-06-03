import { render, screen, within } from "@testing-library/react";
import { UC } from "../../../lib/constants";
import PageComponent from "../index";

describe("Test BUTTON_NAV page component", () => {
  it("renders button navigation with multiple kinds of links", () => {
    render(
      <PageComponent
        spec={`BUTTON_NAV${UC.newline}First Topic=/topic/first|first-topic|Description of the first topic.${UC.newline}Second Topic=https://www.genome.gov|second-topic|Description of the second topic.${UC.newline}#first-topic=<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>${UC.newline}#second-topic=<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>`}
      />
    );

    // Make sure a nav appears.
    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();

    // Make sure the nav has a ul.
    const ul = screen.getByRole("list");
    expect(ul).toBeInTheDocument();

    // Make sure the ul has the correct number of li as specified in the spec text.
    const lis = screen.getAllByRole("listitem");
    expect(lis).toHaveLength(2);

    // Make sure the first li has the correct text and href.
    const firstItem = within(lis[0]).getByRole("link");
    expect(firstItem).toHaveTextContent("First Topic");
    expect(firstItem).toHaveAttribute("href", "/topic/first");

    // Make sure the second li has the correct text and href.
    const secondItem = within(lis[1]).getByRole("link");
    expect(secondItem).toHaveTextContent("Second Topic");
    expect(secondItem).toHaveAttribute("href", "https://www.genome.gov");
  });

  it("renders nothing for malformed items", () => {
    render(
      <PageComponent
        spec={`BUTTON_NAV${UC.newline}First Topic=/topic/first|first-topic${UC.newline}Second Topic=https://www.genome.gov|second-topic|Description of the second topic.${UC.newline}#first-topic=<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>${UC.newline}#second-topic=<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>`}
      />
    );

    // Make sure a nav appears.
    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();

    // Make sure the nav has a ul.
    const ul = screen.getByRole("list");
    expect(ul).toBeInTheDocument();

    // Make sure the ul has the correct number of li as specified in the spec text.
    const lis = screen.getAllByRole("listitem");
    expect(lis).toHaveLength(1);

    // Make sure the second li has the correct text and href.
    const secondItem = within(lis[0]).getByRole("link");
    expect(secondItem).toHaveTextContent("Second Topic");
    expect(secondItem).toHaveAttribute("href", "https://www.genome.gov");
  });

  it("renders nothing for items with a missing SVG", () => {
    render(
      <PageComponent
        spec={`BUTTON_NAV${UC.newline}First Topic=/topic/first|first-topic${UC.newline}Second Topic=https://www.genome.gov|second-topic|Description of the second topic.${UC.newline}#second-topic=<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>`}
      />
    );

    // Make sure a nav appears.
    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();

    // Make sure the nav has a ul.
    const ul = screen.getByRole("list");
    expect(ul).toBeInTheDocument();

    // Make sure the ul has the correct number of li as specified in the spec text.
    const lis = screen.getAllByRole("listitem");
    expect(lis).toHaveLength(1);

    // Make sure the second li has the correct text and href.
    const secondItem = within(lis[0]).getByRole("link");
    expect(secondItem).toHaveTextContent("Second Topic");
    expect(secondItem).toHaveAttribute("href", "https://www.genome.gov");
  });

  it("renders nothing if no items given in the spec text", () => {
    render(<PageComponent spec={`BUTTON_NAV${UC.newline}`} />);

    // Make sure a nav does not appear.
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});
