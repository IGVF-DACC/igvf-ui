import { fireEvent, render, screen } from "@testing-library/react";
import {
  DataArea,
  DataAreaTitle,
  DataAreaTitleLink,
  DataItemLabel,
  DataItemList,
  DataItemValue,
  DataItemValueAnnotated,
  DataItemValueBoolean,
  DataItemValueUrl,
  DataPanel,
} from "../data-area";
import SessionContext from "../session-context";
import { TooltipPortalRoot } from "../tooltip";
import Status from "../status";

describe("Test the DataArea component", () => {
  it("properly renders a data panel with default Tailwind CSS classes", () => {
    render(
      <>
        <DataPanel>
          <DataArea>
            <DataItemLabel>Status</DataItemLabel>
            <DataItemValue>
              <Status status="in progress" />
            </DataItemValue>
            <DataItemLabel isSmall>Status Small</DataItemLabel>
            <DataItemValue isSmall>
              <Status status="in progress" />
            </DataItemValue>
          </DataArea>
        </DataPanel>
        <DataAreaTitle>Treatments</DataAreaTitle>
      </>
    );

    const dataPanel = screen.getByTestId("datapanel");
    expect(dataPanel).toBeInTheDocument();

    const dataArea = screen.getByTestId("dataarea");
    expect(dataArea).toBeInTheDocument();

    const dataAreaTitle = screen.getByTestId("dataareatitle");
    expect(dataAreaTitle).toBeInTheDocument();

    const dataItemLabels = screen.getAllByTestId("dataitemlabel");
    expect(dataItemLabels[0]).toBeInTheDocument();
    expect(dataItemLabels[0]).toHaveClass(
      "break-words font-semibold text-data-label first:mt-0 dark:text-gray-400 mt-4 @xs:mt-0"
    );

    const values = screen.getAllByTestId("dataitemvalue");
    expect(values[0]).toBeInTheDocument();
    expect(values[0]).toHaveClass(
      "font-medium text-data-value last:mb-0 mb-4 @md:mb-0 @md:min-w-0"
    );
    expect(values[1]).toBeInTheDocument();
    expect(values[1]).toHaveClass(
      "font-medium text-data-value last:mb-0 mb-2 @xs:mb-0 @xs:min-w-0"
    );

    // Check the CSS classes include "@md:grid @md:grid-cols-data-item @md:gap-4"
    expect(dataArea).toHaveClass("@md:grid @md:grid-cols-data-item @md:gap-4");
  });

  it("properly renders a data panel with custom Tailwind CSS classes", () => {
    render(
      <>
        <DataPanel className="text-xs" isPaddingSuppressed>
          <DataArea isSmall>
            <DataItemLabel className="font-black" isSmall>
              Status
            </DataItemLabel>
            <DataItemValueUrl>
              <a
                href="https://igvf.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://igvf.org/
              </a>
            </DataItemValueUrl>
          </DataArea>
        </DataPanel>
        <DataAreaTitle>
          Treatments
          <DataAreaTitleLink href="/profiles" label="Link to profiles page">
            Profiles
          </DataAreaTitleLink>
        </DataAreaTitle>
      </>
    );

    const dataPanel = screen.getByTestId("datapanel");
    expect(dataPanel).toBeInTheDocument();
    expect(dataPanel).toHaveClass("text-xs");

    const dataArea = screen.getByTestId("dataarea");
    expect(dataArea).toBeInTheDocument();
    expect(dataArea).toHaveClass(
      "@xs:grid @xs:grid-cols-data-item-small @xs:gap-2 text-sm"
    );

    const dataAreaTitle = screen.getByTestId("dataareatitle");
    expect(dataAreaTitle).toBeInTheDocument();
    expect(dataAreaTitle).toHaveClass("mb-1 mt-4 text-2xl font-light");

    const dataItemLabel = screen.getByTestId("dataitemlabel");
    expect(dataItemLabel).toBeInTheDocument();
    expect(dataItemLabel).toHaveClass(
      "break-words font-semibold text-data-label first:mt-0 dark:text-gray-400 mt-2 @xs:mt-0 font-black"
    );

    const value = screen.getByTestId("dataitemvalue");
    expect(value).toBeInTheDocument();
    expect(value).toHaveClass(
      "font-medium text-data-value last:mb-0 mb-4 @md:mb-0 @md:min-w-0 break-all"
    );
  });

  it("handles the `secDirTitle` prop for the DataAreaTitle component", () => {
    render(
      <DataAreaTitle secDirTitle="Treatments">
        <DataAreaTitleLink href="/profiles" label="Link to profiles page">
          Profiles
        </DataAreaTitleLink>
      </DataAreaTitle>
    );

    const dataAreaTitle = screen.getByTestId("dataareatitle");
    expect(dataAreaTitle).toBeInTheDocument();
    expect(dataAreaTitle).toHaveAttribute("data-sec-dir", "Treatments");
  });

  it("handles the `id` prop for the DataAreaTitle component", () => {
    render(<DataAreaTitle id="test-section">Test Section Title</DataAreaTitle>);

    const dataAreaTitle = screen.getByTestId("dataareatitle");
    expect(dataAreaTitle).toBeInTheDocument();
    expect(dataAreaTitle).toHaveAttribute("id", "sec-dir-test-section");
  });
});

describe("Test DataItemList", () => {
  it("renders a list of items that's not collapsible", () => {
    render(
      <DataItemList>
        {"Item 1"}
        {"Item 2"}
        {"Item 3"}
        {"Item 4"}
        {"Item 5"}
        {"Item 6"}
        {"Item 7"}
      </DataItemList>
    );

    const items = screen.getAllByText(/Item [0-9]/);
    expect(items.length).toBe(7);

    const listItems = screen.getAllByRole("listitem");
    listItems.forEach((item) => {
      expect(item).toHaveClass("border-data-list-item");
    });
  });

  it("renders a collapsible list that collapses when the control is clicked", () => {
    render(
      <DataItemList isCollapsible maxItemsBeforeCollapse={4}>
        {"Item 1"}
        {"Item 2"}
        {"Item 3"}
        {"Item 4"}
        {"Item 5"}
        {"Item 6"}
        {"Item 7"}
      </DataItemList>
    );

    let items = screen.getAllByText(/Item [0-9]/);
    expect(items.length).toBe(4);

    const button = screen.getByTestId("collapse-control-vertical");
    fireEvent.click(button);
    items = screen.getAllByText(/Item [0-9]/);
    expect(items.length).toBe(7);

    fireEvent.click(button);
    items = screen.getAllByText(/Item [0-9]/);
    expect(items.length).toBe(4);
  });

  it("renders a single-item list and doesn't contain a border class", () => {
    render(<DataItemList>{"Item 1"}</DataItemList>);

    const listItems = screen.getAllByRole("listitem");
    listItems.forEach((item) => {
      expect(item).not.toHaveClass("border-data-list-item");
    });
  });

  it("renders a list for URLs with the break-all class", () => {
    render(
      <DataItemList isUrlList>
        <a href="https://igvf.org/" target="_blank" rel="noopener noreferrer">
          https://igvf.org/
        </a>
        <a href="https://igvf.org/" target="_blank" rel="noopener noreferrer">
          https://igvf.org/
        </a>
        <a href="https://igvf.org/" target="_blank" rel="noopener noreferrer">
          https://igvf.org/
        </a>
      </DataItemList>
    );

    const listItems = screen.getAllByRole("listitem");
    listItems.forEach((item) => {
      expect(item).toHaveClass("break-all");
    });
  });
});

describe("Test the DataItemValueBoolean component", () => {
  it("renders the boolean value true", () => {
    render(<DataItemValueBoolean>{true}</DataItemValueBoolean>);
    expect(screen.getByText("True")).toBeInTheDocument();
  });

  it("renders the boolean value false", () => {
    render(<DataItemValueBoolean>{false}</DataItemValueBoolean>);
    expect(screen.getByText("False")).toBeInTheDocument();
  });

  it('renders nothing when the value is "undefined"', () => {
    render(<DataItemValueBoolean>{undefined}</DataItemValueBoolean>);
    expect(screen.queryByText("True")).not.toBeInTheDocument();
    expect(screen.queryByText("False")).not.toBeInTheDocument();
  });

  it('renders nothing when the value is "null"', () => {
    render(<DataItemValueBoolean>{null}</DataItemValueBoolean>);
    expect(screen.queryByText("True")).not.toBeInTheDocument();
    expect(screen.queryByText("False")).not.toBeInTheDocument();
  });
});

describe("Test the DataItemValueAnnotated component", () => {
  function renderWithSession(ui, profiles = {}) {
    const providerValue = {
      session: null,
      sessionProperties: null,
      profiles,
      collectionTitles: null,
      dataProviderUrl: null,
    };
    return render(
      <SessionContext.Provider value={providerValue}>
        <TooltipPortalRoot />
        {ui}
      </SessionContext.Provider>
    );
  }

  it("renders a single string value with annotation", () => {
    const profiles = {
      File: {
        properties: {
          content_type: {
            type: "string",
            enum_descriptions: {
              fastq: "FASTQ file format",
            },
          },
        },
      },
    };

    renderWithSession(
      <DataItemValueAnnotated objectType="File" propertyName="content_type">
        fastq
      </DataItemValueAnnotated>,
      profiles
    );

    expect(screen.getByText("fastq")).toBeInTheDocument();
  });

  it("renders an array of string values with annotations", () => {
    const profiles = {
      File: {
        properties: {
          file_format: {
            type: "string",
            enum_descriptions: {
              bam: "BAM file format",
              fastq: "FASTQ file format",
              bed: "BED file format",
            },
          },
        },
      },
    };

    renderWithSession(
      <DataItemValueAnnotated objectType="File" propertyName="file_format">
        {["fastq", "bam", "bed"]}
      </DataItemValueAnnotated>,
      profiles
    );

    expect(screen.getByText("fastq")).toBeInTheDocument();
    expect(screen.getByText("bam")).toBeInTheDocument();
    expect(screen.getByText("bed")).toBeInTheDocument();
  });

  it("de-duplicates array values", () => {
    const profiles = {
      File: {
        properties: {
          status: {
            type: "string",
            enum_descriptions: {
              released: "Released status",
            },
          },
        },
      },
    };

    renderWithSession(
      <DataItemValueAnnotated objectType="File" propertyName="status">
        {["released", "released", "released"]}
      </DataItemValueAnnotated>,
      profiles
    );

    const elements = screen.getAllByText("released");
    expect(elements.length).toBe(1);
  });

  it("sorts array values alphabetically", () => {
    const profiles = {
      File: {
        properties: {
          file_format: {
            type: "string",
            enum_descriptions: {
              bam: "BAM file format",
              fastq: "FASTQ file format",
              bed: "BED file format",
            },
          },
        },
      },
    };

    renderWithSession(
      <DataItemValueAnnotated objectType="File" propertyName="file_format">
        {["fastq", "bam", "bed"]}
      </DataItemValueAnnotated>,
      profiles
    );

    const listItems = screen.getAllByText(/bam|bed|fastq/);
    // After sorting: bam, bed, fastq
    expect(listItems[0]).toHaveTextContent("bam");
    expect(listItems[1]).toHaveTextContent("bed");
    expect(listItems[2]).toHaveTextContent("fastq");
  });

  it("applies custom className to the component", () => {
    const profiles = {
      File: {
        properties: {
          content_type: {
            type: "string",
            enum_descriptions: {
              fastq: "FASTQ file format",
            },
          },
        },
      },
    };

    renderWithSession(
      <DataItemValueAnnotated
        objectType="File"
        propertyName="content_type"
        className="custom-class"
      >
        fastq
      </DataItemValueAnnotated>,
      profiles
    );

    const dataItemValue = screen.getByTestId("dataitemvalue");
    expect(dataItemValue).toHaveClass("custom-class");
  });

  it("renders with isSmall prop", () => {
    const profiles = {
      File: {
        properties: {
          content_type: {
            type: "string",
            enum_descriptions: {
              fastq: "FASTQ file format",
            },
          },
        },
      },
    };

    renderWithSession(
      <DataItemValueAnnotated
        objectType="File"
        propertyName="content_type"
        isSmall
      >
        fastq
      </DataItemValueAnnotated>,
      profiles
    );

    const dataItemValue = screen.getByTestId("dataitemvalue");
    expect(dataItemValue).toHaveClass("mb-2 @xs:mb-0 @xs:min-w-0");
  });

  it("renders with externalAnnotations for a single value", () => {
    const externalAnnotations = {
      active: "This item is currently active.",
      inactive: "This item is inactive.",
    };

    renderWithSession(
      <DataItemValueAnnotated externalAnnotations={externalAnnotations}>
        active
      </DataItemValueAnnotated>
    );

    expect(screen.getByText("active")).toBeInTheDocument();
  });

  it("renders with externalAnnotations for multiple values", () => {
    const externalAnnotations = {
      high: "High priority",
      medium: "Medium priority",
      low: "Low priority",
    };

    renderWithSession(
      <DataItemValueAnnotated externalAnnotations={externalAnnotations}>
        {["high", "low", "medium"]}
      </DataItemValueAnnotated>
    );

    // Check all values are rendered.
    expect(screen.getByText("high")).toBeInTheDocument();
    expect(screen.getByText("low")).toBeInTheDocument();
    expect(screen.getByText("medium")).toBeInTheDocument();

    // Verify they're sorted alphabetically.
    const listItems = screen.getAllByText(/high|low|medium/);
    expect(listItems[0]).toHaveTextContent("high");
    expect(listItems[1]).toHaveTextContent("low");
    expect(listItems[2]).toHaveTextContent("medium");
  });
});
