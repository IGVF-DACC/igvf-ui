import { render } from "@testing-library/react";
import PageComponent from "../index";

describe("Test page component special conditions", () => {
  it("renders nothing for unknown component labels", () => {
    const { container } = render(<PageComponent spec="UNKNOWN" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing for a component label with unrecognized characters", () => {
    const { container } = render(<PageComponent spec="UN-KNOWN" />);
    expect(container.firstChild).toBeNull();
  });
});
