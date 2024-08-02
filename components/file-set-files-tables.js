// node_modules
import _ from "lodash";
import PropTypes from "prop-types";
// components
import FileTable from "./file-table";
import SequencingFileTable from "./sequencing-file-table";

/**
 * Display tables of files associated with a file set for those file-set types that need different
 * tables for different types of files.
 */
export default function FileSetFilesTables({
  files = [],
  fileSet,
  seqspecFiles,
  sequencingPlatforms,
  children,
}) {
  // Extract sequencing files from `files` and group them by characteristics to determine which
  // file table they should appear in, if any. Possible groups include:
  // - sequencingIllumina: Sequencing files with `illumina_read_type`
  // - sequencingOther: Sequencing files without `illumina_read_type`
  // - seqspec: Configuration files with `content_type` of `seqspec` and associated with a file in
  //   `seqspecFiles`
  // - other: All other files
  const groupedFiles = _.groupBy(files, (file) => {
    if (file["@type"].includes("SequenceFile")) {
      // Split sequencing files into those with `illumina_read_type` and those without.
      return file.illumina_read_type ? "sequencingIllumina" : "sequencingOther";
    }
    if (
      file["@type"].includes("ConfigurationFile") &&
      file.content_type === "seqspec"
    ) {
      // Extract configuration files with a `content_type` of `seqspec` that are associated with a
      // sequencing file.
      const isSeqspecFileOfSequencingFile = seqspecFiles.some(
        (seqspecFile) => file["@id"] === seqspecFile["@id"]
      );
      if (isSeqspecFileOfSequencingFile) {
        return "seqspec";
      }
    }

    // No other conditions apply, so place the file in the "other" group.
    return "other";
  });

  return (
    <>
      {groupedFiles.sequencingIllumina?.length > 0 && (
        <SequencingFileTable
          files={groupedFiles.sequencingIllumina}
          title="Sequencing Results (Illumina)"
          isIlluminaReadType
          itemPath={fileSet["@id"]}
          seqspecFiles={seqspecFiles}
          sequencingPlatforms={sequencingPlatforms}
          hasReadType
        />
      )}
      {groupedFiles.sequencingOther?.length > 0 && (
        <SequencingFileTable
          files={groupedFiles.sequencingOther}
          title="Sequencing Results"
          itemPath={fileSet["@id"]}
          seqspecFiles={seqspecFiles}
          sequencingPlatforms={sequencingPlatforms}
        />
      )}
      {children}
      {groupedFiles.other?.length > 0 && (
        <FileTable
          files={groupedFiles.other}
          fileSet={fileSet}
          title="Other Raw Data Files"
        />
      )}
    </>
  );
}

FileSetFilesTables.propTypes = {
  // The files to display in the tables
  files: PropTypes.arrayOf(PropTypes.object),
  // FileSet object for the page displaying these tables
  fileSet: PropTypes.object.isRequired,
  // seqspec files associated with the files
  seqspecFiles: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Sequencing platform objects associated with `files`
  sequencingPlatforms: PropTypes.arrayOf(PropTypes.object).isRequired,
};
