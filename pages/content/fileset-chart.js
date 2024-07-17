/**
 * Displays a standalone chart of file sets -- the same chart that appears on the home page --
 * without any surrounding UI such as navigation, headers, or footers, and without needing
 * authentication. Use this page to embed as an iframe on other web sites.
 */

// node_modules
import PropTypes from "prop-types";
// components
import ChartFileSetLab from "../../components/chart-file-set-lab";
// lib
import { requestDatasetSummary } from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";

export default function FileSetChart({ fileSets }) {
  return (
    <>
      {fileSets.length > 0 && (
        <ChartFileSetLab
          fileSets={fileSets}
          title="Data Sets Produced by IGVF Labs"
        />
      )}
    </>
  );
}

FileSetChart.propTypes = {
  // File sets to display in the chart
  fileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export async function getServerSideProps({ req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const results = await requestDatasetSummary(request);
  if (FetchRequest.isResponseSuccess(results)) {
    return {
      props: {
        fileSets: results["@graph"] || [],
        isStandalonePage: true,
      },
    };
  }
  return errorObjectToProps(results);
}
