// node_modules
import _ from "lodash";
// lib
import { truncateText } from "./general";
// root
import type {
  AnalysisStepVersionObject,
  Attachment,
  DatabaseObject,
  FileObject,
} from "../globals";

/**
 * Maximum length for quality metric titles.
 */
const MAX_TITLE_LENGTH = 60;

export interface QualityMetricObject extends DatabaseObject {
  analysis_step_version: string | AnalysisStepVersionObject;
  attachment?: Attachment;
  description?: string;
  quality_metric_of: string[] | FileObject[];
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
  avg_cells_per_target?: number;
  avg_umis_per_cell?: number;
  guide_diversity?: number;
  mean_mitochondrial_reads?: number;
  moi?: number;
  paired_reads_mapped?: number;
  pct_cells_assigned_guide?: number;
  total_cells_passing_filters?: number;
  total_detected_scrna_barcodes?: number;
  total_guides?: number;
  total_reads?: number;
  total_targets?: number;
}

export interface SingleCellAtacSeqQualityMetricObject
  extends QualityMetricObject {
  atac_bam_summary_stats?: Attachment;
  atac_fragment_summary_stats?: Attachment;
  atac_fragments_alignment_stats?: Attachment;
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

export interface SingleCellRnaSeqQualityMetricObject
  extends QualityMetricObject {
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
  rnaseq_kb_info?: Attachment;
  total_umis?: number;
}

export interface StarrSeqQualityMetricObject extends QualityMetricObject {
  alignment_percentage?: number;
  avg_cells_per_target?: number;
  avg_umis_per_cell?: number;
  guide_diversity?: number;
  mean_mitochondrial_reads?: number;
  moi?: number;
  paired_reads_mapped?: number;
  pct_cells_assigned_guide?: number;
  total_cells_passing_filters?: number;
  total_detected_scrna_barcodes?: number;
  total_guides?: number;
  total_reads?: number;
  total_targets?: number;
}

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
    name: "summary",
    title: "Summary",
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
    name: "summary",
    title: "Summary",
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
    name: "avg_cells_per_target",
    title: "Average Cells Per Target",
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
    name: "summary",
    title: "Summary",
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
    name: "summary",
    title: "Summary",
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
    name: "summary",
    title: "Summary",
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
 * Type guard to check if a quality metric is an MpraQualityMetric.
 * @param qualityMetric - Quality metric object to check
 * @returns True if the quality metric is an MpraQualityMetric
 */
export function isMpraQualityMetric(
  qualityMetric: QualityMetricObject
): qualityMetric is MpraQualityMetricObject {
  return qualityMetric["@type"][0] === "MpraQualityMetric";
}

/**
 * Type guard to check if a quality metric is a PerturbSeqQualityMetric.
 * @param qualityMetric - Quality metric object to check
 * @returns True if the quality metric is a PerturbSeqQualityMetric
 */
export function isPerturbSeqQualityMetric(
  qualityMetric: QualityMetricObject
): qualityMetric is PerturbSeqQualityMetricObject {
  return qualityMetric["@type"][0] === "PerturbSeqQualityMetric";
}

/**
 * Type guard to check if a quality metric is a SingleCellAtacSeqQualityMetric.
 * @param qualityMetric - Quality metric object to check
 * @returns True if the quality metric is a SingleCellAtacSeqQualityMetric
 */
export function isSingleCellAtacSeqQualityMetric(
  qualityMetric: QualityMetricObject
): qualityMetric is SingleCellAtacSeqQualityMetricObject {
  return qualityMetric["@type"][0] === "SingleCellAtacSeqQualityMetric";
}

/**
 * Type guard to check if a quality metric is a SingleCellRnaSeqQualityMetric.
 * @param qualityMetric - Quality metric object to check
 * @returns True if the quality metric is a SingleCellRnaSeqQualityMetric
 */
export function isSingleCellRnaSeqQualityMetric(
  qualityMetric: QualityMetricObject
): qualityMetric is SingleCellRnaSeqQualityMetricObject {
  return qualityMetric["@type"][0] === "SingleCellRnaSeqQualityMetric";
}

/**
 * Type guard to check if a quality metric is a StarrSeqQualityMetric.
 * @param qualityMetric - Quality metric object to check
 * @returns True if the quality metric is a StarrSeqQualityMetric
 */
export function isStarrSeqQualityMetric(
  qualityMetric: QualityMetricObject
): qualityMetric is StarrSeqQualityMetricObject {
  return qualityMetric["@type"][0] === "StarrSeqQualityMetric";
}

/**
 * Gets the title of a quality metric, truncating it to a maximum length.
 * @param qualityMetric - Quality metric object to get the title from
 * @returns Title of the quality metric, truncated to a maximum length
 */
export function qualityMetricTitle(qualityMetric: QualityMetricObject): string {
  const title = qualityMetric.description || qualityMetric.summary;
  return truncateText(title, MAX_TITLE_LENGTH);
}
