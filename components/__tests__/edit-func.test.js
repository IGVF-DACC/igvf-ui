import JsonEditor, { canEdit, EditLink } from "../edit-func";
import { render, waitFor } from "@testing-library/react";
import { jest } from "@jest/globals";
import "@testing-library/jest-dom/extend-expect";

describe("Test canEdit utility for edit button", () => {
  it("Returns true if the item object has an action included in the `actions` parameter", () => {
    expect(
      canEdit({
        actions: [
          {
            name: "edit",
          },
        ],
      })
    ).toBe(true);
    expect(
      canEdit(
        {
          actions: [
            {
              name: "add",
            },
          ],
        },
        ["add"]
      )
    ).toBe(true);
  });
  it("Returns false if there are no actions", () => {
    expect(canEdit({})).toBe(false);
  });
  it("Returns false if no such action is present in the object", () => {
    expect(
      canEdit({
        actions: [
          {
            name: "foo",
          },
        ],
      })
    ).toBe(false);
  });
});

describe("Test JsonEditor", () => {
  it("Renders the text", async () => {
    const onChange = jest.fn();
    const { getByRole } = render(
      <JsonEditor text='{"Hello": "World"}' onChange={onChange} />
    );
    await waitFor(() => {
      const text = getByRole("textbox");
      expect(text).toBeInTheDocument();
    });
  });
});

describe("Test EditLink component", () => {
  it("Renders nothing if we cannot edit", () => {
    // Item with no actions, so cannot edit
    const item = {
      "@id": "/human-donors/abc123/",
    };
    const { queryByRole } = render(<EditLink item={item} />);
    expect(queryByRole("button")).toBe(null);
  });

  it("Renders a button if we can edit", () => {
    // Item with an edit action allows us to edit
    const item = {
      "@id": "/human-donors/abc123",
      actions: [
        {
          name: "edit",
        },
      ],
    };
    const { queryByRole } = render(<EditLink item={item} />);
    expect(queryByRole("link")).toBeInTheDocument();
  });
});
