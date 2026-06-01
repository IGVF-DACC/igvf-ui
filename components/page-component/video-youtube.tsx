/**
 * Display a YouTube video on a page. The Markdown displayed on pages gets filtered for potentially
 * malicious content, which includes <iframe> tags. This component uses the YouTube API to embed
 * videos within a Markdown page but outside of the Markdown filter, allowing the video to appear
 * embedded in the page. The video appears at the full width of the content of the page.
 *
 * See ./docs/video-youtube.md for more information.
 */

export default function VideoYouTube({
  id = "",
  start = "",
}: {
  id?: string;
  start?: string;
}) {
  const startQuery = start ? `?start=${start}` : "";

  if (id) {
    return (
      <iframe
        data-testid="video-youtube"
        className="my-3 aspect-video w-full border-0 first:mt-0 last:mb-0"
        src={`https://www.youtube.com/embed/${id}${startQuery}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }
  return null;
}
