// node_modules
import { useEffect, useMemo, useState } from "react";
// components
import {
  BatchDownloadActuator,
  BatchDownloadModalContent,
} from "./batch-download";
import { RadioCardGroup } from "./radio-card-group";
// lib
import { FileTableController, FileSetController } from "../lib/batch-download";
// root
import { FileSetObject } from "../globals";

/**
 * Allowed values for the type of file-set batch download.
 */
const DOWNLOAD_OPTIONS = {
  FILES: "files",
  FILES_WITH_RELATED: "files-with-related",
  FILES_WITH_RELATED_AND_ANALYSIS: "files-with-related-and-analysis",
} as const;

/**
 * Type representing the allowed download options.
 */
type DownloadOption = (typeof DOWNLOAD_OPTIONS)[keyof typeof DOWNLOAD_OPTIONS];

/**
 * Display the batch-download actuator for file-set page headers. This allows users to download all
 * files associated with the file set, or optionally those files as well as their input files. The
 * user can select which option they want in the modal that appears when they click the actuator
 * button.
 *
 * @param fileSet - File set whose files will be downloaded
 */
export function BatchDownloadFileSet({ fileSet }: { fileSet: FileSetObject }) {
  const [selectedOption, setSelectedOption] = useState<DownloadOption>(
    DOWNLOAD_OPTIONS.FILES
  );
  const [isOptionDisabled, setIsOptionDisabled] = useState(false);

  // Reset the component state when the file set ID changes such as when the user navigates
  // directly to a different file set, and this component gets reused.
  useEffect(() => {
    setSelectedOption(DOWNLOAD_OPTIONS.FILES);
    setIsOptionDisabled(false);
  }, [fileSet["@id"]]);

  // Create the appropriate controller based on the selected download option, recreating it when
  // the user switches options. Use fileSet["@id"] as a dependency in case the user navigates
  // between different file sets, causing the component to be reused without clearing state.
  const controller = useMemo(() => {
    if (selectedOption === DOWNLOAD_OPTIONS.FILES) {
      return new FileTableController(fileSet);
    }
    return new FileSetController(
      fileSet,
      selectedOption === DOWNLOAD_OPTIONS.FILES_WITH_RELATED_AND_ANALYSIS
    );
  }, [selectedOption, fileSet["@id"]]);

  if (!controller.offerDownload) {
    // Don't render the actuator at all if the controller determines that a download isn't offered
    // (e.g. if there are no files to download).
    return null;
  }

  return (
    <BatchDownloadActuator
      controller={controller}
      label="Download files associated with this file set"
      size="sm"
      onDownloadActuated={() => setIsOptionDisabled(true)}
      onDownloadModalClosed={() => setIsOptionDisabled(false)}
    >
      <BatchDownloadModalContent>
        <DownloadTypeOptions
          selectedOption={selectedOption}
          isOptionDisabled={isOptionDisabled}
          onSelect={(selection: DownloadOption) => {
            setSelectedOption(selection);
          }}
        />
      </BatchDownloadModalContent>
    </BatchDownloadActuator>
  );
}

/**
 * Display the radio button options for the three different types of file-set batch downloads:
 *   1. download all files in the file set
 *   2. download all files in the file set as well as input files
 *   3. download all files in the file set as well as input files and downstream analysis files
 *
 * @param selectedOption - Currently selected download option
 * @param isOptionDisabled - True to disable the radio buttons
 * @param onSelect - Called when the user selects one of the options
 */
function DownloadTypeOptions({
  selectedOption,
  isOptionDisabled,
  onSelect,
}: {
  selectedOption: DownloadOption;
  isOptionDisabled: boolean;
  onSelect: (value: string) => void;
}) {
  return (
    <RadioCardGroup
      name="download-type"
      legend="Select the files to include:"
      selectedValue={selectedOption}
      setSelectedValue={onSelect}
      className="mt-6"
    >
      <RadioCardGroup.Card
        id="files-only"
        value={DOWNLOAD_OPTIONS.FILES}
        label="Files in this file set"
        description="Download all files directly associated with this file set."
        disabled={isOptionDisabled}
      />
      <RadioCardGroup.Card
        id="files-with-related"
        value={DOWNLOAD_OPTIONS.FILES_WITH_RELATED}
        label="Files in this file set and their input files"
        description="Download all files directly associated with this file set, along with any files used as inputs to generate them."
        disabled={isOptionDisabled}
      />
      <RadioCardGroup.Card
        id="files-with-related-and-analysis"
        value={DOWNLOAD_OPTIONS.FILES_WITH_RELATED_AND_ANALYSIS}
        label="Files in this file set, their input files, and downstream analysis files"
        description="Download all files directly associated with this file set, along with any input files used to generate them and any analysis files derived from them."
        disabled={isOptionDisabled}
      />
    </RadioCardGroup>
  );
}
