// node_modules
import _ from "lodash";
import {
  type GetServerSidePropsContext,
  type GetServerSidePropsResult,
} from "next";
import { useContext } from "react";
// components
import { AnnotatedValue } from "../../components/annotated-value";
import { DataPanel } from "../../components/data-area";
import Link from "../../components/link-no-prefetch";
import NoCollectionData from "../../components/no-collection-data";
import PagePreamble from "../../components/page-preamble";
import SessionContext from "../../components/session-context";
// lib
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
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
 * Assays to include in the Coding Variants page matrix requests.
 */
const includedAssays = [
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
const assayQuery = includedAssays
  .map((assay) => `preferred_assay_titles=${encodeUriElement(assay)}`)
  .join("&");

/**
 * Base query string for the Coding Variants page matrix requests.
 */
const BASE_PAGE_QUERY = `type=AnalysisSet&status=released&file_set_type=principal+analysis&${assayQuery}`;

/**
 * Base query string for the list-view links.
 */
const BASE_LIST_QUERY =
  "/search/?type=AnalysisSet&status=released&file_set_type=principal+analysis";

/**
 * Props for the Coding Variants page component from the server-side request.
 */
interface CodingVariantsProps extends PageProps {
  codingVariants: MatrixResultsObject;
}

/**
 * Coding Variants page component.
 *
 * @param codingVariants - Matrix results for the coding variants
 */
export default function CodingVariantsPage({
  codingVariants,
}: CodingVariantsProps) {
  const [assayProp] = getMatrixAxisGroups(codingVariants.x);
  const [geneProp] = getMatrixAxisGroups(codingVariants.y);

  // If the x or y buckets are empty, display a message that no data is available.
  const assayBuckets = getMatrixBuckets(codingVariants.x, assayProp);
  const geneBuckets = getMatrixBuckets(codingVariants.y, geneProp);
  if (assayBuckets.length === 0 || geneBuckets.length === 0) {
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

  // Build a mapping from assay titles to the associated genes and their counts.
  const assayToGenes = buildAssayToGenesMapping(codingVariants.y, assayProp);

  return (
    <>
      <PagePreamble />
      <DataPanel className="mt-8">
        <ProteinScanningSection assayToGenes={assayToGenes} />
      </DataPanel>
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
    <dl className="grid grid-cols-1 gap-3 @md:grid-cols-[max-content_minmax(0,1fr)] @md:items-baseline @md:gap-x-6">
      {includedAssays
        .filter((assay) => assayToGenes[assay]?.length)
        .map((assay) => (
          <ProteinScanningAssaySection
            key={assay}
            assay={assay}
            genes={assayToGenes[assay]}
          />
        ))}
    </dl>
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
            href={`${BASE_LIST_QUERY}&preferred_assay_titles=${encodeUriElement(assay)}${assay === "SGE" ? `&preferred_assay_titles!=SGE-RNA` : ""}&construct_library_sets.small_scale_gene_list.symbol=${encodeUriElement(gene.symbol)}`}
            className="border-protein-scan-outline bg-protein-scan-button hover:bg-protein-scan-button-hl text-protein-scan-label rounded-xs border px-2 py-1 text-sm no-underline"
          >
            {gene.symbol}
          </Link>
        ))}
      </dd>
    </div>
  );
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
 * Fetches the server-side props for the Coding Variants page.
 *
 * @param context - The server-side context containing the request and other information
 */
export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<CodingVariantsProps>> {
  const { req } = context;

  const request = new FetchRequest({ cookie: req.headers.cookie });
  const codingVariantsMatrix = (
    await request.getObject<MatrixResults>(
      `/matrix/?${BASE_PAGE_QUERY}&config=ProteinScanning`
    )
  ).union();
  if (FetchRequest.isResponseSuccess(codingVariantsMatrix)) {
    return {
      props: {
        codingVariants: codingVariantsMatrix.matrix,
        pageContext: {
          title: "Coding Variants",
        },
        isJson: false,
      },
    };
  }
  return errorObjectToProps(codingVariantsMatrix);
}
