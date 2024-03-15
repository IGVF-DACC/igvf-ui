// node_modules
import _ from "lodash";
import dynamic from "next/dynamic";
import PropTypes from "prop-types";
import { useContext } from "react";
// component
import GlobalContext from "./global-context";
// lib
import { abbreviateNumber } from "../lib/general";

// Use a dynamic import to avoid an import error for nivo modules.
// https://github.com/plouc/nivo/issues/2310#issuecomment-1552663752
const ResponsiveLine = dynamic(
  () => import("@nivo/line").then((m) => m.ResponsiveLine),
  { ssr: false }
);

/**
 * Primary color used in the chart.
 */
const CHART_COLOR = "#00a651";

/**
 * Custom X-axis tick that works like the default but with dark-mode support.
 */
function CustomXTick({ value, x, y, rotate }) {
  return (
    <g transform={`translate(${x},${y + 10}) rotate(${rotate})`}>
      <text
        x={0}
        y={0}
        textAnchor="start"
        dominantBaseline="central"
        className="fill-black dark:fill-white"
        fontSize={10}
      >
        {value}
      </text>
    </g>
  );
}

CustomXTick.propTypes = {
  // Value to display
  value: PropTypes.string.isRequired,
  // X coordinate of the tick
  x: PropTypes.number.isRequired,
  // Y coordinate of the tick
  y: PropTypes.number.isRequired,
  // Rotation angle for the tick
  rotate: PropTypes.number.isRequired,
};

/**
 * Custom Y-axis tick that displays abbreviated numbers (e.g. “550K”) and works with dark mode.
 */
function CustomYTick({ value, y }) {
  return (
    <g transform={`translate(0,${y})`}>
      <text
        x={-8}
        y={-12}
        dy={16}
        fontSize={12}
        textAnchor="end"
        className="fill-black dark:fill-white"
      >
        {abbreviateNumber(value)}
      </text>
    </g>
  );
}

CustomYTick.propTypes = {
  // Value for the tick
  value: PropTypes.number.isRequired,
  // Y position for the tick
  y: PropTypes.number.isRequired,
};

/**
 * Render a chart of file-set counts by release date. This appears as a cumulative line chart.
 */
export default function ChartFileSetRelease({ releaseData, title }) {
  const data = [
    {
      id: "release-counts",
      data: releaseData,
    },
  ];

  // Get the dark-mode setting from the global context for cases we can't use Tailwind CSS.
  const { darkMode } = useContext(GlobalContext);
  const legendColor = darkMode.enabled ? "#ffffff" : "#000000";
  const pointColor = darkMode.enabled ? "#000000" : "#ffffff";

  return (
    <div className="h-96">
      <ResponsiveLine
        data={data}
        animate={false}
        ariaLabel={title}
        areaBaselineValue={0}
        areaOpacity={0.2}
        axisBottom={{
          orient: "bottom",
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 45,
          renderTick: CustomXTick,
        }}
        axisLeft={{
          orient: "left",
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Cumulative Released Data Sets",
          legendOffset: -60,
          legendPosition: "middle",
          renderTick: CustomYTick,
          tickValues: releaseData.at(-1).y < 10 ? 4 : 10,
        }}
        colors={[CHART_COLOR]}
        curve="linear"
        enableArea={true}
        enableGridX={false}
        margin={{
          top: 20,
          right: 50,
          bottom: 50,
          left: 70,
        }}
        pointSize={8}
        pointColor={pointColor}
        pointBorderWidth={2}
        pointBorderColor={CHART_COLOR}
        theme={{
          grid: { line: { className: "stroke-gray-300 dark:stroke-gray-700" } },
          axis: { legend: { text: { fill: legendColor } } },
        }}
        xScale={{
          type: "point",
        }}
        yScale={{
          type: "linear",
          stacked: true,
          min: 0,
          max: "auto",
        }}
      />
    </div>
  );
}

ChartFileSetRelease.propTypes = {
  // Release data to display in the chart
  releaseData: PropTypes.arrayOf(
    PropTypes.exact({
      x: PropTypes.string.isRequired,
      y: PropTypes.number.isRequired,
    })
  ).isRequired,
  // Title for the chart; used for the chart's aria label
  title: PropTypes.string.isRequired,
};
