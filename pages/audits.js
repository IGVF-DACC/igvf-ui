// node_modules
import _ from "lodash";
import PropTypes from "prop-types";
// component
import AuditDynamicTable from "../components/audit-table";
import Markdown from "../components/markdown";
// lib
import errorObjectToProps from "../lib/errors";
import FetchRequest from "../lib/fetch-request";
import { formatPropertyName } from "../lib/general";

export default function AuditDoc({ arrayObject }) {
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
      {Object.keys(arrayObject).map((itemType) => {
        const typeAudits = arrayObject[itemType];
        const filteredAudits = typeAudits.filter(
          (audit) => audit.audit_levels[0] !== "INTERNAL_ACTION"
        );
        console.log(filteredAudits);
        if (filteredAudits.length > 0) {
          return (
            <>
              <h2 className="mb-1 px-2 pt-8 text-lg font-semibold text-brand">
                {formatPropertyName(itemType)}
              </h2>
              <AuditDynamicTable data={filteredAudits} key={itemType} />
            </>
          );
        }
        return null;
      })}
    </>
  );
}

AuditDoc.propTypes = {
  arrayObject: PropTypes.object.isRequired,
};

export async function getServerSideProps({ req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const auditDoc = await request.getObject("/static/doc/auditdoc.json");
  if (FetchRequest.isResponseSuccess(auditDoc)) {
    const arrayVersion = Object.keys(auditDoc).map((key) => {
      return {
        key: key.split(".")[2],
        ...auditDoc[key],
      };
    });
    const arrayObject = _.groupBy(arrayVersion, "key");
    return {
      props: {
        auditDoc,
        arrayVersion,
        arrayObject,
      },
    };
  }
  return errorObjectToProps(auditDoc);
}
