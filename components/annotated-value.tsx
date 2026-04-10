// node_modules
import { ElementType, useContext } from "react";
import { twMerge } from "tailwind-merge";
// components
import MarkdownSection from "./markdown-section";
import SessionContext from "./session-context";
import { Tooltip, TooltipRef, useTooltip } from "./tooltip";
// lib
import { toShishkebabCase } from "../lib/general";
import { extractSchema } from "../lib/profiles";

/**
 * Display a single data-item value with an annotation that appears in a tooltip. If no annotation
 * is provided, this renders the children without any underline nor tooltip.
 *
 * @param as - HTML element or React component to render as; defaults to "span"
 * @param tooltipKey - Unique key for the tooltip reference
 * @param annotation - The annotation text to show in the tooltip
 * @param className - Additional class names to apply to the element wrapping the children
 */
export function AnnotatedItem({
  as,
  tooltipKey,
  annotation = "",
  className = "",
  children,
}: {
  as?: ElementType;
  tooltipKey: string;
  annotation?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const Tag = as ?? "span";
  const tooltipRef = useTooltip(tooltipKey);

  if (annotation) {
    return (
      <>
        <TooltipRef tooltipAttr={tooltipRef}>
          <Tag
            className={twMerge(
              "decoration-help-underline underline decoration-dotted underline-offset-2",
              className
            )}
          >
            {children}
          </Tag>
        </TooltipRef>
        <Tooltip tooltipAttr={tooltipRef}>
          <MarkdownSection className="text-xs text-white dark:text-black">
            {annotation}
          </MarkdownSection>
        </Tooltip>
      </>
    );
  }
  return <Tag>{children}</Tag>;
}

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
 * @param as - HTML element or React component to render as; defaults to "span"
 * @param objectType - `@type` of object this property belongs to
 * @param propertyName - Name of the object property being displayed
 * @param externalAnnotations - Map of values to descriptions if not using the schema
 */
export function AnnotatedValue({
  as,
  objectType = "",
  propertyName = "",
  externalAnnotations = {},
  children,
}: {
  as?: ElementType;
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

  // Check that we either have an object type and property name, or external annotations, and check
  // that we don't have both.
  const Tag = as ?? "span";

  if (hasSchema && hasExternal) {
    console.error(
      "AnnotatedValue cannot have both objectType/propertyName and externalAnnotations"
    );
    return <Tag>{children}</Tag>;
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
      <AnnotatedItem
        as={as}
        annotation={annotation}
        tooltipKey={uniqueTooltipKey}
      >
        {children}
      </AnnotatedItem>
    );
  }

  // Could not find an annotation, so just display the value without a tooltip.
  return <Tag>{children}</Tag>;
}
