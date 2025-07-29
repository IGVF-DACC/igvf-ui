/**
 * @file Quality metric property display components.
 *
 * Use these components to display quality-metric properties for any number of quality-metric
 * objects. Each gets displayed in a panel, and each quality-metric type has its own set of
 * properties to display.
 *
 * If you add a new quality-metric type:
 * 1. add its list of displayed properties as a `QualityMetricFieldAttr[]`
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
  isMpraQualityMetric,
  isPerturbSeqQualityMetric,
  isSingleCellAtacSeqQualityMetric,
  isSingleCellRnaSeqQualityMetric,
  isStarrSeqQualityMetric,
  mpraFields,
  perturbSeqFields,
  singleCellAtacSeqFields,
  singleCellRnaSeqFields,
  starrSeqFields,
  type QualityMetricFieldAttr,
  type QualityMetricObject,
} from "../lib/quality-metric";
// root
import type { Attachment, CollectionTitles, FileObject } from "../globals";

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
 * Property renderer for quality metric properties that are numbers. It displays the numbers,
 * including 0, with thousand separators.
 * @param field - Information about the property to display
 * @param qualityMetric - Quality metric that includes the property specified by `field`
 * @param isSmall - True to display the property in a smaller format
 */
function Number({
  fieldAttr,
  qualityMetric,
  isSmall,
}: {
  fieldAttr: QualityMetricFieldAttr;
  qualityMetric: QualityMetricObject;
  isSmall: boolean;
}) {
  return (
    <>
      <DataItemLabel isSmall={isSmall}>{fieldAttr.title}</DataItemLabel>
      <DataItemValue isSmall={isSmall}>
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
 * @param isSmall - True to display the property in a smaller format
 */
function Percent({
  fieldAttr,
  qualityMetric,
  isSmall,
}: {
  fieldAttr: QualityMetricFieldAttr;
  qualityMetric: QualityMetricObject;
  isSmall: boolean;
}) {
  return (
    <>
      <DataItemLabel isSmall={isSmall}>{fieldAttr.title}</DataItemLabel>
      <DataItemValue isSmall={isSmall}>
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
 * @param isSmall - True to display the property in a smaller format
 */
function String({
  fieldAttr,
  qualityMetric,
  isSmall,
}: {
  fieldAttr: QualityMetricFieldAttr;
  qualityMetric: QualityMetricObject;
  isSmall: boolean;
}) {
  return (
    <>
      <DataItemLabel isSmall={isSmall}>{fieldAttr.title}</DataItemLabel>
      <DataItemValue isSmall={isSmall}>
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
 * @param isSmall - True to display the property in a smaller format
 */
function Attachment({
  fieldAttr,
  qualityMetric,
  isSmall,
}: {
  fieldAttr: QualityMetricFieldAttr;
  qualityMetric: QualityMetricObject;
  isSmall: boolean;
}) {
  return (
    <>
      <DataItemLabel isSmall={isSmall}>{fieldAttr.title}</DataItemLabel>
      <DataItemValue isSmall={isSmall}>
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
 * @param isSmall - True to display the property in a smaller format
 */
export function QualityMetricField({
  fieldAttr,
  qualityMetric,
  isSmall = false,
}: {
  fieldAttr: QualityMetricFieldAttr;
  qualityMetric: QualityMetricObject;
  isSmall?: boolean;
}) {
  if (qualityMetric[fieldAttr.name] !== undefined) {
    switch (fieldAttr.type) {
      case "number":
        return (
          <Number
            fieldAttr={fieldAttr}
            qualityMetric={qualityMetric}
            isSmall={isSmall}
          />
        );
      case "percent":
        return (
          <Percent
            fieldAttr={fieldAttr}
            qualityMetric={qualityMetric}
            isSmall={isSmall}
          />
        );
      case "string":
        return (
          <String
            fieldAttr={fieldAttr}
            qualityMetric={qualityMetric}
            isSmall={isSmall}
          />
        );
      case "attachment":
        return (
          <Attachment
            fieldAttr={fieldAttr}
            qualityMetric={qualityMetric}
            isSmall={isSmall}
          />
        );
    }
  }
}

/**
 * Display all the fields of a quality metric.
 * @param fieldAttrs - List of field attributes to display; differs by quality metric type
 * @param qualityMetric - Quality metric object to display
 * @param isSmall - True to display the fields in a smaller format
 */
function QualityMetricFields({
  fieldAttrs,
  qualityMetric,
  isSmall,
}: {
  fieldAttrs: QualityMetricFieldAttr[];
  qualityMetric: QualityMetricObject;
  isSmall: boolean;
}) {
  return (
    <div className="mt-4 w-full">
      <DataArea isSmall={isSmall}>
        {fieldAttrs.map((fieldAttr) => {
          return (
            <QualityMetricField
              key={fieldAttr.name}
              fieldAttr={fieldAttr}
              qualityMetric={qualityMetric}
              isSmall={isSmall}
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
 * @param isSmall - True to display the fields in a smaller format
 */
export function QCMetricPanel({
  qualityMetric,
  isSmall = false,
}: {
  qualityMetric: QualityMetricObject;
  isSmall?: boolean;
}) {
  let fieldAttrs: QualityMetricFieldAttr[] = [];

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
        isSmall={isSmall}
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
      <h2 className="mt-[-4px] mb-2 text-center font-semibold">
        <a
          href={qualityMetric["@id"]}
          rel="noopener noreferrer"
          target="_blank"
        >
          {title}
        </a>
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
  isInSubPanel,
  children,
}: {
  isInSubPanel: boolean;
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
          <a href={file["@id"]} rel="noopener noreferrer" target="_blank">
            {file.accession}
          </a>
        </h2>
      </Modal.Header>
      <div className="@container/qc-panel flex max-h-[80svh] flex-wrap gap-2 overflow-y-auto p-4 md:max-h-[calc(80dvh-7rem)]">
        {qualityMetrics.map((metric) => {
          return (
            <SubPanelWrapper
              key={metric["@id"]}
              isInSubPanel={qualityMetrics.length > 1}
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
        <DataPanel className="@container/qc-panel flex flex-wrap gap-2">
          {qualityMetrics.map((metric) => {
            let title =
              collectionTitles?.[metric["@type"][0]] || metric["@type"][0];
            title = title.replace(/ Quality Metrics$/, "");

            return (
              <SubPanelWrapper
                key={metric["@id"]}
                isInSubPanel={qualityMetrics.length > 1}
              >
                <h2 className="mt-[-4px] mb-2 text-center font-semibold">
                  <Link href={metric["@id"]}>{title}</Link>
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
