import { render, screen } from "@testing-library/react";
import { WorkflowTitle, WorkflowList } from "../workflow";
import { WorkflowObject } from "../../lib/workflow";

describe("WorkflowTitle component", () => {
  describe("Basic rendering", () => {
    it("renders workflow name without version", () => {
      const workflow: WorkflowObject = {
        "@id": "/workflows/test-workflow/",
        "@type": ["Workflow"],
        name: "Test Workflow",
        source_url: "https://example.com",
      };
      render(<WorkflowTitle workflow={workflow} />);

      expect(screen.getByText("Test Workflow")).toBeInTheDocument();
      expect(screen.queryByTestId("version-number")).not.toBeInTheDocument();
    });

    it("renders workflow name with version", () => {
      const workflow: WorkflowObject = {
        "@id": "/workflows/test-workflow/",
        "@type": ["Workflow"],
        name: "Test Workflow",
        source_url: "https://example.com",
        workflow_version: "v1.2.0",
      };
      render(<WorkflowTitle workflow={workflow} />);

      expect(screen.getByText("Test Workflow")).toBeInTheDocument();
      expect(screen.getByText("v1.2.0")).toBeInTheDocument();
    });
  });
});

describe("WorkflowList component", () => {
  describe("Empty state", () => {
    it("renders nothing when workflows array is empty", () => {
      const { container } = render(<WorkflowList workflows={[]} />);

      expect(container.firstChild).toBeNull();
    });

    it("renders nothing when workflows array has no items", () => {
      render(<WorkflowList workflows={[]} />);

      expect(screen.queryByRole("list")).not.toBeInTheDocument();
      expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
    });
  });

  describe("Single workflow", () => {
    it("renders single workflow without version", () => {
      const workflows: WorkflowObject[] = [
        {
          "@id": "/workflows/single-workflow/",
          "@type": ["Workflow"],
          name: "Single Workflow",
          source_url: "https://example.com",
        },
      ];

      render(<WorkflowList workflows={workflows} />);

      expect(screen.getByRole("list")).toBeInTheDocument();
      expect(screen.getByRole("listitem")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "View workflow Single Workflow" })
      ).toBeInTheDocument();
      expect(screen.getByText("Single Workflow")).toBeInTheDocument();
    });

    it("renders single workflow with version", () => {
      const workflows: WorkflowObject[] = [
        {
          "@id": "/workflows/versioned-workflow/",
          "@type": ["Workflow"],
          name: "Versioned Workflow",
          source_url: "https://example.com",
          workflow_version: "v1.5.0",
        },
      ];

      render(<WorkflowList workflows={workflows} />);

      expect(
        screen.getByRole("link", {
          name: "View workflow Versioned Workflow version v1.5.0",
        })
      ).toBeInTheDocument();
      expect(screen.getByText("v1.5.0")).toBeInTheDocument();
    });

    it("renders single workflow with uniform pipeline badge", () => {
      const workflows: WorkflowObject[] = [
        {
          "@id": "/workflows/uniform-workflow/",
          "@type": ["Workflow"],
          name: "Uniform Workflow",
          source_url: "https://example.com",
          uniform_pipeline: true,
        },
      ];

      render(<WorkflowList workflows={workflows} />);

      expect(
        screen.getByTestId("uniform-pipeline-badge-abbreviated")
      ).toBeInTheDocument();
    });
  });

  describe("Multiple workflows", () => {
    it("renders multiple workflows in alphabetical order", () => {
      const workflows: WorkflowObject[] = [
        {
          "@id": "/workflows/zebra/",
          "@type": ["Workflow"],
          name: "Zebra Workflow",
          source_url: "https://example.com",
        },
        {
          "@id": "/workflows/alpha/",
          "@type": ["Workflow"],
          name: "Alpha Workflow",
          source_url: "https://example.com",
        },
        {
          "@id": "/workflows/beta/",
          "@type": ["Workflow"],
          name: "Beta Workflow",
          source_url: "https://example.com",
        },
      ];

      render(<WorkflowList workflows={workflows} />);

      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(3);

      expect(links[0]).toHaveTextContent("Alpha Workflow");
      expect(links[1]).toHaveTextContent("Beta Workflow");
      expect(links[2]).toHaveTextContent("Zebra Workflow");
    });

    it("sorts workflows case-insensitively", () => {
      const workflows: WorkflowObject[] = [
        {
          "@id": "/workflows/lowercase/",
          "@type": ["Workflow"],
          name: "lowercase workflow",
          source_url: "https://example.com",
        },
        {
          "@id": "/workflows/uppercase/",
          "@type": ["Workflow"],
          name: "UPPERCASE WORKFLOW",
          source_url: "https://example.com",
        },
        {
          "@id": "/workflows/mixedcase/",
          "@type": ["Workflow"],
          name: "MixedCase Workflow",
          source_url: "https://example.com",
        },
      ];

      render(<WorkflowList workflows={workflows} />);

      const links = screen.getAllByRole("link");
      expect(links[0]).toHaveTextContent("lowercase workflow");
      expect(links[1]).toHaveTextContent("MixedCase Workflow");
      expect(links[2]).toHaveTextContent("UPPERCASE WORKFLOW");
    });
  });

  describe("Link attributes and accessibility", () => {
    it("creates proper href attributes for workflow links", () => {
      const workflows: WorkflowObject[] = [
        {
          "@id": "/workflows/test-id/",
          "@type": ["Workflow"],
          name: "Test Workflow",
          source_url: "https://example.com",
        },
      ];

      render(<WorkflowList workflows={workflows} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/workflows/test-id");
    });

    it("creates aria-label without version when workflow_version is missing", () => {
      const workflows: WorkflowObject[] = [
        {
          "@id": "/workflows/no-version/",
          "@type": ["Workflow"],
          name: "No Version Workflow",
          source_url: "https://example.com",
          workflow_version: undefined,
        },
      ];

      render(<WorkflowList workflows={workflows} />);

      expect(
        screen.getByRole("link", { name: "View workflow No Version Workflow" })
      ).toBeInTheDocument();
    });

    it("creates aria-label with version when workflow_version exists", () => {
      const workflows: WorkflowObject[] = [
        {
          "@id": "/workflows/with-version/",
          "@type": ["Workflow"],
          name: "With Version Workflow",
          source_url: "https://example.com",
          workflow_version: "v2.0.0",
        },
      ];

      render(<WorkflowList workflows={workflows} />);

      expect(
        screen.getByRole("link", {
          name: "View workflow With Version Workflow version v2.0.0",
        })
      ).toBeInTheDocument();
    });
  });

  describe("Version number handling", () => {
    it("conditionally renders version number only when workflow_version exists", () => {
      const workflows: WorkflowObject[] = [
        {
          "@id": "/workflows/no-version/",
          "@type": ["Workflow"],
          name: "No Version",
          source_url: "https://example.com",
        },
        {
          "@id": "/workflows/with-version/",
          "@type": ["Workflow"],
          name: "With Version",
          source_url: "https://example.com",
          workflow_version: "v1.0.0",
        },
      ];

      render(<WorkflowList workflows={workflows} />);

      expect(screen.getByText("v1.0.0")).toBeInTheDocument();
      expect(screen.queryByText("No version")).not.toBeInTheDocument();
    });

    it("does not render version number for empty workflow_version", () => {
      const workflows: WorkflowObject[] = [
        {
          "@id": "/workflows/empty-version/",
          "@type": ["Workflow"],
          name: "Empty Version",
          source_url: "https://example.com",
          workflow_version: "",
        },
      ];

      render(<WorkflowList workflows={workflows} />);

      expect(screen.queryByText(/^v/)).not.toBeInTheDocument();
    });
  });

  describe("Uniform pipeline badge", () => {
    it("renders uniform pipeline badge when uniform_pipeline is true", () => {
      const workflows: WorkflowObject[] = [
        {
          "@id": "/workflows/uniform/",
          "@type": ["Workflow"],
          name: "Uniform Workflow",
          source_url: "https://example.com",
          uniform_pipeline: true,
        },
      ];

      render(<WorkflowList workflows={workflows} />);

      expect(
        screen.getByTestId("uniform-pipeline-badge-abbreviated")
      ).toBeInTheDocument();
    });

    it("does not render uniform pipeline badge when uniform_pipeline is false", () => {
      const workflows: WorkflowObject[] = [
        {
          "@id": "/workflows/not-uniform/",
          "@type": ["Workflow"],
          name: "Not Uniform Workflow",
          source_url: "https://example.com",
          uniform_pipeline: false,
        },
      ];

      render(<WorkflowList workflows={workflows} />);

      expect(
        screen.queryByTestId("uniform-pipeline-badge-abbreviated")
      ).not.toBeInTheDocument();
    });

    it("does not render uniform pipeline badge when uniform_pipeline is undefined", () => {
      const workflows: WorkflowObject[] = [
        {
          "@id": "/workflows/undefined-uniform/",
          "@type": ["Workflow"],
          name: "Undefined Uniform Workflow",
          source_url: "https://example.com",
        },
      ];

      render(<WorkflowList workflows={workflows} />);

      expect(
        screen.queryByTestId("uniform-pipeline-badge-abbreviated")
      ).not.toBeInTheDocument();
    });
  });

  describe("Collapse control integration", () => {
    it("shows collapse control when there are more than 10 workflows", () => {
      const workflows: WorkflowObject[] = Array.from(
        { length: 12 },
        (_, i) => ({
          "@id": `/workflows/workflow-${i}/`,
          "@type": ["Workflow"],
          name: `Workflow ${i}`,
          source_url: "https://example.com",
        })
      );

      render(<WorkflowList workflows={workflows} />);

      expect(
        screen.getByTestId("collapse-control-vertical")
      ).toBeInTheDocument();
    });

    it("uses proper keys for workflow items", () => {
      const workflows: WorkflowObject[] = [
        {
          "@id": "/workflows/key-test-1/",
          "@type": ["Workflow"],
          name: "Key Test 1",
          source_url: "https://example.com",
        },
        {
          "@id": "/workflows/key-test-2/",
          "@type": ["Workflow"],
          name: "Key Test 2",
          source_url: "https://example.com",
        },
      ];

      const { container } = render(<WorkflowList workflows={workflows} />);

      const listItems = container.querySelectorAll("li");
      expect(listItems).toHaveLength(2);
    });
  });

  describe("Edge cases", () => {
    it("handles workflows with all optional properties", () => {
      const workflows: WorkflowObject[] = [
        {
          "@id": "/workflows/full-featured/",
          "@type": ["Workflow"],
          name: "Full Featured Workflow",
          source_url: "https://example.com",
          workflow_version: "v2.1.0",
          uniform_pipeline: true,
        },
      ];

      render(<WorkflowList workflows={workflows} />);

      expect(screen.getByText("Full Featured Workflow")).toBeInTheDocument();
      expect(screen.getByText("v2.1.0")).toBeInTheDocument();
      expect(
        screen.getByTestId("uniform-pipeline-badge-abbreviated")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", {
          name: "View workflow Full Featured Workflow version v2.1.0",
        })
      ).toBeInTheDocument();
    });

    it("handles workflows with minimal properties", () => {
      const workflows: WorkflowObject[] = [
        {
          "@id": "/workflows/minimal/",
          "@type": ["Workflow"],
          name: "Minimal Workflow",
          source_url: "https://example.com",
        },
      ];

      render(<WorkflowList workflows={workflows} />);

      expect(screen.getByText("Minimal Workflow")).toBeInTheDocument();
      expect(screen.queryByText(/^v/)).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("uniform-pipeline-badge-abbreviated")
      ).not.toBeInTheDocument();
    });
  });
});
