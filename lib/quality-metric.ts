// root
import {
  AnalysisStepVersionObject,
  Attachment,
  DatabaseObject,
  FileObject,
} from "../globals";

export interface QualityMetricObject extends DatabaseObject {
  analysis_step_version: string | AnalysisStepVersionObject;
  attachment?: Attachment;
  description?: string;
  quality_metric_of: string[] | FileObject[];
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
