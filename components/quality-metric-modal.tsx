// node_modules
import Link from "next/link";
import { useContext } from "react";
// components
import { DataPanel, DataArea, DataItemLabel, DataItemValue } from "./data-area";
import Modal from "./modal";
import SessionContext from "./session-context";
// lib
import { attachmentToServerHref } from "../lib/attachment";
import {
  MpraQualityMetricObject,
  PerturbSeqQualityMetricObject,
  QualityMetricObject,
  SingleCellAtacSeqQualityMetricObject,
  SingleCellRnaSeqQualityMetricObject,
  StarrSeqQualityMetricObject,
} from "../lib/quality-metric";
// root
import type { Attachment, CollectionTitles, FileObject } from "../globals.d";

/**
 * Display an attachment link for a quality metric attachment.
 * @param qualityMetric - Quality metric object to display
 * @param attachment - Attachment object to display
 * @param className - Additional class name to apply to the link
 */
function QualityMetricAttachmentLink({
  qualityMetric,
  attachment,
  className = "",
  children = null,
}: {
  qualityMetric: QualityMetricObject;
  attachment: Attachment;
  className?: string;
  children?: React.ReactNode;
}) {
  const href = attachmentToServerHref(attachment, qualityMetric["@id"]);
  return (
    <a
      className={className || "break-all"}
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={`Download ${attachment.download}`}
    >
      {children || attachment.download}
    </a>
  );
}

/**
 * Type guard to check if a quality metric is an MpraQualityMetric.
 * @param qualityMetric - Quality metric object to check
 * @returns True if the quality metric is an MpraQualityMetric
 */
function isMpraQualityMetric(
  qualityMetric: QualityMetricObject
): qualityMetric is MpraQualityMetricObject {
  return qualityMetric["@type"][0] === "MpraQualityMetric";
}

/**
 * Type guard to check if a quality metric is a PerturbSeqQualityMetric.
 * @param qualityMetric - Quality metric object to check
 * @returns True if the quality metric is a PerturbSeqQualityMetric
 */
function isPerturbSeqQualityMetric(
  qualityMetric: QualityMetricObject
): qualityMetric is PerturbSeqQualityMetricObject {
  return qualityMetric["@type"][0] === "PerturbSeqQualityMetric";
}

/**
 * Type guard to check if a quality metric is a SingleCellAtacSeqQualityMetric.
 * @param qualityMetric - Quality metric object to check
 * @returns True if the quality metric is a SingleCellAtacSeqQualityMetric
 */
function isSingleCellAtacSeqQualityMetric(
  qualityMetric: QualityMetricObject
): qualityMetric is SingleCellAtacSeqQualityMetricObject {
  return qualityMetric["@type"][0] === "SingleCellAtacSeqQualityMetric";
}

/**
 * Type guard to check if a quality metric is a SingleCellRnaSeqQualityMetric.
 * @param qualityMetric - Quality metric object to check
 * @returns True if the quality metric is a SingleCellRnaSeqQualityMetric
 */
function isSingleCellRnaSeqQualityMetric(
  qualityMetric: QualityMetricObject
): qualityMetric is SingleCellRnaSeqQualityMetricObject {
  return qualityMetric["@type"][0] === "SingleCellRnaSeqQualityMetric";
}

/**
 * Type guard to check if a quality metric is a StarrSeqQualityMetric.
 * @param qualityMetric - Quality metric object to check
 * @returns True if the quality metric is a StarrSeqQualityMetric
 */
function isStarrSeqQualityMetric(
  qualityMetric: QualityMetricObject
): qualityMetric is StarrSeqQualityMetricObject {
  return qualityMetric["@type"][0] === "StarrSeqQualityMetric";
}

/**
 * Shows the quality metrics for a MpraQualityMetric.
 * @param qualityMetric - Quality metric object to display
 */
function MpraQualityMetricPanel({
  qualityMetric,
}: {
  qualityMetric: MpraQualityMetricObject;
}) {
  return (
    <DataArea isSmall>
      {qualityMetric.description && (
        <>
          <DataItemLabel isSmall>Description</DataItemLabel>
          <DataItemValue isSmall>{qualityMetric.description}</DataItemValue>
        </>
      )}

      {qualityMetric.attachment && (
        <>
          <DataItemLabel isSmall>Attachment</DataItemLabel>
          <DataItemValue isSmall>
            <QualityMetricAttachmentLink
              qualityMetric={qualityMetric}
              attachment={qualityMetric.attachment}
            />
          </DataItemValue>
        </>
      )}

      {qualityMetric.fraction_assigned_oligos !== undefined && (
        <>
          <DataItemLabel isSmall>Fraction of Assigned Oligos</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.fraction_assigned_oligos.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.fraction_oligos_passing !== undefined && (
        <>
          <DataItemLabel isSmall>
            Fraction of Oligos Passing Filters
          </DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.fraction_oligos_passing.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.median_assigned_barcodes !== undefined && (
        <>
          <DataItemLabel isSmall>
            Median Number of Assigned Barcodes
          </DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.median_assigned_barcodes.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.median_barcodes_passing_filtering !== undefined && (
        <>
          <DataItemLabel isSmall>
            Median Barcodes Passing Filtering
          </DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.median_barcodes_passing_filtering.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.median_rna_read_count !== undefined && (
        <>
          <DataItemLabel isSmall>Median RNA Read Count</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.median_rna_read_count.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.pearson_correlation !== undefined && (
        <>
          <DataItemLabel isSmall>Pearson Correlation</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.pearson_correlation.toLocaleString()}
          </DataItemValue>
        </>
      )}
    </DataArea>
  );
}

/**
 * Displays the quality metrics for a PerturbSeqQualityMetric.
 * @param qualityMetric - Quality metric object to display
 */
function PerturbSeqPanel({
  qualityMetric,
}: {
  qualityMetric: PerturbSeqQualityMetricObject;
}) {
  return (
    <DataArea isSmall>
      {qualityMetric.description && (
        <>
          <DataItemLabel isSmall>Description</DataItemLabel>
          <DataItemValue isSmall>{qualityMetric.description}</DataItemValue>
        </>
      )}

      {qualityMetric.attachment && (
        <>
          <DataItemLabel isSmall>Attachment</DataItemLabel>
          <DataItemValue isSmall>
            <QualityMetricAttachmentLink
              qualityMetric={qualityMetric}
              attachment={qualityMetric.attachment}
            />
          </DataItemValue>
        </>
      )}

      {qualityMetric.alignment_percentage !== undefined && (
        <>
          <DataItemLabel isSmall>Alignment Percentage</DataItemLabel>
          <DataItemValue
            isSmall
          >{`${qualityMetric.alignment_percentage.toLocaleString()}%`}</DataItemValue>
        </>
      )}

      {qualityMetric.avg_cells_per_target !== undefined && (
        <>
          <DataItemLabel isSmall>Average Cells Per Target</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.avg_cells_per_target.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.avg_umis_per_cell !== undefined && (
        <>
          <DataItemLabel isSmall>Average UMIs Per Cell</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.avg_umis_per_cell.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.guide_diversity !== undefined && (
        <>
          <DataItemLabel isSmall>Guide Diversity</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.guide_diversity.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.mean_mitochondrial_reads !== undefined && (
        <>
          <DataItemLabel isSmall>Mean Mitochondrial Reads</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.mean_mitochondrial_reads.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.moi !== undefined && (
        <>
          <DataItemLabel isSmall>Multiplicity of Infection</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.moi.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.paired_reads_mapped !== undefined && (
        <>
          <DataItemLabel isSmall>Paired Reads Mapped</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.paired_reads_mapped.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.pct_cells_assigned_guide !== undefined && (
        <>
          <DataItemLabel isSmall>Percent Cells Assigned Guide</DataItemLabel>
          <DataItemValue isSmall>
            {`${qualityMetric.pct_cells_assigned_guide.toLocaleString()}%`}
          </DataItemValue>
        </>
      )}

      {qualityMetric.total_cells_passing_filters !== undefined && (
        <>
          <DataItemLabel isSmall>Total Cells Passing Filters</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.total_cells_passing_filters.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.total_detected_scrna_barcodes !== undefined && (
        <>
          <DataItemLabel isSmall>Total Detected scRNA Barcodes</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.total_detected_scrna_barcodes.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.total_guides !== undefined && (
        <>
          <DataItemLabel isSmall>Total Guides</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.total_guides.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.total_reads !== undefined && (
        <>
          <DataItemLabel isSmall>Total Reads</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.total_reads.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.total_targets !== undefined && (
        <>
          <DataItemLabel isSmall>Total Targets</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.total_targets.toLocaleString()}
          </DataItemValue>
        </>
      )}
    </DataArea>
  );
}

/**
 * Displays the quality metrics for a SingleCellAtacSeqQualityMetric.
 * @param qualityMetric - Quality metric object to display
 */
function SingleCellAtacSeqPanel({
  qualityMetric,
}: {
  qualityMetric: SingleCellAtacSeqQualityMetricObject;
}) {
  return (
    <DataArea isSmall>
      {qualityMetric.description && (
        <>
          <DataItemLabel isSmall>Description</DataItemLabel>
          <DataItemValue isSmall>{qualityMetric.description}</DataItemValue>
        </>
      )}

      {qualityMetric.attachment !== undefined && (
        <>
          <DataItemLabel isSmall>Attachment</DataItemLabel>
          <DataItemValue isSmall>
            <QualityMetricAttachmentLink
              qualityMetric={qualityMetric}
              attachment={qualityMetric.attachment}
            />
          </DataItemValue>
        </>
      )}

      {qualityMetric.atac_bam_summary_stats !== undefined && (
        <>
          <DataItemLabel isSmall>ATAC BAM Summary Stats</DataItemLabel>
          <DataItemValue isSmall>
            <QualityMetricAttachmentLink
              qualityMetric={qualityMetric}
              attachment={qualityMetric.atac_bam_summary_stats}
            />
          </DataItemValue>
        </>
      )}

      {qualityMetric.atac_fragment_summary_stats !== undefined && (
        <>
          <DataItemLabel isSmall>ATAC Fragment Summary Stats</DataItemLabel>
          <DataItemValue isSmall>
            <QualityMetricAttachmentLink
              qualityMetric={qualityMetric}
              attachment={qualityMetric.atac_fragment_summary_stats}
            />
          </DataItemValue>
        </>
      )}

      {qualityMetric.atac_fragments_alignment_stats !== undefined && (
        <>
          <DataItemLabel isSmall>ATAC Fragments Alignment Stats</DataItemLabel>
          <DataItemValue isSmall>
            <QualityMetricAttachmentLink
              qualityMetric={qualityMetric}
              attachment={qualityMetric.atac_fragments_alignment_stats}
            />
          </DataItemValue>
        </>
      )}

      {qualityMetric.multi_mappings !== undefined && (
        <>
          <DataItemLabel isSmall>Multi-Mappings</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.multi_mappings.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.n_barcodes_on_onlist !== undefined && (
        <>
          <DataItemLabel isSmall>Number of Barcodes on Onlist</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.n_barcodes_on_onlist.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.n_candidates !== undefined && (
        <>
          <DataItemLabel isSmall>Number of Candidates</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.n_candidates.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.n_corrected_barcodes !== undefined && (
        <>
          <DataItemLabel isSmall>Number of Corrected Barcodes</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.n_corrected_barcodes.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.n_mapped_reads !== undefined && (
        <>
          <DataItemLabel isSmall>Number of Mapped Reads</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.n_mapped_reads.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.n_mappings !== undefined && (
        <>
          <DataItemLabel isSmall>Number of Mappings</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.n_mappings.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.n_multi_mappings !== undefined && (
        <>
          <DataItemLabel isSmall>Number of Multi-Mappings</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.n_multi_mappings.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.n_output_mappings !== undefined && (
        <>
          <DataItemLabel isSmall>Number of Output Mappings</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.n_output_mappings.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.n_reads !== undefined && (
        <>
          <DataItemLabel isSmall>Number of Reads</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.n_reads.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.n_reads_with_multi_mappings !== undefined && (
        <>
          <DataItemLabel isSmall>
            Number of Reads With Multi-Mappings
          </DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.n_reads_with_multi_mappings.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.n_uni_mappings !== undefined && (
        <>
          <DataItemLabel isSmall>Number of Uni-Mappings</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.n_uni_mappings.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.n_uniquely_mapped_reads !== undefined && (
        <>
          <DataItemLabel isSmall>Number of Uniquely Mapped Reads</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.n_uniquely_mapped_reads.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.pct_duplicates !== undefined && (
        <>
          <DataItemLabel isSmall>Percent Duplicates</DataItemLabel>
          <DataItemValue isSmall>
            {`${qualityMetric.pct_duplicates.toLocaleString()}%`}
          </DataItemValue>
        </>
      )}

      {qualityMetric.total !== undefined && (
        <>
          <DataItemLabel isSmall>Total</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.total.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.uni_mappings !== undefined && (
        <>
          <DataItemLabel isSmall>Uni-Mappings</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.uni_mappings.toLocaleString()}
          </DataItemValue>
        </>
      )}
    </DataArea>
  );
}

/**
 * Displays the quality metrics for a SingleCellRnaSeqQualityMetric.
 * @param qualityMetric - Quality metric object to display
 */
function SingleCellRnaSeqPanel({
  qualityMetric,
}: {
  qualityMetric: SingleCellRnaSeqQualityMetricObject;
}) {
  return (
    <DataArea isSmall>
      {qualityMetric.description && (
        <>
          <DataItemLabel isSmall>Description</DataItemLabel>
          <DataItemValue isSmall>{qualityMetric.description}</DataItemValue>
        </>
      )}

      {qualityMetric.attachment && (
        <>
          <DataItemLabel isSmall>Attachment</DataItemLabel>
          <DataItemValue isSmall>
            <QualityMetricAttachmentLink
              qualityMetric={qualityMetric}
              attachment={qualityMetric.attachment}
            />
          </DataItemValue>
        </>
      )}

      {qualityMetric.gt_records !== undefined && (
        <>
          <DataItemLabel isSmall>Good-Toulmin Estimation Records</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.gt_records.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.index_version !== undefined && (
        <>
          <DataItemLabel isSmall>Kallisto Index Version</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.index_version.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.kmer_length !== undefined && (
        <>
          <DataItemLabel isSmall>K-mer Length</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.kmer_length.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.mean_reads_per_barcode !== undefined && (
        <>
          <DataItemLabel isSmall>Mean Reads Per Barcode</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.mean_reads_per_barcode.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.mean_umis_per_barcode !== undefined && (
        <>
          <DataItemLabel isSmall>Mean UMIs Per Barcode</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.mean_umis_per_barcode.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.median_reads_per_barcode !== undefined && (
        <>
          <DataItemLabel isSmall>Median Reads Per Barcode</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.median_reads_per_barcode.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.median_umis_per_barcode !== undefined && (
        <>
          <DataItemLabel isSmall>Median UMIs Per Barcode</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.median_umis_per_barcode.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.n_barcode_umis !== undefined && (
        <>
          <DataItemLabel isSmall>Number of Barcode UMIs</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.n_barcode_umis.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.n_barcodes !== undefined && (
        <>
          <DataItemLabel isSmall>Number of Barcodes</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.n_barcodes.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.n_bootstraps !== undefined && (
        <>
          <DataItemLabel isSmall>Number of Bootstrap Iterations</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.n_bootstraps.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.n_processed !== undefined && (
        <>
          <DataItemLabel isSmall>Number of Reads Processed</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.n_processed.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.n_pseudoaligned !== undefined && (
        <>
          <DataItemLabel isSmall>Number of Reads Pseudoaligned</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.n_pseudoaligned.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.n_reads !== undefined && (
        <>
          <DataItemLabel isSmall>Number of Reads</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.n_reads.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.n_records !== undefined && (
        <>
          <DataItemLabel isSmall>Number of Records</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.n_records.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.n_targets !== undefined && (
        <>
          <DataItemLabel isSmall>Number of Target Sequences</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.n_targets.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.n_unique !== undefined && (
        <>
          <DataItemLabel isSmall>
            Number of Reads Uniquely Pseudoaligned
          </DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.n_unique.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.num_barcodes_on_onlist !== undefined && (
        <>
          <DataItemLabel isSmall>Number of Barcodes on Onlist</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.num_barcodes_on_onlist.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.num_reads_on_onlist !== undefined && (
        <>
          <DataItemLabel isSmall>Number of Reads on Onlist</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.num_reads_on_onlist.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.p_pseudoaligned !== undefined && (
        <>
          <DataItemLabel isSmall>
            Percentage of Reads Pseudoaligned
          </DataItemLabel>
          <DataItemValue
            isSmall
          >{`${qualityMetric.p_pseudoaligned}%`}</DataItemValue>
        </>
      )}

      {qualityMetric.p_unique !== undefined && (
        <>
          <DataItemLabel isSmall>
            Percentage of Reads Uniquely Pseudoaligned
          </DataItemLabel>
          <DataItemValue isSmall>{`${qualityMetric.p_unique}%`}</DataItemValue>
        </>
      )}

      {qualityMetric.percentage_barcodes_on_onlist !== undefined && (
        <>
          <DataItemLabel isSmall>
            Percentage of Barcodes on Onlist
          </DataItemLabel>
          <DataItemValue
            isSmall
          >{`${qualityMetric.percentage_barcodes_on_onlist}%`}</DataItemValue>
        </>
      )}

      {qualityMetric.percentage_reads_on_onlist !== undefined && (
        <>
          <DataItemLabel isSmall>Percentage of Reads on Onlist</DataItemLabel>
          <DataItemValue
            isSmall
          >{`${qualityMetric.percentage_reads_on_onlist}%`}</DataItemValue>
        </>
      )}

      {qualityMetric.percentage_reads_on_onlist !== undefined && (
        <>
          <DataItemLabel isSmall>Percentage of Reads on Onlist</DataItemLabel>
          <DataItemValue
            isSmall
          >{`${qualityMetric.percentage_reads_on_onlist}%`}</DataItemValue>
        </>
      )}

      {qualityMetric.rnaseq_kb_info && (
        <>
          <DataItemLabel isSmall>RNA-seq KB Info</DataItemLabel>
          <DataItemValue isSmall>
            <QualityMetricAttachmentLink
              qualityMetric={qualityMetric}
              attachment={qualityMetric.rnaseq_kb_info}
            />
          </DataItemValue>
        </>
      )}

      {qualityMetric.total_umis !== undefined && (
        <>
          <DataItemLabel isSmall>Total UMIs</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.total_umis.toLocaleString()}
          </DataItemValue>
        </>
      )}
    </DataArea>
  );
}

/**
 * Displays the quality metrics for a StarrSeqQualityMetric.
 * @param qualityMetric - Quality metric object to display
 */
function StarrSeqQualityMetricPanel({
  qualityMetric,
}: {
  qualityMetric: StarrSeqQualityMetricObject;
}) {
  return (
    <DataArea isSmall>
      {qualityMetric.description && (
        <>
          <DataItemLabel isSmall>Description</DataItemLabel>
          <DataItemValue isSmall>{qualityMetric.description}</DataItemValue>
        </>
      )}

      {qualityMetric.attachment && (
        <>
          <DataItemLabel isSmall>Attachment</DataItemLabel>
          <DataItemValue isSmall>
            <QualityMetricAttachmentLink
              qualityMetric={qualityMetric}
              attachment={qualityMetric.attachment}
            />
          </DataItemValue>
        </>
      )}

      {qualityMetric.coverage !== undefined && (
        <>
          <DataItemLabel isSmall>Coverage</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.coverage.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.coverage_per_basepair !== undefined && (
        <>
          <DataItemLabel isSmall>Coverage Per Basepair</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.coverage_per_basepair.toLocaleString()}
          </DataItemValue>
        </>
      )}

      {qualityMetric.rna_correlation_in_peaks !== undefined && (
        <>
          <DataItemLabel isSmall>Correlation of RNA in Peaks</DataItemLabel>
          <DataItemValue isSmall>
            {qualityMetric.rna_correlation_in_peaks.toLocaleString()}
          </DataItemValue>
        </>
      )}
    </DataArea>
  );
}

/**
 * Displays the elements of a quality metric regardless of the specific quality metric type. Based
 * on the type of the quality metric, it dispatches to the appropriate panel.
 * @param qualityMetric - Quality metric object to display
 */
function QCMetricPanel({
  qualityMetric,
}: {
  qualityMetric: QualityMetricObject;
}) {
  if (isMpraQualityMetric(qualityMetric)) {
    return <MpraQualityMetricPanel qualityMetric={qualityMetric} />;
  }
  if (isPerturbSeqQualityMetric(qualityMetric)) {
    return <PerturbSeqPanel qualityMetric={qualityMetric} />;
  }
  if (isSingleCellAtacSeqQualityMetric(qualityMetric)) {
    return <SingleCellAtacSeqPanel qualityMetric={qualityMetric} />;
  }
  if (isSingleCellRnaSeqQualityMetric(qualityMetric)) {
    return <SingleCellRnaSeqPanel qualityMetric={qualityMetric} />;
  }
  if (isStarrSeqQualityMetric(qualityMetric)) {
    return <StarrSeqQualityMetricPanel qualityMetric={qualityMetric} />;
  }

  // None of the other quality metrics are currently supported. Display a message indicating that
  // the quality metric is not supported, along with its @type.
  return (
    <div className="italic">
      {qualityMetric["@type"][0]} is not yet supported.
    </div>
  );
}

/**
 * Modal to display quality metrics for a file.
 * @param qualityMetrics - Quality metrics to display.
 * @param onClose - Function to call when the modal is closed.
 */
export function QualityMetricModal({
  file,
  qualityMetrics,
  onClose,
}: {
  file: FileObject;
  qualityMetrics: QualityMetricObject[];
  onClose: () => void;
}) {
  const { collectionTitles } = useContext(SessionContext as any) as {
    collectionTitles: CollectionTitles;
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      <Modal.Header onClose={onClose}>
        <h2>
          Quality Metrics for{" "}
          <a href={file["@id"]} target="_blank">
            {file.accession}
          </a>
        </h2>
      </Modal.Header>
      <Modal.Body>
        <div className="flex max-h-[80svh] flex-wrap gap-2 overflow-y-auto @container/qualityMetric-metric-modal md:max-h-[calc(80dvh-7rem)]">
          {qualityMetrics.map((metric) => {
            let title =
              collectionTitles[metric["@type"][0]] || metric["@type"][0];
            title = title.replace(/ Quality Metrics$/, "");

            return (
              <DataPanel
                key={metric["@id"]}
                className="w-full rounded-md only-child:w-full lg/qualityMetric-metric-modal:w-[calc(50%-0.25rem)]"
              >
                <h2 className="mb-2 mt-[-8px] text-center font-semibold">
                  <Link href={metric["@id"]} target="_blank">
                    {title}
                  </Link>
                </h2>
                <QCMetricPanel qualityMetric={metric} />
              </DataPanel>
            );
          })}
        </div>
      </Modal.Body>
    </Modal>
  );
}
