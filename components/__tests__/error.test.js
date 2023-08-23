import { render, screen } from "@testing-library/react";
import Error from "../error";

describe("Test the Error component", () => {
  it("should render the error page with a status code and title", () => {
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
  });

  it("should render the error page with a status code and no title", () => {
    render(<Error statusCode={401} />);

    expect(screen.getByText("401")).toBeInTheDocument();
    expect(screen.queryByTestId("error-title")).not.toBeInTheDocument();
  });

  it("should render the error page with no status code and a title", () => {
    render(<Error title="Unable to sign in." />);

    expect(screen.getByText("ERROR")).toBeInTheDocument();
    expect(screen.getByText("Unable to sign in.")).toBeInTheDocument();
  });

  it("should render the error page with no status code and no title", () => {
    render(<Error />);

    expect(screen.getByText("ERROR")).toBeInTheDocument();
    expect(screen.queryByTestId("error-title")).not.toBeInTheDocument();
  });
});
