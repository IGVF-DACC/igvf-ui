// node_modules
import { XCircleIcon } from "@heroicons/react/20/solid";
import {
  type GetServerSidePropsContext,
  type GetServerSidePropsResult,
} from "next";
import { useMemo, useState, type ComponentProps } from "react";
// components
import { TextField } from "../components/form-elements";
import Icon from "../components/icon";
import Link from "../components/link-no-prefetch";
import NoCollectionData from "../components/no-collection-data";
import PagePreamble from "../components/page-preamble";
import {
  secDirId,
  useSecDir,
  type SecMenuItemRenderer,
} from "../components/section-directory";
import { Tooltip, TooltipRef, useTooltip } from "../components/tooltip";
// lib
import { errorObjectToProps } from "../lib/errors";
import FetchRequest from "../lib/fetch-request";
import { type PredictionSetObject } from "../lib/file-sets";
import { toShishkebabCase } from "../lib/general";
import { type PageProps } from "../lib/next-js";
import {
  groupSoftwareByFileSetType,
  filterSoftwareByText,
  getFileSetTypeDescriptions,
} from "../lib/predictive-modeling";
import { retrieveProfiles } from "../lib/server-objects";
import { requestSoftwareFromObjects } from "../lib/software";
import { requestSoftwareVersionsFromObjects } from "../lib/software-version";
// root
import type {
  SearchResults,
  SoftwareObject,
  SoftwareVersionObject,
} from "../globals";

/**
 * Props for the predictive modeling page component.
 *
 * @property predictionSets - Prediction set objects that include software versions
 * @property softwareVersions - Software version objects associated with the prediction sets
 * @property software - Software objects corresponding to the software versions
 * @property fileSetTypeDescriptions - Descriptions for each file set type extracted from profiles
 */
interface PredictiveModelingPageProps extends PageProps {
  predictionSets: PredictionSetObject[];
  softwareVersions: SoftwareVersionObject[];
  software: SoftwareObject[];
  fileSetTypeDescriptions: Record<string, string>;
}

/**
 * Renders the predictive modeling page, displaying sections of software grouped by file set type.
 *
 * @param predictionSets - Prediction set objects that include software versions
 * @param softwareVersions - Software version objects associated with the prediction sets
 * @param software - Software objects corresponding to the software versions
 * @param descriptions - Descriptions for each file set type
 * @param fileSetTypeDescriptions - Descriptions for each file set type extracted from profiles
 */
export default function PredictiveModeling({
  predictionSets,
  softwareVersions,
  software,
  fileSetTypeDescriptions,
}: PredictiveModelingPageProps) {
  const [filterText, setFilterText] = useState("");
  const normalizedFilterText =
    filterText.length > 1 ? filterText.trim().toLowerCase() : "";
  const sections = useSecDir({
    renderer: SectionTitleRenderer,
    hash: filterText,
  });

  // Generate the sections of software grouped by file set type, where each section contains the
  // unique software associated with that file set type. Memoize the result to avoid unnecessary
  // recalculations with trivial rerenders. It still recalculates when navigating to this page.
  const fileSetTypeSections = useMemo(() => {
    const grouped = groupSoftwareByFileSetType(
      predictionSets,
      softwareVersions,
      software
    );
    return filterSoftwareByText(grouped, normalizedFilterText);
  }, [predictionSets, softwareVersions, software, normalizedFilterText]);

  // Determine whether any software matches the current filter.
  const hasMatchingSoftware = fileSetTypeSections.some(
    ({ software }) => software.length > 0
  );

  if (predictionSets.length === 0) {
    return <NoCollectionData pageTitle="predictive modeling data" />;
  }

  return (
    <div>
      <PagePreamble sections={sections} />
      <FilterEntry filterText={filterText} setFilterText={setFilterText} />
      {hasMatchingSoftware ? (
        fileSetTypeSections
          .filter(({ software }) => software.length > 0)
          .map(({ fileSetType, software, unfilteredSoftwareCount }) => {
            return (
              <FileSetTypeSection
                key={fileSetType}
                title={fileSetType}
                fileSetTypeDescriptions={fileSetTypeDescriptions}
                softwareCount={software.length}
                unfilteredSoftwareCount={unfilteredSoftwareCount}
              >
                {software.map((softwareItem) => (
                  <SoftwareItem
                    key={softwareItem["@id"]}
                    software={softwareItem}
                    filterText={normalizedFilterText}
                    sectionId={toShishkebabCase(fileSetType)}
                  />
                ))}
              </FileSetTypeSection>
            );
          })
      ) : (
        <p className="italic">
          {normalizedFilterText ? (
            <>No software matches the filter &ldquo;{filterText}.&rdquo;</>
          ) : (
            <>No software is available for the prediction sets.</>
          )}
        </p>
      )}
    </div>
  );
}

/**
 * Renders a section for a specific file set type, displaying the associated software list in
 * `children`. Each software item includes links to view prediction sets using the software and to
 * its source repository.
 *
 * @param title - Title of the file set type section
 * @param softwareList - Software objects associated with the file set type
 * @param softwareCount - Number of software items after filtering
 * @param unfilteredSoftwareCount - Total number of software items before filtering
 * @param fileSetTypeDescriptions - Descriptions for each file set type
 */
function FileSetTypeSection({
  title,
  fileSetTypeDescriptions,
  softwareCount,
  unfilteredSoftwareCount,
  children,
}: {
  title: string;
  fileSetTypeDescriptions: Record<string, string>;
  softwareCount: number;
  unfilteredSoftwareCount: number;
  children?: React.ReactNode;
}) {
  const shishkebabTitle = toShishkebabCase(title);
  const testId = `file-set-type-section-${shishkebabTitle}`;

  return (
    <section className="mb-8" data-testid={testId}>
      <h2
        id={secDirId(title)}
        data-sec-dir={title}
        className="text-predmod-sec-heading relative flex items-center gap-2 text-lg leading-none font-bold uppercase"
      >
        {title}
        <FileSectionSoftwareCount
          softwareCount={softwareCount}
          unfilteredSoftwareCount={unfilteredSoftwareCount}
        />
      </h2>
      <p className="border-panel text-predmod-sec-subheading border-b pb-2 text-sm">
        {fileSetTypeDescriptions[title] && (
          <>{fileSetTypeDescriptions[title]}</>
        )}
      </p>
      <ul
        data-testid="section-nav"
        aria-labelledby={secDirId(title)}
        className="@container"
      >
        {children}
      </ul>
    </section>
  );
}

/**
 * Renders a single software item within a file set type section, including links to view prediction
 * sets and the source repository.
 *
 * @param software - Software object to render
 * @param sectionId - ID of the section this software item belongs to
 */
function SoftwareItem({
  software,
  sectionId,
  filterText,
}: {
  software: SoftwareObject;
  sectionId: string;
  filterText: string;
}) {
  return (
    <li className="relative">
      <Link
        className="hover:bg-predmod-sw-hover absolute inset-0 focus-visible:outline"
        href={`/search/?type=PredictionSet&status=released&software_versions.software.title=${encodeURIComponent(
          software.title
        )}`}
        aria-label={`View prediction sets using ${software.title}`}
      />

      <div className="pointer-events-none relative z-10 px-4 py-4 pr-20">
        <div className="text-predmod-sw-title flex items-center gap-2 text-base font-semibold">
          <div>
            <HighlightedText text={software.title} searchTerm={filterText} />
          </div>
        </div>
        <div className="text-predmod-sw-description mt-1 text-sm font-normal">
          <HighlightedText
            text={software.description}
            searchTerm={filterText}
          />
        </div>
      </div>

      <RepoLink software={software} sectionId={sectionId} />
    </li>
  );
}

/**
 * Renders a link to the source repository of a software item, including a tooltip.
 *
 * @param software - Software object to render
 * @param sectionId - ID of the file-set-type section this software item belongs to
 */
function RepoLink({
  software,
  sectionId,
}: {
  software: SoftwareObject;
  sectionId: string;
}) {
  const repoTooltipAttr = useTooltip(`${sectionId}-repo-${software["@id"]}`);

  return (
    <>
      <TooltipRef tooltipAttr={repoTooltipAttr}>
        <a
          href={software.source_url}
          className="bg-predmod-repo hover:bg-predmod-repo-hover border-predmod-repo-outline absolute top-1/2 right-4 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border focus-visible:outline"
          title={`View the ${software.title} source repository`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon.Repo className="size-4 shrink-0" />
        </a>
      </TooltipRef>
      <Tooltip tooltipAttr={repoTooltipAttr}>
        View the {software.title} source repository in a new tab
      </Tooltip>
    </>
  );
}

/**
 * Renders text with highlighted search-term matches.
 *
 * @param text - The text to render
 * @param searchTerm - The search term to highlight within the text
 * @returns React element with highlighted search term matches
 */
function HighlightedText({
  text,
  searchTerm,
}: {
  text: string;
  searchTerm: string;
}) {
  const normalizedQuery = searchTerm.trim();
  if (!normalizedQuery) {
    // No search term; return the text as-is without any highlights.
    return <>{text}</>;
  }

  // Normalize the text and search term for case-insensitive matching.
  const normalizedText = text.toLocaleLowerCase();
  const normalizedSearch = normalizedQuery.toLocaleLowerCase();

  // Split the text into parts, highlighting matches of the search term. Each part is either a plain
  // text segment or a <mark> element for a match to `searchTerm`.
  const parts: React.ReactNode[] = [];
  let position = 0;
  let matchStart = normalizedText.indexOf(normalizedSearch);
  while (matchStart !== -1) {
    // Start with non-highlighted text before the next match. The length might be zero if the match
    // is at the current position.
    parts.push(text.slice(position, matchStart));

    // Highlight the next match of the search term.
    const matchEnd = matchStart + normalizedSearch.length;
    parts.push(
      <mark key={matchStart} className="bg-yellow-200">
        {text.slice(matchStart, matchEnd)}
      </mark>
    );

    // Move the current position past the highlighted match and look for the next match.
    position = matchEnd;
    matchStart = normalizedText.indexOf(normalizedSearch, position);
  }

  // Append any remaining non-highlighted text after the last match, if any.
  parts.push(text.slice(position));
  return <>{parts}</>;
}

/**
 * Renders a text field for filtering software items by name or description.
 *
 * @param filterText - Current filter text
 * @param setFilterText - Function to update the filter text state
 */
function FilterEntry({
  filterText,
  setFilterText,
}: {
  filterText: string;
  setFilterText: (text: string) => void;
}) {
  return (
    <div className="relative mt-6 mb-4 w-full max-w-96">
      <TextField
        name="software-filter"
        fieldLabel="Filter software by name or description"
        value={filterText}
        onChange={(event) => setFilterText(event.target.value)}
        placeholder="Filter software by name or description"
        className="max-w-96 [&_input]:pr-11"
        isSpellCheckDisabled
        isMessageAllowed={false}
      />
      <button
        type="button"
        onClick={() => setFilterText("")}
        aria-label="Close filter"
        className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer"
      >
        <XCircleIcon className="size-4 fill-gray-500" />
      </button>
    </div>
  );
}

/**
 * Renders the count of software items within a file set type section, including the unfiltered
 * count if it differs from the filtered count.
 *
 * @param softwareCount - Number of software items in the section after filtering
 * @param unfilteredSoftwareCount - Total number of software items in the section before filtering
 */
function FileSectionSoftwareCount({
  softwareCount,
  unfilteredSoftwareCount,
}: {
  softwareCount: number;
  unfilteredSoftwareCount: number;
}) {
  return (
    <div className="bg-predmod-repo-count text-predmod-repo-count-label rounded-full px-1.5 text-xs">
      {softwareCount}{" "}
      {unfilteredSoftwareCount !== softwareCount &&
        `of ${unfilteredSoftwareCount}`}
    </div>
  );
}

/**
 * Renders the title of a file-set-type section in the Page Navigator menu capitalized.
 *
 * @param section - Section-directory item to render
 */
function SectionTitleRenderer({
  section,
}: ComponentProps<SecMenuItemRenderer>) {
  return <span className="capitalize">{section.title}</span>;
}

/**
 * Server function to request prediction sets with software versions and their associated software
 * version objects. In addition, request those software version objects' associated software
 * objects.
 *
 * @param req - HTTP request object containing headers and other request information
 * @returns An object containing the props for the page, including prediction sets, software
 *          versions, and software objects, or an error object if the request fails.
 */
export async function getServerSideProps({
  req,
}: GetServerSidePropsContext): Promise<
  GetServerSidePropsResult<PredictiveModelingPageProps>
> {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const predictionSetsResults = (
    await request.getObject<SearchResults<PredictionSetObject>>(
      `/search-quick/?type=PredictionSet&field=software_versions.@id&field=file_set_type&software_versions=*&status=released&limit=all`
    )
  ).union();
  if (FetchRequest.isResponseSuccess(predictionSetsResults)) {
    const predictionSets = predictionSetsResults["@graph"];

    // Get deduplicated software version objects for the prediction sets.
    const softwareVersions = await requestSoftwareVersionsFromObjects(
      predictionSets,
      request,
      ["software.@id"]
    );

    // Get deduplicated software objects for the software versions.
    const software = await requestSoftwareFromObjects(
      softwareVersions,
      request
    );

    // Get the descriptions for each file set type from the PredictionSet schema.
    const profiles = await retrieveProfiles(req.headers.cookie);
    const fileSetTypeDescriptions = profiles
      ? getFileSetTypeDescriptions(profiles)
      : {};

    return {
      props: {
        predictionSets,
        softwareVersions,
        software,
        fileSetTypeDescriptions,
        pageContext: { title: "Predictive Modeling" },
        isJson: false,
      },
    };
  }

  return errorObjectToProps(predictionSetsResults);
}
