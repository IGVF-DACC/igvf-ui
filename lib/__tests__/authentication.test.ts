import {
  checkAuthErrorUri,
  getDataProviderUrl,
  getSession,
  getSessionProperties,
  loginDataProvider,
  logoutDataProvider,
  loginAuthProvider,
  logoutAuthProvider,
} from "../authentication";

describe("Test logging into and out of the server", () => {
  it("should log in to igvfd", async () => {
    // Looks like the object you get from {igvfd url}/session while signed out.
    const signedOutSession = {
      _csrft_: "6FnqvE30k90JdOE2fr9j1jOX1IsDctBJuQex34nv",
    };

    // Looks like the object returned from igvfd server after logging in.
    const sessionProperties = {
      user: {
        "@id": "/users/627eedbc-7cb3-4de3-9743-a86266e435a6/",
        "@type": ["User", "Item"],
        "@context": "/terms/",
      },
      user_actions: [
        {
          id: "signout",
          title: "Sign out",
          trigger: "logout",
          notSubmittable: true,
        },
      ],
      admin: true,
      "auth.userid": "fytanaka@stanford.edu",
    };

    // Mock fetch() for the POST of the login path to the igvfd server.
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(sessionProperties),
      })
    );

    // Mock getAccessTokenSilently().
    const mockCallback = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(sessionProperties),
      })
    );

    const sessionResponse = await loginDataProvider(
      signedOutSession,
      mockCallback
    );
    expect(sessionResponse).toEqual(sessionProperties);
  });

  it("should log out of igvfd", async () => {
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    // Not much to test, so this mostly assures code coverage rather than functionality.
    const response = await logoutDataProvider();
    expect(response).toEqual({});
  });
});

describe("Test authentication utility functions", () => {
  it("tests getSession() functionality", async () => {
    // Looks like the object you get from {igvfd url}/session while signed out.
    const signedOutSession = {
      _csrft_: "6FnqvE30k90JdOE2fr9j1jOX1IsDctBJuQex34nv",
    };

    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(signedOutSession),
      })
    );

    const response = await getSession("/api/path");
    expect(response).toEqual(signedOutSession);
  });

  it("tests getSessionProperties() functionality", async () => {
    // Looks like the object you get from {igvfd url}/session-properties while signed in.
    const sessionProperties = {
      user: {
        "@id": "/users/627eedbc-7cb3-4de3-9743-a86266e435a6/",
        "@type": ["User", "Item"],
        "@context": "/terms/",
      },
      user_actions: [
        {
          id: "signout",
          title: "Sign out",
          trigger: "logout",
          notSubmittable: true,
        },
      ],
      admin: true,
      "auth.userid": "fytanaka@stanford.edu",
    };

    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(sessionProperties),
      })
    );

    const response = await getSessionProperties("/api/path");
    expect(response).toEqual(sessionProperties);
  });

  test("getDataProviderUrl() returns the correct url", async () => {
    const correctResponse = "http://localhost:8000";

    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ dataProviderUrl: correctResponse }),
      })
    );

    const response = await getDataProviderUrl();
    expect(response).toEqual(correctResponse);
  });

  test("getDataProviderUrl() returns null on an error", async () => {
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve(),
      })
    );

    const response = await getDataProviderUrl();
    expect(response).toEqual(null);
  });
});

describe("Test logging in and out of Auth0", () => {
  const { window } = global;

  beforeEach(() => {
    const locationMock = {
      href: "http://localhost",
      assign: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      hash: "",
      host: "localhost",
      hostname: "localhost",
      origin: "http://localhost",
      pathname: "/",
      port: "",
      protocol: "http:",
      search: "",
      toString: () => "http://localhost",
    } as unknown as Location;

    Object.defineProperty(window, "location", {
      value: locationMock,
      writable: true,
    });
  });

  it("should log in to Auth0 at home path", () => {
    window.location.pathname = "/";
    const loginWithRedirect = jest.fn().mockImplementation(() => {});

    loginAuthProvider(loginWithRedirect);
    expect(loginWithRedirect).toHaveBeenCalled();
  });

  it("should log in to Auth0 at error path", () => {
    window.location.pathname = "/auth-error/";
    const loginWithRedirect = jest.fn().mockImplementation(() => {});

    loginAuthProvider(loginWithRedirect);
    expect(loginWithRedirect).toHaveBeenCalled();
  });

  it("should log out of Auth0 with no alternate path", () => {
    const logout = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    // Make sure mockCallback gets called.
    logoutAuthProvider(logout);
    expect(logout).toHaveBeenCalled();
  });

  it("should log out of Auth0 with an alternate path", () => {
    const logout = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    // Make sure mockCallback gets called.
    logoutAuthProvider(logout, "/alternate-path");
    expect(logout).toHaveBeenCalled();
  });
});

describe("Test checkAuthErrorUri()", () => {
  it("should return true for the AUTH_ERROR_URI", () => {
    const result = checkAuthErrorUri("/auth-error/");
    expect(result).toBe(true);
  });

  it("should return true for the AUTH_ERROR_URI without trailing slash", () => {
    const result = checkAuthErrorUri("/auth-error");
    expect(result).toBe(true);
  });

  it("should return false for a different path", () => {
    const result = checkAuthErrorUri("/some-other-path");
    expect(result).toBe(false);
  });
});
