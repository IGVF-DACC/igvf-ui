// node_modules
import _ from "lodash";
import dynamic from "next/dynamic";
import Link from "next/link";
import PropTypes from "prop-types";
// lib
import {
  abbreviateNumber,
  toShishkebabCase,
  truncateText,
} from "../lib/general";
import {
  convertLabDataToChartData,
  NO_ASSAY_TITLE_LABEL,
  typeConfig,
} from "../lib/home";
import { encodeUriElement } from "../lib/query-encoding";

// Use a dynamic import to avoid an import error for nivo modules.
// https://github.com/plouc/nivo/issues/2310#issuecomment-1552663752
const ResponsiveBar = dynamic(
  () => import("@nivo/bar").then((m) => m.ResponsiveBar),
  { ssr: false }
);

/**
 * Maximum number of characters to display in the file-set lab chart title.
 */
const MAX_TERM_LENGTH = 64;

/**
 * Width of the axis on the left side of the chart in pixels. This has to allow enough space for
 * the longest title string.
 */
const AXIS_LEFT_WIDTH = 300;

/**
 * Nivo calls this component to render each tick on the Y axis. It renders the lab and title
 * strings for the tick. When building the Nivo data, the lab and title got concatenated into a
 * single {lab}|{title} string, so we have to break those back apart here.
 */
function CustomYTick({ value, y }) {
  const [lab, term] = value.split("|");

  return (
    <g transform={`translate(40,${y})`} id={`bar-${toShishkebabCase(value)}`}>
      <text
        x={-50}
        y={-6}
        textAnchor="end"
        dominantBaseline="central"
        className="fill-gray-500"
        fontSize={10}
      >
        {lab}
      </text>
      <text
        x={-50}
        y={6}
        textAnchor="end"
        dominantBaseline="central"
        className="fill-black dark:fill-white"
        fontSize={12}
      >
        {truncateText(term, MAX_TERM_LENGTH)}
      </text>
    </g>
  );
}

CustomYTick.propTypes = {
  // Combined {lab}|{title} string for the tick
  value: PropTypes.string.isRequired,
  // Y coordinate of the tick
  y: PropTypes.number.isRequired,
};

/**
 * Custom X-axis tick that displays as default, but works with dark mode.
 */
function CustomXTick({ value, x, y }) {
  return (
    <g transform={`translate(${x},${y + 10})`}>
      <text
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-black dark:fill-white"
        fontSize={10}
      >
        {abbreviateNumber(value)}
      </text>
    </g>
  );
}

CustomXTick.propTypes = {
  // Value to display
  value: PropTypes.number.isRequired,
  // X coordinate of the tick
  x: PropTypes.number.isRequired,
  // Y coordinate of the tick
  y: PropTypes.number.isRequired,
};

/**
 * Wraps a bar in a link to the report page with the appropriate filters. The link is only added if
 * `shouldIncludeLinks` is true.
 */
function BarLink({ path, children }) {
  return <Link href={path}>{children}</Link>;
}

BarLink.propTypes = {
  // Path to link to
  path: PropTypes.string.isRequired,
};

/**
 * Renders a custom segment of a bar within a bar chart. This custom component does the same as the
 * default `Bar` component, but it wraps the bar in a link to the report page with the appropriate
 * filters.
 */
function CustomBar({ bar, type }) {
  const barData = bar.data;
  const dataPoint = barData.data;
  const [lab, term] = dataPoint.title.split("|");
  const { typeQuery, termProp, foreground } = typeConfig[type];
  const termElement =
    term === NO_ASSAY_TITLE_LABEL
      ? `${termProp}!=*`
      : `${termProp}=${encodeUriElement(term)}`;

  return (
    <>
      <BarLink
        path={`/multireport/?type=${typeQuery}&lab.title=${encodeUriElement(
          lab
        )}&${termElement}&status=released`}
      >
        <g transform={`translate(${bar.x},${bar.y})`}>
          <rect width={bar.width} height={bar.height} className={foreground} />
        </g>
      </BarLink>
      <g transform={`translate(${bar.width + 5},${bar.y + 12})`}>
        <text
          x={0}
          y={0}
          textAnchor="start"
          dominantBaseline="central"
          className="fill-black dark:fill-white"
          fontSize={10}
        >
          {abbreviateNumber(dataPoint.value)}
        </text>
      </g>
    </>
  );
}

CustomBar.propTypes = {
  bar: PropTypes.shape({
    // X coordinate of the bar
    x: PropTypes.number.isRequired,
    // Y coordinate of the bar
    y: PropTypes.number.isRequired,
    // Width of the bar
    width: PropTypes.number.isRequired,
    // Height of the bar
    height: PropTypes.number.isRequired,
    // Data for the bar
    data: PropTypes.object.isRequired,
    // Color of the bar
    color: PropTypes.string.isRequired,
  }).isRequired,
  // Type of file-set data to display in the chart
  type: PropTypes.string.isRequired,
};

/**
 * Display a bar chart of file sets by lab and title.
 */
export default function ChartFileSetLab({ labData, type }) {
  const { chartData } = convertLabDataToChartData(labData);

  return (
    <div className="relative" style={{ height: 30 * chartData.length + 60 }}>
      <ResponsiveBar
        data={chartData}
        animate={false}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          truncateTickAt: 0,
          format: (value) => (Math.round(value) === value ? value : ""),
        }}
        axisLeft={{ renderTick: CustomYTick }}
        axisRight={null}
        axisTop={null}
        barAriaLabel={(datum) => {
          const [lab, title] = datum.indexValue.split("|");
          return `${datum.formattedValue} ${datum.id} ${title} from ${lab}`;
        }}
        barComponent={(props) => <CustomBar {...props} type={type} />}
        borderColor={{
          from: "color",
          modifiers: [["darker", 1.6]],
        }}
        enableGridX={true}
        enableGridY={false}
        enableTotals={true}
        totalsOffset={10}
        indexBy="title"
        indexScale={{ type: "band", round: true }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{
          from: "color",
          modifiers: [["darker", 1.6]],
        }}
        layout="horizontal"
        margin={{ top: 0, right: 50, bottom: 50, left: AXIS_LEFT_WIDTH + 10 }}
        padding={0.2}
        role="application"
        theme={{
          grid: {
            line: { className: "stroke-gray-300 dark:stroke-gray-700" },
          },
        }}
        tooltip={() => null}
        xScale={{
          type: "linear",
          min: 0,
          max: "auto",
        }}
        valueScale={{ type: "linear" }}
        valueFormat={() => null}
      />
    </div>
  );
}

ChartFileSetLab.propTypes = {
  // FileSet objects to display in the chart
  labData: PropTypes.shape({
    group_by: PropTypes.array.isRequired,
    label: PropTypes.string.isRequired,
    doc_count: PropTypes.number.isRequired,
  }),
  // Type of file-set data to display in the chart
  type: PropTypes.string.isRequired,
};
