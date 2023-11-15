import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import PagedDataGrid from "../paged-data-grid";

describe("Test automatically managed case", () => {
  it("displays a pager and correctly advances data when going to different pages", () => {
    const data = [
      { name: "Item 1", description: "Item 1 description" },
      { name: "Item 2", description: "Item 2 description" },
      { name: "Item 3", description: "Item 3 description" },
      { name: "Item 4", description: "Item 4 description" },
      { name: "Item 5", description: "Item 5 description" },
      { name: "Item 6", description: "Item 6 description" },
    ];

    render(
      <PagedDataGrid data={data} maxItemsPerPage={3}>
        {(pageData) => {
          return (
            <table>
              <tbody>
                {pageData.map((item) => (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          );
        }}
      </PagedDataGrid>
    );

    // The pager should be displayed.
    const pager = screen.getByRole("navigation");
    expect(pager).toBeInTheDocument();

    // The resulting data should show exactly three table rows.
    expect(screen.getAllByRole("row")).toHaveLength(3);

    // The first page of data should be displayed.
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();
    expect(screen.queryByText("Item 4")).not.toBeInTheDocument();
    expect(screen.queryByText("Item 5")).not.toBeInTheDocument();
    expect(screen.queryByText("Item 6")).not.toBeInTheDocument();

    // Click the button to get the next page of data.
    fireEvent.click(screen.getByLabelText("Next page"));

    // The second page of data should be displayed.
    expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Item 2")).not.toBeInTheDocument();
    expect(screen.queryByText("Item 3")).not.toBeInTheDocument();
    expect(screen.getByText("Item 4")).toBeInTheDocument();
    expect(screen.getByText("Item 5")).toBeInTheDocument();
    expect(screen.getByText("Item 6")).toBeInTheDocument();
  });

  it("doesn't display a pager when too few items exist", () => {
    const data = [
      { name: "Item 1", description: "Item 1 description" },
      { name: "Item 2", description: "Item 2 description" },
      { name: "Item 3", description: "Item 3 description" },
    ];

    render(
      <PagedDataGrid data={data}>
        {(pageData) => {
          return (
            <table>
              <tbody>
                {pageData.map((item) => (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          );
        }}
      </PagedDataGrid>
    );

    // The pager should not be displayed.
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();

    // The resulting data should show exactly two table rows.
    expect(screen.getAllByRole("row")).toHaveLength(3);

    // The first page of data should be displayed.
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();
  });
});

describe("Test parent managed case", () => {
  it("displays a pager and correctly advances data when going to different pages", () => {
    const data = [
      { name: "Item 1", description: "Item 1 description" },
      { name: "Item 2", description: "Item 2 description" },
      { name: "Item 3", description: "Item 3 description" },
      { name: "Item 4", description: "Item 4 description" },
      { name: "Item 5", description: "Item 5 description" },
      { name: "Item 6", description: "Item 6 description" },
    ];

    function ParentComponent() {
      const [currentPageIndex, setCurrentPageIndex] = React.useState(0);

      function onPageChange(newCurrentPageIndex) {
        setCurrentPageIndex(newCurrentPageIndex);
      }

      const start = currentPageIndex * 3;
      const end = start + 3;
      const pageData = data.slice(start, end);

      return (
        <PagedDataGrid
          data={data}
          maxItemsPerPage={3}
          parentManaged={{
            currentPageIndex,
            onCurrentPageIndexChange: onPageChange,
          }}
        >
          <table>
            <tbody>
              {pageData.map((item) => (
                <tr key={item.name}>
                  <td>{item.name}</td>
                  <td>{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
          );
        </PagedDataGrid>
      );
    }

    render(<ParentComponent />);
    // The pager should be displayed.
    const pager = screen.getByRole("navigation");
    expect(pager).toBeInTheDocument();

    // The resulting data should show exactly three table rows.
    expect(screen.getAllByRole("row")).toHaveLength(3);

    // The first page of data should be displayed.
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();
    expect(screen.queryByText("Item 4")).not.toBeInTheDocument();
    expect(screen.queryByText("Item 5")).not.toBeInTheDocument();
    expect(screen.queryByText("Item 6")).not.toBeInTheDocument();

    // Click the button to get the next page of data.
    fireEvent.click(screen.getByLabelText("Next page"));

    // Make sure the `onPageChange` function was called.

    // The second page of data should be displayed.
    expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Item 2")).not.toBeInTheDocument();
    expect(screen.queryByText("Item 3")).not.toBeInTheDocument();
    expect(screen.getByText("Item 4")).toBeInTheDocument();
    expect(screen.getByText("Item 5")).toBeInTheDocument();
    expect(screen.getByText("Item 6")).toBeInTheDocument();
  });

  it("doesn't display a pager when too few items exist", () => {
    const data = [
      { name: "Item 1", description: "Item 1 description" },
      { name: "Item 2", description: "Item 2 description" },
      { name: "Item 3", description: "Item 3 description" },
    ];

    function ParentComponent() {
      const [currentPageIndex, setCurrentPageIndex] = React.useState(0);

      function onPageChange(newCurrentPageIndex) {
        setCurrentPageIndex(newCurrentPageIndex);
      }

      const start = currentPageIndex * 3;
      const end = start + 3;
      const pageData = data.slice(start, end);

      return (
        <PagedDataGrid
          data={data}
          parentManaged={{
            currentPageIndex,
            onCurrentPageIndexChange: onPageChange,
          }}
        >
          <table>
            <tbody>
              {pageData.map((item) => (
                <tr key={item.name}>
                  <td>{item.name}</td>
                  <td>{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
          );
        </PagedDataGrid>
      );
    }

    render(<ParentComponent />);

    // The pager should not be displayed.
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();

    // The resulting data should show exactly two table rows.
    expect(screen.getAllByRole("row")).toHaveLength(3);

    // The first page of data should be displayed.
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();
  });
});
