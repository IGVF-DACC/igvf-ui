// node_modules
import FetchRequest from "../../lib/fetch-request";
import PropTypes from "prop-types";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
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

export default function GraphSvg({ graph }) {
  const [size, setSize] = useState({
    width: 300,
    height: 300,
  });
  const [tool, setTool] = useState(TOOL_NONE);
  const [value, setValue] = useState(INITIAL_VALUE);

  const viewer = useRef(null);
  const container = useRef(null);

  // Called to set the size of the SVG viewer based on the size of the window. We have to cache
  // this callback so that we can add and remove the same instance of the callback.
  const setLeftoverSize = useCallback(() => {
    const box = container.current.getBoundingClientRect();
    setSize({
      width: container.current.clientWidth,
      height: window.innerHeight - box.top,
    });
  }, []);

  useEffect(() => {
    setLeftoverSize();
    window.addEventListener("resize", setLeftoverSize);

    return () => {
      window.removeEventListener("resize", setLeftoverSize);
    };
  }, []);

  useLayoutEffect(() => {
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
              width={size.width}
              height={0.9 * size.height}
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
