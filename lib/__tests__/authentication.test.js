import { getSession, loginToServer, logoutFromServer } from "../authentication";

describe("Test logging into and out of the server", () => {
  it("should log in to the igvfd server", async () => {
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

    const sessionResponse = await loginToServer(signedOutSession, mockCallback);
    expect(sessionResponse).toEqual(sessionProperties);
  });

  it("should log in to the igvfd server", async () => {
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    // Not much to test, so this mostly assures code coverage rather than functionality.
    const response = await logoutFromServer();
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

    const response = await getSession();
    expect(response).toEqual(signedOutSession);
  });
});
