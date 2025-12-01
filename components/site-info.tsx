// node_modules
import { CheckCircleIcon, EnvelopeIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
// components
import { useCopyAction } from "./copy-button";
import Icon from "./icon";
import { Tooltip, TooltipRef, useTooltip } from "./tooltip";
// lib
import { fetchVersions, type VersionsInfo } from "../lib/site-versions";

/**
 * Display the igvf-ui and igvfd version numbers.
 *
 * @param versions - Versions info object containing UI and server version strings
 */
function Versions({ versions }: { versions: VersionsInfo }) {
  const { isCopied, initiateCopy } = useCopyAction(
    `UI Version: v${versions.uiVersion}\nServer Version: v${versions.serverVersion}`
  );
  const tooltipAttr = useTooltip("versions");

  return (
    <>
      <TooltipRef tooltipAttr={tooltipAttr}>
        <button
          onClick={initiateCopy}
          aria-label="Copy UI and server versions to clipboard"
          className="relative cursor-pointer"
        >
          {isCopied && (
            <CheckCircleIcon className="absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-green-500 dark:text-green-600" />
          )}
          <div
            className={`flex cursor-pointer gap-1.5 text-xs font-semibold text-gray-400 dark:text-gray-600 ${isCopied ? "opacity-30" : ""}`}
          >
            <div data-testid="version-ui">{`v${versions.uiVersion}`}</div>
            <div aria-hidden="true">•</div>
            <div data-testid="version-server">{`v${versions.serverVersion}`}</div>
          </div>
        </button>
      </TooltipRef>
      <Tooltip tooltipAttr={tooltipAttr}>
        Click to copy UI and server versions to your clipboard
      </Tooltip>
    </>
  );
}

/**
 * Display email link.
 */
export function Email() {
  return (
    <div>
      <a
        className="block"
        href="mailto:igvf-portal-help@lists.stanford.edu"
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Email the IGVF help desk"
      >
        <EnvelopeIcon className="fill-brand h-6 w-6" />
      </a>
    </div>
  );
}

/**
 * Display the Twitter link.
 */
export function Twitter() {
  return (
    <div>
      <a
        className="block"
        href="https://twitter.com/IGVFConsortium"
        target="_blank"
        rel="noreferrer noopener"
        aria-label="IGVF Consortium on X"
      >
        <Icon.Twitter className="h-6 w-6" />
      </a>
    </div>
  );
}

/**
 * Display Creative Commons linked icon.
 */
export function CreativeCommons() {
  return (
    <div>
      <a
        className="block"
        href="https://creativecommons.org/licenses/by/4.0/"
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Creative Commons Attribution (CC BY) license"
      >
        <Icon.CCBY className="h-6 w-6" />
      </a>
    </div>
  );
}

/**
 * Display the version numbers for the UI and server.
 */
export function SiteInfo() {
  const [versions, setVersions] = useState<VersionsInfo | null>(null);

  // Once the component mounts we can fetch the UI and server versions.
  useEffect(() => {
    fetchVersions().then((receivedVersions) => {
      if (receivedVersions) {
        setVersions(receivedVersions);
      }
    });
  }, []);

  return versions && <Versions versions={versions} />;
}
