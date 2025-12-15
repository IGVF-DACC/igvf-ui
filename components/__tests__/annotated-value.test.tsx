import React from "react";
import { render, screen } from "@testing-library/react";
import { AnnotatedItem, AnnotatedValue } from "../annotated-value";
import SessionContext from "../session-context";
import { TooltipPortalRoot } from "../tooltip";

function renderWithSession(ui: React.ReactElement, profiles?: any) {
  const providerValue: any = {
    session: null,
    sessionProperties: null,
    profiles: profiles ?? {},
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

describe("AnnotatedValue", () => {
  it("renders plain text when no profiles available", () => {
    renderWithSession(
      <AnnotatedValue objectType="File" propertyName="content_type">
        fastq
      </AnnotatedValue>,
      null
    );

    const el = screen.getByText("fastq");
    expect(el.tagName.toLowerCase()).toBe("span");
    expect(el).not.toHaveClass("underline");
    expect(el).not.toHaveAttribute("aria-describedby");
  });

  it("renders plain text when schema property is not found", () => {
    const profiles = {
      Sample: {
        properties: {
          status: {
            type: "string",
            enum_descriptions: { active: "Active item" },
          },
        },
      },
    };

    renderWithSession(
      <AnnotatedValue objectType="File" propertyName="content_type">
        fastq
      </AnnotatedValue>,
      profiles
    );

    const el = screen.getByText("fastq");
    expect(el.tagName.toLowerCase()).toBe("span");
    expect(el).not.toHaveClass("underline");
    expect(el).not.toHaveAttribute("aria-describedby");
  });

  it("renders plain text when string type has no enum_descriptions", () => {
    const profiles = {
      File: {
        properties: {
          content_type: {
            type: "string",
            // enum_descriptions intentionally missing
          },
        },
      },
    };
    renderWithSession(
      <AnnotatedValue objectType="File" propertyName="content_type">
        fastq
      </AnnotatedValue>,
      profiles
    );

    const el = screen.getByText("fastq");
    expect(el.tagName.toLowerCase()).toBe("span");
    expect(el).not.toHaveClass("underline");
    expect(el).not.toHaveAttribute("aria-describedby");
  });

  it("renders annotated tooltip when schema property is a string with enum_descriptions", () => {
    const profiles = {
      File: {
        properties: {
          content_type: {
            type: "string",
            enum_descriptions: {
              fastq: "fastq files contain sequence reads.",
            },
          },
        },
      },
    };

    renderWithSession(
      <AnnotatedValue objectType="File" propertyName="content_type">
        fastq
      </AnnotatedValue>,
      profiles
    );

    const el = screen.getByText("fastq");
    expect(el).toHaveClass("underline");
    const describedBy = el.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const expectedPrefix = `tooltip-file-content-type-fastq`;
    expect(describedBy!.startsWith(expectedPrefix)).toBe(true);
  });

  it("renders annotated tooltip when schema property is an array with enum_descriptions in items", () => {
    const profiles = {
      File: {
        properties: {
          tags: {
            type: "array",
            items: {
              enum_descriptions: {
                Important: "Marked as important.",
              },
            },
          },
        },
      },
    };

    renderWithSession(
      <AnnotatedValue objectType="File" propertyName="tags">
        Important
      </AnnotatedValue>,
      profiles
    );

    const el = screen.getByText("Important");
    expect(el).toHaveClass("underline");
    expect(el).toHaveAttribute("aria-describedby");
  });

  it("renders plain text when array type has no enum_descriptions in items", () => {
    const profiles = {
      File: {
        properties: {
          tags: {
            type: "array",
            items: {
              // enum_descriptions intentionally missing
            },
          },
        },
      },
    };

    renderWithSession(
      <AnnotatedValue objectType="File" propertyName="tags">
        Important
      </AnnotatedValue>,
      profiles
    );

    const el = screen.getByText("Important");
    expect(el.tagName.toLowerCase()).toBe("span");
    expect(el).not.toHaveClass("underline");
    expect(el).not.toHaveAttribute("aria-describedby");
  });

  it("renders plain text when annotation exists but is empty string", () => {
    const profiles = {
      File: {
        properties: {
          content_type: {
            type: "string",
            enum_descriptions: {
              fastq: "", // intentionally empty -> treated as missing
            },
          },
        },
      },
    };

    renderWithSession(
      <AnnotatedValue objectType="File" propertyName="content_type">
        fastq
      </AnnotatedValue>,
      profiles
    );

    const el = screen.getByText("fastq");
    expect(el).not.toHaveClass("underline");
    expect(el).not.toHaveAttribute("aria-describedby");
  });

  it("renders annotated tooltip when using externalAnnotations", () => {
    const externalAnnotations = {
      active: "This item is currently active.",
      inactive: "This item is inactive.",
    };

    renderWithSession(
      <AnnotatedValue externalAnnotations={externalAnnotations}>
        active
      </AnnotatedValue>
    );

    const el = screen.getByText("active");
    expect(el).toHaveClass("underline");
    expect(el).toHaveAttribute("aria-describedby");
  });

  it("renders plain text when externalAnnotations does not contain the value", () => {
    const externalAnnotations = {
      active: "This item is currently active.",
    };

    renderWithSession(
      <AnnotatedValue externalAnnotations={externalAnnotations}>
        inactive
      </AnnotatedValue>
    );

    const el = screen.getByText("inactive");
    expect(el).not.toHaveClass("underline");
    expect(el).not.toHaveAttribute("aria-describedby");
  });

  it("logs error and renders plain text when both schema props and externalAnnotations are provided", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    const externalAnnotations = {
      fastq: "FASTQ format",
    };

    renderWithSession(
      <AnnotatedValue
        objectType="File"
        propertyName="content_type"
        externalAnnotations={externalAnnotations}
      >
        fastq
      </AnnotatedValue>
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "AnnotatedValue cannot have both objectType/propertyName and externalAnnotations"
    );

    const el = screen.getByText("fastq");
    expect(el).not.toHaveClass("underline");
    expect(el).not.toHaveAttribute("aria-describedby");

    consoleErrorSpy.mockRestore();
  });

  it("renders annotated item with custom className", () => {
    const profiles = {
      File: {
        properties: {
          content_type: {
            type: "string",
            enum_descriptions: {
              fastq: "fastq files contain sequence reads.",
            },
          },
        },
      },
    };

    renderWithSession(
      <AnnotatedValue objectType="File" propertyName="content_type">
        fastq
      </AnnotatedValue>,
      profiles
    );

    const el = screen.getByText("fastq");
    expect(el).toHaveClass("underline");
    expect(el).toHaveClass("decoration-help-underline");
  });
});

describe("AnnotatedItem", () => {
  it("renders plain text when annotation is not provided (default empty string)", () => {
    render(
      <>
        <TooltipPortalRoot />
        <AnnotatedItem tooltipKey="test-key">test value</AnnotatedItem>
      </>
    );

    const el = screen.getByText("test value");
    expect(el).not.toHaveClass("underline");
    expect(el).not.toHaveAttribute("aria-describedby");
  });

  it("renders plain text when annotation is empty string", () => {
    render(
      <>
        <TooltipPortalRoot />
        <AnnotatedItem tooltipKey="test-key" annotation="">
          test value
        </AnnotatedItem>
      </>
    );

    const el = screen.getByText("test value");
    expect(el).not.toHaveClass("underline");
    expect(el).not.toHaveAttribute("aria-describedby");
  });

  it("renders annotated item with custom className", () => {
    render(
      <>
        <TooltipPortalRoot />
        <AnnotatedItem
          tooltipKey="test-key"
          annotation="Test annotation"
          className="custom-class"
        >
          test value
        </AnnotatedItem>
      </>
    );

    const el = screen.getByText("test value");
    expect(el).toHaveClass("underline");
    expect(el).toHaveClass("custom-class");
  });
});
