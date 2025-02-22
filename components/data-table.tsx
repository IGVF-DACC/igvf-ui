// lib
import {
  splitHeaderAndDataRows,
  type DataTableFormat,
} from "../lib/data-table";

export function DataCellWithClasses({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <td className={`min-w-40 border border-panel p-2 align-top ${className}`}>
      {children}
    </td>
  );
}

function DefaultHeaderCell({
  children,
}: {
  children: string | number | React.ReactNode;
}) {
  return (
    <th className="bg-table-header-cell sticky top-0 z-[2] min-w-40 border-b border-r border-panel p-2 text-left align-bottom last:border-r-0">
      {children}
    </th>
  );
}

function DefaultDataCell({
  children,
}: {
  children: string | number | React.ReactNode;
}) {
  return (
    <td className="bg-table-data-cell min-w-40 border-b border-r border-panel p-2 align-top last:border-r-0">
      {children}
    </td>
  );
}

export function DataTable({ data }: { data: DataTableFormat }) {
  const headerAndDataRows = splitHeaderAndDataRows(data);

  return (
    <div className="max-h-[90vh] overflow-auto border border-panel">
      <table>
        {headerAndDataRows.map((rows, index) => {
          if (rows[0].isHeaderRow) {
            return (
              <thead key={index}>
                {rows.map((row) => {
                  return (
                    <tr key={row.id}>
                      {row.cells.map((cell) => {
                        const CellComponent =
                          cell.component || DefaultHeaderCell;
                        return (
                          <CellComponent key={cell.id} {...cell.componentProps}>
                            {cell.content}
                          </CellComponent>
                        );
                      })}
                    </tr>
                  );
                })}
              </thead>
            );
          }

          return (
            <tbody key={index}>
              {rows.map((row) => {
                return (
                  <tr key={row.id}>
                    {row.cells.map((cell) => {
                      const CellComponent = cell.component || DefaultDataCell;
                      return (
                        <CellComponent key={cell.id} {...cell.componentProps}>
                          {cell.content}
                        </CellComponent>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          );
        })}
      </table>
    </div>
  );
}
