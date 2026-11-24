import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  createAccessKey,
  deleteAccessKey,
  resetAccessKey,
} from "../../lib/access-keys";
import {
  AccessKeyItem,
  AccessKeyList,
  CreateAccessKeyTrigger,
  ResetAccessKeyTrigger,
} from "../access-keys";
import { ModalManagerProvider } from "../modal-manager";
import SessionContext, { type SessionContextValue } from "../session-context";

jest.mock("../../lib/access-keys", () => ({
  createAccessKey: jest.fn(),
  deleteAccessKey: jest.fn(),
  resetAccessKey: jest.fn(),
}));

const mockCreateAccessKey = createAccessKey as jest.Mock;
const mockDeleteAccessKey = deleteAccessKey as jest.Mock;
const mockResetAccessKey = resetAccessKey as jest.Mock;

const sessionContextValue = {
  session: { _csrft_: "csrf-token" },
  sessionProperties: { user: { lab: "/labs/example/" } },
  profiles: null,
  collectionTitles: null,
  dataProviderUrl: "http://localhost:8000",
} as SessionContextValue;

function renderWithSession(
  component: React.ReactNode,
  contextValue = sessionContextValue
) {
  return render(
    <ModalManagerProvider>
      <SessionContext.Provider value={contextValue}>
        {component}
      </SessionContext.Provider>
    </ModalManagerProvider>
  );
}

describe("CreateAccessKeyTrigger", () => {
  it("does not offer access-key creation to a user without a lab", () => {
    const contextValue = {
      ...sessionContextValue,
      sessionProperties: { user: {} },
    } as SessionContextValue;
    const { container } = renderWithSession(
      <CreateAccessKeyTrigger
        onAccessKeyChange={jest.fn()}
        onError={jest.fn()}
      />,
      contextValue
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("creates a key, displays its credentials, copies them, and closes the modal", async () => {
    const onAccessKeyChange = jest.fn();
    const onError = jest.fn();
    mockCreateAccessKey.mockResolvedValue({
      access_key_id: "new-key-id",
      secret_access_key: "new-key-secret",
    });
    renderWithSession(
      <CreateAccessKeyTrigger
        onAccessKeyChange={onAccessKeyChange}
        onError={onError}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Create Access Key" }));

    expect(await screen.findByText("Your new secret key")).toBeInTheDocument();
    expect(screen.getByText("new-key-id")).toBeInTheDocument();
    expect(screen.getByText("new-key-secret")).toBeInTheDocument();
    expect(onError).toHaveBeenCalledWith("");
    expect(onAccessKeyChange).toHaveBeenCalledTimes(1);

    const copyIdButton = screen.getByRole("button", { name: "Access Key ID" });
    fireEvent.click(copyIdButton);
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("new-key-id");
      expect(copyIdButton.querySelectorAll("path")).toHaveLength(1);
    });

    const closeButtons = screen.getAllByRole("button", {
      name: "Close dialog containing your new access key",
    });
    fireEvent.click(closeButtons[closeButtons.length - 1]);
    expect(screen.queryByText("Your new secret key")).not.toBeInTheDocument();
  });

  it("displays a recognized backend error that omits detail", async () => {
    const onError = jest.fn();
    mockCreateAccessKey.mockRejectedValue({
      "@type": ["LoginDenied", "Error"],
      description: "Access was denied to this resource.",
    });
    renderWithSession(
      <CreateAccessKeyTrigger onAccessKeyChange={jest.fn()} onError={onError} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Create Access Key" }));

    await waitFor(() => {
      expect(onError).toHaveBeenLastCalledWith(
        "Access was denied to this resource."
      );
    });
  });

  it("trims and deduplicates backend error messages", async () => {
    const onError = jest.fn();
    mockCreateAccessKey.mockRejectedValue({
      "@type": ["Error"],
      description: "  Duplicate message  ",
      detail: "Duplicate message",
    });
    renderWithSession(
      <CreateAccessKeyTrigger onAccessKeyChange={jest.fn()} onError={onError} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Create Access Key" }));

    await waitFor(() => {
      expect(onError).toHaveBeenLastCalledWith("Duplicate message");
    });
  });

  it("uses the action fallback for an empty backend error", async () => {
    const onError = jest.fn();
    mockCreateAccessKey.mockRejectedValue({
      "@type": ["Error"],
      description: " ",
      detail: null,
    });
    renderWithSession(
      <CreateAccessKeyTrigger onAccessKeyChange={jest.fn()} onError={onError} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Create Access Key" }));

    await waitFor(() => {
      expect(onError).toHaveBeenLastCalledWith(
        "Unable to create the access key."
      );
    });
  });

  it("uses an Error message and falls back for an unknown error", async () => {
    const onError = jest.fn();
    mockCreateAccessKey
      .mockRejectedValueOnce(new Error("Request failed"))
      .mockRejectedValueOnce(null);
    renderWithSession(
      <CreateAccessKeyTrigger onAccessKeyChange={jest.fn()} onError={onError} />
    );
    const trigger = screen.getByRole("button", { name: "Create Access Key" });

    fireEvent.click(trigger);
    await waitFor(() => {
      expect(onError).toHaveBeenLastCalledWith("Request failed");
    });
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(onError).toHaveBeenLastCalledWith(
        "Unable to create the access key."
      );
    });
  });
});

describe("ResetAccessKeyTrigger", () => {
  it("resets a key, displays the new secret, and closes the modal", async () => {
    const onError = jest.fn();
    mockResetAccessKey.mockResolvedValue({ secret_access_key: "reset-secret" });
    renderWithSession(
      <ResetAccessKeyTrigger accessKeyId="key-to-reset" onError={onError} />
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Reset access key key-to-reset" })
    );

    expect(
      await screen.findByText("Your reset secret key")
    ).toBeInTheDocument();
    expect(screen.getByText("key-to-reset")).toBeInTheDocument();
    expect(screen.getByText("reset-secret")).toBeInTheDocument();
    expect(onError).toHaveBeenCalledWith("");

    const closeButtons = screen.getAllByRole("button", {
      name: "Close dialog containing your reset access key",
    });
    fireEvent.click(closeButtons[0]);
    expect(screen.queryByText("Your reset secret key")).not.toBeInTheDocument();
  });

  it("reports a reset failure", async () => {
    const onError = jest.fn();
    mockResetAccessKey.mockRejectedValue(new Error("Reset failed"));
    renderWithSession(
      <ResetAccessKeyTrigger accessKeyId="key-to-reset" onError={onError} />
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Reset access key key-to-reset" })
    );

    await waitFor(() => {
      expect(onError).toHaveBeenLastCalledWith("Reset failed");
    });
  });
});

describe("AccessKeyItem", () => {
  it("displays an access key and cancels deletion", () => {
    renderWithSession(
      <AccessKeyItem
        accessKey={{ access_key_id: "existing-key" }}
        onAccessKeyChange={jest.fn()}
        onError={jest.fn()}
      />
    );
    expect(screen.getByText("existing-key")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Delete access key existing-key" })
    );
    expect(screen.getByText("Delete Access Key")).toBeInTheDocument();
    const cancelButtons = screen.getAllByRole("button", {
      name: "Cancel deleting access key",
    });
    fireEvent.click(cancelButtons[cancelButtons.length - 1]);
    expect(screen.queryByText("Delete Access Key")).not.toBeInTheDocument();
  });

  it("deletes an access key", async () => {
    const onAccessKeyChange = jest.fn();
    const onError = jest.fn();
    mockDeleteAccessKey.mockResolvedValue(undefined);
    renderWithSession(
      <AccessKeyItem
        accessKey={{ access_key_id: "existing-key" }}
        onAccessKeyChange={onAccessKeyChange}
        onError={onError}
      />
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Delete access key existing-key" })
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Confirm deleting access key" })
    );

    expect(onError).toHaveBeenCalledWith("");
    expect(screen.queryByText("Delete Access Key")).not.toBeInTheDocument();
    await waitFor(() => {
      expect(onAccessKeyChange).toHaveBeenCalledTimes(1);
    });
  });

  it("reports a deletion failure", async () => {
    const onError = jest.fn();
    mockDeleteAccessKey.mockRejectedValue(new Error("Delete failed"));
    renderWithSession(
      <AccessKeyItem
        accessKey={{ access_key_id: "existing-key" }}
        onAccessKeyChange={jest.fn()}
        onError={onError}
      />
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Delete access key existing-key" })
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Confirm deleting access key" })
    );

    await waitFor(() => {
      expect(onError).toHaveBeenLastCalledWith("Delete failed");
    });
  });
});

describe("AccessKeyList", () => {
  it("renders its children", () => {
    render(
      <AccessKeyList>
        <div>Listed key</div>
      </AccessKeyList>
    );
    expect(screen.getByText("Listed key")).toBeInTheDocument();
  });
});
