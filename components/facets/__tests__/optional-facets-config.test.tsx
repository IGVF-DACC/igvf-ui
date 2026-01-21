import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { OptionalFacetsConfigModal } from "../optional-facets-config";
import { ModalManagerProvider } from "../../modal-manager";
import type { SearchResultsFacet } from "../../../globals";
import * as authentication from "../../../lib/authentication";

// Mock the ResizeObserver and IntersectionObserver
jest.mock("../../__mocks__/resize-observer-mock");
jest.mock("../../__mocks__/intersectionObserverMock");

// Mock the authentication module
jest.mock("../../../lib/authentication", () => ({
  loginAuthProvider: jest.fn(),
}));

describe("OptionalFacetsConfigModal", () => {
  const mockAllFacets: SearchResultsFacet[] = [
    {
      field: "age",
      title: "Age",
      terms: [],
      total: 0,
      type: "terms",
      appended: false,
      optional: true,
      category: "Demographics",
    },
    {
      field: "ethnicity",
      title: "Ethnicity",
      terms: [],
      total: 0,
      type: "terms",
      appended: false,
      optional: true,
      category: "Demographics",
    },
    {
      field: "sex",
      title: "Sex",
      terms: [],
      total: 0,
      type: "terms",
      appended: false,
      optional: true,
      category: "Biology",
    },
    {
      field: "disease",
      title: "Disease",
      terms: [],
      total: 0,
      type: "terms",
      appended: false,
      optional: true,
      category: "Biology",
    },
    {
      field: "platform",
      title: "Platform",
      terms: [],
      total: 0,
      type: "terms",
      appended: false,
      optional: true,
    },
    {
      field: "status",
      title: "Status",
      terms: [],
      total: 0,
      type: "terms",
      appended: false,
      optional: false,
    },
  ];

  it("renders the modal with categorized optional facets", () => {
    const onSave = jest.fn();
    const onClose = jest.fn();

    render(
      <ModalManagerProvider>
        <OptionalFacetsConfigModal
          visibleOptionalFacets={[]}
          allFacets={mockAllFacets}
          onSave={onSave}
          onClose={onClose}
        />
      </ModalManagerProvider>
    );

    // Check modal is rendered
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Configure Optional Filters")).toBeInTheDocument();

    // Check categories are rendered
    expect(screen.getByText("Biology")).toBeInTheDocument();
    expect(screen.getByText("Demographics")).toBeInTheDocument();
    expect(screen.getByText("Other")).toBeInTheDocument();

    // Check optional facets are rendered (non-optional facets should not appear)
    expect(screen.getByText("Age")).toBeInTheDocument();
    expect(screen.getByText("Ethnicity")).toBeInTheDocument();
    expect(screen.getByText("Sex")).toBeInTheDocument();
    expect(screen.getByText("Disease")).toBeInTheDocument();
    expect(screen.getByText("Platform")).toBeInTheDocument();
    expect(screen.queryByText("Status")).not.toBeInTheDocument();
  });

  it("initializes checkboxes based on visibleOptionalFacets prop", () => {
    const onSave = jest.fn();
    const onClose = jest.fn();

    render(
      <ModalManagerProvider>
        <OptionalFacetsConfigModal
          visibleOptionalFacets={["age", "sex"]}
          allFacets={mockAllFacets}
          onSave={onSave}
          onClose={onClose}
        />
      </ModalManagerProvider>
    );

    // Check that Age and Sex are checked
    const ageCheckbox = screen.getByRole("checkbox", { name: "Age" });
    const sexCheckbox = screen.getByRole("checkbox", { name: "Sex" });
    const ethnicityCheckbox = screen.getByRole("checkbox", {
      name: "Ethnicity",
    });

    expect(ageCheckbox).toBeChecked();
    expect(sexCheckbox).toBeChecked();
    expect(ethnicityCheckbox).not.toBeChecked();
  });

  it("toggles checkbox when clicked", () => {
    const onSave = jest.fn();
    const onClose = jest.fn();

    render(
      <ModalManagerProvider>
        <OptionalFacetsConfigModal
          visibleOptionalFacets={[]}
          allFacets={mockAllFacets}
          onSave={onSave}
          onClose={onClose}
        />
      </ModalManagerProvider>
    );

    const ageCheckbox = screen.getByRole("checkbox", { name: "Age" });
    expect(ageCheckbox).not.toBeChecked();

    // Click to check
    fireEvent.click(ageCheckbox);
    expect(ageCheckbox).toBeChecked();

    // Click to uncheck
    fireEvent.click(ageCheckbox);
    expect(ageCheckbox).not.toBeChecked();
  });

  it("calls onSave with updated config when Save button is clicked", () => {
    const onSave = jest.fn();
    const onClose = jest.fn();

    render(
      <ModalManagerProvider>
        <OptionalFacetsConfigModal
          visibleOptionalFacets={["age"]}
          allFacets={mockAllFacets}
          onSave={onSave}
          onClose={onClose}
        />
      </ModalManagerProvider>
    );

    // Check a new facet
    const sexCheckbox = screen.getByRole("checkbox", { name: "Sex" });
    fireEvent.click(sexCheckbox);

    // Click Save button
    const saveButton = screen.getByRole("button", { name: /Save/i });
    fireEvent.click(saveButton);

    // Verify onSave was called with updated config
    expect(onSave).toHaveBeenCalledWith(["age", "sex"]);
  });

  it("calls onClose when Close button is clicked", () => {
    const onSave = jest.fn();
    const onClose = jest.fn();

    render(
      <ModalManagerProvider>
        <OptionalFacetsConfigModal
          visibleOptionalFacets={[]}
          allFacets={mockAllFacets}
          onSave={onSave}
          onClose={onClose}
        />
      </ModalManagerProvider>
    );

    // Get the Close button specifically by its exact text content
    const closeButton = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when header X button is clicked", () => {
    const onSave = jest.fn();
    const onClose = jest.fn();

    render(
      <ModalManagerProvider>
        <OptionalFacetsConfigModal
          visibleOptionalFacets={[]}
          allFacets={mockAllFacets}
          onSave={onSave}
          onClose={onClose}
        />
      </ModalManagerProvider>
    );

    const headerCloseButton = screen.getByRole("button", {
      name: "Close dialog",
    });
    fireEvent.click(headerCloseButton);

    expect(onClose).toHaveBeenCalled();
  });

  it("clears all checkboxes when Clear All button is clicked", () => {
    const onSave = jest.fn();
    const onClose = jest.fn();

    render(
      <ModalManagerProvider>
        <OptionalFacetsConfigModal
          visibleOptionalFacets={["age", "sex", "ethnicity"]}
          allFacets={mockAllFacets}
          onSave={onSave}
          onClose={onClose}
        />
      </ModalManagerProvider>
    );

    // Verify initial state
    const ageCheckbox = screen.getByRole("checkbox", { name: "Age" });
    const sexCheckbox = screen.getByRole("checkbox", { name: "Sex" });
    expect(ageCheckbox).toBeChecked();
    expect(sexCheckbox).toBeChecked();

    // Click Clear All
    const clearAllButton = screen.getByRole("button", { name: /Clear All/i });
    fireEvent.click(clearAllButton);

    // Verify all are unchecked
    expect(ageCheckbox).not.toBeChecked();
    expect(sexCheckbox).not.toBeChecked();
  });

  it("groups facets by category correctly", () => {
    const onSave = jest.fn();
    const onClose = jest.fn();

    render(
      <ModalManagerProvider>
        <OptionalFacetsConfigModal
          visibleOptionalFacets={[]}
          allFacets={mockAllFacets}
          onSave={onSave}
          onClose={onClose}
        />
      </ModalManagerProvider>
    );

    // Get all sections
    const sections = screen.getAllByTestId("facet-checkboxes");
    expect(sections).toHaveLength(3); // Biology, Demographics, Other
  });

  it("handles facets without category by grouping them in Other", () => {
    const onSave = jest.fn();
    const onClose = jest.fn();

    render(
      <ModalManagerProvider>
        <OptionalFacetsConfigModal
          visibleOptionalFacets={[]}
          allFacets={mockAllFacets}
          onSave={onSave}
          onClose={onClose}
        />
      </ModalManagerProvider>
    );

    // Platform should appear under "Other" category
    expect(screen.getByText("Other")).toBeInTheDocument();
    expect(screen.getByText("Platform")).toBeInTheDocument();
  });

  it("removes field from config when unchecking a previously checked checkbox", () => {
    const onSave = jest.fn();
    const onClose = jest.fn();

    render(
      <ModalManagerProvider>
        <OptionalFacetsConfigModal
          visibleOptionalFacets={["age", "sex"]}
          allFacets={mockAllFacets}
          onSave={onSave}
          onClose={onClose}
        />
      </ModalManagerProvider>
    );

    // Uncheck Age
    const ageCheckbox = screen.getByRole("checkbox", { name: "Age" });
    fireEvent.click(ageCheckbox);

    // Click Save
    const saveButton = screen.getByRole("button", { name: /Save/i });
    fireEvent.click(saveButton);

    // Verify onSave was called with age removed
    expect(onSave).toHaveBeenCalledWith(["sex"]);
  });

  it("shows sign in button and calls loginAuthProvider when clicked (unauthenticated)", () => {
    const onSave = jest.fn();
    const onClose = jest.fn();
    const mockLoginAuthProvider = jest.spyOn(authentication, "loginAuthProvider");

    render(
      <ModalManagerProvider>
        <OptionalFacetsConfigModal
          visibleOptionalFacets={[]}
          allFacets={mockAllFacets}
          onSave={onSave}
          onClose={onClose}
        />
      </ModalManagerProvider>
    );

    // Find and click the Sign in button
    const signInButton = screen.getByRole("button", { name: "Sign in" });
    fireEvent.click(signInButton);

    // Verify loginAuthProvider was called
    expect(mockLoginAuthProvider).toHaveBeenCalled();
  });
});
