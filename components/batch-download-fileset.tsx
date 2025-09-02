// node_modules
import { useEffect, useMemo, useState } from "react";
// components
import {
  BatchDownloadActuator,
  BatchDownloadModalContent,
} from "./batch-download";
// lib
import { FileTableController, FileSetController } from "../lib/batch-download";
// root
import { FileSetObject } from "../globals";

/**
 * Allowed values for the type of file-set batch download.
 */
const DOWNLOAD_OPTIONS = {
  FILES: "files",
  FILES_WITH_INPUTS: "files-with-inputs",
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
  const controller = useMemo(
    () =>
      selectedOption === DOWNLOAD_OPTIONS.FILES_WITH_INPUTS
        ? new FileSetController(fileSet)
        : new FileTableController(fileSet),
    [selectedOption, fileSet["@id"]]
  );

  if (controller.offerDownload) {
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
}

/**
 * Display the radio button options for the two different types of file-set batch downloads:
 *   1. download all files in the file set
 *   2. download all files in the file set as well as input files
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
    <div className="mt-4">
      <div className="mt-1 leading-6 w-fit mx-auto border border-panel py-2 px-3">
        <Option
          value={DOWNLOAD_OPTIONS.FILES}
          checked={selectedOption === DOWNLOAD_OPTIONS.FILES}
          isOptionDisabled={isOptionDisabled}
          onSelect={onSelect}
        >
          Download files in this dataset
        </Option>
        <Option
          value={DOWNLOAD_OPTIONS.FILES_WITH_INPUTS}
          checked={selectedOption === DOWNLOAD_OPTIONS.FILES_WITH_INPUTS}
          isOptionDisabled={isOptionDisabled}
          onSelect={onSelect}
        >
          Download all files in this dataset including inputs
        </Option>
      </div>
    </div>
  );
}

/**
 * Display a single radio button for one file-set batch-download option.
 *
 * @param value - Value of the radio button passed to the onSelect callback on click
 * @param checked - Whether this radio button should be checked
 * @param isOptionDisabled - True to disable the radio button
 * @param onSelect - Called when the user selects this option
 * @param children - Text label to display next to the radio button
 */
function Option({
  value,
  checked,
  isOptionDisabled,
  onSelect,
  children,
}: {
  value: string;
  checked: boolean;
  isOptionDisabled: boolean;
  onSelect: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-1 cursor-pointer w-fit">
      <input
        type="radio"
        name="download-type"
        value={value}
        checked={checked}
        onChange={(e) => onSelect(e.target.value)}
        disabled={isOptionDisabled}
      />
      <span
        className={
          isOptionDisabled ? "text-gray-400" : "text-black dark:text-white"
        }
      >
        {children}
      </span>
    </label>
  );
}
