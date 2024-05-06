import { render, screen } from "@testing-library/react";
import { useAuth0 } from "@auth0/auth0-react";
import AuditTitle from "../custom-facets/audit-title";

/**
 * Method to mock the useAuth0 hook comes from:
 * https://stackoverflow.com/questions/45758366/how-to-change-jest-mock-function-return-value-in-each-testanswer-45758767
 * This method lets you change the return values of the hook between tests.
 */
jest.mock("@auth0/auth0-react", () => ({
  useAuth0: jest.fn(),
}));

describe("Test the facet audit title component", () => {
  it("renders the internal actions audit facet title while authorized", () => {
    useAuth0.mockReturnValue({ isAuthenticated: true });

    render(
      <AuditTitle
        facet={{
          appended: false,
          field: "audit.INTERNAL_ACTION.category",
          open_on_load: false,
          terms: [
            {
              doc_count: 4,
              key: "mismatched status",
            },
          ],
          title: "Audit category: DCC ACTION",
          total: 5,
          type: "terms",
        }}
      />
    );

    expect(screen.getByText("Audit Internal Action")).toBeInTheDocument();
  });

  it("doesn't render the internal actions audit facet title while not authorized", () => {
    useAuth0.mockReturnValue({ isAuthenticated: false });

    render(
      <AuditTitle
        facet={{
          appended: false,
          field: "audit.INTERNAL_ACTION.category",
          open_on_load: false,
          terms: [
            {
              doc_count: 4,
              key: "mismatched status",
            },
          ],
          title: "Audit category: DCC ACTION",
          total: 5,
          type: "terms",
        }}
      />
    );

    expect(screen.queryByText("Audit Internal Action")).not.toBeInTheDocument();
  });

  it("renders the error audit facet title while authorized", () => {
    useAuth0.mockReturnValue({ isAuthenticated: true });

    render(
      <AuditTitle
        facet={{
          appended: false,
          field: "audit.ERROR.category",
          open_on_load: false,
          terms: [
            {
              doc_count: 4,
              key: "missing file",
            },
          ],
          title: "Audit category: ERROR",
          total: 5,
          type: "terms",
        }}
      />
    );

    expect(screen.getByText("Audit Error")).toBeInTheDocument();
  });

  it("renders the error audit facet title while not authorized", () => {
    useAuth0.mockReturnValue({ isAuthenticated: true });

    render(
      <AuditTitle
        facet={{
          appended: false,
          field: "audit.ERROR.category",
          open_on_load: false,
          terms: [
            {
              doc_count: 4,
              key: "missing file",
            },
          ],
          title: "Audit category: ERROR",
          total: 5,
          type: "terms",
        }}
      />
    );

    expect(screen.getByText("Audit Error")).toBeInTheDocument();
  });
});
