import {
  fileSetTypeColorMap,
  isFileNodeData,
  isFileSetNodeData,
  MAX_NODES_TO_DISPLAY,
  type FileNodeData,
  type FileSetNodeData,
} from "../types";

describe("Test isFileNodeData type guard", () => {
  it("returns true for FileNodeData", () => {
    const node: FileNodeData = {
      id: "file1",
      parentIds: [],
      type: "file",
      file: {} as any,
      externalFiles: [],
    };
    expect(isFileNodeData(node)).toBe(true);
  });

  it("returns false for FileSetNodeData", () => {
    const node: FileSetNodeData = {
      id: "set1",
      parentIds: [],
      type: "file-set",
      fileSet: {} as any,
      files: [],
      childFile: {} as any,
    };
    expect(isFileNodeData(node)).toBe(false);
  });
});

describe("Test isFileSetNodeData type guard", () => {
  it("returns true for FileSetNodeData", () => {
    const node: FileSetNodeData = {
      id: "set1",
      parentIds: [],
      type: "file-set",
      fileSet: {} as any,
      files: [],
      childFile: {} as any,
    };
    expect(isFileSetNodeData(node)).toBe(true);
  });

  it("returns false for FileNodeData", () => {
    const node: FileNodeData = {
      id: "file1",
      parentIds: [],
      type: "file",
      file: {} as any,
      externalFiles: [],
    };
    expect(isFileSetNodeData(node)).toBe(false);
  });
});

describe("Test fileSetTypeColorMap", () => {
  it("has more than one key in the map", () => {
    expect(Object.keys(fileSetTypeColorMap).length).toBeGreaterThan(1);
  });
});

describe("Test global consts for statement coverage", () => {
  it("MAX_NODES_TO_DISPLAY is defined", () => {
    expect(MAX_NODES_TO_DISPLAY).toBeDefined();
  });
});
