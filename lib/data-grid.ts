/**
 * The content of a cell in the data grid. It can be a string, number, JSX element, React component,
 * or a function returning a React component.
 */
export type CellContent<TItem = unknown, TMeta = unknown> =
  | string
  | number
  | React.ReactNode
  | React.ComponentType<CellContentProps<TItem, TMeta>>
  | ((props: CellContentProps<TItem, TMeta>) => React.ReactNode);

/**
 * Props for a row component used in data grids.
 */
export type RowComponentProps<TExtra> = {
  rowId: string;
  cells?: Cell[];
  cellIndex?: number;
  meta?: any;
  children: React.ReactElement<TExtra> | React.ReactElement<TExtra>[];
};

/**
 * Props passed to cell content components.
 */
export type CellContentProps<TItem = unknown, TMeta = unknown> = {
  id?: string;
  source?: TItem;
  meta?: TMeta;
};

/**
 * Defines one cell in the data grid. The cell can contain a simple type or a React component. The
 * cell can span multiple columns.
 * @property id - Identifier for the cell unique throughout the row.
 * @property content - Content of the cell, which can be a string, number, function, or component.
 * @property columns - Number of columns the cell spans. Default is 1.
 * @property role - HTML role of the cell. Default is "cell".
 * @property source - Source of the cell, used for custom cell renderers.
 * @property noWrapper - True to not wrap the cell content in a default cell wrapper.
 */
export type Cell<TItem = unknown, TMeta = unknown> = {
  id: string;
  content: CellContent<TItem, TMeta>;
  columns?: number;
  role?: string;
  source?: TItem;
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
export type Row<TItem = unknown, TMeta = unknown, TExtra = unknown> = {
  id: string;
  cells: Cell<TItem, TMeta>[];
  children?: Row<TItem, TMeta, TExtra>[];
  RowComponent?: React.ComponentType<RowComponentProps<TExtra>>;
};

/**
 * Defines an entire data grid.
 */
export type DataGridFormat<
  TItem = unknown,
  TMeta = unknown,
  TExtra = unknown,
> = Row<TItem, TMeta, TExtra>[];
