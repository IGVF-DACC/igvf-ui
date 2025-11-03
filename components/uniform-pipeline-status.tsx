// node_modules
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";
import { useContext } from "react";
// components
import MarkdownSection from "./markdown-section";
import { PillBadge } from "./pill-badge";
import SessionContext from "./session-context";
import { Tooltip, TooltipRef, useTooltip } from "./tooltip";
// lib
import { toShishkebabCase } from "../lib/general";
import { extractSchema } from "../lib/profiles";

/**
 * Possible statuses for the uniform pipeline. Update if the `uniform_pipeline_status` enum in the
 * schema changes. Keep `fallback` as the last option to handle unexpected values.
 */
export type UniformPipelineStatus =
  | "completed"
  | "error"
  | "preprocessing"
  | "processing"
  | "fallback";

/**
 * Display configuration for each possible status.
 */
type StatusConfig = {
  styles: string;
  fallbackDescription: string;
  Icon: ({ className }: { className?: string }) => JSX.Element;
};

const statusConfig: Record<UniformPipelineStatus, StatusConfig> = {
  completed: {
    styles:
      "bg-uniform-pipeline-completed ring-uniform-pipeline-completed fill-uniform-pipeline-completed text-uniform-pipeline-completed",
    fallbackDescription: "The process has been completed successfully.",
    Icon: ({ className }: { className?: string }) => (
      <CheckCircleIcon aria-hidden="true" className={className} />
    ),
  },

  error: {
    styles:
      "bg-uniform-pipeline-error ring-uniform-pipeline-error text-uniform-pipeline-error fill-uniform-pipeline-error",
    fallbackDescription: "An error occurred during processing.",
    Icon: ({ className }: { className?: string }) => (
      <ExclamationCircleIcon aria-hidden="true" className={className} />
    ),
  },

  preprocessing: {
    styles:
      "bg-uniform-pipeline-preprocessing ring-uniform-pipeline-preprocessing text-uniform-pipeline-preprocessing fill-uniform-pipeline-preprocessing",
    fallbackDescription: "The process is in the preprocessing stage.",
    Icon: ({ className }: { className?: string }) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M10,4c3.31,0,6,2.69,6,6s-2.69,6-6,6-6-2.69-6-6,2.69-6,6-6M10,2C5.58,2,2,5.58,2,10s3.58,8,8,8,8-3.58,8-8S14.42,2,10,2h0Z" />
        <path d="M10,8.16c-1.02,0-1.84.82-1.84,1.84s.82,1.84,1.84,1.84,1.84-.82,1.84-1.84-.82-1.84-1.84-1.84h0Z" />
      </svg>
    ),
  },

  processing: {
    styles:
      "bg-uniform-pipeline-processing ring-uniform-pipeline-processing text-uniform-pipeline-processing fill-uniform-pipeline-processing",
    fallbackDescription: "The process is currently running.",
    Icon: ({ className }: { className?: string }) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M10,2C5.58,2,2,5.58,2,10s3.58,8,8,8,8-3.58,8-8S14.42,2,10,2ZM10,16c-3.31,0-6-2.69-6-6s2.69-6,6-6v5.99l5.2,3c-1.04,1.8-2.98,3.01-5.2,3.01Z" />
      </svg>
    ),
  },

  fallback: {
    styles:
      "bg-uniform-pipeline-fallback ring-uniform-pipeline-fallback text-uniform-pipeline-fallback fill-uniform-pipeline-fallback",
    fallbackDescription: "The status is unknown.",
    Icon: ({ className }: { className?: string }) => (
      <XCircleIcon aria-hidden="true" className={className} />
    ),
  },
};

/**
 * Badge for the uniform pipeline status. Currently only one uniform pipeline status is expected per
 * page, but if that changes in the future we need to ensure that the tooltip IDs are unique, which
 * is why we accept an `objectId` parameter to help make the IDs unique.
 *
 * @param status - Pipeline status to display
 * @param atType - @type property of the displayed object
 * @param objectId - Unique identifier for the object, used to ensure unique tooltip IDs
 */
export function UniformPipelineStatus({
  status,
  atType,
  objectId,
}: {
  status: UniformPipelineStatus;
  atType: string;
  objectId: string;
}) {
  const sessionContext = useContext(SessionContext);
  const tooltipAttr = useTooltip(
    `uniform-pipeline-status-${toShishkebabCase(status)}-${toShishkebabCase(objectId)}`
  );

  // Get the description for the status from the given object type's schema, if available.
  let description = (statusConfig[status] || statusConfig.fallback)
    .fallbackDescription;
  if (sessionContext && "profiles" in sessionContext) {
    const profiles = sessionContext.profiles;
    const pageSchema = extractSchema(profiles, atType);
    if (
      pageSchema &&
      typeof pageSchema === "object" &&
      "properties" in pageSchema
    ) {
      const descriptions =
        pageSchema.properties.uniform_pipeline_status?.enum_descriptions;
      if (descriptions && descriptions[status]) {
        description = descriptions[status];
      }
    }
  }

  const stylesForStatus = statusConfig[status] || statusConfig.fallback;
  const { styles, Icon } = stylesForStatus;

  return (
    <>
      <TooltipRef tooltipAttr={tooltipAttr}>
        <PillBadge
          className={styles}
          testid={`uniform-pipeline-status-pill-${toShishkebabCase(status)}`}
          iconPosition="left"
        >
          <Icon className="mr-0.5 h-4 w-4" />
          <div className="pt-px">{status}</div>
        </PillBadge>
      </TooltipRef>
      <Tooltip tooltipAttr={tooltipAttr}>
        <MarkdownSection className="text-sm text-white dark:text-black">
          {description}
        </MarkdownSection>
      </Tooltip>
    </>
  );
}
