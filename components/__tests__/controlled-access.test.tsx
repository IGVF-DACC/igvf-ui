import { render, screen } from "@testing-library/react";
import { ControlledAccessIndicator } from "../controlled-access";
import { type InstitutionalCertificateObject } from "../../lib/data-use-limitation";

describe("tests for ControlledAccessIndicator", () => {
  test("renders a controlled access indicator when item has controlled access", () => {
    const item: InstitutionalCertificateObject = {
      "@id": "/xyz/1234",
      "@type": ["InstitutionalCertificate", "Item"],
      certificate_identifier: "IP003-234",
      controlled_access: true,
      data_use_limitation_summary: "No limitations",
      summary: "IP003",
      urls: ["https://drive.google.com"],
    };
    render(<ControlledAccessIndicator item={item} />);
    expect(screen.getByTestId("controlled-access-badge")).toBeInTheDocument();
  });

  test("does not render a controlled access indicator when item does not have controlled access", () => {
    const item: InstitutionalCertificateObject = {
      "@id": "/xyz/1234",
      "@type": ["InstitutionalCertificate", "Item"],
      certificate_identifier: "IP003-234",
      controlled_access: false,
      data_use_limitation_summary: "No limitations",
      summary: "IP003",
      urls: ["https://drive.google.com"],
    };
    render(<ControlledAccessIndicator item={item} />);
    expect(
      screen.queryByTestId("controlled-access-badge")
    ).not.toBeInTheDocument();
  });
});
