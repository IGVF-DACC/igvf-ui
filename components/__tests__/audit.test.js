import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { useAuth0 } from "@auth0/auth0-react";
import { AuditDetail, AuditStatus, useAudit } from "../audit";

/**
 * Method to mock the useAuth0 hook comes from:
 * https://stackoverflow.com/questions/45758366/how-to-change-jest-mock-function-return-value-in-each-testanswer-45758767
 * This method lets you change the return values of the hook between tests.
 */
jest.mock("@auth0/auth0-react", () => ({
  useAuth0: jest.fn(),
}));

// Needed because of animations.
global.scrollTo = jest.fn();

/**
 * Mimics a full audit object within an item object.
 */
const demoAudit = {
  ERROR: [
    {
      category: "extremely low read depth",
      detail:
        "Alignment file [ENCFF557RSA](/files/ENCFF557RSA/) processed by ATAC-seq ENCODE4 v2.1.1 GRCh38 pipeline has 8585759 usable fragments. According to ENCODE4 standards, ATAC-seq assays processed by the uniform processing pipeline should have > 25 million usable fragments. 20-25 million is acceptable and < 15 million is not compliant.",
      level: 60,
      level_name: "ERROR",
      path: "/analyses/ENCAN615CMZ/",
      name: "audit_analysis",
    },
  ],
  WARNING: [
    {
      category: "mixed read lengths",
      detail:
        "Biological replicate 1 in experiment [ENCSR859USB](/experiments/ENCSR859USB/) has mixed sequencing read lengths (33, 36).",
      level: 40,
      level_name: "WARNING",
      path: "/experiments/ENCSR859USB/",
      name: "audit_experiment",
    },
    {
      category: "moderate number of reproducible peaks",
      detail:
        "According to ENCODE4 standards, ATAC-seq assays processed by the uniform processing pipeline should have either >150k reproducible peaks in an overlap peaks file, or >70k in an IDR thresholded peaks file. 100-150k or 50-70k peaks respectively is acceptable, and <100k or <50k respectively is not compliant. File(s) [ENCFF055NNT](/files/ENCFF055NNT/) (overlap peaks) and [ENCFF926KTI](/files/ENCFF926KTI/) (IDR thresholded peaks) processed by ATAC-seq ENCODE4 v2.1.1 GRCh38 pipeline have 99862 and 55575 peaks.",
      level: 40,
      level_name: "WARNING",
      path: "/analyses/ENCAN615CMZ/",
      name: "audit_analysis",
    },
  ],
  NOT_COMPLIANT: [
    {
      category: "insufficient read depth",
      detail:
        "Alignment file processed by ATAC-seq ENCODE4 v2.1.1 GRCh38 pipeline has 15065125 usable fragments. According to ENCODE4 standards, ATAC-seq assays processed by the uniform processing pipeline should have > 25 million usable fragments. 20-25 million is acceptable and < 15 million is not compliant.",
      level: 50,
      level_name: "NOT_COMPLIANT",
      path: "/analyses/ENCAN615CMZ/",
      name: "audit_analysis",
    },
  ],
  INTERNAL_ACTION: [
    {
      category: "mismatched status",
      detail:
        "[ENCAN615CMZ](/analyses/ENCAN615CMZ/) has in progress subobject quality standard [encode4-atac-seq](quality-standards). See [IGVF](https://igvf.org) for information.",
      level: 30,
      level_name: "INTERNAL_ACTION",
      path: "/analyses/ENCAN615CMZ/",
      name: "audit_item_status",
    },
  ],
  FAKE: [
    {
      category:
        "fake level to make sure we can deal with a new level without crashing",
      detail: "Stuff",
      level: 0,
      level_name: "FAKE",
      path: "/analyses/ENCAN615CMZ/",
      name: "audit_item_status",
    },
  ],
};

describe("Test the AuditStatus and AuditDetail components together", () => {
  it("renders the AuditStatus button and the AuditDetail panel if the button is clicked", async () => {
    useAuth0.mockReturnValue({ isLoading: false, isAuthenticated: false });

    function AuditTestComponent() {
      const auditState = useAudit();
      const item = {
        "@id": "/path/item",
        audit: demoAudit,
      };

      return (
        <>
          <AuditStatus item={item} auditState={auditState} />
          <AuditDetail item={item} auditState={auditState} />
        </>
      );
    }

    render(<AuditTestComponent />);

    // Make sure the button has the correct Tailwind CSS class for open audit details.
    let auditStatusButton = screen.getByTestId("audit-status-button");
    expect(auditStatusButton).toHaveClass("bg-button-audit-closed");

    // Click on the button to open the audit details.
    fireEvent.click(auditStatusButton);

    // Make sure the button has the correct Tailwind CSS class for closed audit details.
    auditStatusButton = screen.getByTestId("audit-status-button");
    expect(auditStatusButton).toHaveClass("bg-button-audit-open");

    // Make sure the audit detail panel appears.
    expect(screen.getByTestId("audit-detail-panel")).toBeInTheDocument();
  });
});

describe("Test the AuditStatus button", () => {
  it("renders all four possible audits while signed in, and it reacts to clicks", () => {
    useAuth0.mockReturnValueOnce({ isLoading: false, isAuthenticated: true });

    const item = {
      "@id": "/path/item",
      audit: demoAudit,
    };
    const auditState = {
      isDetailOpen: false,
      toggleDetailsOpen: jest.fn(),
    };

    render(<AuditStatus item={item} auditState={auditState} />);

    const auditStatusButton = screen.getByTestId("audit-status-button");
    expect(auditStatusButton).toBeInTheDocument();

    // Make sure it an icon for each of the four audit levels.
    let auditStatusIcon =
      within(auditStatusButton).getByTestId("audit-error-icon");
    expect(auditStatusIcon).toBeInTheDocument();
    auditStatusIcon =
      within(auditStatusButton).getByTestId("audit-warning-icon");
    expect(auditStatusIcon).toBeInTheDocument();
    auditStatusIcon = within(auditStatusButton).getByTestId(
      "audit-not-compliant-icon"
    );
    expect(auditStatusIcon).toBeInTheDocument();
    auditStatusIcon = within(auditStatusButton).getByTestId(
      "audit-internal-action-icon"
    );
    expect(auditStatusIcon).toBeInTheDocument();

    // Make sure the button has the correct Tailwind CSS class for closed audit details.
    expect(auditStatusButton).toHaveClass("bg-button-audit-closed");
  });

  it("renders three of the possible four audits while signed out", () => {
    useAuth0.mockReturnValueOnce({ isLoading: false, isAuthenticated: false });

    const item = {
      "@id": "/path/item",
      audit: demoAudit,
    };
    const auditState = {
      isDetailOpen: false,
      toggleDetailsOpen: jest.fn(),
    };

    render(<AuditStatus item={item} auditState={auditState} />);

    const auditStatusButton = screen.getByTestId("audit-status-button");
    expect(auditStatusButton).toBeInTheDocument();

    // Make sure it an icon for each of the four audit levels.
    let auditStatusIcon =
      within(auditStatusButton).getByTestId("audit-error-icon");
    expect(auditStatusIcon).toBeInTheDocument();
    auditStatusIcon =
      within(auditStatusButton).getByTestId("audit-warning-icon");
    expect(auditStatusIcon).toBeInTheDocument();
    auditStatusIcon = within(auditStatusButton).getByTestId(
      "audit-not-compliant-icon"
    );
    expect(auditStatusIcon).toBeInTheDocument();
    auditStatusIcon = within(auditStatusButton).queryByTestId(
      "audit-internal-action-icon"
    );
    expect(auditStatusIcon).toBeNull();
  });

  it("renders a highlighted status button if audit details are open", () => {
    useAuth0.mockReturnValueOnce({ isLoading: false, isAuthenticated: false });

    const item = {
      "@id": "/path/item",
      audit: demoAudit,
    };
    const auditState = {
      isDetailOpen: true,
      toggleDetailsOpen: jest.fn(),
    };

    render(<AuditStatus item={item} auditState={auditState} />);

    // Make sure the button has the correct Tailwind CSS class for open audit details.
    expect(screen.getByTestId("audit-status-button")).toHaveClass(
      "bg-button-audit-open"
    );
  });

  it("renders no audit status button if no audits exist in an item", () => {
    useAuth0.mockReturnValueOnce({ isLoading: false, isAuthenticated: false });

    const item = {
      "@id": "/path/item",
    };
    const auditState = {
      isDetailOpen: false,
      toggleDetailsOpen: jest.fn(),
    };

    render(<AuditStatus item={item} auditState={auditState} />);
    expect(screen.queryByTestId("audit-status-button")).toBeNull();
  });

  it("renders no audit status button if the item has empty audits", () => {
    useAuth0.mockReturnValueOnce({ isLoading: false, isAuthenticated: false });

    const item = {
      "@id": "/path/item",
      audit: {},
    };
    const auditState = {
      isDetailOpen: false,
      toggleDetailsOpen: jest.fn(),
    };

    render(<AuditStatus item={item} auditState={auditState} />);
    expect(screen.queryByTestId("audit-status-button")).toBeNull();
  });
});

describe("Test the AuditDetail panel", () => {
  it("renders the audit detail panel and all four levels if it's open and signed in", () => {
    useAuth0.mockReturnValueOnce({ isLoading: false, isAuthenticated: true });

    const item = {
      "@id": "/path/item",
      audit: demoAudit,
    };
    const auditState = {
      isDetailOpen: true,
      toggleDetailsOpen: jest.fn(),
    };

    render(<AuditDetail item={item} auditState={auditState} />);

    expect(screen.getByTestId("audit-detail-panel")).toBeInTheDocument();

    // Make sure all four of the level panels appear.
    expect(screen.getByTestId("audit-level-error")).toBeInTheDocument();
    expect(screen.getByTestId("audit-level-warning")).toBeInTheDocument();
    expect(screen.getByTestId("audit-level-not-compliant")).toBeInTheDocument();
    expect(
      screen.getByTestId("audit-level-internal-action")
    ).toBeInTheDocument();
  });

  it("renders the audit detail panel and three levels if it's open and signed out", () => {
    useAuth0.mockReturnValueOnce({ isLoading: false, isAuthenticated: false });

    const item = {
      "@id": "/path/item",
      audit: demoAudit,
    };
    const auditState = {
      isDetailOpen: true,
      toggleDetailsOpen: jest.fn(),
    };

    render(<AuditDetail item={item} auditState={auditState} />);

    expect(screen.getByTestId("audit-detail-panel")).toBeInTheDocument();

    // Make sure all four of the level panels appear.
    expect(screen.getByTestId("audit-level-error")).toBeInTheDocument();
    expect(screen.getByTestId("audit-level-warning")).toBeInTheDocument();
    expect(screen.getByTestId("audit-level-not-compliant")).toBeInTheDocument();
    expect(screen.queryByTestId("audit-level-internal-action")).toBeNull();
  });

  it("reacts to clicks in a detail button to render the detail text", async () => {
    useAuth0.mockReturnValueOnce({ isLoading: false, isAuthenticated: true });

    const item = {
      "@id": "/path/item",
      audit: demoAudit,
    };
    const auditState = {
      isDetailOpen: true,
      toggleDetailsOpen: jest.fn(),
    };

    render(<AuditDetail item={item} auditState={auditState} />);

    expect(screen.getByTestId("audit-detail-panel")).toBeInTheDocument();

    // Click on the button for the ERROR level that includes a link.
    const errorDetail = screen.getByTestId("audit-level-error");
    expect(errorDetail).toBeInTheDocument();
    const errorDetailButton = within(errorDetail).getByRole("button");
    fireEvent.click(errorDetailButton);
    await waitFor(() =>
      screen.queryByTestId("audit-narrative-error-extremely-low-read-depth")
    );

    let narrative = screen.queryByTestId(
      "audit-narrative-error-extremely-low-read-depth"
    );
    expect(within(narrative).getByRole("link")).toHaveAttribute(
      "href",
      "/files/ENCFF557RSA"
    );

    // Click on the button for the NOT_COMPLIANT level that doesn't include a link.
    const notCompliantDetail = screen.getByTestId("audit-level-not-compliant");
    expect(notCompliantDetail).toBeInTheDocument();
    const internalActionButton = within(notCompliantDetail).getByRole("button");
    fireEvent.click(internalActionButton);
    await waitFor(() =>
      screen.queryByTestId(
        "audit-narrative-not-compliant-insufficient-read-depth"
      )
    );

    narrative = screen.queryByTestId(
      "audit-narrative-not-compliant-insufficient-read-depth"
    );
    expect(within(narrative).queryByRole("link")).toBeNull();

    // Click on the button for the INTERNAL_ACTION level that begins with a link.
    const internalActionDetail = screen.getByTestId(
      "audit-level-internal-action"
    );
    expect(internalActionDetail).toBeInTheDocument();
    const internalActionDetailButton =
      within(internalActionDetail).getByRole("button");
    fireEvent.click(internalActionDetailButton);
    await waitFor(() =>
      screen.queryByTestId("audit-narrative-internal-action-mismatched-status")
    );
  });

  it("doesn't render the audit detail panel if it's closed", () => {
    useAuth0.mockReturnValueOnce({ isLoading: false, isAuthenticated: false });

    const item = {
      "@id": "/path/item",
      audit: demoAudit,
    };
    const auditState = {
      isDetailOpen: false,
      toggleDetailsOpen: jest.fn(),
    };

    render(<AuditDetail item={item} auditState={auditState} />);

    expect(screen.queryByTestId("audit-detail-panel")).toBeNull();
  });
});
