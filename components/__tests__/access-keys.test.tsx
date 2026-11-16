import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createAccessKey } from "../../lib/access-keys";
import { CreateAccessKeyTrigger } from "../access-keys";
import SessionContext, { type SessionContextValue } from "../session-context";

jest.mock("../../lib/access-keys", () => ({
  createAccessKey: jest.fn(),
  deleteAccessKey: jest.fn(),
  resetAccessKey: jest.fn(),
}));

const mockCreateAccessKey = createAccessKey as jest.Mock;

const sessionContextValue = {
  session: { _csrft_: "csrf-token" },
  sessionProperties: {
    user: { lab: "/labs/example/" },
  },
  profiles: null,
  collectionTitles: null,
  dataProviderUrl: "http://localhost:8000",
} as SessionContextValue;

describe("CreateAccessKeyTrigger", () => {
  it("displays a recognized backend error that omits detail", async () => {
    const onError = jest.fn();
    mockCreateAccessKey.mockRejectedValue({
      "@type": ["LoginDenied", "Error"],
      description: "Access was denied to this resource.",
    });

    render(
      <SessionContext.Provider value={sessionContextValue}>
        <CreateAccessKeyTrigger
          onAccessKeyChange={jest.fn()}
          onError={onError}
        />
      </SessionContext.Provider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Create Access Key" }));

    await waitFor(() => {
      expect(onError).toHaveBeenLastCalledWith(
        "Access was denied to this resource."
      );
    });
  });
});
