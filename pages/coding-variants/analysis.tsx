// node_modules
import _ from "lodash";
import {
  type GetServerSidePropsContext,
  type GetServerSidePropsResult,
} from "next";
import { useContext } from "react";
// components
import { AnnotatedValue } from "../../components/annotated-value";
import { CodingVariantsLayout } from "../../components/coding-variants";
import Link from "../../components/link-no-prefetch";
import NoCollectionData from "../../components/no-collection-data";
import PagePreamble from "../../components/page-preamble";
import SessionContext from "../../components/session-context";
// lib
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { type AnalysisSetObject } from "../../lib/file-sets";
import {
  getMatrixAxisGroups,
  getMatrixBuckets,
  type MatrixAxis,
  type MatrixResults,
  type MatrixResultsObject,
} from "../../lib/matrix";
import { type PageProps } from "../../lib/next-js";
import { encodeUriElement } from "../../lib/query-encoding";
import { getPreferredAssayTitleDescriptionMap } from "../../lib/ontology-terms";
// root
import { SearchQuickResults } from "../../globals";
import { isEmbeddedArray } from "../../lib/types";

/**
 * Props for the Coding Variants page component from the server-side request.
 */
interface CodingVariantsProps extends PageProps {
  scanning: MatrixResultsObject | null;
  nonScanning: AnalysisSetObject[] | null;
}

/**
 * Represents a gene and the number of times it appears in the dataset. This data comes directly
 * from the matrix results.
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
 * Versioned Arrayed semi-qY2H assays that share one display group.
 */
const arrayedSemiQy2hAssays = [
  "Arrayed semi-qY2H v1",
  "Arrayed semi-qY2H v2",
  "Arrayed semi-qY2H v3",
] as const;
const arrayedSemiQy2hAssaySet = new Set<string>(arrayedSemiQy2hAssays);

/**
 * Base query string for the non-scanning assays in the Coding Variants page report requests.
 */
const nonScanningAssays = [
  ...arrayedSemiQy2hAssays,
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

/**
 * Mapping from non-scanning assay slim keys to their display titles.
 */
const nonScanningSlimTitleMap: Record<NonScanningSlims, string> = {
  "protein interaction": "Protein-Protein Interaction",
  "protein expression": "Protein Expression",
  imaging: "Imaging",
};

/**
 * Coding Variants page component.
 *
 * @param codingVariants - Matrix results for the coding variants
 */
export default function CodingVariantsPage({
  scanning,
  nonScanning,
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

  // If neither request supplied displayable data, display the empty-page message.
  if (Object.keys(assayToGenes).length === 0 && !nonScanning) {
    return (
      <>
        <PagePreamble />
        <NoCollectionData
          pageTitle="coding variants"
          displayLoginHint={false}
        />
      </>
    );
  }

  const groupedNonScanning = nonScanning ? groupNonScanning(nonScanning) : null;

  return (
    <>
      <PagePreamble />
      <CodingVariantsLayout pageId="analysis-content">
        {Object.keys(assayToGenes).length > 0 && (
          <ProteinScanningSection assayToGenes={assayToGenes} />
        )}
        {groupedNonScanning && (
          <NonScanningSection nonScanningSlims={groupedNonScanning} />
        )}
      </CodingVariantsLayout>
    </>
  );
}

/**
 * Protein scanning section for the Coding Variants page.
 *
 * @param assayToGenes - Mapping from assay titles to the associated genes and their counts.
 */
function ProteinScanningSection({
  assayToGenes,
}: {
  assayToGenes: AssayToGeneMapping;
}) {
  return (
    <section>
      <SlimTitle title="Protein Scanning" />
      <dl className="grid grid-cols-1 gap-3 @md:grid-cols-[max-content_minmax(0,1fr)] @md:items-baseline @md:gap-x-6">
        {scanningAssays
          .filter((assay) => assayToGenes[assay]?.length)
          .map((assay) => (
            <ProteinScanningAssaySection
              key={assay}
              assay={assay}
              genes={assayToGenes[assay]}
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
 */
function ProteinScanningAssaySection({
  assay,
  genes,
}: {
  assay: string;
  genes: GeneCount[];
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
            <Link
              key={gene.symbol}
              href={`${BASE_SCANNING_LIST_QUERY}&preferred_assay_titles=${encodeUriElement(assay)}${assay === "SGE" ? `&preferred_assay_titles!=SGE-RNA` : ""}&construct_library_sets.small_scale_gene_list.symbol=${encodeUriElement(gene.symbol)}`}
              className="border-protein-scan-outline bg-protein-scan-button hover:bg-protein-scan-button-hl text-protein-scan-label rounded-xs border px-2 py-1 text-sm no-underline"
            >
              {gene.symbol}
            </Link>
          ))}
        </dd>
      </div>
    </>
  );
}

function NonScanningSection({
  nonScanningSlims,
}: {
  nonScanningSlims: Record<string, AnalysisSetObject[]>;
}) {
  const slims = Object.keys(nonScanningSlims);

  return (
    <section className="flex flex-col gap-6">
      {slims.map((slim) => {
        const title = nonScanningSlimTitleMap[slim];
        if (title) {
          const assayGroups = groupNonScanningByAssayTitle(
            nonScanningSlims[slim]
          );
          return (
            <div key={slim}>
              <SlimTitle title={title} />
              <dl className="grid grid-cols-1 gap-3 @md:grid-cols-[max-content_minmax(0,1fr)] @md:items-baseline @md:gap-x-6">
                {Object.entries(assayGroups).map(
                  ([assayTitle, analysisSets]) => (
                    <div key={assayTitle} className="@md:contents">
                      <dt className="mb-1 whitespace-nowrap @md:mb-0">
                        {assayTitle}
                      </dt>
                      <dd className="min-w-0 text-left">
                        {generateNonScanningCount(analysisSets)}
                      </dd>
                    </div>
                  )
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
 * Component for rendering the title of a slim section.
 *
 * @param title - The title of the slim section.
 */
function SlimTitle({ title }: { title: string }) {
  return <h2 className="mb-2 text-lg font-bold">{title}</h2>;
}

/**
 * Group analysis sets within a preferred assay slim by their preferred assay title. All available
 * Arrayed semi-qY2H versions share a single group whose label lists only the versions represented
 * in the supplied analysis sets. They appear as "Arrayed semi-qY2H <version1>, <version2>, ..." in
 * the display title.
 *
 * @param items - Analysis sets within one preferred-assay-slim group
 * @returns Analysis sets grouped by their display assay title
 */
function groupNonScanningByAssayTitle(
  items: AnalysisSetObject[]
): Record<string, AnalysisSetObject[]> {
  const grouped: Record<string, AnalysisSetObject[]> = {};
  const arrayedSemiQy2hVersions = new Set<string>();
  const arrayedSemiQy2hItems = new Map<string, AnalysisSetObject>();

  // Group items by their preferred assay titles, handling Arrayed semi-qY2H versions separately.
  for (const item of items) {
    for (const assayTitle of item.preferred_assay_titles || []) {
      if (arrayedSemiQy2hAssaySet.has(assayTitle)) {
        // The assay title is a versioned Arrayed semi-qY2H assay, so they'll get treated as a
        // single group later.
        arrayedSemiQy2hVersions.add(assayTitle);
        arrayedSemiQy2hItems.set(item["@id"], item);
      } else {
        // The assay title is not a versioned Arrayed semi-qY2H assay, so group it normally.
        (grouped[assayTitle] ??= []).push(item);
      }
    }
  }

  // If there are any Arrayed semi-qY2H versions, create a single group for them with a display
  // title and their combined version numbers.
  if (arrayedSemiQy2hVersions.size > 0) {
    const availableVersions = arrayedSemiQy2hAssays.filter((assay) =>
      arrayedSemiQy2hVersions.has(assay)
    );
    const displayTitle = availableVersions
      .map((assay, index) =>
        index === 0 ? assay : assay.replace("Arrayed semi-qY2H ", "")
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
 * Fetches the server-side props for the Coding Variants page.
 *
 * @param context - The server-side context containing the request and other information
 */
export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<CodingVariantsProps>> {
  const { req } = context;

  // Request the scanning and non-scanning data from the server.
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const [scanningMatrixResult, nonScanningReportResult] = await Promise.all([
    request.getObject<MatrixResults>(
      `/matrix/?${BASE_SCANNING_PAGE_QUERY}&config=ProteinScanning`
    ),
    request.getObject<SearchQuickResults<AnalysisSetObject>>(
      `/search-quick/?${BASE_NON_SCANNING_PAGE_QUERY}&limit=all`
    ),
  ]);
  const scanningMatrix = scanningMatrixResult.union();
  const nonScanningReport = nonScanningReportResult.union();

  // Determine whether the scanning and non-scanning requests were successful.
  const isScanningSuccess = FetchRequest.isResponseSuccess(scanningMatrix);
  const isNonScanningSuccess =
    FetchRequest.isResponseSuccess(nonScanningReport);

  // Only fail the whole page when both requests produced errors.
  if (!isScanningSuccess && !isNonScanningSuccess) {
    return errorObjectToProps(scanningMatrix);
  }

  return {
    props: {
      scanning: isScanningSuccess ? scanningMatrix.matrix : null,
      nonScanning: isNonScanningSuccess ? nonScanningReport["@graph"] : null,
      pageContext: {
        title: "Coding Variants",
      },
      isJson: false,
    },
  };
}
