// components
import Checkbox from "./checkbox";
// lib
import { type DeprecatedFileFilterProps } from "../lib/deprecated-files";

export function DeprecatedFileFilterControl({
  panelId,
  deprecatedData,
}: {
  panelId: string;
  deprecatedData: DeprecatedFileFilterProps;
}) {
  return (
    <Checkbox
      id={`file-table-deprecated-${panelId}`}
      checked={deprecatedData.visible}
      name="Include deprecated files"
      onClick={() => deprecatedData.setVisible(!deprecatedData.visible)}
      className="items-center [&>input]:mr-0"
    >
      <div className="order-first mr-1 text-sm">
        {deprecatedData.controlTitle || "Include deprecated files"}
      </div>
    </Checkbox>
  );
}
