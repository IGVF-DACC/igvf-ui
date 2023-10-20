// node_modules
import PropTypes from "prop-types";
import _ from "lodash";
import { useContext } from "react";
// component
import { DataItemValue } from "../components/data-area";
import Markdown from "../components/markdown";
import AuditDynamicTable from "../components/audit-table";
import SessionContext from "../components/session-context";
// lib
import errorObjectToProps from "../lib/errors";
import FetchRequest from "../lib/fetch-request";

export default function AuditDoc({ uniqueDetails, arrayVersion, arrayObject }) {
  const { collectionTitles } = useContext(SessionContext);
  return (
    <>
      <h1 className="tight my-4 text-center text-xl font-bold text-black dark:text-gray-300 sm:text-2xl md:my-10 md:text-3xl lg:text-4xl">
        Audits
      </h1>
      <Markdown
        markdown={
          "The IGVF Data and Administration Coordinating Center has established an audit system, utilizing flags, to detect discrepancies in the data. While dependencies ensure metadata accuracy within an individual object, audits primarily focus on validating metadata between linked objects. For example, a specific audit has been implemented to verify the linkage of Biosamples with donors sharing the same taxa. Within each audit category, there could be one or more icons, each assigned a distinct color corresponding to the severity level of the audit category."
        }
      />
      <DataItemValue>{uniqueDetails.join(", ")}</DataItemValue>
      <DataItemValue>
        {JSON.stringify(arrayVersion, undefined, 2)}
      </DataItemValue>
      {Object.keys(arrayObject).map((itemType) => {
        const typeAudits = arrayObject[itemType];
        return (
          <>
            <h2 className="mb-4 px-2 py-2 text-lg font-semibold text-brand">
              {collectionTitles?.[itemType] || itemType}
            </h2>
            <AuditDynamicTable arrayVersion={typeAudits} key={itemType} />
          </>
        );
      })}
    </>
  );
}

AuditDoc.propTypes = {
  uniqueDetails: PropTypes.object,
  arrayVersion: PropTypes.arrayOf(PropTypes.object),
  arrayObject: PropTypes.object.isRequired,
};

export async function getServerSideProps({ req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const auditDoc = await request.getObject("/static/doc/auditdoc.json");
  if (FetchRequest.isResponseSuccess(auditDoc)) {
    const objectTypes = Object.keys(auditDoc);
    const arrayVersion = Object.keys(auditDoc).map((key) => {
      return {
        key: key.split(".")[2],
        ...auditDoc[key],
      };
    });
    const arrayObject = _.groupBy(arrayVersion, "key");
    // _.groupBy(arrayVersion, (item) => item.key);
    const details = Object.keys(auditDoc).map((auditCode) => {
      const auditObject = auditCode.split(".")[2];
      return auditObject;
      // Get each audit object within the auditDocObject.
      // const audit = auditDoc[auditCode];
      // audit = { audit_category: "missing stuff", audit_detail: "Missing Stuff", audit_levels: ["WARNING"]}
      // return audit.audit_detail;
      // return "Missing Stuff", then "Missing Other Stuff", and then "Missing More Stuff"
    });
    const uniqueDetails = [...new Set(details)];
    console.log(uniqueDetails);
    return {
      props: {
        auditDoc,
        objectTypes,
        uniqueDetails,
        arrayVersion,
        arrayObject,
      },
    };
  }
  return errorObjectToProps(auditDoc);
}
