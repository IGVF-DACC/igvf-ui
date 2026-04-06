import { type ElkNodeEx } from "../../types";
import { buildNodesByFileSetPath, generateGroupId } from "../lib";

describe("buildNodesByFileSetPath", () => {
  it("builds a mapping of file-set object paths to all corresponding nodes", () => {
    const node1 = {
      id: "node1",
      metadata: {
        fileSet: { "@id": "/file-set-1", "@type": ["FileSet", "Item"] },
      },
    };
    const node2 = {
      id: "node2",
      metadata: {
        fileSet: { "@id": "/file-set-1", "@type": ["FileSet", "Item"] },
      },
    };
    const node3 = {
      id: "node3",
      metadata: {
        fileSet: { "@id": "/file-set-2", "@type": ["FileSet", "Item"] },
      },
    };

    const nodesByPath = buildNodesByFileSetPath([
      node1 as any,
      node2 as any,
      node3 as any,
    ]);

    expect(nodesByPath.size).toBe(2);
    expect(nodesByPath.get("/file-set-1")).toEqual(
      expect.arrayContaining([node1, node2])
    );
    expect(nodesByPath.get("/file-set-2")).toEqual(
      expect.arrayContaining([node3])
    );
  });
});

describe("generateGroupId", () => {
  it("generates different group IDs for different groups of nodes", () => {
    const nodeA: ElkNodeEx = { id: "a", width: 100, height: 100 };
    const nodeB: ElkNodeEx = { id: "b", width: 100, height: 100 };
    const nodeC: ElkNodeEx = { id: "c", width: 100, height: 100 };

    const group1 = [nodeA, nodeB];
    const group2 = [nodeB, nodeC];

    const groupId = generateGroupId(group1);
    expect(groupId).toMatch(/^group-[0-9a-f]+$/);

    const groupId2 = generateGroupId(group2);
    expect(groupId2).toMatch(/^group-[0-9a-f]+$/);
    expect(groupId).not.toBe(groupId2);
  });

  it("generates the same group ID for the same group of nodes regardless of order", () => {
    const nodeA: ElkNodeEx = { id: "a", width: 100, height: 100 };
    const nodeB: ElkNodeEx = { id: "b", width: 100, height: 100 };

    const group1 = [nodeA, nodeB];
    const group2 = [nodeB, nodeA];

    const groupId1 = generateGroupId(group1);
    const groupId2 = generateGroupId(group2);

    expect(groupId1).toBe(groupId2);
  });

  it("generates a group ID for a single node group", () => {
    const nodeA: ElkNodeEx = { id: "a", width: 100, height: 100 };

    const group = [nodeA];

    const groupId = generateGroupId(group);
    expect(groupId).toMatch(/^group-[0-9a-f]+$/);
  });
});
