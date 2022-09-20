import { fireEvent, render, screen } from "@testing-library/react";
import CloseButton from "../close-button";

describe("Testing the standard close icon button", () => {
  it("renders with Tailwind CSS classes specified", () => {
    const onClick = jest.fn();
    render(
      <CloseButton
        onClick={onClick}
        label="Test Label"
        className="border-red-500"
      />
    );

    const closeButton = screen.getByLabelText("Test Label");
    fireEvent.click(closeButton);
    expect(onClick).toHaveBeenCalled();
  });

  it("renders with no Tailwind CSS classes specified", () => {
    const onClick = jest.fn();
    render(<CloseButton onClick={onClick} label="Test Label" />);

    const closeButton = screen.getByLabelText("Test Label");
    fireEvent.click(closeButton);
    expect(onClick).toHaveBeenCalled();
  });
});
