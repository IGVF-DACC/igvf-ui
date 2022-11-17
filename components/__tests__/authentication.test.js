import { useAuth0 } from "@auth0/auth0-react";
import { render, screen } from "@testing-library/react";
import { useAuthenticated } from "../authentication";

/**
 * Method to mock the useAuth0 hook comes from:
 * https://stackoverflow.com/questions/45758366/how-to-change-jest-mock-function-return-value-in-each-testanswer-45758767
 * This method lets you change the return values of the hook between tests.
 */
jest.mock("@auth0/auth0-react", () => ({
  useAuth0: jest.fn(),
}));

const Component = () => {
  const isAuthenticated = useAuthenticated();
  return (
    <div>
      {isAuthenticated ? (
        <div>Authenticated</div>
      ) : (
        <div>Not authenticated</div>
      )}
    </div>
  );
};

describe("Test authentication custom react hook", () => {
  it("should show 'Authenticated' text when authenticated", () => {
    useAuth0.mockReturnValueOnce({ isLoading: false, isAuthenticated: true });

    render(<Component />);

    const outputText = screen.getByText("Authenticated");
    expect(outputText).toBeInTheDocument();
  });

  it("should show 'Not authenticated' text when loading", () => {
    useAuth0.mockReturnValueOnce({ isLoading: true, isAuthenticated: false });

    // https://stackoverflow.com/questions/60270013/how-to-mock-react-custom-hook-returned-value#answer-70448042
    render(<Component />);

    const outputText = screen.getByText("Not authenticated");
    expect(outputText).toBeInTheDocument();
  });
});
