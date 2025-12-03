import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { SiteInfo, Email, Twitter, CreativeCommons } from "../site-info";
import { fetchVersions } from "../../lib/site-versions";

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
});

// Mock the fetchVersions function
jest.mock("../../lib/site-versions", () => ({
  fetchVersions: jest.fn(),
}));

const mockFetchVersions = fetchVersions as jest.MockedFunction<
  typeof fetchVersions
>;

describe("SiteInfo component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders version numbers after fetching", async () => {
    mockFetchVersions.mockResolvedValueOnce({
      uiVersion: "1.2.3",
      serverVersion: "4.5.6",
    });

    render(<SiteInfo />);

    await waitFor(() => {
      expect(screen.getByTestId("version-ui")).toHaveTextContent("v1.2.3");
      expect(screen.getByTestId("version-server")).toHaveTextContent("v4.5.6");
    });

    expect(mockFetchVersions).toHaveBeenCalledTimes(1);
  });

  it("does not render when fetchVersions returns null", async () => {
    mockFetchVersions.mockResolvedValueOnce(null);

    const { container } = render(<SiteInfo />);

    await waitFor(() => {
      expect(mockFetchVersions).toHaveBeenCalledTimes(1);
    });

    expect(container.firstChild).toBeNull();
  });

  it("copies version info to clipboard when clicked", async () => {
    mockFetchVersions.mockResolvedValueOnce({
      uiVersion: "1.2.3",
      serverVersion: "4.5.6",
    });

    render(<SiteInfo />);

    await waitFor(() => {
      expect(screen.getByTestId("version-ui")).toBeInTheDocument();
    });

    const button = screen.getByRole("button", {
      name: "Copy UI and server versions to clipboard",
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "UI Version: v1.2.3\nServer Version: v4.5.6"
      );
    });
  });

  it("shows check icon when copy is successful", async () => {
    mockFetchVersions.mockResolvedValueOnce({
      uiVersion: "1.2.3",
      serverVersion: "4.5.6",
    });

    render(<SiteInfo />);

    await waitFor(() => {
      expect(screen.getByTestId("version-ui")).toBeInTheDocument();
    });

    const button = screen.getByRole("button", {
      name: "Copy UI and server versions to clipboard",
    });

    // Check icon should not be visible initially
    expect(screen.queryByTestId("check-circle-icon")).not.toBeInTheDocument();

    fireEvent.click(button);

    // Check that the opacity changes when copied
    await waitFor(() => {
      const versionDiv = screen.getByTestId("version-ui").parentElement;
      expect(versionDiv).toHaveClass("opacity-30");
    });
  });
});

describe("Email component", () => {
  it("renders email link with correct attributes", () => {
    render(<Email />);

    const link = screen.getByRole("link", {
      name: "Email the IGVF help desk",
    });
    expect(link).toHaveAttribute(
      "href",
      "mailto:igvf-portal-help@lists.stanford.edu"
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer noopener");
  });
});

describe("Twitter component", () => {
  it("renders Twitter link with correct attributes", () => {
    render(<Twitter />);

    const link = screen.getByRole("link", {
      name: "IGVF Consortium on X",
    });
    expect(link).toHaveAttribute("href", "https://twitter.com/IGVFConsortium");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer noopener");
  });
});

describe("CreativeCommons component", () => {
  it("renders Creative Commons link with correct attributes", () => {
    render(<CreativeCommons />);

    const link = screen.getByRole("link", {
      name: "Creative Commons Attribution (CC BY) license",
    });
    expect(link).toHaveAttribute(
      "href",
      "https://creativecommons.org/licenses/by/4.0/"
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer noopener");
  });
});
