// node_modules
import FetchRequest from "../../lib/fetch-request";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import {
  ReactSVGPanZoom,
  INITIAL_VALUE,
  TOOL_NONE,
  TOOL_PAN,
} from "react-svg-pan-zoom";
import { ReactSvgPanZoomLoader } from "react-svg-pan-zoom-loader";

// components
import Breadcrumbs from "../../components/breadcrumbs";
import PagePreamble from "../../components/page-preamble";

/**
 * Calculates the leftover width and height of a container element. The width goes across
 * the window, and the height goes from the top of the container to the bottom of the
 * window. This is recalculated when the window changes size
 * @param {*} containerRef A ref to the container element, like a <div>
 * @param {*} The inital width and height to use for the returned size
 * @returns An array [width, height] in pixels
 */
function useLeftoverSize(containerRef, { initialWidth, initialHeight }) {
  const [size, setSize] = useState({
    width: initialWidth,
    height: initialHeight,
  });

  useEffect(() => {
    // Once rendered, we can set a value
    const box = containerRef.current.getBoundingClientRect();
    setSize({
      width: containerRef.current.clientWidth,
      height: window.innerHeight - box.top,
    });

    window.addEventListener("resize", () => {
      setSize({
        width: containerRef.current.clientWidth,
        height: window.innerHeight - box.top,
      });
    });

    return () => {
      window.removeEventListener("resize", () => {
        setSize({
          width: containerRef.current.clientWidth,
          height: window.innerHeight - box.top,
        });
      });
    };
  }, []);

  return [size.width, size.height];
}

export default function GraphSvg({ graph }) {
  const viewer = useRef(null);
  const container = useRef(null);

  const [tool, setTool] = useState(TOOL_NONE);
  const [value, setValue] = useState(INITIAL_VALUE);

  const [width, height] = useLeftoverSize(container, {
    initialWidth: 300,
    initialHeight: 300,
  });

  useEffect(() => {
    setTool(TOOL_PAN);
    viewer.current.setPointOnViewerCenter(2600, 2200, 0.13);
  }, []);

  return (
    <>
      <Breadcrumbs />
      <PagePreamble pageTitle="Graph" />
      <div ref={container} className="border border-panel bg-panel">
        <ReactSvgPanZoomLoader
          svgXML={graph}
          render={(content) => (
            <ReactSVGPanZoom
              ref={viewer}
              width={width}
              height={0.9 * height}
              tool={tool}
              onChangeTool={setTool}
              value={value}
              onChangeValue={setValue}
              preventPanOutside={false}
              detectAutoPan={false}
              miniatureProps={{ position: "none" }}
            >
              <svg width={500} height={500}>
                {content}
              </svg>
            </ReactSVGPanZoom>
          )}
        />
      </div>
    </>
  );
}

GraphSvg.propTypes = {
  graph: PropTypes.string.isRequired,
};

export async function getServerSideProps({ req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const graph = await request.getText("/profiles/graph.svg");
  return {
    props: {
      graph,
    },
  };
}
