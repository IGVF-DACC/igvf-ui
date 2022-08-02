// node_modules
import Image from "next/image";
import PropTypes from "prop-types";
import { useState } from "react";
// components
import Button from "./button";
import { isDarkMode } from "../lib/general";
import Modal from "./modal";
// lib
import { generateTsvFromCollection } from "../lib/collection-table";
// public
import excelFileOrigin from "../public/img/excel-file-origin.png";
import excelFileOriginDark from "../public/img/excel-file-origin-dark.png";

/**
 * Handle the user downloading the table as a TSV file, and render the button to trigger this.
 * https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side#answer-14966131
 */
const CollectionDownload = ({ collection, columns, collectionType }) => {
  // True if the download modal is open
  const [isDownloadModalVisible, setIsDownloadModalVisible] = useState(false);

  /**
   * Called when the user clicks the "Download TSV" button in the download modal.
   */
  const handleDownload = () => {
    setIsDownloadModalVisible(false);
    const encodedTsvContent = generateTsvFromCollection(collection, columns);

    // To download to a specific filename, add a hidden <a> element to the DOM and click it. This element
    // gets removed with GC.
    var link = document.createElement("a");
    link.setAttribute("href", encodedTsvContent);
    link.setAttribute("download", `${collectionType}.tsv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <>
      <Button
        className="w-full lg:ml-auto lg:w-auto"
        onClick={() => setIsDownloadModalVisible(true)}
      >
        Download TSV
      </Button>
      <Modal
        isOpen={isDownloadModalVisible}
        onClose={() => setIsDownloadModalVisible(false)}
      >
        <Modal.Header onClose={() => setIsDownloadModalVisible(false)}>
          Download as TSV file
        </Modal.Header>
        <Modal.Body>
          <div className="prose dark:prose-invert">
            <p>
              The downloaded TSV file includes the same columns currently
              visible in the table.
            </p>
            <p>
              Most spreadsheet applications (e.g. Google Sheets and Apple
              Numbers) use UTF-8 character encoding and properly display special
              characters in the TSV file. For Microsoft Excel, make sure to use
              the <strong>Unicode (UTF-8)</strong> file origin:
            </p>
            <div className="mx-auto mt-3 max-w-2xl">
              <Image
                src={isDarkMode() ? excelFileOriginDark : excelFileOrigin}
                alt="Excel TSV import file origin"
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="primary-outline"
            onClick={() => setIsDownloadModalVisible(false)}
          >
            Close
          </Button>
          <Button type="primary" onClick={handleDownload} autofocus>
            Download TSV
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

CollectionDownload.propTypes = {
  // Collection of data to download
  collection: PropTypes.arrayOf(PropTypes.object).isRequired,
  // All available columns, not including hidden columns
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Type of collection to download
  collectionType: PropTypes.string.isRequired,
};

export default CollectionDownload;
