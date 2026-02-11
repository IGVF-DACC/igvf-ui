// node_modules
import {
  CheckIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/20/solid";
// components
import { CopyButton } from "./copy-button";
import { AttachedButtons, ButtonLink } from "./form-elements/button";
import { Tooltip, TooltipRef, useTooltip } from "./tooltip";

/**
 * Display a combined DOI button that lets users copy the identifier to their clipboard, and open
 * the linked DOI page. If no DOI is provided, this component renders nothing so that you can
 * include this component in your page unconditionally.
 *
 * @param doi - Digital object identifier to display
 */
export function DoiControl({ doi = "" }: { doi?: string }) {
  const tooltipAttr = useTooltip("doi-copy");

  if (doi) {
    return (
      <>
        <TooltipRef tooltipAttr={tooltipAttr}>
          <AttachedButtons>
            <CopyButton.Icon
              target={doi}
              label="Copy DOI to the clipboard"
              type="secondary"
              size="sm"
              className="bg-doi-brand border-doi-outline text-doi-label"
            >
              {(isCopied) =>
                isCopied ? (
                  <CheckIcon data-testid="doi-check" />
                ) : (
                  <ClipboardDocumentCheckIcon data-testid="doi-clipboard" />
                )
              }
            </CopyButton.Icon>
            <ButtonLink
              href={`https://doi.org/${doi}`}
              label="Open the resource referenced by the DOI in a new tab"
              type="secondary"
              size="sm"
              className="bg-doi-brand border-doi-outline text-doi-label"
              isExternal
            >
              {doi}
            </ButtonLink>
          </AttachedButtons>
        </TooltipRef>
        <Tooltip tooltipAttr={tooltipAttr}>
          Copy the DOI to your clipboard, or open the linked resource in a new
          tab.
        </Tooltip>
      </>
    );
  }
  return null;
}
