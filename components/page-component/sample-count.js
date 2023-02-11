/**
 * Example page plugin component that shows the number of items for the selected sample type.
 */

// node_modules
import PropTypes from "prop-types";
import { useContext, useEffect, useState } from "react";
// components
import { Select } from "../form-elements";
import SessionContext from "../session-context";
// lib
import FetchRequest from "../../lib/fetch-request";
/* istanbul ignore file */
/* This page component just shows how to implement a complex one; no need to test with Jest */

export default function SampleCount({
  label = "Sample Count",
  color = "gray",
}) {
  // Selected sample collection type
  const [sampleType, setSampleType] = useState("tissues");
  // Sample collection @graph for the selected sample type
  const [samples, setSamples] = useState([]);

  const { session } = useContext(SessionContext);

  useEffect(() => {
    if (sampleType) {
      const request = new FetchRequest({ session });
      request.getCollection(sampleType).then((samples) => {
        if (FetchRequest.isResponseSuccess(samples)) {
          setSamples(samples["@graph"]);
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

SampleCount.propTypes = {
  // Label to display before the count
  label: PropTypes.string,
  // Color style to use for the border and background
  color: PropTypes.string,
};
