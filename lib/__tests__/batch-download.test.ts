import BaseController from "../batch-download/base-controller";
import FileTableController from "../batch-download/file-table-controller";
import SearchController from "../batch-download/search-controller";
import QueryString from "../query-string";
import type { FileSetObject } from "../../globals";

describe("Test batch download controller classes", () => {
  let urlAssignMock: jest.Mock;
  const originalLocation = window.location;

  beforeEach(() => {
    // Mock function to capture URL assignments
    urlAssignMock = jest.fn();

    // Mock `window.location` using a class with an href getter and setter
    Object.defineProperty(window, "location", {
      value: {
        ...originalLocation,
        get href() {
          return this._href;
        },
        set href(value) {
          this._href = value;
          urlAssignMock(value);
        },
      },
      writable: true,
    });
  });

  afterAll(() => {
    // Restore the original `window.location`
    Object.defineProperty(window, "location", {
      value: originalLocation,
    });
  });

  describe("Test batch download base controller class", () => {
    it("should create a new instance of the base controller and make a FileSet query", () => {
      const controller = new BaseController(new QueryString("type=FileSet"));

      expect(controller).toBeInstanceOf(BaseController);
      expect(controller.offerDownload).toBe(true);
      controller.initiateDownload();
      expect(urlAssignMock).toHaveBeenCalledWith(
        "/batch-download-v2/?type=FileSet"
      );
    });
  });

  describe("Test batch download fileset controller class", () => {
    it("should create a new instance of the fileset controller without an extra query, and make a FileSet query", () => {
      const fileSet: FileSetObject = {
        "@context": "/terms/",
        "@id": "/analysis-sets/IGVFDS1006IYEJ/",
        "@type": ["AnalysisSet", "FileSet", "Item"],
        creation_timestamp: "2024-07-05T17:19:40.744723+00:00",
        status: "released",
        uuid: "dd171b83-cbd9-4d06-4aa1-b77ab49569cd",
        files: [
          {
            "@context": "/terms/",
            "@id": "/sequence-files/IGVFFI0001SQFL/",
            "@type": ["SequenceFile", "File", "Item"],
            accession: "IGVFFI0001SQFL",
            content_type: "reads",
            file_format: "fastq",
            file_set: "/analysis-sets/IGVFDS1006IYEJ/",
            status: "released",
            uuid: "11111111-1111-1111-1111-111111111111",
            creation_timestamp: "2024-07-05T17:19:40.744723+00:00",
          },
        ],
        summary: "Test analysis set for batch download",
      };

      const controller = new FileTableController(fileSet);

      expect(controller).toBeInstanceOf(FileTableController);
      expect(controller.offerDownload).toBe(true);
      controller.initiateDownload();
      expect(urlAssignMock).toHaveBeenCalledWith(
        "/batch-download-v2/?type=AnalysisSet&@id=%2Fanalysis-sets%2FIGVFDS1006IYEJ%2F"
      );
    });

    it("should create a new instance of the fileset controller with an extra query, and make a FileSet query", () => {
      const fileSet: FileSetObject = {
        "@context": "/terms/",
        "@id": "/analysis-sets/IGVFDS1006IYEJ/",
        "@type": ["AnalysisSet", "FileSet", "Item"],
        creation_timestamp: "2024-07-05T17:19:40.744723+00:00",
        status: "released",
        uuid: "dd171b83-cbd9-4d06-4aa1-b77ab49569cd",
        files: [
          {
            "@context": "/terms/",
            "@id": "/alignment-files/IGVFFI0002ALGN/",
            "@type": ["AlignmentFile", "File", "Item"],
            accession: "IGVFFI0002ALGN",
            content_type: "alignments",
            file_format: "bam",
            file_set: "/analysis-sets/IGVFDS1006IYEJ/",
            status: "released",
            uuid: "22222222-2222-2222-2222-222222222222",
            creation_timestamp: "2024-07-05T17:19:40.744723+00:00",
          },
        ],
        summary: "Test analysis set for batch download",
      };

      const controller = new FileTableController(
        fileSet,
        new QueryString("illumina_read_type=*")
      );

      expect(controller).toBeInstanceOf(FileTableController);
      expect(controller.offerDownload).toBe(true);
      controller.initiateDownload();
      expect(urlAssignMock).toHaveBeenCalledWith(
        "/batch-download-v2/?illumina_read_type=*&type=AnalysisSet&@id=%2Fanalysis-sets%2FIGVFDS1006IYEJ%2F"
      );
    });
  });

  describe("Test batch download search controller class", () => {
    const profiles = {
      "@type": ["JSONSchemas"],
      _hierarchy: {
        Item: {
          File: {
            AlignmentFile: {},
            ConfigurationFile: {},
            ImageFile: {},
            IndexFile: {},
            MatrixFile: {},
            ModelFile: {},
            ReferenceFile: {},
            SequenceFile: {},
            SignalFile: {},
            TabularFile: {},
          },
          FileSet: {
            AnalysisSet: {},
            AuxiliarySet: {},
            ConstructLibrarySet: {},
            CuratedSet: {},
            MeasurementSet: {},
            ModelSet: {},
            PredictionSet: {},
          },
        },
      },
      _subtypes: {
        File: [
          "AlignmentFile",
          "ConfigurationFile",
          "ImageFile",
          "IndexFile",
          "MatrixFile",
          "ModelFile",
          "ReferenceFile",
          "SequenceFile",
          "SignalFile",
          "TabularFile",
        ],
        FileSet: [
          "AnalysisSet",
          "AuxiliarySet",
          "ConstructLibrarySet",
          "CuratedSet",
          "MeasurementSet",
          "ModelSet",
          "PredictionSet",
        ],
      },
    };

    it("should create a new instance of the search controller with a profile, and make a FileSet query", () => {
      const controller = new SearchController(
        new QueryString("type=FileSet"),
        profiles
      );

      expect(controller).toBeInstanceOf(SearchController);
      expect(controller.offerDownload).toBe(true);
      controller.initiateDownload();
      expect(urlAssignMock).toHaveBeenCalledWith(
        "/batch-download-v2/?type=FileSet"
      );
    });

    it("should create a new instance of the search controller with a profile, and make a AnalysisSet query", () => {
      const controller = new SearchController(
        new QueryString("type=AnalysisSet"),
        profiles
      );

      expect(controller).toBeInstanceOf(SearchController);
      expect(controller.offerDownload).toBe(true);
      controller.initiateDownload();
      expect(urlAssignMock).toHaveBeenCalledWith(
        "/batch-download-v2/?type=AnalysisSet"
      );
    });

    it("should perform the correct query for a File query", () => {
      const controller = new SearchController(
        new QueryString("type=File"),
        profiles
      );

      expect(controller).toBeInstanceOf(SearchController);
      expect(controller.offerDownload).toBe(true);
      controller.initiateDownload();
      expect(urlAssignMock).toHaveBeenCalledWith(
        "/file-batch-download-v2/?type=File"
      );
    });

    it("should perform the correct query for an AlignmentFile query", () => {
      const controller = new SearchController(
        new QueryString("type=AlignmentFile"),
        profiles
      );

      expect(controller).toBeInstanceOf(SearchController);
      expect(controller.offerDownload).toBe(true);
      controller.initiateDownload();
      expect(urlAssignMock).toHaveBeenCalledWith(
        "/file-batch-download-v2/?type=AlignmentFile"
      );
    });

    it("should not initiate a download if we pass null for profiles", () => {
      const controller = new SearchController(
        new QueryString("type=AnalysisSet"),
        null
      );

      expect(controller).toBeInstanceOf(SearchController);
      expect(controller.offerDownload).toBe(false);
      controller.initiateDownload();
      expect(urlAssignMock).not.toHaveBeenCalled();
    });

    it("should not initiate a download if the query-string type isn't a FileSet nor File type", () => {
      const controller = new SearchController(
        new QueryString("type=NonExistent"),
        profiles
      );

      expect(controller).toBeInstanceOf(SearchController);
      expect(controller.offerDownload).toBe(false);
      controller.initiateDownload();
      expect(urlAssignMock).not.toHaveBeenCalled();
    });

    it("should not initiate a download if multiple types exist in the query string", () => {
      const controller = new SearchController(
        new QueryString("type=File&type=AnalysisSet"),
        profiles
      );

      expect(controller).toBeInstanceOf(SearchController);
      expect(controller.offerDownload).toBe(false);
      controller.initiateDownload();
      expect(urlAssignMock).not.toHaveBeenCalled();
    });
  });
});
