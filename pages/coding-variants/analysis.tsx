// node_modules
import { Bars4Icon } from "@heroicons/react/20/solid";
import _ from "lodash";
import {
  type GetServerSidePropsContext,
  type GetServerSidePropsResult,
} from "next";
import { useContext, useState, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";
// components
import { AnnotatedValue } from "../../components/annotated-value";
import { CodingVariantsLayout } from "../../components/coding-variants";
import { TextField } from "../../components/form-elements";
import Link from "../../components/link-no-prefetch";
import PagePreamble from "../../components/page-preamble";
import SessionContext from "../../components/session-context";
// lib
import { errorObjectToProps, generateErrorObject } from "../../lib/errors";
import FetchRequest, { HTTP_STATUS_CODE } from "../../lib/fetch-request";
import { type AnalysisSetObject } from "../../lib/file-sets";
import { abbreviateNumber } from "../../lib/general";
import {
  getMatrixAxisGroups,
  getMatrixBuckets,
  isMatrixResultsObject,
  type MatrixAxis,
  type MatrixResults,
  type MatrixResultsObject,
} from "../../lib/matrix";
import { type PageProps } from "../../lib/next-js";
import { encodeUriElement } from "../../lib/query-encoding";
import { getQueryStringFromServerQuery } from "../../lib/query-utils";
import { getPreferredAssayTitleDescriptionMap } from "../../lib/ontology-terms";
import { isSearchQuickResults } from "../../lib/search-results";
// root
import { SearchQuickResults } from "../../globals";
import { isEmbeddedArray } from "../../lib/types";

/**
 * Props for the Coding Variants page component from the server-side request.
 *
 * @property scanning - Matrix results for the scanning assays
 * @property nonScanning - Analysis sets for the non-scanning assays
 * @property additionalQuery - Additional query string parameters to include in links
 */
interface CodingVariantsProps extends PageProps {
  scanning: MatrixResultsObject | null;
  nonScanning: AnalysisSetObject[] | null;
  additionalQuery: string;
}

/**
 * Represents a gene and the number of times it appears in the dataset for the protein-scanning
 * display. This data comes directly from the matrix results.
 *
 * @property symbol - Gene symbol
 * @property count - Number of times the gene appears for a given assay
 */
type GeneCount = { symbol: string; count: number };

/**
 * Collects the mapping from preferred assay titles to the associated genes and their counts.
 */
type AssayToGeneMapping = Record<string, GeneCount[]>;

/**
 * Represents the possible non-scanning assay slims.
 */
type NonScanningSlims =
  "protein interaction" | "protein expression" | "imaging";

/**
 * Assays to include in the Coding Variants page matrix requests.
 */
const scanningAssays = [
  "SGE",
  "SGE-RNA",
  "Immune-SGE",
  "MAVE",
  "VAMP-seq",
  "VAMP-seq (MultiSTEP)",
];

/**
 * Query string for the included assays in the Coding Variants page matrix requests.
 */
const scanningAssayQuery = scanningAssays
  .map((assay) => `preferred_assay_titles=${encodeUriElement(assay)}`)
  .join("&");

/**
 * Base query string for the Coding Variants page matrix requests.
 */
const BASE_SCANNING_PAGE_QUERY = `type=AnalysisSet&status=released&file_set_type=principal+analysis&${scanningAssayQuery}`;

/**
 * Base query string for the list-view links.
 */
const BASE_SCANNING_LIST_QUERY =
  "/search/?type=AnalysisSet&status=released&file_set_type=principal+analysis";

/**
 * Base query string for the non-scanning assays in the Coding Variants page report requests. If
 * more versions of Arrayed semi-qY2H are added, this should be the only place to add them. The rest
 * of the code should accommodate these changes automatically.
 */
const nonScanningAssays = [
  "Arrayed semi-qY2H v1",
  "Arrayed semi-qY2H v2",
  "Arrayed semi-qY2H v3",
  "DUAL-IPA",
  "Pooled Y2H",
  "Variant painting via fluorescence",
  "Variant painting via immunostaining",
  "LABEL-seq",
];

/**
 * Fields to include for the non-scanning assays in the Coding Variants page report requests.
 */
const nonScanningFields = [
  "construct_library_sets.@id",
  "construct_library_sets.large_gene_count",
  "construct_library_sets.small_scale_gene_list.@id",
  "preferred_assay_slims",
  "preferred_assay_titles",
];

/**
 * Base query string elements for the non-scanning assays in the Coding Variants page report
 * requests.
 */
const nonScanningAssayQuery = nonScanningAssays
  .map((assay) => `preferred_assay_titles=${encodeUriElement(assay)}`)
  .join("&");

/**
 * Base query string elements for the non-scanning assay fields in the Coding Variants page report
 * requests.
 */
const nonScanningFieldQuery = nonScanningFields
  .map((field) => `field=${encodeUriElement(field)}`)
  .join("&");

/**
 * Base query string for the non-scanning assays in the Coding Variants page report requests.
 */
const BASE_NON_SCANNING_PAGE_QUERY = `type=AnalysisSet&status=released&file_set_type=principal+analysis&${nonScanningAssayQuery}&${nonScanningFieldQuery}`;

const BASE_NON_SCANNING_LIST_QUERY =
  "type=AnalysisSet&status=released&file_set_type=principal+analysis";

/**
 * Mapping from non-scanning assay slim keys to their display titles.
 */
const nonScanningSlimTitleMap: Record<NonScanningSlims, string> = {
  "protein interaction": "Protein-Protein Interaction",
  "protein expression": "Protein Expression",
  imaging: "Imaging",
};

/**
 * Mapping from non-scanning assay slim keys to their color classes for styling.
 */
const nonScanningSlimColorMap: Record<NonScanningSlims, string> = {
  "protein interaction":
    "border-protein-interaction-outline bg-protein-interaction-button hover:bg-protein-interaction-hl text-protein-interaction-label px-4",
  "protein expression":
    "border-protein-expression-outline bg-protein-expression-button hover:bg-protein-expression-hl text-protein-expression-label px-4",
  imaging:
    "border-imaging-outline bg-imaging-button hover:bg-imaging-hl text-imaging-label px-4",
};

/**
 * Constants for the Arrayed Semi-qY2H assay prefix and its description. Assays starting with the
 * prefix need to be annotated with this description instead of getting it from the measurement-set
 * schema which has entries for each of the versions of Arrayed Semi-qY2H assays. If someone
 * modifies the descriptions of the Arrayed Semi-qY2H assay entries in the measurement-set schema,
 * they need to update this description accordingly.
 */
const ARRAYED_SEMI_QY2H_PREFIX = "Arrayed semi-qY2H";
const ARRAYED_SEMI_QY2H_DESCRIPTION =
  "Arrayed Semi-q Yeast two-hybrid (Y2H) is a yeast-based protein-protein interaction assay that fuses proteins to DNA-binding and Activation domains and measures His3 and Ade2 reporter expression in the presences of increasing competitive inhibitors to detect an interaction between pairs of proteins tested.";

/**
 * Coding Variants page component.
 *
 * @param codingVariants - Matrix results for the coding variants
 */
export default function CodingVariantsAnalysis({
  scanning,
  nonScanning,
  additionalQuery,
}: CodingVariantsProps) {
  let assayToGenes: AssayToGeneMapping = {};
  if (scanning) {
    const [assayProp] = getMatrixAxisGroups(scanning.x);
    const [geneProp] = getMatrixAxisGroups(scanning.y);
    const assayBuckets = getMatrixBuckets(scanning.x, assayProp);
    const geneBuckets = getMatrixBuckets(scanning.y, geneProp);

    // Build a mapping only when the matrix contains both axes.
    if (assayBuckets.length > 0 && geneBuckets.length > 0) {
      assayToGenes = buildAssayToGenesMapping(scanning.y, assayProp);
    }
  }

  // Group the non-scanning results by assay for easier rendering in the non-scanning section. Then
  // determine if there are any non-scanning results to display.
  const groupedNonScanning = nonScanning ? groupNonScanning(nonScanning) : null;
  const hasNonScanningResults =
    groupedNonScanning &&
    Object.keys(groupedNonScanning).some(
      (slim) => slim in nonScanningSlimTitleMap
    );

  // Determine whether there are any scanning results to display.
  const hasScanningResults = Object.keys(assayToGenes).length > 0;

  return (
    <>
      <PagePreamble />
      <CodingVariantsLayout pageId="analysis-content">
        {!hasScanningResults && !hasNonScanningResults ? (
          <div className="p-4 italic">
            No coding variants analysis data available.
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {Object.keys(assayToGenes).length > 0 && (
              <ProteinScanningSection
                assayToGenes={assayToGenes}
                additionalQuery={additionalQuery}
              />
            )}
            {hasNonScanningResults && (
              <NonScanningSection
                nonScanningSlims={groupedNonScanning}
                additionalQuery={additionalQuery}
              />
            )}
          </div>
        )}
      </CodingVariantsLayout>
    </>
  );
}

/**
 * Protein scanning section for the Coding Variants page.
 *
 * @param assayToGenes - Mapping from assay titles to the associated genes and their counts
 * @param additionalQuery - Additional query string parameters to include in links
 */
function ProteinScanningSection({
  assayToGenes,
  additionalQuery,
}: {
  assayToGenes: AssayToGeneMapping;
  additionalQuery: string;
}) {
  const [geneSearchTerm, setGeneSearchTerm] = useState("");
  const normalizedGeneSearchTerm = geneSearchTerm.trim().toLowerCase();

  return (
    <section>
      <SlimTitle title="Protein Scanning" className="flex justify-between">
        <TextField
          name="protein-scanning-gene-search"
          value={geneSearchTerm}
          type="search"
          fieldLabel="Highlight genes"
          placeholder="Highlight genes"
          onChange={(event) => setGeneSearchTerm(event.target.value)}
          isSpellCheckDisabled
          isMessageAllowed={false}
        />
      </SlimTitle>
      <dl className="grid grid-cols-1 gap-3 p-4 @md:grid-cols-[max-content_minmax(0,1fr)] @md:items-baseline @md:gap-x-6">
        {scanningAssays
          .filter((assay) => assayToGenes[assay]?.length)
          .map((assay) => (
            <ProteinScanningAssaySection
              key={assay}
              assay={assay}
              genes={assayToGenes[assay]}
              geneSearchTerm={normalizedGeneSearchTerm}
              additionalQuery={additionalQuery}
            />
          ))}
      </dl>
    </section>
  );
}

/**
 * Protein scanning section for a specific assay within the Coding Variants page.
 *
 * @param assay - Preferred assay title
 * @param genes - List of genes and their counts associated with the assay.
 * @param geneSearchTerm - Normalized text used to highlight matching genes.
 * @param additionalQuery - Additional query string parameters to include in links.
 */
function ProteinScanningAssaySection({
  assay,
  genes,
  geneSearchTerm,
  additionalQuery,
}: {
  assay: string;
  genes: GeneCount[];
  geneSearchTerm: string;
  additionalQuery: string;
}) {
  const { profiles } = useContext(SessionContext);
  const preferredAssayTitleDescriptionMap =
    getPreferredAssayTitleDescriptionMap(profiles);

  return (
    <>
      <div className="@md:contents">
        <dt className="[&:has(+dd_a:hover)>span]:bg-protein-scan-button-hl mb-1 whitespace-nowrap @md:mb-0">
          <span className="inline-block rounded-xs px-1 py-0.5 transition-colors">
            <AnnotatedValue
              externalAnnotations={preferredAssayTitleDescriptionMap}
            >
              {assay}
            </AnnotatedValue>
          </span>
        </dt>
        <dd className="flex min-w-0 flex-wrap gap-0.5">
          {genes.map((gene) => (
            <CodingVariantButton
              key={gene.symbol}
              value={gene.symbol}
              href={`${BASE_SCANNING_LIST_QUERY}&preferred_assay_titles=${encodeUriElement(assay)}${assay === "SGE" ? `&preferred_assay_titles!=SGE-RNA` : ""}&construct_library_sets.small_scale_gene_list.symbol=${encodeUriElement(gene.symbol)}${additionalQuery ? `&${additionalQuery}` : ""}`}
              className="border-protein-scan-outline bg-protein-scan-button hover:bg-protein-scan-button-hl text-protein-scan-label"
              isHighlighted={
                geneSearchTerm.length > 0 &&
                gene.symbol.toLowerCase().includes(geneSearchTerm)
              }
            />
          ))}
          <CodingVariantButton
            value={<Bars4Icon className="h-4 w-4" />}
            href={`${BASE_SCANNING_LIST_QUERY}&preferred_assay_titles=${encodeUriElement(assay)}${assay === "SGE" ? `&preferred_assay_titles!=SGE-RNA` : ""}${additionalQuery ? `&${additionalQuery}` : ""}`}
            className="border-protein-scan-all-outline bg-protein-scan-all-button hover:bg-protein-scan-all-button-hl text-protein-scan-label"
          />
        </dd>
      </div>
    </>
  );
}

/**
 * Non-scanning section for the Coding Variants page analysis tab.
 *
 * @param nonScanningSlims - Non-scanning slim categories and their associated analysis sets
 * @param additionalQuery - Additional query string parameters to include in links
 */
function NonScanningSection({
  nonScanningSlims,
  additionalQuery,
}: {
  nonScanningSlims: Record<string, AnalysisSetObject[]>;
  additionalQuery: string;
}) {
  const { profiles } = useContext(SessionContext);
  const preferredAssayTitleDescriptionMap =
    getPreferredAssayTitleDescriptionMap(profiles);
  const slims = Object.keys(nonScanningSlims);

  return (
    <section className="flex flex-col gap-8">
      {slims.map((slim) => {
        const title = nonScanningSlimTitleMap[slim];
        if (title) {
          const assayGroups = groupNonScanningByAssayTitle(
            nonScanningSlims[slim]
          );
          return (
            <div key={slim}>
              <SlimTitle title={title} />
              <dl className="grid grid-cols-1 gap-3 p-4 @md:grid-cols-[max-content_minmax(0,1fr)] @md:items-baseline @md:gap-x-6">
                {Object.entries(assayGroups).map(
                  ([assayTitle, analysisSets]) => {
                    const href = buildNonScanningHrefs(
                      slim,
                      assayTitle,
                      additionalQuery
                    );
                    const geneCount = generateNonScanningCount(analysisSets);
                    return (
                      <div key={assayTitle} className="@md:contents">
                        <dt className="mb-1 whitespace-nowrap @md:mb-0">
                          <AnnotatedValue
                            externalAnnotations={getAssayAnnotations(
                              assayTitle,
                              preferredAssayTitleDescriptionMap
                            )}
                          >
                            {assayTitle}
                          </AnnotatedValue>
                        </dt>
                        <dd className="min-w-0 text-left">
                          <CodingVariantButton
                            value={`${abbreviateNumber(geneCount)} ${geneCount === 1 ? "gene" : "genes"} `}
                            href={href}
                            className={`px-4 ${nonScanningSlimColorMap[slim]}`}
                          />
                        </dd>
                      </div>
                    );
                  }
                )}
              </dl>
            </div>
          );
        }
      })}
    </section>
  );
}

/**
 * Render a button on the coding variants page analysis tab.
 *
 * @param value - Text or React component to display on the button
 * @param href - The URL the button should link to
 * @param className - Optional additional CSS classes for the button
 * @param isHighlighted - True to display the button as a search match
 */
function CodingVariantButton({
  value,
  href,
  className,
  isHighlighted = false,
}: {
  value: ReactNode;
  href: string;
  className?: string;
  isHighlighted?: boolean;
}) {
  return (
    <Link
      href={href}
      className={twMerge(
        "inline-flex items-center justify-center rounded-xs border px-2 py-1 text-sm no-underline",
        className,
        isHighlighted &&
          "border-protein-scan-match-border bg-protein-scan-match hover:bg-protein-scan-match-hover"
      )}
    >
      {value}
    </Link>
  );
}

/**
 * Component for rendering the title of a slim section.
 *
 * @param title - Title of the slim section.
 */
function SlimTitle({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={twMerge("bg-coding-variants-title px-2 py-1", className)}>
      <h2 data-slot="title" className="text-lg">
        {title}
      </h2>
      {children && <div data-slot="children">{children}</div>}
    </div>
  );
}

/**
 * Group analysis sets within a preferred assay slim by their preferred assay title. All titles
 * beginning with Arrayed semi-qY2H share a single group. The shared prefix appears once, followed
 * by each title's otherwise-uninterpreted suffix.
 *
 * @param items - Analysis sets within one preferred-assay-slim group
 * @returns Analysis sets grouped by their display assay title
 */
function groupNonScanningByAssayTitle(
  items: AnalysisSetObject[]
): Record<string, AnalysisSetObject[]> {
  const grouped: Record<string, AnalysisSetObject[]> = {};
  const arrayedSemiQy2hTitles = new Set<string>();
  const arrayedSemiQy2hItems = new Map<string, AnalysisSetObject>();

  // Group items by their preferred assay titles, handling Arrayed semi-qY2H titles separately.
  for (const item of items) {
    for (const assayTitle of item.preferred_assay_titles || []) {
      if (assayTitle.startsWith(ARRAYED_SEMI_QY2H_PREFIX)) {
        // Titles with the Arrayed semi-qY2H prefix get treated as a single group later.
        arrayedSemiQy2hTitles.add(assayTitle);
        arrayedSemiQy2hItems.set(item["@id"], item);
      } else {
        // The assay title does not have the Arrayed semi-qY2H prefix, so group it normally.
        (grouped[assayTitle] ??= []).push(item);
      }
    }
  }

  // Combine the Arrayed semi-qY2H titles without interpreting the contents of their suffixes.
  if (arrayedSemiQy2hTitles.size > 0) {
    const displayTitle = [...arrayedSemiQy2hTitles]
      .sort((titleA, titleB) => titleA.localeCompare(titleB))
      .map((assay, index) =>
        index === 0
          ? assay
          : assay.slice(ARRAYED_SEMI_QY2H_PREFIX.length).trim()
      )
      .join(", ");
    grouped[displayTitle] = [...arrayedSemiQy2hItems.values()];
  }

  return grouped;
}

/**
 * Generate the count for the non-scanning assay. Find the sum of
 * construct_library_sets.large_gene_count and len(construct_library_sets.small_scale_gene_list) for
 * each item. Then add all those counts together and return the total.
 *
 * @param items - Array of analysis set objects to calculate the non-scanning count for.
 * @returns Total count of genes in the non-scanning assay.
 */
function generateNonScanningCount(items: AnalysisSetObject[]): number {
  let totalCount = 0;
  for (const item of items) {
    if (isEmbeddedArray(item.construct_library_sets)) {
      for (const constructLibrarySet of item.construct_library_sets) {
        totalCount += constructLibrarySet.large_gene_count ?? 0;
        totalCount += constructLibrarySet.small_scale_gene_list?.length ?? 0;
      }
    }
  }
  return totalCount;
}

/**
 * Builds a mapping from preferred assay titles to the genes associated with each of them.
 *
 * @param geneAxis Matrix axis representing genes.
 * @param assayProp Preferred assay title property name to map genes to.
 * @returns A record mapping each assay to the list of associated genes.
 */
function buildAssayToGenesMapping(
  geneAxis: MatrixAxis,
  assayProp: string
): AssayToGeneMapping {
  const [geneGroup] = getMatrixAxisGroups(geneAxis);

  const assayToGenes: AssayToGeneMapping = {};
  for (const geneBucket of getMatrixBuckets(geneAxis, geneGroup)) {
    for (const assayBucket of getMatrixBuckets(geneBucket, assayProp)) {
      // Add the gene to the list of genes for this assay. If the assay does not have a list yet,
      // create one.
      (assayToGenes[assayBucket.key] ??= []).push({
        symbol: geneBucket.key,
        count: assayBucket.doc_count,
      });
    }
  }

  // For every gene, if it appears for the "SGE-RNA" assay, decrement its count from the "SGE" assay.
  if (assayToGenes["SGE-RNA"] && assayToGenes.SGE) {
    const sgeRnaGenes = assayToGenes["SGE-RNA"];
    const sgeGenes = assayToGenes.SGE;
    for (const sgeRnaGene of sgeRnaGenes) {
      const sgeGene = sgeGenes.find(
        (gene) => gene.symbol === sgeRnaGene.symbol
      );
      if (sgeGene) {
        sgeGene.count -= sgeRnaGene.count;
      }
    }

    // If any SGE genes have a count of zero after decrementing, remove them from the list.
    assayToGenes.SGE = sgeGenes.filter((gene) => gene.count > 0);

    // If this leaves the SGE list empty, remove SGE from the mapping.
    if (assayToGenes.SGE.length === 0) {
      delete assayToGenes.SGE;
    }
  }

  // Sort the genes for each assay alphabetically, ignoring case.
  return _.mapValues(assayToGenes, (genes) =>
    _.sortBy(genes, (gene) => gene.symbol.toLowerCase())
  );
}

/**
 * Builds a URL for non-scanning analysis sets filtered by assay slim and assay title. For the
 * special case of Arrayed semi-qY2H assays, it generates separate query parameters for each
 * comma-separated suffix without interpreting its contents.
 *
 * @param assaySlim The preferred assay slim to filter by
 * @param assayTitle The preferred assay title to filter by
 * @param additionalQuery Additional query string parameters to include in the generated URL
 * @returns A URL string for the search page with the specified filters applied
 */
function buildNonScanningHrefs(
  assaySlim: string,
  assayTitle: string,
  additionalQuery?: string
): string {
  let assayTitleQuery = `preferred_assay_titles=${encodeUriElement(
    assayTitle
  )}`;
  const arrayedSemiQy2hSuffixes = assayTitle
    .slice(ARRAYED_SEMI_QY2H_PREFIX.length)
    .trim();

  if (
    assayTitle.startsWith(ARRAYED_SEMI_QY2H_PREFIX) &&
    arrayedSemiQy2hSuffixes
  ) {
    assayTitleQuery = arrayedSemiQy2hSuffixes
      .split(",")
      .map((suffix) => suffix.trim())
      .filter(Boolean)
      .map(
        (suffix) =>
          `preferred_assay_titles=${encodeUriElement(
            `${ARRAYED_SEMI_QY2H_PREFIX} ${suffix}`
          )}`
      )
      .join("&");
  }

  return `/search/?${BASE_NON_SCANNING_LIST_QUERY}&preferred_assay_slims=${encodeUriElement(
    assaySlim
  )}&${assayTitleQuery}${additionalQuery ? `&${additionalQuery}` : ""}`;
}

/**
 * Group non-scanning analysis-set objects by their preferred assay slims.
 *
 * @param items - List of non-scanning analysis-set objects to group
 * @returns Record mapping each assay slim to the list of analysis set objects that include it
 */
function groupNonScanning(
  items: AnalysisSetObject[]
): Record<string, AnalysisSetObject[]> {
  // Group non-scanning items by their preferred assay slims. If an item does not have a preferred
  // assay slim, it will be grouped under "Unknown". If an item has multiple preferred assay slims,
  // it will appear in multiple groups. But if an item's preferred assay slims includes `imaging`,
  // it will only appear in the `imaging` group, not any other groups even if its preferred assay slims
  // includes other values.
  const grouped: Record<string, AnalysisSetObject[]> = {};
  for (const item of items) {
    const preferredAssaySlims = item.preferred_assay_slims || ["Unknown"];
    if (preferredAssaySlims.includes("imaging")) {
      (grouped.imaging ??= []).push(item);
    } else {
      for (const assaySlim of preferredAssaySlims) {
        (grouped[assaySlim] ??= []).push(item);
      }
    }
  }
  return grouped;
}

/**
 * Returns the updated annotations mapping, potentially including a specific description for the
 * given assay title.
 *
 * @param assayTitle - Title of the assay to check for specific annotations
 * @param annotations - Existing annotations mapping assay titles to descriptions
 * @returns Updated annotations including any specific description for the given assay title
 */
function getAssayAnnotations(
  assayTitle: string,
  annotations: Record<string, string>
): Record<string, string> {
  return assayTitle.startsWith(ARRAYED_SEMI_QY2H_PREFIX)
    ? {
        ...annotations,
        [assayTitle]: ARRAYED_SEMI_QY2H_DESCRIPTION,
      }
    : annotations;
}

/**
 * Fetches the server-side props for the Coding Variants page.
 *
 * @param context - The server-side context containing the request and other information
 */
export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<CodingVariantsProps>> {
  const { query, req } = context;
  const additionalQuery = getQueryStringFromServerQuery(query);
  const additionalQuerySuffix = additionalQuery ? `&${additionalQuery}` : "";

  // Request the scanning and non-scanning data from the server.
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const [scanningResult, nonScanningResult] = await Promise.all([
    request.getObject<MatrixResults>(
      `/matrix/?${BASE_SCANNING_PAGE_QUERY}&config=ProteinScanning${additionalQuerySuffix}`
    ),
    request.getObject<SearchQuickResults<AnalysisSetObject>>(
      `/search-quick/?${BASE_NON_SCANNING_PAGE_QUERY}&limit=all${additionalQuerySuffix}`
    ),
  ]);

  // Extract the matrix results from the response if it appears as a valid matrix object.
  let scanningResponse: MatrixResults | null = null;
  if (scanningResult.isOk()) {
    const response = scanningResult.unwrap();
    if (isMatrixResultsObject(response)) {
      scanningResponse = response;
    }
  }

  // Extract the quick-search results from the response if it appears as a valid search-quick
  // object.
  let nonScanningResponse: SearchQuickResults<AnalysisSetObject> | null = null;
  if (nonScanningResult.isOk()) {
    const response = nonScanningResult.unwrap();
    if (isSearchQuickResults(response)) {
      nonScanningResponse = response;
    }
  }

  // Fail the whole page only when neither request produced a valid response.
  if (!scanningResponse && !nonScanningResponse) {
    if (scanningResult.isErr()) {
      return errorObjectToProps(scanningResult.unwrap_err());
    }
    if (nonScanningResult.isErr()) {
      return errorObjectToProps(nonScanningResult.unwrap_err());
    }
    return errorObjectToProps(
      generateErrorObject(
        HTTP_STATUS_CODE.BAD_GATEWAY,
        "Invalid server response",
        "The server returned invalid coding-variants analysis data.",
        "Expected a matrix response or a quick-search response."
      )
    );
  }

  // Determine if the scanning response is empty by checking if the matrix exists and has non-zero
  // doc_count for both axes.
  const isScanningEmpty =
    !scanningResponse ||
    scanningResponse.matrix.x.doc_count === 0 ||
    scanningResponse.matrix.y.doc_count === 0;

  return {
    props: {
      scanning: isScanningEmpty ? null : scanningResponse.matrix,
      nonScanning: nonScanningResponse?.["@graph"] ?? null,
      additionalQuery: additionalQuery ?? "",
      pageContext: {
        title: "Coding Variants",
      },
      isJson: false,
    },
  };
}
