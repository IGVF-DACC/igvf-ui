import { render, screen } from "@testing-library/react";
import QualitySection from "../quality-section";

describe("Test QualitySection component", () => {
  const mockItem = {
    status: "active",
    upload_status: "uploaded",
  };

  const mockAuditState = {
    isDetailOpen: false,
    toggleDetailsOpen: jest.fn(),
  };

  it("displays status and upload status", () => {
    render(<QualitySection item={mockItem} auditState={mockAuditState} />);
    expect(screen.getByText("active")).toBeInTheDocument();
    expect(screen.getByText("uploaded")).toBeInTheDocument();
    // Check that the wrapper section class does not contain "@lg/main:flex-nowrap"
    const section = screen.getByRole("region");
    expect(section).toHaveClass("flex flex-wrap justify-start gap-1");
    expect(section).not.toHaveClass("@lg/main:flex-nowrap");
  });

  it("displays status and upload status in header", () => {
    render(
      <QualitySection
        item={mockItem}
        auditState={mockAuditState}
        isForHeader={true}
      />
    );
    expect(screen.getByText("active")).toBeInTheDocument();
    expect(screen.getByText("uploaded")).toBeInTheDocument();
    const section = screen.getByRole("region");
    expect(section).toHaveClass("flex flex-wrap justify-start gap-1");
    expect(section).toHaveClass("@lg/main:flex-nowrap");
  });
});
