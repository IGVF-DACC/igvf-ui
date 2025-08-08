// root
import { DatabaseObject } from "../globals";

/**
 * The content of a cell in the data grid. It can be a string, number, JSX element, React component,
 * or a function returning a React component.
 */
export type CellContent =
  | string
  | number
  | React.ReactNode
  | React.ComponentType<CellContentProps>
  | ((props: CellContentProps) => React.ReactNode);

/**
 * Props for a row component used in data grids.
 */
export type RowComponentProps = {
  rowId: string;
  cells?: Cell[];
  cellIndex?: number;
  meta?: any;
  children?: React.ReactNode;
};

/**
 * Props passed to cell content components.
 */
export type CellContentProps = {
  id?: string;
  source?: DatabaseObject;
  meta?: object;
};

/**
 * Defines one cell in the data grid. The cell can contain a simple type or a React component. The
 * cell can span multiple columns.
 * @property id - Identifier for the cell unique throughout the row.
 * @property content - Content of the cell, which can be a string, number, etc.
 * @property columns - Number of columns the cell spans. Default is 1.
 * @property role - HTML role of the cell. Default is "cell".
 * @property source - Source of the cell, used for custom cell renderers.
 * @property noWrapper - True to not wrap the cell content in a default cell wrapper.
 */
export type Cell = {
  id: string;
  content: CellContent;
  columns?: number;
  role?: string;
  source?: unknown;
  noWrapper?: boolean;
};

/**
 * Defines one row in the data grid. The row can contain multiple cells and child rows. The row can
 * contain a custom React component to render the row.
 * @property id - Identifier for the row unique throughout the data grid.
 * @property cells - Array of cells in the row.
 * @property children - Array of child rows in the row when the cells span multiple rows to the right.
 * @property RowComponent - Custom React component to render the row.
 */
export type Row = {
  id: string;
  cells: Cell[];
  children?: Row[];
  RowComponent?: React.ComponentType<RowComponentProps>;
};

/**
 * Defines an entire data grid.
 */
export type DataGridFormat = Row[];
