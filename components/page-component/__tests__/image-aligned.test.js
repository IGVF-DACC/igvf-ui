import { render, screen, within } from "@testing-library/react";
import { UC } from "../../../lib/constants";
import PageComponent from "../index";

describe("Test IMAGE_ALIGNED page component", () => {
  it("renders a left-aligned image without a caption", () => {
    render(
      <PageComponent
        spec={`IMAGE_ALIGNED${UC.newline}src=/images/placeholder.png${UC.newline}alt=Placeholder image${UC.newline}width=50%${UC.newline}align=left`}
      />,
    );

    // Test the <picture> element.
    const picture = screen.getByTestId("image-aligned");
    expect(picture).toHaveClass(
      "block first:mt-0 last:mb-0 float-left mr-3 my-2",
    );
    expect(picture).toHaveStyle("width: 50%;");

    // Test the <img> element within the <picture> element.
    const img = within(picture).getByRole("img");
    expect(img).toHaveAttribute("src", "/images/placeholder.png");
    expect(img).toHaveAttribute("alt", "Placeholder image");

    // Test that there is no <figcaption> element.
    expect(
      screen.queryByTestId("image-aligned-caption"),
    ).not.toBeInTheDocument();
  });

  it("renders a right-aligned image with a caption", () => {
    render(
      <PageComponent
        spec={`IMAGE_ALIGNED${UC.newline}src=/images/placeholder.png${UC.newline}alt=Placeholder image${UC.newline}width=50%${UC.newline}align=right${UC.newline}caption=This is a caption`}
      />,
    );

    // Test the <picture> element.
    const picture = screen.getByTestId("image-aligned");
    expect(picture).toHaveClass(
      "block first:mt-0 last:mb-0 float-right ml-3 my-2",
    );
    expect(picture).toHaveStyle("width: 50%;");

    // Test the <img> element within the <picture> element.
    const img = within(picture).getByRole("img");
    expect(img).toHaveAttribute("src", "/images/placeholder.png");
    expect(img).toHaveAttribute("alt", "Placeholder image");

    // Test that there is a <figcaption> element.
    const caption = screen.getByTestId("image-aligned-caption");
    expect(caption).toBeInTheDocument();
    expect(caption).toHaveTextContent("This is a caption");
  });

  it("renders a center-aligned full-width image with a caption", () => {
    render(
      <PageComponent
        spec={`IMAGE_ALIGNED${UC.newline}src=/images/placeholder.png${UC.newline}alt=Placeholder image${UC.newline}caption=This is a caption`}
      />,
    );

    // Test the <picture> element.
    const picture = screen.getByTestId("image-aligned");
    expect(picture).toHaveClass("block first:mt-0 last:mb-0 mx-auto my-6");
    expect(picture).toHaveStyle("width: 100%;");

    // Test the <img> element within the <picture> element.
    const img = within(picture).getByRole("img");
    expect(img).toHaveAttribute("src", "/images/placeholder.png");
    expect(img).toHaveAttribute("alt", "Placeholder image");

    // Test that there is a <figcaption> element.
    const caption = screen.getByTestId("image-aligned-caption");
    expect(caption).toBeInTheDocument();
    expect(caption).toHaveTextContent("This is a caption");
  });

  it("renders nothing if the page editor provided no src attribute", () => {
    render(
      <PageComponent
        spec={`IMAGE_ALIGNED${UC.newline}alt=Placeholder image${UC.newline}width=50%${UC.newline}align=left`}
      />,
    );

    // Test that there is no <picture> element.
    expect(screen.queryByTestId("image-aligned")).not.toBeInTheDocument();
  });

  it("renders nothing if the page editor provided no alt attribute", () => {
    render(
      <PageComponent
        spec={`IMAGE_ALIGNED${UC.newline}src=/images/placeholder.png${UC.newline}width=50%${UC.newline}align=left`}
      />,
    );

    // Test that there is no <picture> element.
    expect(screen.queryByTestId("image-aligned")).not.toBeInTheDocument();
  });
});
