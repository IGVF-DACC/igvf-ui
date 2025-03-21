// components
import { PillBadge } from "./pill-badge";
import { Tooltip, TooltipRef, useTooltip } from "./tooltip";
// lib
import { decomposeDataUseLimitationSummary } from "../lib/data-use-limitation";
import { toShishkebabCase } from "../lib/general";

/**
 * Maps data use limitations to the corresponding tooltip descriptions and icons.
 */
const limitationConfigs = {
  DS: {
    description: (
      <>
        <b>Disease specific</b>: Use of the data must be related to the
        specified disease.
      </>
    ),
    icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="white"
        className="ml-[-4px] h-full"
        data-testid="icon-limitation-ds"
      >
        <path d="M17,10.5v-1h-2.1c-.1-1-.5-1.9-1.1-2.6l1.4-1.4-.7-.7-1.4,1.4c-.7-.6-1.6-1-2.6-1.1v-2.1h-1v2.1c-1,.1-1.9.5-2.6,1.1l-1.4-1.4-.7.7,1.4,1.4c-.6.7-1,1.6-1.1,2.6h-2.1v1h2.1c.1,1,.5,1.9,1.1,2.6l-1.4,1.4.7.7,1.4-1.4c.7.6,1.6,1,2.6,1.1v2.1h1v-2.1c1-.1,1.9-.5,2.6-1.1l1.4,1.4.7-.7-1.4-1.4c.6-.7,1-1.6,1.1-2.6h2.1ZM8.6,9.5c-.5,0-1-.4-1-1s.4-1,1-1,1,.4,1,1-.4,1-1,1ZM11.4,12.4c-.5,0-1-.4-1-1s.4-1,1-1,1,.4,1,1-.4,1-1,1Z" />
      </svg>
    ),
  },

  GRU: {
    description: (
      <>
        <b>General research use</b>: Use of the data is limited only by the
        terms of the Data Use Certification. These data will be added to the
        dbGaP Collection.
      </>
    ),
    icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="white"
        className="ml-[-4px] h-full"
        data-testid="icon-limitation-gru"
      >
        <path d="M10,17c-3.9,0-7-3.1-7-7s3.1-7,7-7,7,3.1,7,7-3.1,7-7,7ZM10,5.6c-2.4,0-4.4,2-4.4,4.4s2,4.4,4.4,4.4,4.4-2,4.4-4.4-2-4.4-4.4-4.4Z" />
      </svg>
    ),
  },

  HMB: {
    description: (
      <>
        <b>Health/medical/biomedical</b>: Use of the data is limited to
        health/medical/biomedical purposes; does not include the study of
        population origins or ancestry.
      </>
    ),
    icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="white"
        className="ml-[-4px] h-full"
        data-testid="icon-limitation-hmb"
      >
        <polygon points="17 8 12 8 12 3 8 3 8 8 3 8 3 12 8 12 8 17 12 17 12 12 17 12 17 8" />
      </svg>
    ),
  },

  other: {
    description: "Any other customized limitation.",
    icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="white"
        className="ml-[-4px] h-full"
        data-testid="icon-limitation-other"
      >
        <path d="M5.6,8.6c.2-.7.5-1.3,1-1.8l-1.4-2.4c-1.2,1.1-2.1,2.5-2.4,4.2h2.8Z" />
        <path d="M2.8,11.4c.3,1.7,1.2,3.1,2.4,4.2l1.4-2.4c-.5-.5-.8-1.1-1-1.8h-2.8Z" />
        <path d="M14.4,11.4c-.2.7-.5,1.3-1,1.8l1.4,2.4c1.2-1.1,2.1-2.5,2.4-4.2h-2.8Z" />
        <path d="M11,14.5c-.3,0-.7.1-1,.1s-.7,0-1-.1l-1.4,2.4c.8.3,1.6.4,2.4.4s1.7-.2,2.4-.4l-1.4-2.4Z" />
        <path d="M14.8,4.4l-1.4,2.4c.5.5.8,1.1,1,1.8h2.8c-.3-1.7-1.2-3.1-2.4-4.2Z" />
        <path d="M9,5.5c.3,0,.7-.1,1-.1s.7,0,1,.1l1.4-2.4c-.8-.3-1.6-.4-2.4-.4s-1.7.2-2.4.4l1.4,2.4Z" />
      </svg>
    ),
  },

  none: {
    description: "No data-use limitations.",
    icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="white"
        className="ml-[-4px] h-full"
        data-testid="icon-limitation-none"
      >
        <path d="M16.3,12.8c0,.4-.1.7-.4,1-.3.3-.6.4-1,.4s-.8-.1-1.1-.3c-.3-.2-.8-.7-1.5-1.4-.8-.8-1.3-1.3-1.7-1.5,0,.4.2,1.2.5,2.2.3,1,.5,1.8.5,2.2s-.1.9-.4,1.2-.6.5-1.1.5-.8-.2-1.1-.5c-.3-.3-.4-.7-.4-1.2s.2-1.2.5-2.2c.3-1,.5-1.8.5-2.2-.4.2-1,.7-1.7,1.5-.7.7-1.2,1.2-1.5,1.4-.3.2-.7.3-1.1.3s-.7-.1-1-.4c-.3-.3-.4-.6-.4-1s.2-.8.5-1.1c.3-.3,1.2-.7,2.5-1,1.1-.3,1.8-.5,2.1-.7-.4-.2-1.1-.4-2.1-.7-1.3-.3-2.2-.6-2.5-1-.4-.3-.6-.7-.6-1.1s.1-.7.4-1c.3-.3.6-.4,1-.4s.7.1,1,.3c.4.2.9.7,1.6,1.4.8.8,1.3,1.3,1.7,1.5,0-.4-.2-1.1-.5-2.2-.3-1-.5-1.8-.5-2.2s.1-.9.4-1.2c.3-.3.6-.5,1.1-.5s.8.2,1.1.5.4.7.4,1.2-.2,1.2-.5,2.2c-.3,1-.5,1.8-.5,2.2.4-.2.9-.7,1.7-1.5.7-.7,1.3-1.2,1.6-1.4s.7-.3,1-.3.7.1,1,.4.4.6.4,1-.2.8-.6,1.1c-.4.3-1.2.6-2.5,1-1.1.3-1.8.5-2.1.7.4.2,1.1.4,2.1.7,1.3.3,2.2.7,2.5,1,.3.3.5.7.5,1.1Z" />
      </svg>
    ),
  },
} as const;

/**
 * Maps data-use limitation modifiers to tooltip descriptions.
 */
const modifierColors = {
  COL: {
    description: (
      <>
        <b>COL</b>: Requestor must provide a letter of collaboration with the
        primary study investigators.
      </>
    ),
  },
  GSO: {
    description: (
      <>
        <b>GSO</b>: Use of the data is limited to genetic studies only.
      </>
    ),
  },
  IRB: {
    description: (
      <>
        <b>IRB</b>: IRB Requestor must provide documentation of local IRB
        approval.
      </>
    ),
  },
  MDS: {
    description: (
      <>
        <b>MDS</b>: Use of the data includes methods development research (e.g.,
        development and testing of software or algorithms).
      </>
    ),
  },
  NPU: {
    description: (
      <>
        <b>NPU</b>: Use of the data is limited to not-for-profit organizations.
      </>
    ),
  },
  PUB: {
    description: (
      <>
        <b>PUB</b>: Requestor agrees to make results of studies using the data
        available to the larger scientific community.
      </>
    ),
  },
} as const;

/**
 * Display a data-use limitation and modifiers status. You can provide the limitation as an
 * individual string and the modifiers as an array of strings, or you can instead provide the data
 * use limitation summary combining the limitation and modifiers.
 * @param limitation - The data-use limitation
 * @param modifiers - The data-use limitation modifiers
 * @param summary - The data-use limitation summary combining the limitation and modifiers
 */
export function DataUseLimitationStatus({
  limitation = "",
  modifiers = [],
  summary = "",
}: {
  limitation?: string;
  modifiers?: string[];
  summary?: string;
}) {
  const tooltipAttr = useTooltip("institutional-certificate");

  if (summary && (limitation || modifiers.length > 0)) {
    throw new Error("Use the limitation/modifiers or the summary; not both.");
  }

  // Use the separate limitation and modifiers if provided, otherwise use the summary.
  let localLimitation = limitation || "No limitations";
  let localModifiers = modifiers;
  if (summary) {
    // Summary provided instead of individual limitation and modifiers. Decompose the summary and
    // use its elements instead.
    const { limitation: newLimitation, modifiers: newModifiers } =
      decomposeDataUseLimitationSummary(summary);
    localLimitation = newLimitation;
    localModifiers = newModifiers;
  }

  const Icon =
    limitationConfigs[localLimitation]?.icon || limitationConfigs.none.icon;

  if (localLimitation) {
    return (
      <>
        <TooltipRef tooltipAttr={tooltipAttr}>
          <div>
            <PillBadge
              className="bg-stone-700 text-white shadow-stone-800"
              testid={`dul-badge-${toShishkebabCase(localLimitation)}`}
            >
              <Icon className="ml-[-4px]" />
              <div
                data-testid={`limitation-${toShishkebabCase(localLimitation)}`}
                className={localModifiers.length > 0 ? "pr-1" : ""}
              >
                {localLimitation}
              </div>
              {localModifiers.length > 0 && (
                <>
                  {localModifiers.map((modifier) => {
                    return (
                      <div
                        key={modifier}
                        className="border-l border-white px-0.5 last:mr-[-5px] last:rounded-r-full last:pr-1.5"
                        data-testid={`modifier-${toShishkebabCase(modifier)}`}
                      >
                        {modifier}
                      </div>
                    );
                  })}
                </>
              )}
            </PillBadge>
          </div>
        </TooltipRef>
        <Tooltip tooltipAttr={tooltipAttr}>
          <div>
            {limitationConfigs[localLimitation]?.description ||
              "No data-use limitations"}
          </div>
          {localModifiers.map((modifier) => (
            <div key={modifier} className="mt-1.5">
              {modifierColors[modifier]?.description || "No description"}
            </div>
          ))}
        </Tooltip>
      </>
    );
  }
}
