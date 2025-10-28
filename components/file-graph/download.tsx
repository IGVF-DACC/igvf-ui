// node_modules
import { ArrowDownTrayIcon } from "@heroicons/react/20/solid";
// components
import { Button } from "../form-elements";
// local
import { generateSVGContent } from "./lib";

/**
 * Component that creates a pure SVG representation of the file graph on click. The graph must
 * already have been rendered by ReactFlow into a div contained by an element with the `id` given
 * in `graphId`.
 *
 * @param graphId - ID of the HTML element containing the ReactFlow graph
 * @param fileId - ID of the file the graph is for; used to customize download filename
 */
export function DownloadTrigger({
  graphId,
  fileId = "",
}: {
  graphId: string;
  fileId?: string;
}) {
  function downloadSVG() {
    const svgContent = generateSVGContent(graphId);
    if (svgContent) {
      // Create download link and "click" it to start the download.
      const blob = new Blob([svgContent], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileId ? `file-graph-${fileId}.svg` : "file-graph.svg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  return (
    <Button
      onClick={downloadSVG}
      label="Download graph as SVG"
      size="sm"
      hasIconOnly
    >
      <ArrowDownTrayIcon className="h-3 w-3" />
    </Button>
  );
}
