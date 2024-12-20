// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
import { useRef, useState } from "react";
import getConfig from "next/config";
// components
import ChartFileSetLab from "../components/chart-file-set-lab";
import { DataPanel } from "../components/data-area";
import HomeTitle from "../components/home-title";
import Icon from "../components/icon";
import { TabGroup, TabList, TabTitle } from "../components/tabs";
// lib
import { ServerCache } from "../lib/cache";
import FetchRequest from "../lib/fetch-request";
import { abbreviateNumber } from "../lib/general";
import { getAllFileSetTypes, getFileSetTypeConfig } from "../lib/home";

/**
 * Map file-set types to corresponding icons.
 */
const typeColorConfig = {
  processed: ProcessedIcon,
  predictions: PredictionsIcon,
  raw: Icon.Sample,
};

/**
 * Key for the cache that stores the statistics for the home page.
 */
const STATISTICS_CACHE_KEY = "home-page-statistics";

/**
 * Icon for the processed data sets statistic.
 */
function ProcessedIcon({ className, style }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      style={style}
    >
      <path
        d="M4.6,2.9c0-.2.1-.5.4-.5l1.2-.3c.2,0,.5,0,.6.3l.4.8c.4,0,.8.1,1.1.3l.7-.5c.2-.1.5-.1.7,0l.9.9c.2.2.2.5,0,.7l-.5.7c.2.4.3.7.3,1.1l.8.4c.2.1.3.4.3.6l-.3,1.2c0,.2-.3.4-.5.4h-.9c-.2.3-.5.5-.8.8v.9c0,.2,0,.5-.3.5l-1.2.3c-.2,0-.5,0-.6-.3l-.4-.8c-.4,0-.8-.1-1.1-.3l-.7.5c-.2.1-.5.1-.7,0l-.9-.9c-.2-.2-.2-.5,0-.7l.5-.7c-.2-.4-.3-.7-.3-1.1l-.8-.4c-.2-.1-.3-.4-.3-.6l.3-1.2c0-.2.3-.4.5-.4h.9c.2-.3.5-.5.8-.8,0,0,0-.9,0-.9ZM7.2,8.3c.8-.2,1.3-1.1,1.1-1.9s-1.1-1.3-1.9-1.1-1.3,1.1-1.1,1.9,1.1,1.3,1.9,1.1Z"
        style={{ fillRule: "evenodd" }}
      />
      <path
        d="M13.3,8.8c.1-.2.4-.3.6-.3l1.2.3c.2,0,.4.3.4.5v.9c.3.2.5.5.8.8h.9c.2,0,.5,0,.5.3l.3,1.2c0,.2,0,.5-.3.6l-.8.4c0,.4-.1.8-.3,1.1l.5.7c.1.2.1.5,0,.7l-.9.9c-.2.2-.5.2-.7,0l-.7-.5c-.4.2-.7.3-1.1.3l-.4.8c-.1.2-.4.3-.6.3l-1.2-.3c-.2,0-.4-.3-.4-.5v-.9c-.3-.2-.5-.5-.8-.8h-.9c-.2,0-.5,0-.5-.3l-.3-1.2c0-.2,0-.5.3-.6l.8-.4c0-.4.1-.8.3-1.1l-.5-.7c-.1-.2-.1-.5,0-.7l.9-.9c.2-.2.5-.2.7,0l.7.5c.4-.2.7-.3,1.1-.3,0,0,.4-.8.4-.8ZM12.8,14.8c.8.2,1.7-.3,1.9-1.1s-.3-1.7-1.1-1.9-1.7.3-1.9,1.1.3,1.7,1.1,1.9Z"
        style={{ fillRule: "evenodd" }}
      />
    </svg>
  );
}

ProcessedIcon.propTypes = {
  // Tailwind CSS classes for the icon
  className: PropTypes.string,
  // CSS style properties
  style: PropTypes.object,
};

/**
 * Icon for the predictions data sets statistic.
 */
function PredictionsIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M10,15.1c-3.6,0-6.6-2.9-6.6-6.6s2.9-6.6,6.6-6.6,6.6,2.9,6.6,6.6-2.9,6.6-6.6,6.6ZM10,3.1c-3,0-5.4,2.4-5.4,5.4s2.4,5.4,5.4,5.4,5.4-2.4,5.4-5.4-2.4-5.4-5.4-5.4Z" />
      <path
        d="M15.7,14.1h-1c-1.3,1.1-2.9,1.8-4.7,1.8s-3.5-.7-4.7-1.8h-1l-2,3.9h15.5l-2-3.9Z"
        style={{ fillRule: "evenodd" }}
      />
      <path d="M8.5,10c-.1,0-.2,0-.3-.2l-.3-1c-.1-.4-.4-.7-.9-.9l-1-.3c-.1,0-.2-.1-.2-.3s0-.2.2-.3l1-.3c.4-.1.7-.4.9-.9l.3-1c0-.1.1-.2.3-.2h0c.1,0,.2,0,.3.2l.3,1c.1.4.4.7.9.9l1,.3c.1,0,.2.1.2.3s0,.2-.2.3l-1,.3c-.4.1-.7.4-.9.9h-.3c0,0,.3,0,.3,0l-.3,1c0,.1-.1.2-.3.2ZM7.2,7.4h0c.6.2,1.1.7,1.3,1.3h0s0,0,0,0c.2-.6.6-1.1,1.3-1.3h0s0,0,0,0c-.6-.2-1.1-.6-1.3-1.3h0s0,0,0,0c-.2.6-.6,1.1-1.3,1.3h0Z" />
    </svg>
  );
}

PredictionsIcon.propTypes = {
  // Tailwind CSS classes for the icon
  className: PropTypes.string,
};

/**
 * Display a statistic panel that shows some property and count of their occurrences in the
 * database.
 */
function Statistic({ graphic, label, value, query, colorClass }) {
  return (
    <div
      className={`my-4 grow basis-1/3 rounded border @xl/home:my-0 ${colorClass}`}
    >
      <Link
        href={`/search/?${query}`}
        className={`flex h-full items-center gap-4 p-2 no-underline`}
      >
        <div className="h-10 w-10 min-w-10 basis-10 rounded-full border border-gray-400 p-2 dark:border-gray-500">
          {graphic}
        </div>
        <div className="shrink">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {label}
          </div>
          <div className="text-4xl font-light text-gray-800 dark:text-gray-200">
            {abbreviateNumber(value)}
          </div>
        </div>
      </Link>
    </div>
  );
}

Statistic.propTypes = {
  // Graphic component to display
  graphic: PropTypes.element.isRequired,
  // Label for the statistic
  label: PropTypes.string.isRequired,
  // Value for the statistic
  value: PropTypes.number.isRequired,
  // Statistic box links to search URI with this query
  query: PropTypes.string.isRequired,
  // Add Tailwind CSS color classes to the statistic box
  colorClass: PropTypes.string,
};

/**
 * Display the chart of file sets by lab and summary, along with the chart's title.
 */
function FileSetChartSection({ children }) {
  return (
    <section className="relative hidden @xl/home:block">
      <DataPanel isPaddingSuppressed>{children}</DataPanel>
    </section>
  );
}

export default function Home({
  labData,
  processedCount,
  predictionsCount,
  rawCount,
}) {
  console.log("HOME PROPS *********", labData);
  // Data for the currently active lab data chart tab
  const [activeLabData, setActiveLabData] = useState(labData);
  // Holds the ID of the currently selected tab
  const activeFileSetType = useRef("processed");

  const counts = {
    processed: processedCount,
    predictions: predictionsCount,
    raw: rawCount,
  };
  const allTypes = getAllFileSetTypes();

  // Request the lab data for the selected tab as a browser-initiated fetch.
  function onTabChange(tabId) {
    activeFileSetType.current = tabId;
    const { dataQuery, typeQuery } = getFileSetTypeConfig(tabId);

    // Request the lab data for the selected tab.
    const request = new FetchRequest({ backend: true });
    request
      .getObject(`/api/dataset-summary/?type=${typeQuery}&${dataQuery}`)
      .then((response) => {
        if (response.isOk()) {
          setActiveLabData(response.unwrap());
        }
      });
  }

  return (
    <div className="@container/home">
      <HomeTitle />
      <p className="my-8">
        The NHGRI is funding this collaborative program that brings together
        teams of investigators who will use state-of-the-art experimental and
        computational approaches to model, predict, characterize and map genome
        function, how genome function shapes phenotype, and how these processes
        are affected by genomic variation. These joint efforts will produce a
        catalog of the impact of genomic variants on genome function and
        phenotypes.
      </p>
      <div className="my-4 @xl/home:flex @xl/home:gap-4">
        {allTypes.map((type) => {
          const typeConfig = getFileSetTypeConfig(type);
          const Icon = typeColorConfig[type];
          return (
            <Statistic
              key={type}
              graphic={<Icon className={typeConfig.foreground} />}
              label={typeConfig.title}
              value={counts[type]}
              query={`type=${typeConfig.typeQuery}&status=released`}
              colorClass={typeConfig.background}
            />
          );
        })}
      </div>
      <TabGroup
        onChange={onTabChange}
        className="border-l border-r border-t border-panel"
      >
        <TabList className="bg-data-background">
          {allTypes.map((type) => {
            const typeConfig = getFileSetTypeConfig(type);
            return (
              <TabTitle key={type} id={type}>
                {typeConfig.title}
              </TabTitle>
            );
          })}
        </TabList>
      </TabGroup>
      {activeLabData.doc_count > 0 && (
        <FileSetChartSection>
          <ChartFileSetLab
            labData={activeLabData}
            type={activeFileSetType.current}
            shouldIncludeLinks
          />
        </FileSetChartSection>
      )}
    </div>
  );
}

Home.propTypes = {
  // All measurement sets in the system
  labData: PropTypes.shape({
    doc_count: PropTypes.number,
  }),
  // Total number of processed data sets in the system
  processedCount: PropTypes.number,
  // Total number of prediction data sets in the system
  predictionsCount: PropTypes.number,
  // Total number of raw data sets in the system
  rawCount: PropTypes.number,
};

/**
 * Fetch the statistics for the home page for copying to the cache.
 * @param {FetchRequest} request Result of `new FetchRequest(..)`
 * @returns {string} JSON string with the statistics for the home page
 */
async function fetchHomePageStatistics(request) {
  const processedResults = (
    await request.getObject("/search/?type=AnalysisSet&status=released&limit=0")
  ).optional();
  const predictionsResults = (
    await request.getObject(
      "/search/?type=PredictionSet&status=released&limit=0"
    )
  ).optional();
  const rawResults = (
    await request.getObject(
      "/search/?type=MeasurementSet&status=released&limit=0"
    )
  ).optional();

  return JSON.stringify({
    processedCount: processedResults?.total || 0,
    predictionsCount: predictionsResults?.total || 0,
    rawCount: rawResults?.total || 0,
  });
}

export async function getServerSideProps({ req }) {
  const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();
  console.log("SERVER RUNTIME CONFIG *********", serverRuntimeConfig);
  console.log("PUBLIC RUNTIME CONFIG *********", publicRuntimeConfig);

  const serverRequest = new FetchRequest({ backend: true });
  const { typeQuery, dataQuery } = getFileSetTypeConfig("processed");
  console.log(
    "HOME QUERY *********",
    `/api/dataset-summary/?type=${typeQuery}&${dataQuery}`
  );
  const labData = (
    await serverRequest.getObject(
      `/api/dataset-summary/?type=${typeQuery}&${dataQuery}`
    )
  ).optional();
  console.log("LAB DATA *********", labData);

  const providerRequest = new FetchRequest({ cookie: req.headers.cookie });
  const cacheRef = new ServerCache(STATISTICS_CACHE_KEY, 30);
  cacheRef.setFetchConfig(fetchHomePageStatistics, providerRequest);
  const { processedCount, predictionsCount, rawCount } =
    await cacheRef.getData();

  return {
    props: {
      labData: labData || { doc_count: 0 },
      processedCount,
      predictionsCount,
      rawCount,
    },
  };
}
