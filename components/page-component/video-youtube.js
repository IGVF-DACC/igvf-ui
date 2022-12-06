// node_modules
import PropTypes from "prop-types";

/**
 * Display a YouTube video on a page. The Markdown displayed on pages gets filtered for potentially
 * malicious content, which includes <iframe> tags. This component uses the YouTube API to embed
 * videos within a Markdown page but outside of the Markdown filter, allowing the video to appear
 * embedded in the page. The video appears at the full width of the content of the page.
 *
 * See ./docs/video-youtube.md for more information.
 */
const VideoYouTube = ({ id = "", start = "" }) => {
  const startQuery = start ? `?start=${start}` : "";

  if (id) {
    return (
      <iframe
        data-testid="video-youtube"
        className="my-3 aspect-video w-full first:mt-0 last:mb-0"
        src={`https://www.youtube.com/embed/${id}${startQuery}`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return null;
};

VideoYouTube.propTypes = {
  // YouTube video ID after the "v=" in its URL; required.
  id: PropTypes.string,
  // Start time in seconds.
  start: PropTypes.string,
};

export default VideoYouTube;
