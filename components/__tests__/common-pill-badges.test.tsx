import { render, screen } from "@testing-library/react";
import {
  UniformlyProcessedBadge,
  ExternallyHostedBadge,
} from "../common-pill-badges";

describe("UniformlyProcessedBadge", () => {
  it("renders text and icon with default props", () => {
    render(<UniformlyProcessedBadge />);

    const badge = screen.getByTestId("uniform-pipeline-badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("uniformly processed");

    const svg = badge.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("h-4", "w-4");
  });

  it("renders with custom className", () => {
    render(<UniformlyProcessedBadge className="custom-class" />);

    const badge = screen.getByTestId("uniform-pipeline-badge");
    expect(badge).toHaveClass("custom-class");
  });

  it("renders with custom label", () => {
    render(<UniformlyProcessedBadge label="custom uniform label" />);

    const badge = screen.getByTestId("uniform-pipeline-badge");
    expect(badge).toHaveTextContent("custom uniform label");
  });

  it("renders in abbreviated mode", () => {
    render(<UniformlyProcessedBadge isAbbreviated={true} />);

    const badge = screen.getByTestId("uniform-pipeline-badge-abbreviated");
    expect(badge).toBeInTheDocument();

    // Should have the icon but not the text content
    const svg = badge.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("h-4", "w-4");

    // Should not have the text div when abbreviated
    expect(badge).not.toHaveTextContent("uniformly processed");
  });

  it("renders in abbreviated mode with custom label", () => {
    render(
      <UniformlyProcessedBadge
        isAbbreviated={true}
        label="custom abbreviated"
      />
    );

    const badge = screen.getByTestId("uniform-pipeline-badge-abbreviated");
    expect(badge).toBeInTheDocument();

    // Should not display the label text when abbreviated
    expect(badge).not.toHaveTextContent("custom abbreviated");
  });

  it("renders in full mode with explicitly false isAbbreviated", () => {
    render(<UniformlyProcessedBadge isAbbreviated={false} />);

    const badge = screen.getByTestId("uniform-pipeline-badge");
    expect(badge).toHaveTextContent("uniformly processed");

    // Should have both icon and text
    const svg = badge.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders with all custom props", () => {
    render(
      <UniformlyProcessedBadge
        className="all-custom-class"
        label="all custom label"
        isAbbreviated={false}
      />
    );

    const badge = screen.getByTestId("uniform-pipeline-badge");
    expect(badge).toHaveClass("all-custom-class");
    expect(badge).toHaveTextContent("all custom label");
  });
});

describe("ExternallyHostedBadge", () => {
  it("renders label and icon with default props", () => {
    render(<ExternallyHostedBadge />);

    const badge = screen.getByTestId("externally-hosted-badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("externally hosted");

    const svg = badge.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("h-4", "w-4");
  });

  it("renders with custom className", () => {
    render(<ExternallyHostedBadge className="external-custom-class" />);

    const badge = screen.getByTestId("externally-hosted-badge");
    expect(badge).toHaveClass("external-custom-class");
    expect(badge).toHaveTextContent("externally hosted");
  });

  it("renders without className", () => {
    render(<ExternallyHostedBadge />);

    const badge = screen.getByTestId("externally-hosted-badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("externally hosted");
  });
});

describe("Badge styling and structure", () => {
  it("UniformlyProcessedBadge has correct styling classes", () => {
    render(<UniformlyProcessedBadge />);

    const badge = screen.getByTestId("uniform-pipeline-badge");
    expect(badge).toHaveClass(
      "bg-amber-300",
      "text-black",
      "ring-amber-500",
      "dark:bg-amber-800",
      "dark:text-white"
    );
  });

  it("ExternallyHostedBadge has correct styling classes", () => {
    render(<ExternallyHostedBadge />);

    const badge = screen.getByTestId("externally-hosted-badge");
    expect(badge).toHaveClass(
      "bg-blue-200",
      "text-black",
      "ring-blue-500",
      "dark:bg-blue-800",
      "dark:text-white"
    );
  });
});
