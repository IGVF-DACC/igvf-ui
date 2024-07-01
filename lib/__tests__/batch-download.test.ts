import BaseController from "../batch-download/base-controller";
import FileSetController from "../batch-download/fileset-controller";
import SearchController from "../batch-download/search-controller";
import QueryString from "../query-string";

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
        "/batch-download/?type=FileSet"
      );
    });
  });

  describe("Test batch download fileset controller class", () => {
    it("should create a new instance of the fileset controller without an extra query, and make a FileSet query", () => {
      const fileSet = {
        "@context": "/terms/",
        "@id": "/analysis-sets/IGVFDS1006IYEJ/",
        "@type": ["AnalysisSet", "FileSet", "Item"],
        creation_timestamp: "2024-07-05T17:19:40.744723+00:00",
        status: "released",
        uuid: "dd171b83-cbd9-4d06-4aa1-b77ab49569cd",
      };

      const controller = new FileSetController(fileSet);

      expect(controller).toBeInstanceOf(FileSetController);
      expect(controller.offerDownload).toBe(true);
      controller.initiateDownload();
      expect(urlAssignMock).toHaveBeenCalledWith(
        "/batch-download/?type=AnalysisSet&@id=%2Fanalysis-sets%2FIGVFDS1006IYEJ%2F"
      );
    });

    it("should create a new instance of the fileset controller with an extra query, and make a FileSet query", () => {
      const fileSet = {
        "@context": "/terms/",
        "@id": "/analysis-sets/IGVFDS1006IYEJ/",
        "@type": ["AnalysisSet", "FileSet", "Item"],
        creation_timestamp: "2024-07-05T17:19:40.744723+00:00",
        status: "released",
        uuid: "dd171b83-cbd9-4d06-4aa1-b77ab49569cd",
      };

      const controller = new FileSetController(
        fileSet,
        new QueryString("illumina_read_type=*")
      );

      expect(controller).toBeInstanceOf(FileSetController);
      expect(controller.offerDownload).toBe(true);
      controller.initiateDownload();
      expect(urlAssignMock).toHaveBeenCalledWith(
        "/batch-download/?illumina_read_type=*&type=AnalysisSet&@id=%2Fanalysis-sets%2FIGVFDS1006IYEJ%2F"
      );
    });
  });

  describe("Test batch download search controller class", () => {
    const profiles = {
      "@type": ["JSONSchemas"],
      _hierarchy: {
        Item: {
          FileSet: {
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
      },
      _subtypes: {
        FileSet: [
          "AnalysisSet",
          "ConstructLibrarySet",
          "CuratedSet",
          "MeasurementSet",
          "ModelSet",
          "PredictionSet",
          "AuxiliarySet",
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
        "/batch-download/?type=FileSet"
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
        "/batch-download/?type=AnalysisSet"
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

    it("should not initiate a download if the query-string type isn't a FileSet type", () => {
      const controller = new SearchController(
        new QueryString("type=NonExistent"),
        profiles
      );

      expect(controller).toBeInstanceOf(SearchController);
      expect(controller.offerDownload).toBe(false);
      controller.initiateDownload();
      expect(urlAssignMock).not.toHaveBeenCalled();
    });
  });
});
