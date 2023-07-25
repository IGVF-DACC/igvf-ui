import { render, screen } from "@testing-library/react";
import { UC } from "../../../lib/constants";
import PageComponent from "../index";

describe("Test the VIDEO_YOUTUBE page component", () => {
  it("renders an iframe for a VIDEO_YOUTUBE page component", () => {
    render(<PageComponent spec={`VIDEO_YOUTUBE${UC.newline}id=8yrnf4oG95Y`} />);

    // Make sure an iframe appears and has the correct src attribute.
    const iframe = screen.getByTestId("video-youtube");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/8yrnf4oG95Y",
    );
  });

  it("renders an iframe for a VIDEO_YOUTUBE page component with a starting time", () => {
    render(
      <PageComponent
        spec={`VIDEO_YOUTUBE${UC.newline}id=8yrnf4oG95Y${UC.newline}start=250`}
      />,
    );

    // Make sure an iframe appears and has the correct src attribute.
    const iframe = screen.getByTestId("video-youtube");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/8yrnf4oG95Y?start=250",
    );
  });

  it("renders nothing if the VIDEO_YOUTUBE component doesn't have a video ID", () => {
    render(<PageComponent spec={`VIDEO_YOUTUBE`} />);

    // Make sure no iframe appears.
    const iframe = screen.queryByTestId("video-youtube");
    expect(iframe).not.toBeInTheDocument();
  });
});
