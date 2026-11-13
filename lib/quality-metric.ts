// node_modules
import _ from "lodash";
// lib
import { type AttachmentObject } from "./attachment";
import { truncateText } from "./general";
import { type LinkTo } from "./types";
import { isDatabaseObjectOfType } from "./database-object";
// root
import type {
  AnalysisStepVersionObject,
  DatabaseObject,
  FileObject,
  Schema,
  SchemaProperties,
  SchemaProperty,
} from "../globals";

/**
 * Maximum length for quality metric titles.
 */
const MAX_TITLE_LENGTH = 60;

export interface QualityMetricObject extends DatabaseObject {
  analysis_step_version: LinkTo<AnalysisStepVersionObject>;
  attachment?: AttachmentObject;
  description?: string;
  quality_metric_of: LinkTo<FileObject>[];
  summary?: string;
}

export interface MpraQualityMetricObject extends QualityMetricObject {
  fraction_assigned_oligos?: number;
  fraction_oligos_passing?: number;
  median_assigned_barcodes?: number;
  median_barcodes_passing_filtering?: number;
  median_rna_read_count?: number;
  pearson_correlation?: number;
}

export interface PerturbSeqQualityMetricObject extends QualityMetricObject {
  alignment_percentage?: number;
  avg_cells_per_guide?: number;
  avg_umis_per_cell?: number;
  frac_cells_with_guide?: number;
  genes_median?: number;
  guide_umi_mean?: number;
  mean_percent_mitochondrial?: number;
  mean_umis_per_barcode?: number;
  n_cells_exactly_1_guide?: number;
  n_cells_with_guide?: number;
  n_targets?: number;
  n_unique?: number;
  observed_moi?: number;
  p_unique?: number;
  paired_reads_mapped?: number;
  percentage_barcodes_on_onlist?: number;
  percentage_reads_on_onlist?: number;
  total_cells_passing_filters?: number;
  total_detected_scrna_barcodes?: number;
  total_guides?: number;
  total_reads?: number;
  umi_median?: number;
}

export interface SingleCellAtacSeqQualityMetricObject extends QualityMetricObject {
  atac_bam_summary_stats?: AttachmentObject;
  atac_fragment_summary_stats?: AttachmentObject;
  atac_fragments_alignment_stats?: AttachmentObject;
  multi_mappings?: number;
  n_barcodes_on_onlist?: number;
  n_candidates?: number;
  n_corrected_barcodes?: number;
  n_mapped_reads?: number;
  n_mappings?: number;
  n_multi_mappings?: number;
  n_output_mappings: number;
  n_reads?: number;
  n_reads_with_multi_mappings?: number;
  n_uni_mappings?: number;
  n_uniquely_mapped_reads: number;
  pct_duplicates?: number;
  total?: number;
  uni_mappings?: number;
}

export interface SingleCellRnaSeqQualityMetricObject extends QualityMetricObject {
  gt_records?: number;
  index_version?: number;
  kmer_length?: number;
  mean_reads_per_barcode?: number;
  mean_umis_per_barcode?: number;
  median_reads_per_barcode?: number;
  median_umis_per_barcode?: number;
  n_barcode_umis?: number;
  n_barcodes?: number;
  n_bootstraps?: number;
  n_processed?: number;
  n_pseudoaligned?: number;
  n_reads?: number;
  n_records?: number;
  n_targets?: number;
  n_unique?: number;
  num_barcodes_on_onlist?: number;
  num_reads_on_onlist?: number;
  p_pseudoaligned?: number;
  p_unique?: number;
  percentage_barcodes_on_onlist?: number;
  percentage_reads_on_onlist?: number;
  rnaseq_kb_info?: AttachmentObject;
  total_umis?: number;
}

export interface StarrSeqQualityMetricObject extends QualityMetricObject {
  coverage?: number;
  coverage_per_basepair?: number;
  rna_correlation_in_peaks?: number;
}

/**
 * Represents the properties of a quality metric within a schema.
 */
export interface QualityMetricProperties extends SchemaProperties {
  analysis_step_version: SchemaProperty;
  attachment: SchemaProperty;
  description: SchemaProperty;
  quality_metric_of: SchemaProperty;
  summary: SchemaProperty;
}

/**
 * Represents the properties of an MPRA quality metric within a schema.
 */
export interface MpraQualityMetricProperties extends QualityMetricProperties {
  fraction_assigned_oligos: SchemaProperty;
  fraction_oligos_passing: SchemaProperty;
  median_assigned_barcodes: SchemaProperty;
  median_barcodes_passing_filtering: SchemaProperty;
  median_rna_read_count: SchemaProperty;
  pearson_correlation: SchemaProperty;
}

/**
 * Represents the properties of a Perturb-seq quality metric within a schema.
 */
export interface PerturbSeqQualityMetricProperties extends QualityMetricProperties {
  alignment_percentage: SchemaProperty;
  avg_cells_per_guide: SchemaProperty;
  avg_umis_per_cell: SchemaProperty;
  frac_cells_with_guide: SchemaProperty;
  genes_median: SchemaProperty;
  guide_umi_mean: SchemaProperty;
  mean_percent_mitochondrial: SchemaProperty;
  mean_umis_per_barcode: SchemaProperty;
  n_cells_exactly_1_guide: SchemaProperty;
  n_cells_with_guide: SchemaProperty;
  n_targets: SchemaProperty;
  n_unique: SchemaProperty;
  observed_moi: SchemaProperty;
  p_unique: SchemaProperty;
  paired_reads_mapped: SchemaProperty;
  percentage_barcodes_on_onlist: SchemaProperty;
  percentage_reads_on_onlist: SchemaProperty;
  total_cells_passing_filters: SchemaProperty;
  total_detected_scrna_barcodes: SchemaProperty;
  total_guides: SchemaProperty;
  total_reads: SchemaProperty;
  umi_median: SchemaProperty;
}

/**
 * Represents the properties of a Single-Cell ATAC-Seq quality metric within a schema.
 */
export interface SingleCellAtacSeqQualityMetricProperties extends QualityMetricProperties {
  atac_bam_summary_stats: SchemaProperty;
  atac_fragment_summary_stats: SchemaProperty;
  atac_fragments_alignment_stats: SchemaProperty;
  multi_mappings: SchemaProperty;
  n_barcodes_on_onlist: SchemaProperty;
  n_candidates: SchemaProperty;
  n_corrected_barcodes: SchemaProperty;
  n_mapped_reads: SchemaProperty;
  n_mappings: SchemaProperty;
  n_multi_mappings: SchemaProperty;
  n_output_mappings: SchemaProperty;
  n_reads: SchemaProperty;
  n_reads_with_multi_mappings: SchemaProperty;
  n_uni_mappings: SchemaProperty;
  n_uniquely_mapped_reads: SchemaProperty;
  pct_duplicates: SchemaProperty;
  total: SchemaProperty;
  uni_mappings: SchemaProperty;
}

/**
 * Represents the properties of a Single-Cell RNA-Seq quality metric within a schema.
 */
export interface SingleCellRnaSeqQualityMetricProperties extends QualityMetricProperties {
  gt_records: SchemaProperty;
  index_version: SchemaProperty;
  kmer_length: SchemaProperty;
  mean_reads_per_barcode: SchemaProperty;
  mean_umis_per_barcode?: SchemaProperty;
  median_reads_per_barcode?: SchemaProperty;
  median_umis_per_barcode?: SchemaProperty;
  n_barcode_umis?: SchemaProperty;
  n_barcodes?: SchemaProperty;
  n_bootstraps?: SchemaProperty;
  n_processed?: SchemaProperty;
  n_pseudoaligned?: SchemaProperty;
  n_reads?: SchemaProperty;
  n_records?: SchemaProperty;
  n_targets?: SchemaProperty;
  n_unique?: SchemaProperty;
  num_barcodes_on_onlist?: SchemaProperty;
  num_reads_on_onlist?: SchemaProperty;
  p_pseudoaligned?: SchemaProperty;
  p_unique?: SchemaProperty;
  percentage_barcodes_on_onlist?: SchemaProperty;
  percentage_reads_on_onlist?: SchemaProperty;
  rnaseq_kb_info?: SchemaProperty;
  total_umis?: SchemaProperty;
}

/**
 * Represents the properties of a Starr-Seq quality metric within a schema.
 */
export interface StarrSeqQualityMetricProperties extends QualityMetricProperties {
  coverage?: SchemaProperty;
  coverage_per_basepair?: SchemaProperty;
  rna_correlation_in_peaks?: SchemaProperty;
}

/**
 * Represents the schema for the different types of quality metrics.
 */
export type QualityMetricSchema = Schema<QualityMetricProperties>;
export type MpraQualityMetricSchema = Schema<MpraQualityMetricProperties>;
export type PerturbSeqQualityMetricSchema =
  Schema<PerturbSeqQualityMetricProperties>;
export type SingleCellAtacSeqQualityMetricSchema =
  Schema<SingleCellAtacSeqQualityMetricProperties>;
export type SingleCellRnaSeqQualityMetricSchema =
  Schema<SingleCellRnaSeqQualityMetricProperties>;
export type StarrSeqQualityMetricSchema =
  Schema<StarrSeqQualityMetricProperties>;

/**
 * Holds the information about a quality metric field within a `QualityMetricObject`.
 * @property name - The name of the field in the `QualityMetricObject`
 * @property title - The title to display for the field
 * @property type - The type of the field, each requiring a distinct renderer
 */
export type QualityMetricFieldAttr = {
  name: string;
  title: string;
  type: "number" | "percent" | "string" | "attachment";
};

export const qualityMetricFallbackSchema = {
  title: "Quality Metric",
  $id: "/profiles/quality_metric.json",
  $schema: "https://json-schema.org/draft/2020-12/schema",
  description:
    "Fallback schema when no specific quality metric schema is available.",
  type: "object",
  additionalProperties: false,
  mixinProperties: [],
  properties: {
    status: {
      title: "Status",
      type: "string",
      description: "The status of the metadata object.",
    },
    release_timestamp: {
      title: "Release Timestamp",
      description: "The date the object was released.",
      type: "string",
    },
    attachment: {
      title: "Attachment",
      type: "object",
      description: "The attached content.",
      properties: {
        download: {
          title: "File Name",
          type: "string",
        },
        href: {
          title: "Hypertext REFerence",
          type: "string",
        },
        type: {
          title: "MIME type",
          type: "string",
        },
        md5sum: {
          title: "MD5sum",
          type: "string",
        },
        size: {
          title: "File Size",
          type: "integer",
        },
        width: {
          title: "Image Width",
          type: "integer",
        },
        height: {
          title: "Image Height",
          type: "integer",
        },
      },
    },
    lab: {
      title: "Lab",
      description: "Lab associated with the submission.",
      type: "string",
    },
    award: {
      title: "Award",
      description: "Grant associated with the submission.",
      type: "string",
    },
    uuid: {
      title: "UUID",
      description: "The unique identifier associated with every object.",
      type: "string",
    },
    aliases: {
      title: "Aliases",
      description: "Lab specific identifiers to reference an object.",
      type: "array",
      items: {
        title: "Lab Alias",
        description: "A lab specific identifier to reference an object.",
        type: "string",
      },
    },
    description: {
      title: "Description",
      description: "A plain text description of the object.",
      type: "string",
    },
    quality_metric_of: {
      title: "Quality Metric Of",
      description: "The file(s) to which this quality metric applies.",
      type: "array",
      items: {
        title: "Quality Metric Of",
        type: "string",
      },
    },
    analysis_step_version: {
      title: "Analysis Step Version",
      description: "The analysis step version of the quality metric.",
      type: "string",
    },
    "@id": {
      title: "ID",
      type: "string",
    },
    "@type": {
      title: "Type",
      type: "array",
      items: {
        title: "Type",
        type: "string",
      },
    },
    summary: {
      title: "Summary",
      type: "string",
      description: "A summary of the quality metric.",
    },
  },
  "@type": ["JSONSchema"],
} satisfies QualityMetricSchema;

/**
 * Checks whether a general schema contains the properties required by every quality metric schema.
 *
 * @param schema - General schema to check
 * @returns True if the schema contains all base quality metric properties
 */
export function isQualityMetricSchema(
  schema: Schema
): schema is QualityMetricSchema {
  return [
    "analysis_step_version",
    "attachment",
    "description",
    "quality_metric_of",
    "summary",
  ].every((property) => property in schema.properties);
}

/**
 * List of fields to display for each MPRA quality metric.
 */
export const mpraFields: QualityMetricFieldAttr[] = [
  {
    name: "description",
    title: "Description",
    type: "string",
  },
  {
    name: "attachment",
    title: "Attachment",
    type: "attachment",
  },
  {
    name: "fraction_assigned_oligos",
    title: "Fraction of Assigned Oligos",
    type: "number",
  },
  {
    name: "fraction_oligos_passing",
    title: "Fraction of Oligos Passing Filters",
    type: "number",
  },
  {
    name: "median_assigned_barcodes",
    title: "Median Number of Assigned Barcodes",
    type: "number",
  },
  {
    name: "median_barcodes_passing_filtering",
    title: "Median Barcodes Passing Filtering",
    type: "number",
  },
  {
    name: "median_rna_read_count",
    title: "Median RNA Read Count",
    type: "number",
  },
  {
    name: "pearson_correlation",
    title: "Pearson Correlation",
    type: "number",
  },
] as const;

/**
 * List of fields to display for each Perturb-seq quality metric.
 */
export const perturbSeqFields: QualityMetricFieldAttr[] = [
  {
    name: "description",
    title: "Description",
    type: "string",
  },
  {
    name: "attachment",
    title: "Attachment",
    type: "attachment",
  },
  {
    name: "alignment_percentage",
    title: "Alignment Percentage",
    type: "percent",
  },
  {
    name: "avg_cells_per_guide",
    title: "Average Cells Per Guide",
    type: "number",
  },
  {
    name: "avg_umis_per_cell",
    title: "Average UMIs Per Cell",
    type: "number",
  },
  {
    name: "guide_diversity",
    title: "Guide Diversity",
    type: "number",
  },
  {
    name: "mean_mitochondrial_reads",
    title: "Mean Mitochondrial Reads",
    type: "number",
  },
  {
    name: "moi",
    title: "Multiplicity of Infection",
    type: "number",
  },
  {
    name: "paired_reads_mapped",
    title: "Paired Reads Mapped",
    type: "number",
  },
  {
    name: "pct_cells_assigned_guide",
    title: "Percent Cells Assigned Guide",
    type: "percent",
  },
  {
    name: "total_cells_passing_filters",
    title: "Total Cells Passing Filters",
    type: "number",
  },
  {
    name: "total_detected_scrna_barcodes",
    title: "Total Detected scRNA Barcodes",
    type: "number",
  },
  {
    name: "total_guides",
    title: "Total Guides",
    type: "number",
  },
  {
    name: "total_reads",
    title: "Total Reads",
    type: "number",
  },
  {
    name: "total_targets",
    title: "Total Targets",
    type: "number",
  },
] as const;

/**
 * List of fields to display for each single-cell ATAC-seq quality metric.
 */
export const singleCellAtacSeqFields: QualityMetricFieldAttr[] = [
  {
    name: "description",
    title: "Description",
    type: "string",
  },
  {
    name: "attachment",
    title: "Attachment",
    type: "attachment",
  },
  {
    name: "atac_bam_summary_stats",
    title: "ATAC BAM Summary Stats",
    type: "attachment",
  },
  {
    name: "atac_fragment_summary_stats",
    title: "ATAC Fragment Summary Stats",
    type: "attachment",
  },
  {
    name: "atac_fragments_alignment_stats",
    title: "ATAC Fragments Alignment Stats",
    type: "attachment",
  },
  {
    name: "multi_mappings",
    title: "Multi-Mappings",
    type: "number",
  },
  {
    name: "n_barcodes_on_onlist",
    title: "Number of Barcodes on Onlist",
    type: "number",
  },
  {
    name: "n_candidates",
    title: "Number of Candidates",
    type: "number",
  },
  {
    name: "n_corrected_barcodes",
    title: "Number of Corrected Barcodes",
    type: "number",
  },
  {
    name: "n_mapped_reads",
    title: "Number of Mapped Reads",
    type: "number",
  },
  {
    name: "n_mappings",
    title: "Number of Mappings",
    type: "number",
  },
  {
    name: "n_multi_mappings",
    title: "Number of Multi-Mappings",
    type: "number",
  },
  {
    name: "n_output_mappings",
    title: "Number of Output Mappings",
    type: "number",
  },
  {
    name: "n_reads",
    title: "Number of Reads",
    type: "number",
  },
  {
    name: "n_reads_with_multi_mappings",
    title: "Number of Reads With Multi-Mappings",
    type: "number",
  },
  {
    name: "n_uni_mappings",
    title: "Number of Uni-Mappings",
    type: "number",
  },
  {
    name: "n_uniquely_mapped_reads",
    title: "Number of Uniquely Mapped Reads",
    type: "number",
  },
  {
    name: "pct_duplicates",
    title: "Percent Duplicates",
    type: "percent",
  },
  {
    name: "total",
    title: "Total",
    type: "number",
  },
  {
    name: "uni_mappings",
    title: "Uni-Mappings",
    type: "number",
  },
] as const;

/**
 * List of fields to display for each single-cell RNA-seq quality metric.
 */
export const singleCellRnaSeqFields: QualityMetricFieldAttr[] = [
  {
    name: "description",
    title: "Description",
    type: "string",
  },
  {
    name: "attachment",
    title: "Attachment",
    type: "attachment",
  },
  {
    name: "gt_records",
    title: "Good-Toulmin Estimation Records",
    type: "number",
  },
  {
    name: "index_version",
    title: "Kallisto Index Version",
    type: "number",
  },
  {
    name: "kmer_length",
    title: "K-mer Length",
    type: "number",
  },
  {
    name: "mean_reads_per_barcode",
    title: "Mean Reads Per Barcode",
    type: "number",
  },
  {
    name: "mean_umis_per_barcode",
    title: "Mean UMIs Per Barcode",
    type: "number",
  },
  {
    name: "median_reads_per_barcode",
    title: "Median Reads Per Barcode",
    type: "number",
  },
  {
    name: "median_umis_per_barcode",
    title: "Median UMIs Per Barcode",
    type: "number",
  },
  {
    name: "n_barcode_umis",
    title: "Number of Barcode UMIs",
    type: "number",
  },
  {
    name: "n_barcodes",
    title: "Number of Barcodes",
    type: "number",
  },
  {
    name: "n_bootstraps",
    title: "Number of Bootstrap Iterations",
    type: "number",
  },
  {
    name: "n_processed",
    title: "Number of Reads Processed",
    type: "number",
  },
  {
    name: "n_pseudoaligned",
    title: "Number of Reads Pseudoaligned",
    type: "number",
  },
  {
    name: "n_reads",
    title: "Number of Reads",
    type: "number",
  },
  {
    name: "n_records",
    title: "Number of Records",
    type: "number",
  },
  {
    name: "n_targets",
    title: "Number of Target Sequences",
    type: "number",
  },
  {
    name: "n_unique",
    title: "Number of Reads Uniquely Pseudoaligned",
    type: "number",
  },
  {
    name: "num_barcodes_on_onlist",
    title: "Number of Barcodes on Onlist",
    type: "number",
  },
  {
    name: "num_reads_on_onlist",
    title: "Number of Reads on Onlist",
    type: "number",
  },
  {
    name: "p_pseudoaligned",
    title: "Percentage of Reads Pseudoaligned",
    type: "percent",
  },
  {
    name: "p_unique",
    title: "Percentage of Reads Uniquely Pseudoaligned",
    type: "percent",
  },
  {
    name: "percentage_barcodes_on_onlist",
    title: "Percentage of Barcodes on Onlist",
    type: "percent",
  },
  {
    name: "percentage_reads_on_onlist",
    title: "Percentage of Reads on Onlist",
    type: "percent",
  },
  {
    name: "rnaseq_kb_info",
    title: "RNA-seq KB Info",
    type: "attachment",
  },
  {
    name: "total_umis",
    title: "Total UMIs",
    type: "number",
  },
] as const;

/**
 * List of fields to display for each STARR-seq quality metric.
 */
export const starrSeqFields: QualityMetricFieldAttr[] = [
  {
    name: "description",
    title: "Description",
    type: "string",
  },
  {
    name: "attachment",
    title: "Attachment",
    type: "attachment",
  },
  {
    name: "coverage",
    title: "Coverage",
    type: "number",
  },
  {
    name: "coverage_per_basepair",
    title: "Coverage Per Basepair",
    type: "number",
  },
  {
    name: "rna_correlation_in_peaks",
    title: "RNA Correlation in Peaks",
    type: "number",
  },
] as const;

/**
 * List of quality metric properties to exclude in the summary display.
 */
const excludedQualityMetricSchemaSummaryProps = [
  "@id",
  "@type",
  "analysis_step_version",
  "award",
  "creation_timestamp",
  "description",
  "lab",
  "notes",
  "preview_timestamp",
  "release_timestamp",
  "schema_version",
  "status",
  "submitted_by",
  "submitter_comment",
  "uuid",
];

/**
 * Filters out quality metric schema properties that are excluded from the summary display.
 *
 * @param schemaProps - Quality metric properties to filter
 * @returns Quality metric schema properties excluding those not displayed in the summary panel
 */
export function filterQualityMetricSchemaSummaryProps<
  T extends QualityMetricProperties,
>(schemaProps: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(schemaProps).filter(
      ([key]) => !excludedQualityMetricSchemaSummaryProps.includes(key)
    )
  ) as Partial<T>;
}

/**
 * Type guard to check if a quality metric is an MpraQualityMetric.
 *
 * @param qualityMetric - Quality metric object to check
 * @returns True if the quality metric is an MpraQualityMetric
 */
export function isMpraQualityMetric(
  qualityMetric: QualityMetricObject
): qualityMetric is MpraQualityMetricObject {
  return isDatabaseObjectOfType(qualityMetric, "MpraQualityMetric");
}

/**
 * Type guard to check if a quality metric is a PerturbSeqQualityMetric.
 *
 * @param qualityMetric - Quality metric object to check
 * @returns True if the quality metric is a PerturbSeqQualityMetric
 */
export function isPerturbSeqQualityMetric(
  qualityMetric: QualityMetricObject
): qualityMetric is PerturbSeqQualityMetricObject {
  return isDatabaseObjectOfType(qualityMetric, "PerturbSeqQualityMetric");
}

/**
 * Type guard to check if a quality metric is a SingleCellAtacSeqQualityMetric.
 *
 * @param qualityMetric - Quality metric object to check
 * @returns True if the quality metric is a SingleCellAtacSeqQualityMetric
 */
export function isSingleCellAtacSeqQualityMetric(
  qualityMetric: QualityMetricObject
): qualityMetric is SingleCellAtacSeqQualityMetricObject {
  return isDatabaseObjectOfType(
    qualityMetric,
    "SingleCellAtacSeqQualityMetric"
  );
}

/**
 * Type guard to check if a quality metric is a SingleCellRnaSeqQualityMetric.
 *
 * @param qualityMetric - Quality metric object to check
 * @returns True if the quality metric is a SingleCellRnaSeqQualityMetric
 */
export function isSingleCellRnaSeqQualityMetric(
  qualityMetric: QualityMetricObject
): qualityMetric is SingleCellRnaSeqQualityMetricObject {
  return isDatabaseObjectOfType(qualityMetric, "SingleCellRnaSeqQualityMetric");
}

/**
 * Type guard to check if a quality metric is a StarrSeqQualityMetric.
 *
 * @param qualityMetric - Quality metric object to check
 * @returns True if the quality metric is a StarrSeqQualityMetric
 */
export function isStarrSeqQualityMetric(
  qualityMetric: QualityMetricObject
): qualityMetric is StarrSeqQualityMetricObject {
  return isDatabaseObjectOfType(qualityMetric, "StarrSeqQualityMetric");
}

/**
 * Gets the title of a quality metric, truncating it to a maximum length.
 *
 * @param qualityMetric - Quality metric object to get the title from
 * @returns Title of the quality metric, truncated to a maximum length
 */
export function qualityMetricTitle(qualityMetric: QualityMetricObject): string {
  const title = qualityMetric.description || qualityMetric.summary;
  return truncateText(title, MAX_TITLE_LENGTH);
}
