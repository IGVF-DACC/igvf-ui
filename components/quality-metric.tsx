/**
 * @file Quality metric property display components.
 *
 * Use these components to display quality-metric properties for any number of quality-metric
 * objects. Each gets displayed in a panel, and each quality-metric type has its own set of
 * properties to display.
 *
 * If you add a new quality-metric type:
 * 1. add its list of displayed properties as a `FieldAttr[]`
 * 2. add a type guard to check if the quality metric is of that type
 * 3. add a case to the `QCMetricPanel` function to display the fields for that type
 */

// node_modules
import { useContext } from "react";
// components
import {
  DataPanel,
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
} from "./data-area";
import Link from "./link-no-prefetch";
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
 * Holds the information about a quality metric field within a `QualityMetricObject`.
 * @property name - The name of the field in the `QualityMetricObject`
 * @property title - The title to display for the field
 * @property type - The type of the field, each requiring a distinct renderer
 */
type FieldAttr = {
  name: string;
  title: string;
  type: "number" | "percent" | "string" | "attachment";
};

/**
 * List of fields to display for each MPRA quality metric.
 */
const mpraFields: FieldAttr[] = [
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
const perturbSeqFields: FieldAttr[] = [
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
const singleCellAtacSeqFields: FieldAttr[] = [
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
const singleCellRnaSeqFields: FieldAttr[] = [
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
const starrSeqFields: FieldAttr[] = [
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
 * Property renderer for quality metric properties that are numbers. It displays the numbers,
 * including 0, with thousand separators.
 * @param field - Information about the property to display
 * @param qualityMetric - Quality metric that includes the property specified by `field`
 */
function Number({
  fieldAttr,
  qualityMetric,
}: {
  fieldAttr: FieldAttr;
  qualityMetric: QualityMetricObject;
}) {
  return (
    <>
      <DataItemLabel isSmall>{fieldAttr.title}</DataItemLabel>
      <DataItemValue isSmall>
        {qualityMetric[fieldAttr.name].toLocaleString()}
      </DataItemValue>
    </>
  );
}

/**
 * Property renderer for quality metric properties that are percentages. It displays the numbers as
 * percentages, including 0, with thousand separators.
 * @param field - Information about the property to display
 * @param qualityMetric - Quality metric that includes the property specified by `field`
 */
function Percent({
  fieldAttr,
  qualityMetric,
}: {
  fieldAttr: FieldAttr;
  qualityMetric: QualityMetricObject;
}) {
  return (
    <>
      <DataItemLabel isSmall>{fieldAttr.title}</DataItemLabel>
      <DataItemValue isSmall>
        {`${qualityMetric[fieldAttr.name].toLocaleString()}%`}
      </DataItemValue>
    </>
  );
}

/**
 * Property renderer for quality metric properties that are strings. It displays the string value
 * directly.
 * @param field - Information about the property to display
 * @param qualityMetric - Quality metric that includes the property specified by `field`
 */
function String({
  fieldAttr,
  qualityMetric,
}: {
  fieldAttr: FieldAttr;
  qualityMetric: QualityMetricObject;
}) {
  return (
    <>
      <DataItemLabel isSmall>{fieldAttr.title}</DataItemLabel>
      <DataItemValue isSmall>
        {qualityMetric[fieldAttr.name] as string}
      </DataItemValue>
    </>
  );
}

/**
 * Property renderer for quality metric properties that are attachments. It displays the attachment
 * name as a link to download the attachment.
 * @param property - Information about the property to display
 * @param qualityMetric - Quality metric that includes the property specified by `field`
 */
function Attachment({
  fieldAttr,
  qualityMetric,
}: {
  fieldAttr: FieldAttr;
  qualityMetric: QualityMetricObject;
}) {
  return (
    <>
      <DataItemLabel isSmall>{fieldAttr.title}</DataItemLabel>
      <DataItemValue isSmall>
        <QualityMetricAttachmentLink
          qualityMetric={qualityMetric}
          attachment={qualityMetric[fieldAttr.name] as Attachment}
        />
      </DataItemValue>
    </>
  );
}

/**
 * Displays a quality metric field based on its type, dispatching to the appropriate renderer.
 * @param fieldAttr - Information about the property to display
 * @param qualityMetric - Quality metric that includes the property specified by `field`
 */
function QualityMetricField({
  fieldAttr,
  qualityMetric,
}: {
  fieldAttr: FieldAttr;
  qualityMetric: QualityMetricObject;
}) {
  if (qualityMetric[fieldAttr.name] !== undefined) {
    switch (fieldAttr.type) {
      case "number":
        return <Number fieldAttr={fieldAttr} qualityMetric={qualityMetric} />;
      case "percent":
        return <Percent fieldAttr={fieldAttr} qualityMetric={qualityMetric} />;
      case "string":
        return <String fieldAttr={fieldAttr} qualityMetric={qualityMetric} />;
      case "attachment":
        return (
          <Attachment fieldAttr={fieldAttr} qualityMetric={qualityMetric} />
        );
      default:
        return null;
    }
  }
}

/**
 * Display all the fields fields of a quality metric.
 * @param fieldAttrs - List of field attributes to display; differs by quality metric type
 * @param qualityMetric - Quality metric object to display
 */
function QualityMetricFields({
  fieldAttrs,
  qualityMetric,
}: {
  fieldAttrs: FieldAttr[];
  qualityMetric: QualityMetricObject;
}) {
  return (
    <div className="mt-4 w-full">
      <DataArea isSmall>
        {fieldAttrs.map((fieldAttr) => {
          return (
            <QualityMetricField
              key={fieldAttr.name}
              fieldAttr={fieldAttr}
              qualityMetric={qualityMetric}
            />
          );
        })}
      </DataArea>
    </div>
  );
}

/**
 * Displays the elements of a quality metric regardless of the specific quality-metric type. Based
 * on the type of the quality metric, it dispatches to the appropriate panel.
 * @param qualityMetric - Quality metric object to display
 */
function QCMetricPanel({
  qualityMetric,
}: {
  qualityMetric: QualityMetricObject;
}) {
  let fieldAttrs: FieldAttr[] = [];

  if (isMpraQualityMetric(qualityMetric)) {
    fieldAttrs = mpraFields;
  } else if (isPerturbSeqQualityMetric(qualityMetric)) {
    fieldAttrs = perturbSeqFields;
  } else if (isSingleCellAtacSeqQualityMetric(qualityMetric)) {
    fieldAttrs = singleCellAtacSeqFields;
  } else if (isSingleCellRnaSeqQualityMetric(qualityMetric)) {
    fieldAttrs = singleCellRnaSeqFields;
  } else if (isStarrSeqQualityMetric(qualityMetric)) {
    fieldAttrs = starrSeqFields;
  }

  // If the quality metric is one of the supported types, display its fields.
  if (fieldAttrs.length > 0) {
    return (
      <QualityMetricFields
        fieldAttrs={fieldAttrs}
        qualityMetric={qualityMetric}
      />
    );
  }

  // The quality metric object currently has no support in this code. Display a message indicating
  // that.
  return (
    <div className="italic">
      {qualityMetric["@type"][0]} is not yet supported.
    </div>
  );
}

/**
 * Display the title and contents within a quality metric panel or modal.
 * @param qualityMetric - Quality metric object to display
 */
function QualityMetricContent({
  qualityMetric,
}: {
  qualityMetric: QualityMetricObject;
}) {
  const { collectionTitles } = useContext(SessionContext as any) as {
    collectionTitles: CollectionTitles;
  };

  // Get the human-readable title for the quality metric type. Strip " Quality Metrics"
  // from the end of the title if it exists.
  let title =
    collectionTitles?.[qualityMetric["@type"][0]] || qualityMetric["@type"][0];
  title = title.replace(/ Quality Metrics$/, "");

  return (
    <>
      <h2 className="mb-2 mt-[-4px] text-center font-semibold">
        <Link href={qualityMetric["@id"]} target="_blank">
          {title}
        </Link>
      </h2>
      <QCMetricPanel qualityMetric={qualityMetric} />
    </>
  );
}

/**
 * Displays either a sub-panel within the quality-metric panel or the children directly, depending
 * on the given condition. Use this to avoid wrapping the children in a panel if there is only one
 * quality metric.
 * @param isInSubPanel - True to display the children in a sub-panel, false to display them directly
 */
function SubPanelWrapper({
  isInSubPanel = true,
  children,
}: {
  isInSubPanel?: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      {isInSubPanel ? (
        <DataPanel className="min-w-[300px] flex-[1_0_auto]">
          {children}
        </DataPanel>
      ) : (
        <div className="w-full">{children}</div>
      )}
    </>
  );
}

/**
 * Modal to display quality metrics for a file.
 * @param file - File object to display quality metrics for
 * @param qualityMetrics - Quality metrics to display
 * @param onClose - Function to call when the modal is closed
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
      <div className="flex max-h-[80svh] flex-wrap gap-2 overflow-y-auto p-4 @container/qc-panel md:max-h-[calc(80dvh-7rem)]">
        {qualityMetrics.map((metric) => {
          return (
            <SubPanelWrapper
              isInSubPanel={qualityMetrics.length > 1}
              key={metric["@id"]}
            >
              <QualityMetricContent qualityMetric={metric} />
            </SubPanelWrapper>
          );
        })}
      </div>
    </Modal>
  );
}

/**
 * Displays the quality metrics for a file in a panel for an object page.
 * @param qualityMetrics - Quality metrics to display
 * @param id - ID of the panel for the section directory
 */
export function QualityMetricPanel({
  qualityMetrics = [],
  id = "quality-metrics-panel",
}: {
  qualityMetrics?: QualityMetricObject[];
  id?: string;
}) {
  const { collectionTitles } = useContext(SessionContext as any) as {
    collectionTitles: CollectionTitles;
  };

  if (qualityMetrics.length > 0) {
    return (
      <>
        <DataAreaTitle id={id}>Quality Metrics</DataAreaTitle>
        <DataPanel className="flex flex-wrap gap-2 @container/qc-panel">
          {qualityMetrics.map((metric) => {
            let title =
              collectionTitles?.[metric["@type"][0]] || metric["@type"][0];
            title = title.replace(/ Quality Metrics$/, "");

            return (
              <SubPanelWrapper
                key={metric["@id"]}
                isInSubPanel={qualityMetrics.length > 1}
              >
                <h2 className="mb-2 mt-[-4px] text-center font-semibold">
                  <Link href={metric["@id"]} target="_blank">
                    {title}
                  </Link>
                </h2>
                <QCMetricPanel qualityMetric={metric} />
              </SubPanelWrapper>
            );
          })}
        </DataPanel>
      </>
    );
  }
}
