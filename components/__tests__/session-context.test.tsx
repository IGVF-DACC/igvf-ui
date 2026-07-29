import { useAuth0 } from "@auth0/auth0-react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/router";
import {
  createUnverifiedAccount,
  getDataProviderUrl,
  getSession,
  getSessionProperties,
  loginDataProvider,
  logoutAuthProvider,
  logoutDataProvider,
} from "../../lib/authentication";
import getCollectionTitles from "../../lib/collection-titles";
import { AUTH_ERROR_URI } from "../../lib/constants";
import { getProfiles } from "../../lib/profiles";
import SessionContext, {
  OfferCreateAccountModal,
  Session,
} from "../session-context";

jest.mock("@auth0/auth0-react", () => ({
  useAuth0: jest.fn(),
}));

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../../lib/authentication", () => ({
  createUnverifiedAccount: jest.fn(),
  getDataProviderUrl: jest.fn(),
  getSession: jest.fn(),
  getSessionProperties: jest.fn(),
  loginDataProvider: jest.fn(),
  logoutAuthProvider: jest.fn(),
  logoutDataProvider: jest.fn(),
}));

jest.mock("../../lib/collection-titles", () => jest.fn());
jest.mock("../../lib/profiles", () => ({
  getProfiles: jest.fn(),
}));

jest.mock("../modal", () => {
  function MockModal({
    children,
    testid,
  }: {
    children: React.ReactNode;
    testid: string;
  }) {
    return <div data-testid={testid}>{children}</div>;
  }

  MockModal.Header = function MockHeader({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <div>{children}</div>;
  };
  MockModal.Body = function MockBody({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <div>{children}</div>;
  };
  MockModal.Footer = function MockFooter({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <div>{children}</div>;
  };

  return MockModal;
});

const mockUseAuth0 = useAuth0 as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;
const mockCreateUnverifiedAccount = createUnverifiedAccount as jest.Mock;
const mockGetDataProviderUrl = getDataProviderUrl as jest.Mock;
const mockGetSession = getSession as jest.Mock;
const mockGetSessionProperties = getSessionProperties as jest.Mock;
const mockLoginDataProvider = loginDataProvider as jest.Mock;
const mockLogoutAuthProvider = logoutAuthProvider as jest.Mock;
const mockLogoutDataProvider = logoutDataProvider as jest.Mock;
const mockGetCollectionTitles = getCollectionTitles as jest.Mock;
const mockGetProfiles = getProfiles as jest.Mock;

const dataProviderUrl = "http://localhost:8000";
const loggedOutSession = { _csrft_: "logged-out-csrf-token" };
const refreshedSession = { _csrft_: "refreshed-csrf-token" };
const signedInSession = {
  _csrft_: "signed-in-csrf-token",
  "auth.userid": "user@example.org",
};
const sessionProperties = {
  "auth.userid": "user@example.org",
  admin: false,
};
const loginDenied = {
  "@type": ["LoginDenied", "Error"],
  status: "error",
  code: 403,
  title: "Login failure",
  description: "Access was denied to this resource.",
};
const serverError = {
  "@type": ["InternalServerError", "Error"],
  status: "error",
  code: 500,
  title: "Server error",
  description: "Login failed unexpectedly.",
};

function configureAuth0({ isAuthenticated = false, isLoading = true } = {}) {
  const getAccessTokenSilently = jest
    .fn()
    .mockResolvedValue("mock-access-token");
  const logout = jest.fn();
  mockUseAuth0.mockReturnValue({
    getAccessTokenSilently,
    isAuthenticated,
    isLoading,
    logout,
  });
  return { getAccessTokenSilently, logout };
}

function configureInitialRequests() {
  mockGetDataProviderUrl.mockResolvedValue(dataProviderUrl);
  mockGetSession.mockResolvedValue(loggedOutSession);
  mockGetSessionProperties.mockResolvedValue({});
  mockGetProfiles.mockResolvedValue({ User: {} });
  mockGetCollectionTitles.mockResolvedValue({ User: "Users" });
}

describe("OfferCreateAccountModal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <OfferCreateAccountModal
        open={false}
        isSubmitting={false}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("offers account creation and invokes both actions", () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    render(
      <OfferCreateAccountModal
        open
        isSubmitting={false}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("disables its actions while creating an account", () => {
    render(
      <OfferCreateAccountModal
        open
        isSubmitting
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: "Creating Account..." })
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });
});

describe("Session", () => {
  const replace = jest.fn();

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    configureInitialRequests();
    configureAuth0();
    mockUseRouter.mockReturnValue({ replace });
    mockLogoutDataProvider.mockResolvedValue({});
    mockCreateUnverifiedAccount.mockResolvedValue({ status: "success" });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("loads the shared session data and renders its children", async () => {
    render(
      <Session>
        <SessionContext.Consumer>
          {(value) => (
            <div>Session child: {value.dataProviderUrl || "loading"}</div>
          )}
        </SessionContext.Consumer>
      </Session>
    );

    expect(screen.getByText("Session child: loading")).toBeInTheDocument();
    await waitFor(() => {
      expect(mockGetDataProviderUrl).toHaveBeenCalled();
      expect(mockGetSession).toHaveBeenCalledWith(dataProviderUrl);
      expect(mockGetSessionProperties).toHaveBeenCalledWith(dataProviderUrl);
      expect(mockGetProfiles).toHaveBeenCalled();
      expect(mockGetCollectionTitles).toHaveBeenCalled();
    });
    expect(
      screen.getByText(`Session child: ${dataProviderUrl}`)
    ).toBeInTheDocument();
  });

  it("logs a known user into igvfd and returns to the original page", async () => {
    const { getAccessTokenSilently } = configureAuth0({
      isAuthenticated: true,
      isLoading: false,
    });
    mockGetSession
      .mockResolvedValueOnce(loggedOutSession)
      .mockResolvedValueOnce(signedInSession);
    mockLoginDataProvider.mockResolvedValue(sessionProperties);

    render(
      <Session postLoginRedirectUri="/search/?type=File">
        <div>Session child</div>
      </Session>
    );

    await waitFor(() => {
      expect(mockLoginDataProvider).toHaveBeenCalledWith(
        loggedOutSession,
        getAccessTokenSilently
      );
      expect(replace).toHaveBeenCalledWith("/search/?type=File");
    });
    expect(screen.queryByTestId("offer-create-account-modal")).toBeNull();
  });

  it("finishes login without redirecting when no return URI exists", async () => {
    configureAuth0({ isAuthenticated: true, isLoading: false });
    mockGetSession
      .mockResolvedValueOnce(loggedOutSession)
      .mockResolvedValueOnce(signedInSession);
    mockLoginDataProvider.mockResolvedValue(sessionProperties);

    render(<Session />);

    await waitFor(() => {
      expect(mockLoginDataProvider).toHaveBeenCalled();
    });
    expect(replace).not.toHaveBeenCalled();
  });

  it("offers account creation to an unknown user and cancels it", async () => {
    const { logout } = configureAuth0({
      isAuthenticated: true,
      isLoading: false,
    });
    mockGetSession
      .mockResolvedValueOnce(loggedOutSession)
      .mockResolvedValueOnce(refreshedSession);
    mockLoginDataProvider.mockResolvedValue(loginDenied);

    render(<Session />);

    const cancel = await screen.findByRole("button", { name: "Cancel" });
    fireEvent.click(cancel);

    expect(mockLogoutAuthProvider).toHaveBeenCalledWith(logout, "/");
  });

  it("creates an account and retries the normal login", async () => {
    const { getAccessTokenSilently } = configureAuth0({
      isAuthenticated: true,
      isLoading: false,
    });
    mockGetSession
      .mockResolvedValueOnce(loggedOutSession)
      .mockResolvedValueOnce(refreshedSession)
      .mockResolvedValueOnce(signedInSession);
    mockLoginDataProvider
      .mockResolvedValueOnce(loginDenied)
      .mockResolvedValueOnce(sessionProperties);

    render(<Session />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Create Account" })
    );

    await waitFor(() => {
      expect(mockCreateUnverifiedAccount).toHaveBeenCalledWith(
        refreshedSession,
        getAccessTokenSilently
      );
      expect(mockLoginDataProvider).toHaveBeenCalledTimes(2);
    });
  });

  it.each([
    ["a backend error", serverError],
    [
      "a backend error without a description",
      { ...serverError, description: undefined },
    ],
    ["an empty response", null],
  ])("logs out to the error page after %s", async (_name, response) => {
    const { logout } = configureAuth0({
      isAuthenticated: true,
      isLoading: false,
    });
    mockLoginDataProvider.mockResolvedValue(response);

    render(<Session />);

    await waitFor(() => {
      expect(mockLogoutAuthProvider).toHaveBeenCalledWith(
        logout,
        AUTH_ERROR_URI
      );
    });
  });

  it("logs out to the error page when refreshing a denied session fails", async () => {
    const { logout } = configureAuth0({
      isAuthenticated: true,
      isLoading: false,
    });
    mockGetSession
      .mockResolvedValueOnce(loggedOutSession)
      .mockResolvedValueOnce(null);
    mockLoginDataProvider.mockResolvedValue(loginDenied);

    render(<Session />);

    await waitFor(() => {
      expect(mockLogoutAuthProvider).toHaveBeenCalledWith(
        logout,
        AUTH_ERROR_URI
      );
    });
  });

  it("logs out to the error page when account creation fails", async () => {
    const { logout } = configureAuth0({
      isAuthenticated: true,
      isLoading: false,
    });
    mockGetSession
      .mockResolvedValueOnce(loggedOutSession)
      .mockResolvedValueOnce(refreshedSession);
    mockLoginDataProvider.mockResolvedValue(loginDenied);
    mockCreateUnverifiedAccount.mockResolvedValue(serverError);

    render(<Session />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Create Account" })
    );

    await waitFor(() => {
      expect(mockLogoutAuthProvider).toHaveBeenCalledWith(
        logout,
        AUTH_ERROR_URI
      );
    });
  });

  it("uses a fallback message when account creation fails without a description", async () => {
    const { logout } = configureAuth0({
      isAuthenticated: true,
      isLoading: false,
    });
    mockGetSession
      .mockResolvedValueOnce(loggedOutSession)
      .mockResolvedValueOnce(refreshedSession);
    mockLoginDataProvider.mockResolvedValue(loginDenied);
    mockCreateUnverifiedAccount.mockResolvedValue({
      ...serverError,
      description: undefined,
    });

    render(<Session />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Create Account" })
    );

    await waitFor(() => {
      expect(mockLogoutAuthProvider).toHaveBeenCalledWith(
        logout,
        AUTH_ERROR_URI
      );
    });
  });

  it("logs the user out of igvfd when Auth0 is logged out", async () => {
    configureAuth0({ isAuthenticated: false, isLoading: false });
    mockGetSessionProperties.mockResolvedValue(sessionProperties);
    const replaceLocation = jest.fn();
    Object.defineProperty(window, "location", {
      value: { ...window.location, replace: replaceLocation },
      writable: true,
    });

    render(<Session />);

    await waitFor(() => {
      expect(mockLogoutDataProvider).toHaveBeenCalled();
      expect(replaceLocation).toHaveBeenCalledWith("/");
    });
  });

  it("does not log out of igvfd without an authenticated backend session", async () => {
    configureAuth0({ isAuthenticated: false, isLoading: false });
    mockGetSessionProperties.mockResolvedValue({});

    render(<Session />);

    await waitFor(() => {
      expect(mockGetSessionProperties).toHaveBeenCalled();
    });
    expect(mockLogoutDataProvider).not.toHaveBeenCalled();
  });
});
