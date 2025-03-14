# Data Table

The `DataTable` component has roughly the same functionality as the `DataGrid` component, but rather than generating a CSS grid, it generates an HTML table. When choosing between the two, generally `DataGrid` works well for small tables without spans or with simple single-level spans at the most. `DataTable` works well for more complex things that could have multiple nested spans or complex highlighting.

This component makes it easy to set up both simple data as well as nested, hierarchical data without having to map data to the order of nested cells in HTML data which, though logical, often doesn't map well to hierarchical data.

## Simple Example

This example shows how to set up a `DataTable` component with simple two-dimensional data.

```tsx
import { type DataTableFormat } from "../lib/data-table";

const data: DataTableFormat = [
  {
    id: "header",
    cells: [
      {
        id: "0",
        content: "First Column",
      },
      {
        id: "1",
        content: "Second Column",
      },
      {
        id: "3",
        content: "Third Column",
      },
    ],
    isHeaderRow: true,
  },
  {
    id: "data-0",
    cells: [
      {
        id: "0",
        content: 500,
      },
      {
        id: "1",
        content: "500 more",
      },
      {
        id: "2",
        content: <a href="#">1000</a>,
      },
    ],
  },
];

return <DataTable data={data} />;
```

This example shows one three-column header row and one three-column data row. Each row of the table has a `Row` object in this `DataTableFormat` (type equivalent to `Row[]`). Each `id` property gets used as a React key, so make sure all the `id` properties within the `cells` array have unique values, and make sure all the `id` properties of the rows array have unique values. These `id` properties only have to have unique values within their arrays, so two `cells` arrays can have the same `id` values.

## Hierarchical Example

HTML tables can have row spans, and `DataTable` supports this. To make the conversion from data to these row spans more natural, instead of the order of cells within an HTML table with row spans, `DataTableFormat` supports a hierarchical structure where each cell can have child rows which have their own cells, and each one of those can have child rows, and continuing as deeply as you need.

The following shows an example of a table with two rows of data, but with a single cell in the first column that spans both rows.

```tsx
const data: DataTableFormat = [
  {
    id: "main-span-row",
    cells: [
      {
        id: "spanned-cell",
        content: "Spanned Cell",
        isHeaderCell: true,
        childRows: [
          {
            id: "row-1",
            cells: [
              {
                id: "0",
                contents: "Row 1, Column 2",
              },
              {
                id: "1",
                contents: "Row 1, Column 3",
              },
              {
                id: "2",
                contents: "Row 1, Column 4",
              },
            ],
          },
          {
            id: "row-2",
            cells: [
              {
                id: "0",
                contents: "Row 2, Column 2",
              },
              {
                id: "1",
                contents: "Row 2, Column 3",
              },
              {
                id: "2",
                contents: "Row 2, Column 4",
              },
            ],
          },
        ],
      },
    ],
  },
];
```

Notice within the `main-span-row` `cells` array, only one row exists — the one that spans both data rows. That row only contains one cell with the contents **Spanned Cell**.

That cell has two rows of its own under `childRows`. Notice this has the same structure as the top-level row, with `id` and `cells` properties, and has the same Typescript type: `Row[]`.

## Data Types

### `DataTableFormat`

This is an array of `Row` types, and in fact if you prefer you can use `Row[]` instead of this.

### `Row`

This defines a single row within the table. This includes top-level rows as well as child rows of a cell when you have a table with row spans.

**`id`** (`string`)

This string gets used as a React key when rendering rows in the table, so it must contain a unique value among all rows within the data table, or all child rows of a cell.

**`cells`** (`Cells[]`)

This defines the contents of every cell in the row.

**`isHeaderRow`** (`boolean`)

Set this to true to place this row within a `thead` element. The cells within a row with `isHeaderRow` set also get special styling, though you can override this if you want.

### `Cell`

This defines a single cell within a `Row` within the table. To have row spans, you can also define child rows that appear to the right of the cell.

**`id`** (`string`)

This string gets used as a React key when rendering cells in a row, so it must contain a unique value among all cells in a row.

**`content`** (`string` | `number` | `React.ReactNode`)

Place the contents that appear in the cell here.

**`component`** (`React.ComponentType`)

If you want to customize the rendering of a cell, put that component here. This has a different effect from providing a React component in `content`. That puts a React component within the default cell, including any padding. This is good for displaying a link within a cell that otherwise looks like the default cell. `component` is better when you need to do something like change the color of an entire cell.

**`componentProps`** (`Record<string, unknown>`)

Use this object to pass extra props you need to `component`. You might pass extra data it needs to render its contents. You could pass extra CSS classes or styles needed for a specific usage of `component`.

**`childRows`** (`Row[]`)

If this cell spans multiple rows to its right, put those child rows here. As you can seem from its type, this has the same format as the top level rows.

**`colSpan`** (`number`)

Defines the number of horizontal columns this cell should span.

**`isHeaderCell`** (`boolean`)

True to make this a `<th>` header cell instead of the usual `<td>`. This is different from `isHeaderRow` which puts the entire row within a `<thead>` element. This is just for individual header cells within a regular row. The header cells along the left-most column of a table is a common usage for this.

## Custom Cell Component

Each `Cell` object can define a custom component to render that cell in the cell’s `component` property. This section describes how to write this component.

At its simplest, this component takes a React `children` property that contains the `content` of the cell:

```tsx
function CustomCell({ children }: { children: React.ReactNode }) {
  return <td>{children}</td>;
}
```

This component is also passed `rowSpan` and `colSpan` properties if needed.

```tsx
function CustomCell({
  rowSpan,
  children,
}: {
  rowSpan: number;
  children: React.ReactNode;
}) {
  return (
    <td
      {...(colSpan > 1 ? { colSpan } : {})}
      {...(rowSpan > 1 ? { rowSpan } : {})}
    >
      {children}
    </td>
  );
}
```

You can also pass any other properties you like to this component through the `componentProps` property of a cell.

```tsx
const data: DataTableFormat = [
  {
  {
    id: "data-0",
    cells: [
      {
        id: "0",
        content: 500,
      },
      {
        id: "1",
        content: "500 more",
        component: CustomCell,
        componentProps: { value: "this value", other: 5 }
      },
      {
        id: "2",
        content: <a href="#">1000</a>,
      },
    ],
  },
];

function CustomCell({
  value: string,
  other: number,
}) {
  return (
    <td style={{ width: other }}>
      {value} {children}
    </td>
  )
}

```
