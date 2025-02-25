export default function SortableGrid({
  data,
  columns,
  keyProp,
  meta = null,
  pager,
}: {
  data: any[];
  columns: any[];
  keyProp: string;
  meta?: Record<string, unknown>;
  pager: Record<string, unknown>;
});
