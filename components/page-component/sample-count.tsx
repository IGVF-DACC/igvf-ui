/**
 * Example page plugin component that shows the number of items for the selected sample type.
 */

// node_modules
import { useContext, useEffect, useState } from "react";
// components
import { Select } from "../form-elements";
import SessionContext from "../session-context";
// lib
import FetchRequest from "../../lib/fetch-request";
// root
import type { SampleObject } from "../../lib/samples";
/* istanbul ignore file */
/* This page component just shows how to implement a complex one; no need to test with Jest */

export default function SampleCount({
  label = "Sample Count",
  color = "gray",
}: {
  label?: string;
  color?: string;
}) {
  // Selected sample collection type
  const [sampleType, setSampleType] = useState("tissues");
  // Sample collection @graph for the selected sample type
  const [samples, setSamples] = useState<SampleObject[]>([]);

  const { session } = useContext(SessionContext);

  useEffect(() => {
    if (sampleType && session) {
      const request = new FetchRequest({ session });
      void request.getCollection(sampleType).then((result) => {
        if (result.isOk()) {
          const data = result.unwrap();
          setSamples(data["@graph"] as SampleObject[]);
        }
      });
    }
  }, [sampleType, session]);

  return (
    <div
      className={"flex items-center justify-between rounded-md border-2 p-2"}
      style={{ borderColor: color }}
    >
      <div>
        {label}: {samples.length}
      </div>
      <Select
        name="sampleType"
        value={sampleType}
        onChange={(event) => setSampleType(event.target.value)}
      >
        <option value="tissues">Tissues</option>
        <option value="primary-cells">Primary Cells</option>
        <option value="technical-samples">Technical Samples</option>
      </Select>
    </div>
  );
}
