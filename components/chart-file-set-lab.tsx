// node_modules
import dynamic from "next/dynamic";
import {
  type BarDatum,
  type BarItemProps,
  type ResponsiveBarSvgProps,
} from "@nivo/bar";
// components
import Link from "./link-no-prefetch";
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
import { type MatrixAxis } from "../lib/matrix";
import { encodeUriElement } from "../lib/query-encoding";

/**
 * Lab chart datum interface for Nivo bar chart.
 *
 * @property title - Title of the lab chart datum
 * @property value - Value of the lab chart datum
 */
interface LabChartDatum extends BarDatum {
  title: string;
  value: number;
}

/**
 * Custom bar props for the Nivo bar chart.
 *
 * @property type - Type of file-set data to display in the chart
 */
interface CustomBarProps extends BarItemProps<LabChartDatum> {
  type: keyof typeof typeConfig;
}

// Use a dynamic import to avoid an import error for nivo modules.
// https://github.com/plouc/nivo/issues/2310#issuecomment-1552663752
const ResponsiveBar = dynamic<ResponsiveBarSvgProps<LabChartDatum>>(
  async () => import("@nivo/bar").then((module) => module.ResponsiveBar),
  { ssr: false }
);

/**
 * Maximum number of characters to display in the file-set lab chart title.
 */
const MAX_TERM_LENGTH = 50;

/**
 * Width of the axis on the left side of the chart in pixels. This has to allow enough space for
 * the longest title string.
 */
const AXIS_LEFT_WIDTH = 300;

/**
 * Nivo calls this component to render each tick on the Y axis. It renders the lab and title
 * strings for the tick. When building the Nivo data, the lab and title got concatenated into a
 * single {lab}|{title} string, so we have to break those back apart here.
 *
 * @param value Combined {lab}|{title} string for the tick
 * @param y Y coordinate of the tick
 */
function CustomYTick({ value, y }: { value: string; y: number }) {
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

/**
 * Wraps a bar in a link to the report page with the appropriate filters. The link is only added if
 * `shouldIncludeLinks` is true.
 *
 * @param path Path to link to
 */
function BarLink({
  path,
  children,
}: {
  path: string;
  children: React.ReactNode;
}) {
  return (
    <Link className="no-underline" href={path}>
      {children}
    </Link>
  );
}

/**
 * Renders a custom segment of a bar within a bar chart. This custom component does the same as the
 * default `Bar` component, but it wraps the bar in a link to the report page with the appropriate
 * filters.
 *
 * @param bar Bar item props
 * @param type Type of file-set data to display in the chart
 */
function CustomBar({ bar, type }: CustomBarProps) {
  const barData = bar.data;
  const dataPoint = barData.data;
  const [lab, term] = dataPoint.title.split("|");
  const { typeQuery, termProp, foreground } = typeConfig[type];
  const termElement =
    term === NO_ASSAY_TITLE_LABEL
      ? `${termProp}!=*`
      : `${termProp}=${encodeUriElement(term)}`;

  return (
    <BarLink
      path={`/multireport/?type=${typeQuery}&lab.title=${encodeUriElement(
        lab
      )}&${termElement}&status=released`}
    >
      <g className="group cursor-pointer">
        <rect
          x={0}
          y={bar.y}
          width="100%"
          height={bar.height}
          fill="transparent"
          pointerEvents="all"
        />

        <rect
          x={bar.x}
          y={bar.y}
          width={bar.width}
          height={bar.height}
          className={`${foreground} group-hover:opacity-75`}
        />

        <text
          x={bar.x + bar.width + 5}
          y={bar.y + 12}
          className="fill-black dark:fill-white"
          fontSize={10}
          dominantBaseline="central"
        >
          {abbreviateNumber(dataPoint.value)}
        </text>
      </g>
    </BarLink>
  );
}

/**
 * Display a bar chart of file sets by lab and title.
 *
 * @param labData - Data grouped by lab and title
 * @param type Type of file-set data to display in the chart
 */
export default function ChartFileSetLab({
  labData,
  type,
}: {
  labData: MatrixAxis;
  type: keyof typeof typeConfig;
}) {
  const { chartData } = convertLabDataToChartData(labData);

  return (
    <div
      className="relative [--chart-grid-color:var(--color-gray-300)] dark:[--chart-grid-color:var(--color-gray-700)]"
      style={{ height: 30 * chartData.length + 60 }}
    >
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
          const [lab, title] = String(datum.indexValue).split("|");
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
            line: { stroke: "var(--chart-grid-color)" },
          },
        }}
        tooltip={() => null}
        valueScale={{
          type: "linear",
          min: 0,
          max: "auto",
        }}
        valueFormat={() => null}
      />
    </div>
  );
}
