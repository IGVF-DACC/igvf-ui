import { fireEvent, render, screen } from "@testing-library/react";
import "../../__mocks__/intersectionObserverMock";
import "../../__mocks__/next-router-mock";
import SessionContext from "../../session-context";
import CollectionTable from "../table";
import "../../__mocks__/navigator";
import profiles from "../__mocks__/profiles";

describe("Test CollectionTable", () => {
  const collection = [
    {
      "@id": "/documents/05614b59-a421-47db-b4f7-5c7c8954c7e9/",
      "@type": ["Document", "Item"],
      aliases: ["j-michael-cherry:characterization_sequencing_insert"],
      attachment: {
        href: "@@download/attachment/mouse_H3K4me3_07-473_validation_Hardison.pdf",
        type: "application/pdf",
        md5sum: "a7c2c98ff7d0f198fdbc6f0ccbfcb411",
        download: "mouse_H3K4me3_07-473_validation_Hardison.pdf",
      },
      award: "/awards/1UM1HG011996-01/",
      description: "Characterization of a sample using sequencing.",
      lab: "/labs/j-michael-cherry/",
      status: "in progress",
      submitted_by: "/users/3787a0ac-f13a-40fc-a524-69628b04cd59/",
      uuid: "05614b59-a421-47db-b4f7-5c7c8954c7e9",
    },
  ];

  it("checks and unchecks column checkboxes", () => {
    render(
      <SessionContext.Provider value={{ profiles }}>
        <CollectionTable
          collection={collection}
          pagerStatus={{ itemsPerPage: 10, pageIndex: 1, totalPages: 1 }}
        />
      </SessionContext.Provider>
    );

    // Click the "Show / Hide Columns" button and make sure the column selector modal appears.
    const showHideColumnsButton = screen.getByText("Show / Hide Columns");
    expect(showHideColumnsButton).toBeInTheDocument();
    fireEvent.click(showHideColumnsButton);
    const columnSelectorModal = screen.getByRole("dialog");
    expect(columnSelectorModal).toBeInTheDocument();

    // Make sure all checkboxes are checked.
    const checkboxes = screen.getAllByTestId("checkbox-label");
    const checkboxCount = checkboxes.length;
    const beforeCheckedCheckboxes = checkboxes.filter(
      (checkbox) => checkbox.querySelector("input").checked
    );
    expect(beforeCheckedCheckboxes.length).toEqual(checkboxCount);

    // Uncheck the first checkbox and make sure it's unchecked.
    fireEvent.click(checkboxes[0]);
    const afterCheckedCheckboxes = checkboxes.filter(
      (checkbox) => checkbox.querySelector("input").checked
    );
    expect(afterCheckedCheckboxes.length).toEqual(checkboxCount - 1);

    // Recheck the first checkbox and make sure it's checked.
    fireEvent.click(checkboxes[0]);
    const afterAfterCheckedCheckboxes = checkboxes.filter(
      (checkbox) => checkbox.querySelector("input").checked
    );
    expect(afterAfterCheckedCheckboxes.length).toEqual(checkboxCount);

    // Close the column selector through typing the escape key.
    fireEvent.keyDown(columnSelectorModal, { key: "Escape", code: "Escape" });
    expect(columnSelectorModal).not.toBeInTheDocument();
  });

  it("lets you select and deselect all checkboxes at once", () => {
    render(
      <SessionContext.Provider value={{ profiles }}>
        <CollectionTable
          collection={collection}
          pagerStatus={{ itemsPerPage: 10, pageIndex: 1, totalPages: 1 }}
        />
      </SessionContext.Provider>
    );

    // Make sure the "Select All Columns" and "Hide All Columns" buttons are present.
    const showHideColumnsButton = screen.getByText("Show / Hide Columns");
    fireEvent.click(showHideColumnsButton);
    let columnSelectorModal = screen.getByRole("dialog");
    expect(columnSelectorModal).toBeInTheDocument();
    const selectAllButton = screen.getByText("Show All Columns");
    expect(selectAllButton).toBeInTheDocument();
    const hideAllButton = screen.getByText("Hide All Columns");
    expect(hideAllButton).toBeInTheDocument();

    // Click the "Hide All Columns" button and make sure all checkboxes are unchecked.
    fireEvent.click(hideAllButton);
    const checkboxes = screen.getAllByTestId("checkbox-label");
    const checkedCheckboxes = checkboxes.filter(
      (checkbox) => checkbox.querySelector("input").checked
    );
    expect(checkedCheckboxes.length).toEqual(0);

    // Click the "Select All Columns" button and make sure all checkboxes are checked.
    fireEvent.click(selectAllButton);
    const afterCheckedCheckboxes = checkboxes.filter(
      (checkbox) => checkbox.querySelector("input").checked
    );
    expect(afterCheckedCheckboxes.length).toEqual(checkboxes.length);

    // Close the column selector by clicking the X button in the header.
    const closeDialogButton = screen.getByRole("button", {
      name: "Close dialog",
    });
    fireEvent.click(closeDialogButton);
    expect(columnSelectorModal).not.toBeInTheDocument();

    // Open the column selector again and close it through the "Close" button.
    fireEvent.click(showHideColumnsButton);
    columnSelectorModal = screen.getByRole("dialog");
    const closeButton = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeButton);
    expect(columnSelectorModal).not.toBeInTheDocument();
  });

  it("lets the user copy a URL with hidden columns to the clipboard", async () => {
    render(
      <SessionContext.Provider value={{ profiles }}>
        <CollectionTable
          collection={collection}
          pagerStatus={{ itemsPerPage: 10, pageIndex: 1, totalPages: 1 }}
        />
      </SessionContext.Provider>
    );

    // Open the column selector, uncheck the first checkbox, the close the column selector.
    const showHideColumnsButton = screen.getByText("Show / Hide Columns");
    fireEvent.click(showHideColumnsButton);
    const checkboxes = screen.getAllByTestId("checkbox-label");
    fireEvent.click(checkboxes[0]);
    const closeButton = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeButton);

    // Click the "Copy URL Columns" button and make sure the URL gets copied to the clipboard.
    const copyUrlButton = screen.getByRole("button", {
      name: "Copy URL Columns",
    });
    const copyIcon = screen.getByTestId("icon-clipboard-document-check");
    expect(copyIcon).toBeInTheDocument();
    fireEvent.click(copyUrlButton);
    await screen.findByTestId("icon-check");
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "http://localhost/#hidden=attachment"
    );
  });

  it("shows buttons for when the URL has hidden columns encoded in it, and clearing them works", async () => {
    // Encode a URL with a hidden column specified.
    const savedWindowLocation = window.location;
    delete window.location;
    window.location = new URL(
      "http://localhost:3000/documents#hidden=attachment"
    );

    render(
      <SessionContext.Provider value={{ profiles }}>
        <CollectionTable
          collection={collection}
          pagerStatus={{ itemsPerPage: 10, pageIndex: 1, totalPages: 1 }}
        />
      </SessionContext.Provider>
    );

    // Make sure the button to clear the hidden columns from the URL is present.
    const clearURLColumnsButton = await screen.findByText("Clear URL Columns");

    // Test that clicking the "Clear URL Columns" button removes the hidden column from the URL.
    fireEvent.click(clearURLColumnsButton);
    expect(window.location.href).toEqual("http://localhost:3000/documents");

    window.location = savedWindowLocation;
  });

  it("shows the button to save the hash tag to localStorage", async () => {
    // Encode a URL with a hidden column specified.
    const savedWindowLocation = window.location;
    delete window.location;
    window.location = new URL(
      "http://localhost:3000/documents#hidden=attachment"
    );

    render(
      <SessionContext.Provider value={{ profiles }}>
        <CollectionTable
          collection={collection}
          pagerStatus={{ itemsPerPage: 10, pageIndex: 1, totalPages: 1 }}
        />
      </SessionContext.Provider>
    );

    // Make sure the button for saving the hidden columns to local storage appears.
    const saveColumnButtons = await screen.findByText(
      "Save URL Columns to Browser"
    );

    // Test that clicking the "Clear URL Columns" button removes the hidden column from the URL.
    fireEvent.click(saveColumnButtons);
    expect(window.location.href).toEqual("http://localhost:3000/documents");

    window.location = savedWindowLocation;
  });

  it("reacts to hovering the mouse over the table", async () => {
    render(
      <SessionContext.Provider value={{ profiles }}>
        <CollectionTable
          collection={collection}
          pagerStatus={{ itemsPerPage: 10, pageIndex: 1, totalPages: 1 }}
        />
      </SessionContext.Provider>
    );

    // Make sure the scroll indicators are not present.
    let scrollIndicator = screen.queryByTestId("scroll-indicator-right");
    expect(scrollIndicator).toBeNull();

    // Hover over the table to assure full Jest coverage. JSDom doesn't allow the scroll indicators
    // to appear, so we can't test the result of hovering.
    const table = screen.getByRole("table");
    fireEvent.pointerEnter(table);
    fireEvent.pointerLeave(table);
  });

  it("renders no table if profiles haven't loaded yet", () => {
    render(
      <SessionContext.Provider value={{ profiles: null }}>
        <CollectionTable
          collection={collection}
          pagerStatus={{ itemsPerPage: 10, pageIndex: 1, totalPages: 1 }}
        />
      </SessionContext.Provider>
    );

    const table = screen.queryByRole("table");
    expect(table).toBeNull();
  });
});
