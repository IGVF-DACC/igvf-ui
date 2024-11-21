// node_modules
import { EyeIcon } from "@heroicons/react/20/solid";
import Papa from "papaparse";
import { useState } from "react";
// components
import DataGrid, {
  DataGridContainer,
  type Cell,
  type DataGridFormat,
  type Row,
} from "./data-grid";
import { Button } from "./form-elements";
import Modal from "./modal";
import Spinner from "./spinner";
import { Tooltip, TooltipRef, useTooltip } from "./tooltip";
// lib
import { checkFileDownloadable } from "../lib/files";
import { loadHostedFile } from "../lib/hosted-file";
// root
import type { FileObject } from "../globals.d";

/**
 * Type for a preview component that takes a file contents as a string and returns a JSX element.
 */
type PreviewComponent = ({ text }: { text: string }) => JSX.Element;

/**
 * Type for the map of file types to preview components for each type.
 */
type TypePreviewMap = {
  [key: string]: PreviewComponent;
};

/**
 * Map of file types to preview components for each type of file that supports preview. Add new
 * values of the file's `file_format` field to this map to support previewing new file types.
 */
const typePreviewMap: TypePreviewMap = {
  bed: PreviewTsv,
  csv: PreviewCsv,
  txt: PreviewText,
  tsv: PreviewTsv,
  vcf: PreviewText,
  yaml: PreviewText,
};

/**
 * Converts CSV file content in string format to a form consumable by `<DataGrid>`.
 * @param text CSV file content in string format
 * @returns CSV file content in a form consumable by `<DataGrid>`
 */
function convertCsvToDataGrid(text: string): DataGridFormat {
  const parsedCsv = Papa.parse(text) as Papa.ParseResult<string[]>;
  const rowGrid: Row[] = parsedCsv.data.map((row, i) => {
    const cellGrid: Cell[] = row.map((cell, j) => ({
      id: `${i}-${j}`,
      content: cell,
    }));
    return { id: i.toString(), cells: cellGrid };
  });
  return rowGrid as DataGridFormat;
}

/**
 * Preview a CSV file in the modal.
 * @param text CSV file to preview
 */
function PreviewCsv({ text }: { text: string }): JSX.Element {
  return (
    <DataGridContainer>
      <DataGrid data={convertCsvToDataGrid(text)} />
    </DataGridContainer>
  );
}

/**
 * Converts TSV file content in string format to a form consumable by `<DataGrid>`.
 * @param text TSV file content in string format
 * @returns TSV file content in a form consumable by `<DataGrid>`
 */
function convertTsvToDataGrid(text: string): DataGridFormat {
  const rows = text.split("\n");
  const rowGrid: Row[] = rows.map((row, i) => {
    const cells = row.split("\t");
    const cellGrid: Cell[] = cells.map((cell, j) => ({
      id: `${i}-${j}`,
      content: cell,
    }));
    return { id: i.toString(), cells: cellGrid };
  });
  return rowGrid as DataGridFormat;
}

/**
 * Preview a TSV file in the modal.
 * @param text TSV file to preview
 */
function PreviewTsv({ text }: { text: string }): JSX.Element {
  return (
    <DataGridContainer>
      <DataGrid data={convertTsvToDataGrid(text)} />
    </DataGridContainer>
  );
}

/**
 * Preview a generic text or yaml file in the modal.
 * @param text Text file to preview
 */
function PreviewText({ text }: { text: string }): JSX.Element {
  return <pre className="whitespace-break-spaces text-sm">{text}</pre>;
}

/**
 * Show a button to preview a hosted file (a file belonging to a file object). When clicked, the
 * file downloads and appears in a modal.
 * @param file File object to preview its hosted file
 * @param buttonSize Size of the preview button using the same values as the `<Button>` component
 */
export function HostedFilePreview({
  file,
  buttonSize = "md",
}: {
  file: FileObject;
  buttonSize?: "sm" | "md" | "lg";
}) {
  // Text content of the file to preview
  const [previewText, setPreviewText] = useState("");
  // True if the file is currently being downloaded for preview
  const [isLoading, setIsLoading] = useState(false);
  // True if an error occurred while downloading the file
  const [isError, setIsError] = useState(false);
  // Tooltip attributes for the file preview button
  const tooltipAttr = useTooltip("indexer-state");

  // Get the converter function corresponding to the file type, if there is one.
  const TypePreview = typePreviewMap[file.file_format];

  // Handle clicks in the preview button.
  function handlePreviewClick() {
    setIsLoading(true);
    loadHostedFile(file).then((data) => {
      if (data) {
        // If error occurred while downloading the file, set the error state.
        if (data.startsWith("ERROR:")) {
          setIsError(true);
        }
        setPreviewText(data);
      } else {
        setPreviewText("Could not load file preview.");
        setIsError(true);
      }
      setIsLoading(false);
    });
  }

  // Handle clicks to close the preview modal.
  function handleClosePreview() {
    if (isError) {
      setIsError(false);
    }
    setPreviewText("");
  }

  // The criteria for previewing is the same as for downloading plus the file's type has to be
  // supported for previewing.
  const isPreviewable = checkFileDownloadable(file) && TypePreview;
  if (isPreviewable) {
    return (
      <>
        <TooltipRef tooltipAttr={tooltipAttr}>
          <div className="flex gap-1">
            <Button
              onClick={handlePreviewClick}
              size={buttonSize}
              type="secondary"
              hasIconOnly
              className="text-xs"
            >
              <EyeIcon className="h-4 w-4" />
            </Button>
            {isLoading && <Spinner svgClassName="h-5" />}
          </div>
        </TooltipRef>
        <Tooltip tooltipAttr={tooltipAttr}>
          Preview this {file.file_format} file. Only the first portion of large
          files appear.
        </Tooltip>
        <Modal
          isOpen={Boolean(previewText)}
          onClose={handleClosePreview}
          testid="hosted-file-preview-modal"
        >
          <Modal.Header onClose={handleClosePreview}>
            <div>
              <h2>{file.file_format} File Preview</h2>
              <h3 className="text-xs">
                Only the first portion of large files appear
              </h3>
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className="max-h-[50vh] overflow-y-auto">
              {isError ? (
                <div className="py-2 text-center italic">{previewText}</div>
              ) : (
                <TypePreview text={previewText} />
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleClosePreview} type="secondary">
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}
