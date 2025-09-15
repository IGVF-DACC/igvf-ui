import { render, screen } from "@testing-library/react";
import { UniformPipelineStatus } from "../uniform-pipeline-status";
import SessionContext from "../session-context";

describe("UniformPipelineStatus", () => {
  // Default props for all test cases
  const defaultProps = {
    atType: "AnalysisSet",
    objectId: "test-object-123",
  };

  beforeEach(() => {
    // Create the tooltip portal root element that the real tooltip system needs
    const portalRoot = document.createElement("div");
    portalRoot.id = "tooltip-portal-root";
    document.body.appendChild(portalRoot);
  });

  afterEach(() => {
    // Clean up the portal root element
    const portalRoot = document.getElementById("tooltip-portal-root");
    if (portalRoot) {
      document.body.removeChild(portalRoot);
    }
  });

  describe("Status rendering", () => {
    it("renders completed status correctly", () => {
      render(<UniformPipelineStatus status="completed" {...defaultProps} />);

      const pill = screen.getByTestId("uniform-pipeline-status-pill-completed");
      expect(pill).toBeInTheDocument();
      expect(pill).toHaveTextContent("completed");
    });

    it("renders error status correctly", () => {
      render(<UniformPipelineStatus status="error" {...defaultProps} />);

      const pill = screen.getByTestId("uniform-pipeline-status-pill-error");
      expect(pill).toBeInTheDocument();
      expect(pill).toHaveTextContent("error");
    });

    it("renders preprocessing status correctly", () => {
      render(
        <UniformPipelineStatus status="preprocessing" {...defaultProps} />
      );

      const pill = screen.getByTestId(
        "uniform-pipeline-status-pill-preprocessing"
      );
      expect(pill).toBeInTheDocument();
      expect(pill).toHaveTextContent("preprocessing");
    });

    it("renders processing status correctly", () => {
      render(<UniformPipelineStatus status="processing" {...defaultProps} />);

      const pill = screen.getByTestId(
        "uniform-pipeline-status-pill-processing"
      );
      expect(pill).toBeInTheDocument();
      expect(pill).toHaveTextContent("processing");
    });

    it("renders fallback status correctly", () => {
      render(<UniformPipelineStatus status="fallback" {...defaultProps} />);

      const pill = screen.getByTestId("uniform-pipeline-status-pill-fallback");
      expect(pill).toBeInTheDocument();
      expect(pill).toHaveTextContent("fallback");
    });
  });

  describe("Icon rendering", () => {
    it("renders CheckCircleIcon for completed status", () => {
      render(<UniformPipelineStatus status="completed" {...defaultProps} />);

      // Check that the icon container has the correct classes
      const iconContainer = screen.getByTestId(
        "uniform-pipeline-status-pill-completed"
      );
      expect(iconContainer.querySelector("svg")).toBeInTheDocument();
    });

    it("renders ExclamationCircleIcon for error status", () => {
      render(<UniformPipelineStatus status="error" {...defaultProps} />);

      const iconContainer = screen.getByTestId(
        "uniform-pipeline-status-pill-error"
      );
      expect(iconContainer.querySelector("svg")).toBeInTheDocument();
    });

    it("renders custom SVG for preprocessing status", () => {
      render(
        <UniformPipelineStatus status="preprocessing" {...defaultProps} />
      );

      const iconContainer = screen.getByTestId(
        "uniform-pipeline-status-pill-preprocessing"
      );
      const svg = iconContainer.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("renders custom SVG for processing status", () => {
      render(<UniformPipelineStatus status="processing" {...defaultProps} />);

      const iconContainer = screen.getByTestId(
        "uniform-pipeline-status-pill-processing"
      );
      const svg = iconContainer.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("renders XCircleIcon for fallback status", () => {
      render(<UniformPipelineStatus status="fallback" {...defaultProps} />);

      const iconContainer = screen.getByTestId(
        "uniform-pipeline-status-pill-fallback"
      );
      expect(iconContainer.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("Tooltip functionality", () => {
    it("renders pill when session context is null", () => {
      render(
        <SessionContext.Provider value={null as any}>
          <UniformPipelineStatus status="error" {...defaultProps} />
        </SessionContext.Provider>
      );

      // Verify pill is rendered
      const pill = screen.getByTestId("uniform-pipeline-status-pill-error");
      expect(pill).toBeInTheDocument();
      expect(pill).toHaveTextContent("error");
    });

    it("renders pill when session context lacks profiles", () => {
      const sessionContextValue = {
        session: { _csrft_: "token123" },
      };

      render(
        <SessionContext.Provider value={sessionContextValue as any}>
          <UniformPipelineStatus status="processing" {...defaultProps} />
        </SessionContext.Provider>
      );

      // Verify pill is rendered.
      const pill = screen.getByTestId(
        "uniform-pipeline-status-pill-processing"
      );
      expect(pill).toBeInTheDocument();
      expect(pill).toHaveTextContent("processing");
    });
  });

  describe("Schema description override", () => {
    it("sets up tooltip when schema description is available", () => {
      const sessionContextValue = {
        profiles: {
          AnalysisSet: {
            properties: {
              uniform_pipeline_status: {
                enum_descriptions: {
                  completed: "Analysis completed with validated results",
                  error: "Pipeline failed with errors",
                  processing: "Currently analyzing data",
                },
              },
            },
          },
        },
      };

      render(
        <SessionContext.Provider value={sessionContextValue as any}>
          <UniformPipelineStatus status="completed" {...defaultProps} />
        </SessionContext.Provider>
      );

      const pill = screen.getByTestId("uniform-pipeline-status-pill-completed");
      expect(pill).toBeInTheDocument();
      expect(pill).toHaveTextContent("completed");
    });

    it("sets up tooltip fallback when schema description is missing for status", () => {
      const sessionContextValue = {
        profiles: {
          AnalysisSet: {
            properties: {
              uniform_pipeline_status: {
                enum_descriptions: {
                  completed: "Analysis completed with validated results",
                  // Missing 'error' description
                },
              },
            },
          },
        },
      };

      render(
        <SessionContext.Provider value={sessionContextValue as any}>
          <UniformPipelineStatus status="error" {...defaultProps} />
        </SessionContext.Provider>
      );

      const pill = screen.getByTestId("uniform-pipeline-status-pill-error");
      expect(pill).toBeInTheDocument();
      expect(pill).toHaveTextContent("error");
    });

    it("falls back to default description when schema description is empty string", () => {
      const sessionContextValue = {
        profiles: {
          AnalysisSet: {
            properties: {
              uniform_pipeline_status: {
                enum_descriptions: {
                  completed: "", // Empty string should be rejected
                  error: "Pipeline failed with errors",
                },
              },
            },
          },
        },
      };

      render(
        <SessionContext.Provider value={sessionContextValue as any}>
          <UniformPipelineStatus status="completed" {...defaultProps} />
        </SessionContext.Provider>
      );

      const pill = screen.getByTestId("uniform-pipeline-status-pill-completed");
      expect(pill).toBeInTheDocument();
      expect(pill).toHaveTextContent("completed");
    });

    it("sets up tooltip fallback when atType is not in profiles", () => {
      const sessionContextValue = {
        profiles: {
          OtherType: {
            properties: {
              uniform_pipeline_status: {
                enum_descriptions: {
                  completed: "Other type completed",
                },
              },
            },
          },
        },
      };

      render(
        <SessionContext.Provider value={sessionContextValue as any}>
          <UniformPipelineStatus status="completed" {...defaultProps} />
        </SessionContext.Provider>
      );

      const pill = screen.getByTestId("uniform-pipeline-status-pill-completed");
      expect(pill).toBeInTheDocument();
      expect(pill).toHaveTextContent("completed");
    });

    it("handles malformed schema gracefully", () => {
      const sessionContextValue = {
        profiles: {
          AnalysisSet: {
            // Missing properties
          },
        },
      };

      render(
        <SessionContext.Provider value={sessionContextValue as any}>
          <UniformPipelineStatus status="completed" {...defaultProps} />
        </SessionContext.Provider>
      );

      const pill = screen.getByTestId("uniform-pipeline-status-pill-completed");
      expect(pill).toBeInTheDocument();
      expect(pill).toHaveTextContent("completed");
    });

    it("sets up tooltip when schema lacks uniform_pipeline_status property", () => {
      const sessionContextValue = {
        profiles: {
          AnalysisSet: {
            properties: {
              other_property: {
                type: "string",
              },
            },
          },
        },
      };

      render(
        <SessionContext.Provider value={sessionContextValue as any}>
          <UniformPipelineStatus status="processing" {...defaultProps} />
        </SessionContext.Provider>
      );

      const pill = screen.getByTestId(
        "uniform-pipeline-status-pill-processing"
      );
      expect(pill).toBeInTheDocument();
      expect(pill).toHaveTextContent("processing");
    });

    it("handles null pageSchema", () => {
      const sessionContextValue = {
        profiles: {
          AnalysisSet: null,
        },
      };

      render(
        <SessionContext.Provider value={sessionContextValue as any}>
          <UniformPipelineStatus status="error" {...defaultProps} />
        </SessionContext.Provider>
      );

      const pill = screen.getByTestId("uniform-pipeline-status-pill-error");
      expect(pill).toBeInTheDocument();
      expect(pill).toHaveTextContent("error");
    });

    it("handles non-object pageSchema", () => {
      const sessionContextValue = {
        profiles: {
          AnalysisSet: "not-an-object",
        },
      };

      render(
        <SessionContext.Provider value={sessionContextValue as any}>
          <UniformPipelineStatus status="preprocessing" {...defaultProps} />
        </SessionContext.Provider>
      );

      const pill = screen.getByTestId(
        "uniform-pipeline-status-pill-preprocessing"
      );
      expect(pill).toBeInTheDocument();
      expect(pill).toHaveTextContent("preprocessing");
    });
  });

  describe("Accessibility", () => {
    it("has proper role attribute on badge", () => {
      render(<UniformPipelineStatus status="completed" {...defaultProps} />);

      const pill = screen.getByTestId("uniform-pipeline-status-pill-completed");
      expect(pill).toHaveAttribute("role", "status");
    });

    it("has proper testid format", () => {
      render(<UniformPipelineStatus status="completed" {...defaultProps} />);

      expect(
        screen.getByTestId("uniform-pipeline-status-pill-completed")
      ).toBeInTheDocument();
    });

    it("applies correct icon positioning", () => {
      render(<UniformPipelineStatus status="completed" {...defaultProps} />);

      const pill = screen.getByTestId("uniform-pipeline-status-pill-completed");
      // PillBadge uses iconPosition="left" internally, verify icon is present
      expect(pill.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("handles undefined enum_descriptions", () => {
      const sessionContextValue = {
        profiles: {
          AnalysisSet: {
            properties: {
              uniform_pipeline_status: {
                // Missing enum_descriptions property
              },
            },
          },
        },
      };

      render(
        <SessionContext.Provider value={sessionContextValue as any}>
          <UniformPipelineStatus status="completed" {...defaultProps} />
        </SessionContext.Provider>
      );

      const pill = screen.getByTestId("uniform-pipeline-status-pill-completed");
      expect(pill).toBeInTheDocument();
      expect(pill).toHaveTextContent("completed");
    });

    it("handles null enum_descriptions", () => {
      const sessionContextValue = {
        profiles: {
          AnalysisSet: {
            properties: {
              uniform_pipeline_status: {
                enum_descriptions: null,
              },
            },
          },
        },
      };

      render(
        <SessionContext.Provider value={sessionContextValue as any}>
          <UniformPipelineStatus status="completed" {...defaultProps} />
        </SessionContext.Provider>
      );

      const pill = screen.getByTestId("uniform-pipeline-status-pill-completed");
      expect(pill).toBeInTheDocument();
      expect(pill).toHaveTextContent("completed");
    });

    it("handles number value in enum_descriptions", () => {
      const sessionContextValue = {
        profiles: {
          AnalysisSet: {
            properties: {
              uniform_pipeline_status: {
                enum_descriptions: {
                  completed: 42, // Numbers are truthy but not strings
                },
              },
            },
          },
        },
      };

      render(
        <SessionContext.Provider value={sessionContextValue as any}>
          <UniformPipelineStatus status="completed" {...defaultProps} />
        </SessionContext.Provider>
      );

      const pill = screen.getByTestId("uniform-pipeline-status-pill-completed");
      expect(pill).toBeInTheDocument();
      expect(pill).toHaveTextContent("completed");
    });

    it("handles false value in enum_descriptions", () => {
      const sessionContextValue = {
        profiles: {
          AnalysisSet: {
            properties: {
              uniform_pipeline_status: {
                enum_descriptions: {
                  completed: false, // Falsy value should fall back
                },
              },
            },
          },
        },
      };

      render(
        <SessionContext.Provider value={sessionContextValue as any}>
          <UniformPipelineStatus status="completed" {...defaultProps} />
        </SessionContext.Provider>
      );

      const pill = screen.getByTestId("uniform-pipeline-status-pill-completed");
      expect(pill).toBeInTheDocument();
      expect(pill).toHaveTextContent("completed");
    });

    it("handles unknown status by falling back to fallback config", () => {
      // Test the fallback case in: const stylesForStatus = statusConfig[status] || statusConfig.fallback;
      render(
        <UniformPipelineStatus status={"unknown" as any} {...defaultProps} />
      );

      // Should render with fallback styles and testid
      const pill = screen.getByTestId("uniform-pipeline-status-pill-unknown");
      expect(pill).toBeInTheDocument();
      expect(pill).toHaveClass("bg-uniform-pipeline-fallback");
      expect(pill).toHaveClass("ring-uniform-pipeline-fallback");
      expect(pill).toHaveClass("text-uniform-pipeline-fallback");
      expect(pill).toHaveClass("fill-uniform-pipeline-fallback");
      expect(pill).toHaveTextContent("unknown");

      // Should use fallback icon (XCircleIcon)
      expect(pill.querySelector("svg")).toBeInTheDocument();
    });
  });
});
