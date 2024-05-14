// node_modules
import { data } from "autoprefixer";
import _ from "lodash";
import PropTypes from "prop-types";
import { Fragment } from "react";
// component
import AuditKeyTable from "../components/audit-key-table";
import AuditTable from "../components/audit-table";
import PagePreamble from "../components/page-preamble";
// lib
import { errorObjectToProps } from "../lib/errors";
import FetchRequest from "../lib/fetch-request";
import { snakeCaseToHuman } from "../lib/general";

const auditKeyColor = [
  {
    audit_level: "ERROR",
    audit_description: "Incorrect or inconsistent metadata",
  },
  {
    audit_level: "NOT_COMPLIANT",
    audit_description:
      "Not fulfilling a compliance standard like attached documents. This will not be released without special exception.",
  },
  {
    audit_level: "WARNING",
    audit_description:
      "Possibly inconsistent metadata. Data can be released with warnings",
  },
  {
    audit_level: "INTERNAL_ACTION",
    audit_description: "Metadata errors that require DACC staff to resolve",
  },
];

export default function AuditDoc({ auditDoc, schemas }) {
  const result = _.flatMap(auditDoc, (auditGroup, key) => {
    return auditGroup.map((audit) => {
      const newKeys = key.split(".")[2];
      return { ...audit, newKeys };
    });
  });
  // console.log(result);
  const auditsGroupedByCollection = _.groupBy(result, "newKeys");
  console.log(auditsGroupedByCollection);
  const allSchemaNames = flattenHierarchy(schemas._hierarchy.Item, schemas);
  //maps all schema names to collectionNames
  console.log(allSchemaNames);
  const allCollectionNames = allSchemaNames.map((itemType) => {
    // console.log(itemType, schemas[itemType]);
    // const re = /\/profiles\/(.*)\.json/;
    // const aMatchName = schemas[itemType].$id.match(re);
    // return aMatchName[1] || "";
  });
  // console.log(allCollectionNames);

  // const sorted = _.sortBy(result, (obj) => allSchemaNames.indexOf(obj));
  // console.log(sorted);
  // console.log(visibleSchemaNames);
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
      <div className="mb-1 mt-4 text-lg font-semibold text-brand dark:text-[#8fb3a5]">
        {"Severity Level and Description Key"}
      </div>
      <AuditKeyTable data={auditKeyColor} />
      {allSchemaNames.map((itemType) => {
        const typeAudits = auditsGroupedByCollection[itemType];
        console.log(typeAudits);
        if (itemType?.length > 0) {
          // const sorted = _.sortBy(typeAudits, (obj) =>
          //   allSchemaNames.indexOf(obj)
          // );
          // console.log(sorted);
          // return (
          //   <Fragment key={itemType}>
          //     <h2 className="mb-1 mt-8 text-lg font-semibold text-brand dark:text-[#8fb3a5]">
          //       {snakeCaseToHuman(itemType)}
          //     </h2>
          //     <AuditTable data={typeAudits} key={itemType} />
          //   </Fragment>
          // );
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

//new function that maps 1 type name to 1 collection Names

export function flattenHierarchy(hierarchy, schemas) {
  const schemaNames = Object.keys(hierarchy).reduce((acc, schemaName) => {
    if (!isDisplayableType(schemaName, schemas, hierarchy[schemaName])) {
      return acc;
    }
    if (Object.keys(hierarchy[schemaName]).length > 0) {
      // The schema named schemaName has child schemas.
      const childSchemaNames = flattenHierarchy(hierarchy[schemaName], schemas);
      return acc.concat(schemaName, childSchemaNames);
    }
    // The schema named schemaName does not have child schemas
    return acc.concat(schemaName);
  }, []);
  return schemaNames;
}

/**
 * Returns true if the given object type is displayable in the UI. This also indicates that you
 * can add and edit objects of this type.
 * @param {string} objectType Object @type to check
 * @param {object} schemas List of schemas to display in the list; directly from /profiles endpoint
 */
function isDisplayableType(objectType, schemas, tree) {
  //console.log("schema names", schemas[objectType]);
  return (
    schemas[objectType]?.identifyingProperties?.length > 0 ||
    Object.keys(tree).length > 0
  );
}

export async function getServerSideProps({ req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const auditDoc = (
    await request.getObject("/static/doc/auditdoc.json")
  ).union();
  const schemas = (await request.getObject("/profiles")).union();
  if (
    FetchRequest.isResponseSuccess(auditDoc) &&
    FetchRequest.isResponseSuccess(schemas)
  ) {
    return {
      props: {
        auditDoc,
        schemas,
        pageContext: { title: "Audit Documentation" },
      },
    };
  }
  return errorObjectToProps(auditDoc, schemas);
}
