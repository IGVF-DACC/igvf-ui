// node_modules
import _ from "lodash";
import dynamic from "next/dynamic";
import Link from "next/link";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
// components
import {
  DROPDOWN_ALIGN_RIGHT,
  Dropdown,
  DropdownRef,
  useDropdown,
} from "./dropdown";
import { ButtonLink, ListSelect } from "./form-elements";
// lib
import {
  abbreviateNumber,
  toShishkebabCase,
  truncateText,
} from "../lib/general";
import {
  composeFileSetQueryElements,
  convertFileSetsToLabData,
  filterFileSetsByMonth,
  formatMonth,
  generateFileSetMonthList,
  collectFileSetMonths,
  generateNumberArray,
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
const AXIS_LEFT_WIDTH = 400;

/**
 * Maximum number of labelled ticks on the X-axis. This axis represents the number of file sets.
 */
const CHART_TICK_COUNT = 5;

/**
 * Order that data should appear in the chart bars, left to right.
 */
const fileSetTypeOrder = ["released", "withFiles", "initiated"];

/**
 * Configuration for each legend element in display order:
 *   - id: Unique identifier for the legend element
 *   - color: Color to display the legend element
 *   - label: Text to display for the legend element
 */
const legendProps = [
  {
    id: "initiated",
    color: "#f8a72b",
    label: "Initiated Data Sets",
  },
  {
    id: "withFiles",
    color: "#64cccb",
    label: "Data Sets With Files",
  },
  {
    id: "released",
    color: "#59a14f",
    label: "Released Data Sets",
  },
];
Object.freeze(legendProps);

/**
 * Nivo calls this component to render each tick on the Y axis. It renders the lab and title
 * strings for the tick. When building the Nivo data, the lab and title got concatenated into a
 * single {lab}|{title} string, so we have to break those back apart here.
 */
function CustomYTick({ value, y }) {
  const [lab, termAndPrefix] = value.split("|");
  const term = termAndPrefix.split("^")[1];

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
function BarLink({ path, shouldIncludeLinks, children }) {
  return shouldIncludeLinks ? (
    <Link href={path}>{children}</Link>
  ) : (
    <>{children}</>
  );
}

BarLink.propTypes = {
  // Path to link to
  path: PropTypes.string.isRequired,
  // True to have each bar link to the corresponding search
  shouldIncludeLinks: PropTypes.bool,
};

/**
 * Renders a custom segment of a bar within a bar chart. The segment represents a count of
 * MeasurementSets with a specific data-set type. This custom component does the same as the default
 * `Bar` component, but it wraps the bar in a link to the report page with the appropriate filters.
 */
function CustomBar({ bar }) {
  const barData = bar.data;
  const dataPoint = barData.data;
  const [lab, prefixedTerm] = dataPoint.title.split("|");
  const queryElements = composeFileSetQueryElements(
    barData.id,
    dataPoint.selectedMonth
  );

  // Extract the preferred assay title or assay term name based on the prefix we added earlier.
  const [prefix, term] = prefixedTerm.split("^");
  const queryKey =
    prefix === "prf" ? "preferred_assay_title" : "assay_term.term_name";
  const termQuery = `&${queryKey}=${encodeUriElement(term)}`;

  return (
    <BarLink
      path={`/multireport/?type=MeasurementSet&lab.title=${encodeUriElement(
        lab
      )}${termQuery}${queryElements}`}
      shouldIncludeLinks={dataPoint.shouldIncludeLinks}
    >
      <g transform={`translate(${bar.x},${bar.y})`}>
        <rect width={bar.width} height={bar.height} fill={bar.color} />
      </g>
    </BarLink>
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
};

/**
 * Presents a button that lets the user select a month to filter the chart by.
 */
function MonthSelector({
  fileSetMonths,
  selectedMonth,
  setDynamicSelectedMonth,
  className = "",
}) {
  const dropdownAttr = useDropdown("month-selector", DROPDOWN_ALIGN_RIGHT);

  // Collect all the creation months from the file sets and add "All" as the first option. For
  // display, format the currently selected month as "All" or "MMMM yyyy".
  const months = ["All"].concat(generateFileSetMonthList(fileSetMonths));
  const selectedMonthFormatted = formatMonth(selectedMonth, "MMMM yyyy");

  // Called when the user selects a month from the dropdown. Update the chart to show only data for
  // the selected month, then close the month-selection dropdown.
  function monthSelection(month) {
    setDynamicSelectedMonth(month);
    dropdownAttr.isVisible = false;
  }

  useEffect(() => {
    if (dropdownAttr.isVisible) {
      // Scroll the month selector dropdown to the selected month.
      const selectedMonthButton = document.getElementById(selectedMonth);
      if (selectedMonthButton) {
        const selectedMonthButtonTop = selectedMonthButton.offsetTop;
        const monthSelectorOptions = document.getElementById(
          "month-selector-options"
        );
        monthSelectorOptions.scrollTop = selectedMonthButtonTop - 5;
      }
    }
  }, [dropdownAttr.isVisible]);

  return (
    <div id="month-selector" className={className}>
      <DropdownRef dropdownAttr={dropdownAttr}>
        <button
          aria-label={`Filter the chart for ${
            selectedMonthFormatted === "All"
              ? "all months"
              : selectedMonthFormatted
          }`}
          className="h-6 rounded border border-button-primary bg-button-primary px-2 text-xs text-button-primary"
        >
          {selectedMonthFormatted}
        </button>
      </DropdownRef>
      <Dropdown dropdownAttr={dropdownAttr}>
        <ListSelect
          value={selectedMonth}
          onChange={monthSelection}
          className="shadow-lg [&>div]:max-h-52"
          scrollId="month-selector-options"
          isBorderHidden
        >
          {months.map((month) => {
            const displayedMonth = formatMonth(month, "MMMM yyyy");
            return (
              <ListSelect.Option key={month} id={month} label={displayedMonth}>
                <div className="text-left">{displayedMonth}</div>
              </ListSelect.Option>
            );
          })}
        </ListSelect>
      </Dropdown>
    </div>
  );
}

MonthSelector.propTypes = {
  // FileSet months to collect
  fileSetMonths: PropTypes.object.isRequired,
  // Currently selected month
  selectedMonth: PropTypes.string.isRequired,
  // Called when the user selects a month
  setDynamicSelectedMonth: PropTypes.func.isRequired,
  // Tailwind CSS classes to apply to the selector
  className: PropTypes.string,
};

/**
 * Display one item in the legend for the chart, with a colored box and corresponding label.
 */
function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-1">
      <div className="h-3 w-5" style={{ backgroundColor: color }} />
      <div className="text-xs">{label}</div>
    </div>
  );
}

LegendItem.propTypes = {
  // Color for the legend item as a hex string
  color: PropTypes.string.isRequired,
  // Label text for the legend item
  label: PropTypes.string.isRequired,
};

/**
 * Display the legend for the chart, with a button for each file-set type. The button links to the
 * report page with the appropriate filters, including a date range if the user has selected a
 * month.
 */
function Legend({
  selectedMonth,
  fileSetTypeCounts,
  shouldIncludeLinks = false,
}) {
  return (
    <div className="flex items-center gap-1">
      {legendProps.map((legend) => {
        if (fileSetTypeCounts[legend.id] > 0) {
          const queryElement = composeFileSetQueryElements(
            legend.id,
            selectedMonth
          );
          const href = `/multireport/?type=MeasurementSet${queryElement}`;
          return shouldIncludeLinks ? (
            <ButtonLink
              key={legend.id}
              type="secondary"
              size="sm"
              href={href}
              className="gap-1"
            >
              <LegendItem color={legend.color} label={legend.label} />
            </ButtonLink>
          ) : (
            <LegendItem
              key={legend.id}
              color={legend.color}
              label={legend.label}
            />
          );
        }
      })}
    </div>
  );
}

Legend.propTypes = {
  // Selected month to filter the chart by in yyyy-MM format, or "All"
  selectedMonth: PropTypes.string.isRequired,
  // Counts for each file-set type
  fileSetTypeCounts: PropTypes.exact({
    initiated: PropTypes.number,
    withFiles: PropTypes.number,
    released: PropTypes.number,
  }),
  // True to have legend link to the production portal instead of the local site
  shouldIncludeLinks: PropTypes.bool,
};

/**
 * Display a bar chart of MeasurementSets by lab and title, breaking each bar into counts by
 * file-set type. The title comes from the `preferred_assay_title` of the MeasurementSet if it
 * exists, or the `assay_term.term_name` if not.
 */
export default function ChartFileSetLab({
  fileSets,
  title,
  staticSelectedMonth = "",
  shouldIncludeLinks = false,
}) {
  // Currently selected month to filter the chart by
  const [dynamicSelectedMonth, setDynamicSelectedMonth] = useState("All");
  const selectedMonth = staticSelectedMonth || dynamicSelectedMonth;

  // Generate the array of colors for the bars based on the legend colors and sorted by
  // `fileSetTypeOrder`. Sort because the order of colors in the bars differs from the order they
  // appear in the legend.
  const barColors = legendProps
    .toSorted(
      (a, b) => fileSetTypeOrder.indexOf(a.id) - fileSetTypeOrder.indexOf(b.id)
    )
    .map((d) => d.color);

  // Filter the file sets by the selected month, then convert to a form the Nivo bar chart can use.
  const fileSetMonths = collectFileSetMonths(fileSets);
  const selectedFileSets = filterFileSetsByMonth(
    fileSets,
    fileSetMonths,
    selectedMonth
  );

  if (selectedFileSets.length > 0) {
    const { fileSetData, counts, maxCount } = convertFileSetsToLabData(
      selectedFileSets,
      selectedMonth,
      shouldIncludeLinks
    );
    return (
      <div
        className="relative"
        style={{ height: 30 * fileSetData.length + 60 }}
      >
        <ResponsiveBar
          data={fileSetData}
          animate={false}
          ariaLabel={title}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            truncateTickAt: 0,
            tickValues: generateNumberArray(maxCount, CHART_TICK_COUNT),
            renderTick: CustomXTick,
          }}
          axisLeft={{ renderTick: CustomYTick }}
          axisRight={null}
          axisTop={null}
          barAriaLabel={(datum) => {
            const [lab, title] = datum.indexValue.split("|");
            return `${datum.formattedValue} ${datum.id} ${title} from ${lab}`;
          }}
          barComponent={CustomBar}
          borderColor={{
            from: "color",
            modifiers: [["darker", 1.6]],
          }}
          colors={barColors}
          enableGridX={true}
          enableGridY={false}
          indexBy="title"
          indexScale={{ type: "band", round: true }}
          keys={fileSetTypeOrder}
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
          valueScale={{ type: "linear" }}
          valueFormat={() => null}
        />
        <div className="absolute bottom-0 left-4 right-4 flex justify-between">
          <Legend
            selectedMonth={selectedMonth}
            fileSetTypeCounts={counts}
            shouldIncludeLinks={shouldIncludeLinks}
          />
          {!staticSelectedMonth && (
            <MonthSelector
              fileSetMonths={fileSetMonths}
              selectedMonth={selectedMonth}
              setDynamicSelectedMonth={(month) =>
                setDynamicSelectedMonth(month || "All")
              }
            />
          )}
        </div>
      </div>
    );
  }

  return <div>No data for the selected month</div>;
}

ChartFileSetLab.propTypes = {
  // FileSet objects to display in the chart
  fileSets: PropTypes.arrayOf(PropTypes.object),
  // Title for the chart; used for the chart's aria label
  title: PropTypes.string.isRequired,
  // Selected month to filter the chart by in yyyy-MM format if specified in the query string
  staticSelectedMonth: PropTypes.string,
  // True to have the chart and legend link to corresponding pages on the local site
  shouldIncludeLinks: PropTypes.bool,
};
