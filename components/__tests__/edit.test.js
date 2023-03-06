import { EditableItem, useEditor } from "../edit";
import * as nextRouter from "next/router";
import { render } from "@testing-library/react";
import { waitFor } from "@testing-library/dom";
import { screen } from "@testing-library/react";

function Component() {
  const editing = useEditor("edit");

  return <div data-testid="editing">{`${editing}`}</div>;
}

describe("Test useEditor hook", () => {
  it("Editing when the given action matches the URL", () => {
    nextRouter.useRouter = jest.fn();
    nextRouter.useRouter.mockImplementation(() => ({
      asPath: "/collection/item/#!edit",
    }));

    render(<Component />);
    expect(screen.getByTestId("editing").textContent).toBe("true");
  });

  it("Not editing when the given action is not present in the URL", () => {
    nextRouter.useRouter = jest.fn();
    nextRouter.useRouter.mockImplementation(() => ({
      asPath: "/collection/item/",
    }));

    render(<Component />);
    expect(screen.getByTestId("editing").textContent).toBe("false");
  });
});

describe("Test EditableItem component", () => {
  it("Show edit page when URL #!edit", async () => {
    nextRouter.useRouter = jest.fn();
    nextRouter.useRouter.mockImplementation(() => ({
      asPath: "/collection/item/#!edit",
    }));

    const item = {
      "@id": "/collection/foo",
      actions: [
        {
          name: "edit",
        },
      ],
    };

    render(
      <EditableItem item={item}>
        <div>Hello</div>
      </EditableItem>
    );

    await waitFor(() => {
      const editBox = screen.queryByRole("textbox");
      expect(editBox).toBeInTheDocument();
    });
  });

  it("Show children component when not editing", () => {
    nextRouter.useRouter = jest.fn();
    nextRouter.useRouter.mockImplementation(() => ({
      asPath: "/collection/item/",
    }));

    const item = {
      "@id": "/collection/foo",
      actions: [
        {
          name: "edit",
        },
      ],
    };

    render(
      <EditableItem item={item}>
        <div data-testid="children">Hello</div>
      </EditableItem>
    );

    expect(screen.queryByTestId("children")).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeInTheDocument();
  });
});
