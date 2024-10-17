// node_modules
import { DocumentTextIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import PropTypes from "prop-types";
// components
import ChartFileSetLab from "../components/chart-file-set-lab";
import ChartFileSetRelease from "../components/chart-file-set-release";
import { DataAreaTitle, DataPanel } from "../components/data-area";
import HomeTitle from "../components/home-title";
import Icon from "../components/icon";
import { useBrowserStateQuery } from "../components/presentation-status";
// lib
import { getCacheClient } from "../lib/cache";
import { errorObjectToProps } from "../lib/errors";
import FetchRequest from "../lib/fetch-request";
import { requestDatasetSummary } from "../lib/common-requests";
import { abbreviateNumber } from "../lib/general";
import { convertFileSetsToReleaseData } from "../lib/home";

/**
 * Display a statistic panel that shows some property and count of their occurrences in the
 * database.
 */
function Statistic({ graphic, label, value, query, colorClass }) {
  // Extra query-string parameters for list pages
  const extraQueries = useBrowserStateQuery({ addAmpersand: true });

  return (
    <div
      className={`my-4 grow basis-1/3 rounded border @xl/home:my-0 ${colorClass}`}
    >
      <Link
        href={`/search/?${query}${extraQueries}`}
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
function FileSetChartSection({ title = "", children }) {
  return (
    <section className="relative my-8 hidden @xl/home:block">
      {title && <DataAreaTitle className="text-center">{title}</DataAreaTitle>}
      <DataPanel className="px-0 py-4">{children}</DataPanel>
    </section>
  );
}

FileSetChartSection.propTypes = {
  // Title above the chart panel
  title: PropTypes.string,
};

/**
 * Titles for the two charts on the home page. Used for the chart panel title and the chart aria
 * labels.
 */
const FILESET_RELEASE_TITLE = "Data Sets Released";
const FILESET_STATUS_TITLE = "Data Sets Produced by IGVF Labs";

export default function Home({ fileSets, fileCount, sampleCount }) {
  const releaseData = convertFileSetsToReleaseData(fileSets);

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
        <Statistic
          graphic={<Icon.FileSet className="fill-sky-600" />}
          label="Data Sets (Measurement Sets)"
          value={fileSets.length}
          query="type=MeasurementSet"
          colorClass="bg-sky-100 dark:bg-sky-900 border-sky-600 hover:bg-sky-200 dark:hover:bg-sky-800"
        />
        <Statistic
          graphic={<DocumentTextIcon className="fill-teal-600" />}
          label="Files"
          value={fileCount}
          query="type=File"
          colorClass="bg-teal-200 dark:bg-teal-900 border-teal-600 hover:bg-teal-300 dark:hover:bg-teal-800"
        />
        <Statistic
          graphic={<Icon.Sample className="fill-yellow-600" />}
          label="Samples"
          value={sampleCount}
          query="type=Sample"
          colorClass="bg-yellow-100 dark:bg-yellow-900 border-yellow-600 hover:bg-yellow-200 dark:hover:bg-yellow-800"
        />
      </div>
      {releaseData.length >= 2 && (
        <FileSetChartSection title={FILESET_RELEASE_TITLE}>
          <ChartFileSetRelease
            releaseData={releaseData}
            title={FILESET_RELEASE_TITLE}
          />
        </FileSetChartSection>
      )}
      {fileSets.length > 0 && (
        <FileSetChartSection title={FILESET_STATUS_TITLE}>
          <ChartFileSetLab
            fileSets={fileSets}
            title={FILESET_STATUS_TITLE}
            shouldIncludeLinks
          />
        </FileSetChartSection>
      )}
    </div>
  );
}

Home.propTypes = {
  // All measurement sets in the system
  fileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Total number of files in the system
  fileCount: PropTypes.number,
  // Total number of samples in the system
  sampleCount: PropTypes.number,
};

export async function getServerSideProps({ req }) {
  const cache = getCacheClient();

  // Return props from cache if available.
  try {
    const homePageProps = await cache.get("homePageProps");
    if (homePageProps) {
      console.log("Found homepage props in cache");
      const { fileSets, fileCount, sampleCount } = JSON.parse(homePageProps);
      return {
        props: { fileSets, fileCount, sampleCount },
      };
    }
  } catch (error) {
    console.log(error);
  }

  // If not in cache, get from backend.
  console.log("Getting homepage props from backend, not cache");
  const request = new FetchRequest({ cookie: req.headers.cookie });

  // We might need to paginate this request in the future, but for now just get all the results.
  const results = await requestDatasetSummary(request);

  if (FetchRequest.isResponseSuccess(results)) {
    const fileResults = (
      await request.getObject("/search/?type=File&limit=0")
    ).optional();
    const sampleResults = (
      await request.getObject("/search/?type=Sample&limit=0")
    ).optional();

    const props = {
      fileSets: results["@graph"] || [],
      fileCount: fileResults?.total || 0,
      sampleCount: sampleResults?.total || 0,
    };

    try {
      // Store props in cache (expires in 1 hour).
      console.log("Setting homepage props in cache");
      await cache.set("homePageProps", JSON.stringify(props), { EX: 3600 });
    } catch (error) {
      console.log(error);
    }
    return { props };
  }

  return errorObjectToProps(results);
}
