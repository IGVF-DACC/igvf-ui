// node_modules
import { useAuth0 } from "@auth0/auth0-react";
import _ from "lodash";
import dynamic from "next/dynamic";
import PropTypes from "prop-types";
import { useContext, useEffect, useState } from "react";
// components
import {
  DROPDOWN_ALIGN_RIGHT,
  Dropdown,
  DropdownRef,
  useDropdown,
} from "./dropdown";
import { ListSelect } from "./form-elements";
import GlobalContext from "./global-context";
// lib
import { abbreviateNumber, toShishkebabCase } from "../lib/general";
import {
  collectFileSetMonths,
  convertFileSetsToStatusData,
  filterFileSetsByMonth,
  formatMonth,
  generateNumberArray,
} from "../lib/home";

// Use a dynamic import to avoid an import error for nivo modules.
// https://github.com/plouc/nivo/issues/2310#issuecomment-1552663752
const ResponsiveBar = dynamic(
  () => import("@nivo/bar").then((m) => m.ResponsiveBar),
  { ssr: false }
);

/**
 * Width of the axis on the left side of the chart in pixels. This has to allow enough space for
 * the longest summary string.
 */
const AXIS_LEFT_WIDTH = 400;

/**
 * Maximum number of labelled ticks on the X-axis. This axis represents the number of file sets.
 */
const CHART_TICK_COUNT = 5;

/**
 * Order that data should appear in the chart bars, left to right.
 */
const keys = ["released", "withFiles", "initiated"];

/**
 * Order that legend labels should appear, left to right.
 */
const legendKeys = ["initiated", "withFiles", "released"];

/**
 * Colors for each legend chip.
 */
const dataColor = {
  released: "#59a14f",
  initiated: "#f8a72b",
  withFiles: "#64cccb",
};

/**
 * Labels for the legend.
 */
const legendLabelText = {
  released: "Released Data Sets",
  initiated: "Initiated Data Sets",
  withFiles: "Data Sets With Files",
};

/**
 * Configures the appearance of the chart legend. Add the `data` prop to this before displaying
 * the legend.
 */
const baseLegendProps = {
  anchor: "bottom-left",
  dataFrom: "keys",
  direction: "row",
  itemDirection: "left-to-right",
  justify: false,
  itemsSpacing: 0,
  itemWidth: 140,
  itemHeight: 20,
  symbolSize: 14,
  translateX: -AXIS_LEFT_WIDTH,
  translateY: 40,
};

/**
 * Nivo calls this component to render each tick on the Y axis. It renders the lab and summary
 * strings for the tick. When building the Nivo data, the lab and summary got concatenated into a
 * single {lab}|{summary} string, so we have to break those back apart here.
 */
function CustomYTick({ value, y }) {
  const [lab, summary] = value.split("|");

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
        {summary}
      </text>
    </g>
  );
}

CustomYTick.propTypes = {
  // Combined {lab}|{summary} string for the tick
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
 * Presents a button that lets the user select a month to filter the chart by.
 */
function MonthSelector({
  fileSets,
  selectedMonth,
  setSelectedMonth,
  className = "",
}) {
  const dropdownAttr = useDropdown("month-selector", DROPDOWN_ALIGN_RIGHT);

  // Collect all the creation months from the file sets and add "All" as the first option. For
  // display, format the currently selected month as "All" or "MMMM yyyy".
  const months = ["All"].concat(collectFileSetMonths(fileSets));
  const selectedMonthFormatted = formatMonth(selectedMonth, "MMMM yyyy");

  // Called when the user selects a month from the dropdown. Update the chart to show only data for
  // the selected month, then close the month-selection dropdown.
  function monthSelection(month) {
    setSelectedMonth(month);
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
  // FileSet objects to collect months for
  fileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Currently selected month
  selectedMonth: PropTypes.string.isRequired,
  // Called when the user selects a month
  setSelectedMonth: PropTypes.func.isRequired,
  // Tailwind CSS classes to apply to the selector
  className: PropTypes.string,
};

/**
 * Display a bar chart of MeasurementSets by lab and summary, breaking each bar into counts by
 * status.
 */
export default function ChartFileSetStatus({ fileSets, title }) {
  // Currently selected month to filter the chart by
  const [selectedMonth, setSelectedMonth] = useState("All");

  // Filter the file sets by the selected month, then convert to a form the Nivo bar chart can use.
  const selectedFileSets = filterFileSetsByMonth(fileSets, selectedMonth);
  const { fileSetData, maxCount } =
    convertFileSetsToStatusData(selectedFileSets);
  console.log("fileSetData", fileSetData);

  // Determine the number of items in the legend based on whether the user has logged in or not.
  const { isAuthenticated } = useAuth0();
  const { darkMode } = useContext(GlobalContext);
  const legendItems = isAuthenticated ? legendKeys : ["released"];
  const legendData = legendItems.map((id) => ({
    id,
    color: dataColor[id],
    label: legendLabelText[id],
  }));
  const itemTextColor = darkMode.enabled ? "#ffffff" : "#000000";
  const legendProps = { ...baseLegendProps, data: legendData, itemTextColor };

  return (
    <div
      className="relative pb-1"
      style={{ height: 40 * fileSetData.length + 60 }}
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
          const [lab, summary] = datum.indexValue.split("|");
          return `${datum.formattedValue} ${datum.id} ${summary} from ${lab}`;
        }}
        borderColor={{
          from: "color",
          modifiers: [["darker", 1.6]],
        }}
        colors={[dataColor.released, dataColor.withFiles, dataColor.initiated]}
        enableGridX={true}
        enableGridY={false}
        indexBy="summary"
        indexScale={{ type: "band", round: true }}
        keys={keys}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{
          from: "color",
          modifiers: [["darker", 1.6]],
        }}
        layout="horizontal"
        legends={[legendProps]}
        margin={{ top: 0, right: 50, bottom: 40, left: AXIS_LEFT_WIDTH + 10 }}
        padding={0.3}
        role="application"
        theme={{
          grid: { line: { className: "stroke-gray-300 dark:stroke-gray-700" } },
        }}
        tooltip={() => null}
        valueScale={{ type: "linear" }}
        valueFormat={() => null}
      />
      <MonthSelector
        fileSets={fileSets}
        selectedMonth={selectedMonth}
        setSelectedMonth={(month) => setSelectedMonth(month || "All")}
        className="absolute bottom-0 right-0"
      />
    </div>
  );
}

ChartFileSetStatus.propTypes = {
  // FileSet objects to display in the chart
  fileSets: PropTypes.arrayOf(PropTypes.object),
  // Title for the chart; used for the chart's aria label
  title: PropTypes.string.isRequired,
};
