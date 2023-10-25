// node_modules
import _ from "lodash";
import PropTypes from "prop-types";
import { Fragment } from "react";
// component
import AuditTable from "../components/audit-table";
import PagePreamble from "../components/page-preamble";
// lib
import errorObjectToProps from "../lib/errors";
import FetchRequest from "../lib/fetch-request";
import { snakeCaseToHuman } from "../lib/general";

export default function AuditDoc({ auditDoc }) {
  const keyedAudits = Object.keys(auditDoc).map((key) => {
    return {
      key: key.split(".")[2],
      ...auditDoc[key],
    };
  });
  const auditsGroupedByCollection = _.groupBy(keyedAudits, "key");
  return (
    <>
      <PagePreamble />
      <p>
        The IGVF Data and Administration Coordinating Center has established an
        audit system, utilizing flags, to detect discrepancies in the data.
        While dependencies ensure metadata accuracy within an individual object,
        audits primarily focus on validating metadata between linked objects.
        For example, a specific audit has been implemented to verify the linkage
        of Biosamples with donors sharing the same taxa. Within each audit
        category, there could be one or more icons, each assigned a distinct
        color corresponding to the severity level of the audit category.
      </p>
      {Object.keys(auditsGroupedByCollection).map((itemType) => {
        const typeAudits = auditsGroupedByCollection[itemType];
        const filteredAudits = typeAudits.filter(
          (audit) => audit.audit_levels[0] !== "INTERNAL_ACTION"
        );
        if (filteredAudits.length > 0) {
          return (
            <Fragment key={itemType}>
              <h2 className="mb-1 mt-8 text-lg font-semibold text-brand dark:text-[#8fb3a5]">
                {snakeCaseToHuman(itemType)}
              </h2>
              <AuditTable data={filteredAudits} key={itemType} />
            </Fragment>
          );
        }
        return null;
      })}
    </>
  );
}

AuditDoc.propTypes = {
  // Audits to display on this page
  auditDoc: PropTypes.object.isRequired,
};

export async function getServerSideProps({ req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const auditDoc = (
    await request.getObject("/static/doc/auditdoc.json")
  ).union();
  if (FetchRequest.isResponseSuccess(auditDoc)) {
    return {
      props: {
        auditDoc,
        pageContext: { title: "Audit Documentation" },
      },
    };
  }
  return errorObjectToProps(auditDoc);
}
