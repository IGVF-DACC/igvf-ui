## nodeSize

**`nodeSize(iteratee)`**

Defines how large the nodes appear within the layout. By setting node sizes, you ensure that the layout algorithm takes into account the dimensions of the nodes when calculating their positions. This is especially useful when nodes are not uniform in size or when you want to add padding between nodes to avoid overlap.

Keep this size compatible with how large you actually render the nodes. If you change the actual rendering of the node, you might need to change what you return from `nodeSize()` too.

### Parameters

**`iteratee(node)`**: `DagNode<never, never>`

This callback gets called once for every rendered node. It takes an object as its argument representing the node, and has the following structure:

```javascript
{
  data: {
    // Unique ID of node
    id: "string",
    // Unique IDs of parent nodes
    parentIds: string[],
  },
  // Data about each child of this node, if any; empty array if leaf node
  dataChildren: [
    // Array of child nodes; each with this node as one of its parents
    children: {
      child: DagNode<never, never>
    },
    // I haven't figured out what this is for; it often doesn't exist
    points: [
      {
        x: number,
        y: number,
      }
    ]
  ],
  // Numeric value meaningful to layout algorithm you chose
  value: number,
  // X coordinate of node
  x: number,
  // Y coordinate of node
  y: number,
}
```
