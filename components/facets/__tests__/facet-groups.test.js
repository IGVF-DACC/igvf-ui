import { render, screen, within } from "@testing-library/react";
import {
  getFacetsInGroup,
  FacetGroup,
  FacetGroupButton,
} from "../facet-groups";

jest.mock("next/router", () => {
  // Mock the window.location object so we can test the router.push() function.
  const location = new URL("https://www.example.com");
  location.assign = jest.fn();
  location.replace = jest.fn();
  location.reload = jest.fn();
  delete window.location;
  window.location = location;

  return {
    useRouter() {
      return {
        route: "/",
        pathname: "",
        query: "",
        asPath: "",
        push: jest.fn().mockImplementation((href) => {
          window.location.href = `https://www.example.com${href}`;
        }),
      };
    },
  };
});

describe("Test the `<FacetGroupButton>` component", () => {
  it("renders a non-selected facet group button with no selected facet terms", () => {
    const onClick = jest.fn();
    const searchResults = {
      "@id": "/search?type=HumanDonor",
      filters: [
        {
          field: "type",
          term: "HumanDonor",
          remove: "/report",
        },
      ],
    };
    const facetGroup = {
      name: "HumanDonor",
      title: "Donor",
      facet_fields: ["life_stage", "sex"],
    };

    render(
      <FacetGroupButton
        searchResults={searchResults}
        group={facetGroup}
        isSelected={false}
        onClick={onClick}
      />
    );

    // Check that the button is rendered with the correct text and icon Tailwind CSS classes.
    const groupButton = screen.getByRole("button", { name: /Donor/ });
    expect(groupButton).toBeInTheDocument();
    expect(groupButton).toHaveClass(
      "border-facet-group-button bg-facet-group-button text-facet-group-button"
    );
    const buttonIcon = screen.getByTestId("icon-filter");
    expect(buttonIcon).toBeInTheDocument();
    expect(buttonIcon).toHaveClass(
      "[&>g>circle]:fill-none [&>g>circle]:stroke-black [&>g>g]:stroke-black"
    );

    // Check that the aria-label is correct.
    expect(groupButton).toHaveAttribute("aria-label", "Donor filter group");

    groupButton.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders a selected facet group button with no selected facet terms", () => {
    const onClick = jest.fn();
    const searchResults = {
      "@id": "/search?type=HumanDonor",
      filters: [
        {
          field: "type",
          term: "HumanDonor",
          remove: "/search?sex=female",
        },
      ],
    };
    const facetGroup = {
      name: "HumanDonor",
      title: "Donor",
      facet_fields: ["life_stage", "sex"],
    };

    render(
      <FacetGroupButton
        searchResults={searchResults}
        group={facetGroup}
        isSelected={true}
        onClick={onClick}
      />
    );

    const groupButton = screen.getByRole("button", { name: /Donor/ });
    expect(groupButton).toBeInTheDocument();
    expect(groupButton).toHaveClass(
      "border-facet-group-button-selected bg-facet-group-button-selected text-facet-group-button-selected"
    );
    const buttonIcon = screen.getByTestId("icon-filter");
    expect(buttonIcon).toBeInTheDocument();
    expect(buttonIcon).toHaveClass(
      "[&>g>circle]:fill-none [&>g>circle]:stroke-black [&>g>g]:stroke-black"
    );

    // Check that the aria-label is correct.
    expect(groupButton).toHaveAttribute(
      "aria-label",
      "Donor selected filter group"
    );

    groupButton.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders a non-selected facet group button with selected facet terms", () => {
    const onClick = jest.fn();
    const searchResults = {
      "@id": "/search?type=HumanDonor&sex=female",
      filters: [
        {
          field: "sex",
          term: "female",
          remove: "/search?type=HumanDonor",
        },
        {
          field: "type",
          term: "HumanDonor",
          remove: "/search?sex=female",
        },
      ],
    };
    const facetGroup = {
      name: "HumanDonor",
      title: "Donor",
      facet_fields: ["life_stage", "sex"],
    };

    render(
      <FacetGroupButton
        searchResults={searchResults}
        group={facetGroup}
        isSelected={false}
        onClick={onClick}
      />
    );

    const groupButton = screen.getByRole("button", { name: /Donor/ });
    expect(groupButton).toBeInTheDocument();
    expect(groupButton).toHaveClass(
      "border-facet-group-button bg-facet-group-button text-facet-group-button"
    );
    const buttonIcon = screen.getByTestId("icon-filter");
    expect(buttonIcon).toBeInTheDocument();
    expect(buttonIcon).toHaveClass(
      "[&>g>circle]:fill-black [&>g>g]:stroke-white"
    );

    // Check that the aria-label is correct.
    expect(groupButton).toHaveAttribute("aria-label", "Donor filter group");

    groupButton.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders a selected facet group button with selected facet terms", () => {
    const onClick = jest.fn();
    const searchResults = {
      "@id": "/search?type=HumanDonor&sex=female",
      filters: [
        {
          field: "sex",
          term: "female",
          remove: "/search?type=HumanDonor",
        },
        {
          field: "type",
          term: "HumanDonor",
          remove: "/search?sex=female",
        },
      ],
    };
    const facetGroup = {
      name: "HumanDonor",
      title: "Donor",
      facet_fields: ["life_stage", "sex"],
    };

    render(
      <FacetGroupButton
        searchResults={searchResults}
        group={facetGroup}
        isSelected={true}
        onClick={onClick}
      />
    );

    const groupButton = screen.getByRole("button", { name: /Donor/ });
    expect(groupButton).toBeInTheDocument();
    expect(groupButton).toHaveClass(
      "border-facet-group-button-selected bg-facet-group-button-selected text-facet-group-button-selected"
    );
    const buttonIcon = screen.getByTestId("icon-filter");
    expect(buttonIcon).toBeInTheDocument();
    expect(buttonIcon).toHaveClass(
      "[&>g>circle]:fill-black [&>g>g]:stroke-white"
    );

    groupButton.click();

    // Check that the aria-label is correct.
    expect(groupButton).toHaveAttribute(
      "aria-label",
      "Donor selected filter group"
    );

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("Test the `getFacetsInGroup()` function", () => {
  it("returns only the facets in the given group", () => {
    const searchResults = {
      "@id": "/search?type=HumanDonor",
      facets: [
        {
          field: "type",
          title: "Data Type",
        },
        {
          field: "sex",
          title: "Sex",
        },
        {
          field: "lab.title",
          title: "Lab",
        },
      ],
    };
    const facetGroup = {
      name: "HumanDonor",
      title: "Donor",
      facet_fields: ["life_stage", "sex"],
    };

    const groupFacets = getFacetsInGroup(searchResults, facetGroup);
    expect(groupFacets.length).toBe(1);
    expect(groupFacets[0]).toEqual({
      field: "sex",
      title: "Sex",
    });
  });

  it("returns all facets except 'type' when no group given", () => {
    const searchResults = {
      "@id": "/search?type=HumanDonor",
      facets: [
        {
          field: "type",
          title: "Data Type",
        },
        {
          field: "sex",
          title: "Sex",
        },
        {
          field: "lab.title",
          title: "Lab",
        },
      ],
    };

    const groupFacets = getFacetsInGroup(searchResults, null);
    expect(groupFacets.length).toBe(2);
    expect(groupFacets[0]).toEqual({
      field: "sex",
      title: "Sex",
    });
    expect(groupFacets[1]).toEqual({
      field: "lab.title",
      title: "Lab",
    });
  });
});

describe("Test the `<FacetGroup>` component", () => {
  it("renders a single facet group with no selected terms", () => {
    const searchResults = {
      "@id": "/search?type=HumanDonor",
      facets: [
        {
          field: "type",
          title: "Data Type",
          terms: [
            {
              key: "Donor",
              doc_count: 7,
            },
            {
              key: "HumanDonor",
              doc_count: 7,
            },
          ],
        },
        {
          field: "sex",
          title: "Sex",
          terms: [
            {
              key: "female",
              doc_count: 6,
            },
            {
              key: "male",
              doc_count: 1,
            },
          ],
        },
        {
          field: "award.component",
          title: "Award",
          terms: [
            {
              key: "networks",
              doc_count: 4,
            },
            {
              key: "data coordination",
              doc_count: 3,
            },
          ],
        },
        {
          field: "lab.title",
          title: "Lab",
          terms: [
            {
              key: "Chongyuan Luo, UCLA",
              doc_count: 4,
            },
            {
              key: "J. Michael Cherry, Stanford",
              doc_count: 3,
            },
          ],
        },
      ],
    };
    const facetGroup = {
      name: "HumanDonor",
      title: "Donor",
      facet_fields: ["lab.title", "sex"],
    };

    render(<FacetGroup searchResults={searchResults} group={facetGroup} />);

    // Test that two facets get rendered.
    const facets = screen.getAllByTestId(/^facet-/);
    expect(facets.length).toBe(2);

    // Check that the facets have the predicted order and correct titles.
    let facetTitle = within(facets[0]).getByRole("heading", { name: /Sex/ });
    expect(facetTitle).toBeInTheDocument();
    facetTitle = within(facets[1]).getByRole("heading", { name: /Lab/ });
    expect(facetTitle).toBeInTheDocument();

    // Make sure each facet has the correct number of terms.
    const facetList = within(facets[0]).getByRole("list");
    const facetTerms = within(facetList).getAllByRole("listitem");
    expect(facetTerms.length).toBe(2);

    // Check that the first term has the correct label and is not checked.
    let facetTermCheckbox = within(facetTerms[0]).getByRole("checkbox");
    expect(facetTermCheckbox).toBeInTheDocument();
    expect(facetTermCheckbox).toHaveAttribute(
      "aria-label",
      expect.stringMatching(/^female with 6 results$/)
    );
    expect(facetTermCheckbox).not.toHaveAttribute("checked");

    // Check that the second term has the correct label and is not checked.
    facetTermCheckbox = within(facetTerms[1]).getByRole("checkbox");
    expect(facetTermCheckbox).toBeInTheDocument();
    expect(facetTermCheckbox).toHaveAttribute(
      "aria-label",
      expect.stringMatching(/^male with 1 result$/)
    );
    expect(facetTermCheckbox).not.toHaveAttribute("checked");

    // Make sure clicking a facet term updates the URL.
    facetTermCheckbox = within(facetTerms[0]).getByRole("checkbox");
    facetTermCheckbox.click();
    expect(window.location.search).toBe("?type=HumanDonor&sex=female");
  });

  it("renders a single facet group with selected terms", () => {
    const searchResults = {
      "@id":
        "/search?type=HumanDonor&sex=female&lab.title=Chongyuan+Luo%2C+UCLA",
      facets: [
        {
          field: "type",
          title: "Data Type",
          terms: [
            {
              key: "Donor",
              doc_count: 7,
            },
            {
              key: "HumanDonor",
              doc_count: 7,
            },
          ],
        },
        {
          field: "sex",
          title: "Sex",
          terms: [
            {
              key: "female",
              doc_count: 6,
            },
            {
              key: "male",
              doc_count: 1,
            },
          ],
        },
        {
          field: "award.component",
          title: "Award",
          terms: [
            {
              key: "networks",
              doc_count: 4,
            },
            {
              key: "data coordination",
              doc_count: 3,
            },
          ],
        },
        {
          field: "lab.title",
          title: "Lab",
          terms: [
            {
              key: "Chongyuan Luo, UCLA",
              doc_count: 4,
            },
            {
              key: "J. Michael Cherry, Stanford",
              doc_count: 3,
            },
          ],
        },
      ],
    };
    const facetGroup = {
      name: "HumanDonor",
      title: "Donor",
      facet_fields: ["lab.title", "sex"],
    };

    render(<FacetGroup searchResults={searchResults} group={facetGroup} />);

    // Test that two facets get rendered.
    const facets = screen.getAllByTestId(/^facet-/);
    expect(facets.length).toBe(2);

    // Check that the facets have the predicted order and correct titles.
    let facetTitle = within(facets[0]).getByRole("heading", { name: /Sex/ });
    expect(facetTitle).toBeInTheDocument();
    facetTitle = within(facets[1]).getByRole("heading", { name: /Lab/ });
    expect(facetTitle).toBeInTheDocument();

    // Make sure each facet has the correct number of terms.
    const facetList = within(facets[0]).getByRole("list");
    const facetTerms = within(facetList).getAllByRole("listitem");
    expect(facetTerms.length).toBe(2);

    // Check that the first term has the correct label and is not checked.
    let facetTermCheckbox = within(facetTerms[0]).getByRole("checkbox");
    expect(facetTermCheckbox).toBeInTheDocument();
    expect(facetTermCheckbox).toHaveAttribute(
      "aria-label",
      expect.stringMatching(/^female with 6 results$/)
    );
    expect(facetTermCheckbox).toHaveAttribute("checked");

    // Check that the second term has the correct label and is not checked.
    facetTermCheckbox = within(facetTerms[1]).getByRole("checkbox");
    expect(facetTermCheckbox).toBeInTheDocument();
    expect(facetTermCheckbox).toHaveAttribute(
      "aria-label",
      expect.stringMatching(/^male with 1 result$/)
    );
    expect(facetTermCheckbox).not.toHaveAttribute("checked");

    // Make sure clicking a facet term updates the URL.
    facetTermCheckbox = within(facetTerms[0]).getByRole("checkbox");
    facetTermCheckbox.click();
    expect(window.location.search).toBe(
      "?type=HumanDonor&lab.title=Chongyuan+Luo%2C+UCLA"
    );
  });

  it("renders facets without a group and with selected terms", () => {
    const searchResults = {
      "@id": "/search?type=HumanDonor&award.component=networks",
      facets: [
        {
          field: "type",
          title: "Data Type",
          terms: [
            {
              key: "Donor",
              doc_count: 7,
            },
            {
              key: "HumanDonor",
              doc_count: 7,
            },
          ],
        },
        {
          field: "sex",
          title: "Sex",
          terms: [
            {
              key: "female",
              doc_count: 6,
            },
            {
              key: "male",
              doc_count: 1,
            },
          ],
        },
        {
          field: "award.component",
          title: "Award",
          terms: [
            {
              key: "networks",
              doc_count: 4,
            },
            {
              key: "data coordination",
              doc_count: 3,
            },
          ],
        },
      ],
    };

    render(<FacetGroup searchResults={searchResults} />);

    // Test that two facets get rendered -- no "type" facet should ever render.
    const facets = screen.getAllByTestId(/^facet-/);
    expect(facets.length).toBe(2);

    // Make sure no facet group buttons exist.
    const facetGroupButtonSection = screen.queryByTestId(
      "facet-group-button-section"
    );
    expect(facetGroupButtonSection).not.toBeInTheDocument();

    // Check that the facets have the predicted order and correct titles.
    let facetTitle = within(facets[0]).getByRole("heading", { name: /Sex/ });
    expect(facetTitle).toBeInTheDocument();
    facetTitle = within(facets[1]).getByRole("heading", { name: /Award/ });
    expect(facetTitle).toBeInTheDocument();

    // Make sure each facet has the correct number of terms.
    let facetList = within(facets[0]).getByRole("list");
    let facetTerms = within(facetList).getAllByRole("listitem");
    expect(facetTerms.length).toBe(2);
    facetList = within(facets[1]).getByRole("list");
    facetTerms = within(facetList).getAllByRole("listitem");
    expect(facetTerms.length).toBe(2);

    // Check that the first term of the second facet has the correct label and is checked.
    let facetTermCheckbox = within(facetTerms[0]).getByRole("checkbox");
    expect(facetTermCheckbox).toBeInTheDocument();
    expect(facetTermCheckbox).toHaveAttribute(
      "aria-label",
      expect.stringMatching(/^networks with 4 results$/)
    );
    expect(facetTermCheckbox).toHaveAttribute("checked");

    // Check that the second term has the correct label and is not checked.
    facetTermCheckbox = within(facetTerms[1]).getByRole("checkbox");
    expect(facetTermCheckbox).toBeInTheDocument();
    expect(facetTermCheckbox).toHaveAttribute(
      "aria-label",
      expect.stringMatching(/^data coordination with 3 results$/)
    );
    expect(facetTermCheckbox).not.toHaveAttribute("checked");

    // Make sure clicking a facet term updates the URL.
    facetTermCheckbox = within(facetTerms[0]).getByRole("checkbox");
    facetTermCheckbox.click();
    expect(window.location.search).toBe("?type=HumanDonor");
  });

  it("renders facets without a group and with no selected terms", () => {
    const searchResults = {
      "@id": "/search?type=HumanDonor",
      facets: [
        {
          field: "type",
          title: "Data Type",
          terms: [
            {
              key: "Donor",
              doc_count: 7,
            },
            {
              key: "HumanDonor",
              doc_count: 7,
            },
          ],
        },
        {
          field: "sex",
          title: "Sex",
          terms: [
            {
              key: "female",
              doc_count: 6,
            },
            {
              key: "male",
              doc_count: 1,
            },
          ],
        },
        {
          field: "award.component",
          title: "Award",
          terms: [
            {
              key: "networks",
              doc_count: 4,
            },
            {
              key: "data coordination",
              doc_count: 3,
            },
          ],
        },
      ],
    };

    render(<FacetGroup searchResults={searchResults} />);

    // Test that two facets get rendered -- no "type" facet should ever render.
    const facets = screen.getAllByTestId(/^facet-/);
    expect(facets.length).toBe(2);

    // Make sure no facet group buttons exist.
    const facetGroupButtonSection = screen.queryByTestId(
      "facet-group-button-section"
    );
    expect(facetGroupButtonSection).not.toBeInTheDocument();

    // Check that the facets have the predicted order and correct titles.
    let facetTitle = within(facets[0]).getByRole("heading", { name: /Sex/ });
    expect(facetTitle).toBeInTheDocument();
    facetTitle = within(facets[1]).getByRole("heading", { name: /Award/ });
    expect(facetTitle).toBeInTheDocument();

    // Make sure each facet has the correct number of terms.
    const facetList = within(facets[0]).getByRole("list");
    const facetTerms = within(facetList).getAllByRole("listitem");
    expect(facetTerms.length).toBe(2);

    // Check that the first term has the correct label and is not checked.
    let facetTermCheckbox = within(facetTerms[0]).getByRole("checkbox");
    expect(facetTermCheckbox).toBeInTheDocument();
    expect(facetTermCheckbox).toHaveAttribute(
      "aria-label",
      expect.stringMatching(/^female with 6 results$/)
    );
    expect(facetTermCheckbox).not.toHaveAttribute("checked");

    // Check that the second term has the correct label and is not checked.
    facetTermCheckbox = within(facetTerms[1]).getByRole("checkbox");
    expect(facetTermCheckbox).toBeInTheDocument();
    expect(facetTermCheckbox).toHaveAttribute(
      "aria-label",
      expect.stringMatching(/^male with 1 result$/)
    );
    expect(facetTermCheckbox).not.toHaveAttribute("checked");

    // Make sure clicking a facet term updates the URL.
    facetTermCheckbox = within(facetTerms[0]).getByRole("checkbox");
    facetTermCheckbox.click();
    expect(window.location.search).toBe("?type=HumanDonor&sex=female");
  });
});
