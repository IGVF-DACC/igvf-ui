// node_modules
import { useContext } from "react";
// components
import MarkdownSection from "./markdown-section";
import SessionContext from "./session-context";
import { Tooltip, TooltipRef, useTooltip } from "./tooltip";
// lib
import { toShishkebabCase } from "../lib/general";
import { extractSchema } from "../lib/profiles";

/**
 * Display a single data-item value with an annotation that appears in a tooltip.
 *
 * Usually the schema supplies the annotations for the given object type and property name. The
 * specified property should have an `enum_descriptions` field in the schema to get each value's
 * annotation. If for any reason we cannot find an annotation for the given value, we simply
 * display the value without a tooltip.
 *
 * For cases in which another source other than the schema provides the mapping of values to
 * annotations, the `externalAnnotations` property provides the mappings of values to annotations.
 * `objectType` and `propertyName` do not get used for this case.
 *
 * @param objectType - `@type` of object this property belongs to
 * @param propertyName - Name of the object property being displayed
 * @param externalAnnotations - Map of values to descriptions if not using the schema
 */
export function AnnotatedValue({
  objectType = "",
  propertyName = "",
  externalAnnotations = {},
  children,
}: {
  objectType?: string;
  propertyName?: string;
  externalAnnotations?: Record<string, string>;
  children: string;
}) {
  const { profiles } = useContext(SessionContext);
  const hasSchema = Boolean(objectType && propertyName);
  const hasExternal = Object.keys(externalAnnotations).length > 0;

  // Generate the tooltip ref ID with a best effort to make it unique on a page.
  const uniqueTooltipKey = hasExternal
    ? `external-${toShishkebabCase(children)}`
    : `${objectType}-${propertyName}-${toShishkebabCase(children)}`;
  const tooltipRef = useTooltip(`data-item-value-tooltip-${uniqueTooltipKey}`);

  // Check that we either have an object type and property name, or external annotations, and check
  // that we don't have both.
  if (hasSchema && hasExternal) {
    console.error(
      "AnnotatedValue cannot have both objectType/propertyName and externalAnnotations"
    );
    return <span>{children}</span>;
  }

  // Get the annotation for the given value from the schema, if available, or from the external
  // annotations if provided.
  let annotations: Record<string, string> = {};
  if (hasExternal) {
    annotations = externalAnnotations;
  } else {
    const schema = extractSchema(profiles, objectType);
    const schemaProperty = schema?.properties?.[propertyName];
    if (schemaProperty) {
      if (schemaProperty.type === "array") {
        annotations = schemaProperty.items?.enum_descriptions || {};
      } else if (schemaProperty.type === "string") {
        annotations = schemaProperty.enum_descriptions || {};
      }
    }
  }
  const annotation = annotations[children] || "";

  // If we got an annotation, display the value with the annotation in a tooltip.
  if (annotation) {
    return (
      <>
        <TooltipRef tooltipAttr={tooltipRef}>
          <span className="decoration-help-underline underline decoration-dotted underline-offset-2">
            {children}
          </span>
        </TooltipRef>
        <Tooltip tooltipAttr={tooltipRef}>
          <MarkdownSection className="text-xs text-white dark:text-black">
            {annotation}
          </MarkdownSection>
        </Tooltip>
      </>
    );
  }

  // Could not find an annotation, so just display the value without a tooltip.
  return <span>{children}</span>;
}
