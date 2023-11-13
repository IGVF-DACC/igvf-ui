import { render, screen, within } from "@testing-library/react";
import { useAuth0 } from "@auth0/auth0-react";
import Error from "../error";

jest.mock("@auth0/auth0-react", () => ({
  useAuth0: jest.fn(),
}));

describe("Test the Error component while logged out", () => {
  it("should render the error page with a status code and title", () => {
    useAuth0.mockReturnValueOnce({
      isAuthenticated: false,
      loginWithRedirect: jest.fn(),
    });

    render(
      <Error
        statusCode="AUTHENTICATION"
        title="Unable to sign in. You can still explore the site without viewing unreleased data."
      />
    );

    expect(screen.getByText("AUTHENTICATION")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Unable to sign in. You can still explore the site without viewing unreleased data."
      )
    ).toBeInTheDocument();
    expect(screen.queryByTestId("error-login")).not.toBeInTheDocument();
  });

  it("should render the error page with a status code and no title", () => {
    useAuth0.mockReturnValueOnce({
      isAuthenticated: false,
      loginWithRedirect: jest.fn(),
    });

    render(<Error statusCode={401} />);

    expect(screen.getByText("401")).toBeInTheDocument();
    expect(screen.queryByTestId("error-title")).not.toBeInTheDocument();
    expect(screen.queryByTestId("error-login")).not.toBeInTheDocument();
  });

  it("should render the error page with 403 status, title, and login help", () => {
    const loginWithRedirect = jest.fn();
    useAuth0.mockReturnValueOnce({
      isAuthenticated: false,
      loginWithRedirect,
    });

    render(
      <Error statusCode={403} title="Access was denied to this resource" />
    );

    const title = screen.getByTestId("error-title");
    const loginHelp = screen.getByTestId("error-login");
    expect(screen.getByText("403")).toBeInTheDocument();
    expect(title).toBeInTheDocument();
    expect(loginHelp).toBeInTheDocument();
    expect(within(loginHelp).getByText("sign in"));

    screen.getByRole("button").click();
    expect(loginWithRedirect).toHaveBeenCalled();
  });

  it("should render the error page with no status code and a title", () => {
    useAuth0.mockReturnValueOnce({
      isAuthenticated: false,
      loginWithRedirect: jest.fn(),
    });

    render(<Error title="Unable to sign in." />);

    expect(screen.getByText("ERROR")).toBeInTheDocument();
    expect(screen.getByText("Unable to sign in.")).toBeInTheDocument();
    expect(screen.queryByTestId("error-login")).not.toBeInTheDocument();
  });

  it("should render the error page with no status code and no title", () => {
    useAuth0.mockReturnValueOnce({
      isAuthenticated: false,
      loginWithRedirect: jest.fn(),
    });

    render(<Error />);

    expect(screen.getByText("ERROR")).toBeInTheDocument();
    expect(screen.queryByTestId("error-title")).not.toBeInTheDocument();
    expect(screen.queryByTestId("error-login")).not.toBeInTheDocument();
  });
});

describe("Test the Error component while logged in", () => {
  it("should render the error page with 403 status, title, and no login help", () => {
    const loginWithRedirect = jest.fn();
    useAuth0.mockReturnValueOnce({
      isAuthenticated: true,
      loginWithRedirect,
    });

    render(
      <Error statusCode={403} title="Access was denied to this resource" />
    );

    const title = screen.getByTestId("error-title");
    const loginHelp = screen.queryByTestId("error-login");
    expect(screen.getByText("403")).toBeInTheDocument();
    expect(title).toBeInTheDocument();
    expect(loginHelp).toBeNull();
  });
});
