// node_modules
import PropTypes from "prop-types";

/**
 * For each of the allowed "align=" values, map it to Tailwind CSS classes.
 */
const alignClassNames = {
  left: "float-left mr-3",
  center: "mx-auto",
  right: "float-right ml-3",
};

/**
 * Displays an image in your Markdown, allowing you to specify the image's width, and whether it
 * has left, center, or right alignment. Left and right alignment also float the image, allowing
 * text defined in blocks below the img element block to wrap around the image.
 *
 * I don't use the Image component from next/image because incorrect user input can cause the
 * Image component to crash the page and you can't recover without directly modifying the Page
 * object in the database. The <img> element can't crash. Should really use <figure> instead
 * <picture>, but you need <picture> to avoid ESLint errors about not using the Image component.
 *
 * See ./docs/image-aligned.md for more information.
 */
const ImageAligned = ({
  src = "",
  alt = "",
  align = "center",
  width = "100%",
  caption = "",
}) => {
  if (src && alt) {
    const alignClassName = align ? ` ${alignClassNames[align]}` : "";
    const imgMargins = align === "center" ? "my-6" : "my-2";

    return (
      <picture
        className={`block first:mt-0 last:mb-0${alignClassName} ${imgMargins}`}
        style={{ width }}
        data-testid="image-aligned"
      >
        <img alt={alt} src={src} className="my-0 block w-full" />
        <figcaption className="mt-1 text-center text-sm">{caption}</figcaption>
      </picture>
    );
  }
  return null;
};

ImageAligned.propTypes = {
  // Path or URL to the image; required
  src: PropTypes.string,
  // Alt text for the image; required
  alt: PropTypes.string,
  // Alignment of the image. Can be "left", "center", or "right"
  align: PropTypes.string,
  // Width of the image in px or %, e.g. "80%" or "300px"; % preferred
  width: PropTypes.string,
  // Caption that appears below the image
  caption: PropTypes.string,
};

export default ImageAligned;
