// node_modules
import _ from "lodash";
import PropTypes from "prop-types";
import { Fragment, useContext } from "react";
// component
import AuditKeyTable from "../components/audit-key-table";
import AuditTable from "../components/audit-table";
import PagePreamble from "../components/page-preamble";
import SessionContext from "../components/session-context";
// lib
import { errorObjectToProps } from "../lib/errors";
import FetchRequest from "../lib/fetch-request";
import { snakeCaseToPascalCase } from "../lib/general";

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
  const { collectionTitles } = useContext(SessionContext);
  const result = _.flatMap(auditDoc, (auditGroup, key) => {
    return auditGroup.map((audit) => {
      const newKeys = snakeCaseToPascalCase(key.split(".")[2]);
      return { ...audit, newKeys };
    });
  });
  const auditsGroupedByCollection = _.groupBy(result, "newKeys");
  const allSchemaNames = flattenHierarchy(schemas._hierarchy.Item, schemas);
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
        if (typeAudits) {
          const title = collectionTitles?.[itemType] || itemType;
          return (
            <Fragment key={itemType}>
              <h2 className="mb-1 mt-8 text-lg font-semibold text-brand dark:text-[#8fb3a5]">
                {title}
              </h2>
              <AuditTable data={typeAudits} key={itemType} />
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
  // List of schemas to display in the list; directly from /profiles endpoint
  schemas: PropTypes.shape({
    _hierarchy: PropTypes.shape({
      Item: PropTypes.object.isRequired,
    }).isRequired,
  }),
};

/**
 * Extracts the hierarchical schema type names from the hierarchy parameter and converts them
 * to a flat array of schema type names in the order they appear on the Schemas page.
 * @param {object} hierarchy _hierarchical tree from /profiles endpoint
 * @param {object} schemas  List of schemas from /profiles endpoint
 * @returns List of profiles name in PascalCase in hierarchical order
 */
function flattenHierarchy(hierarchy, schemas) {
  const schemaNames = Object.keys(hierarchy).reduce((acc, schemaName) => {
    if (!isDisplayableType(schemaName, schemas, hierarchy[schemaName])) {
      return acc;
    }
    if (Object.keys(hierarchy[schemaName]).length > 0) {
      const childSchemaNames = flattenHierarchy(hierarchy[schemaName], schemas);
      return acc.concat(schemaName, childSchemaNames);
    }
    return acc.concat(schemaName);
  }, []);
  return schemaNames;
}

/**
 * Returns true if the given object type is displayable in the UI. This also indicates that you
 * can add and edit objects of this type.
 * @param {string} objectType Object @type to check
 * @param {object} schemas List of schemas to display in the list; directly from /profiles endpoint
 * @param {object} tree Top of the _hierarchy tree at this level
 * @returns {boolean} True if the object type is displayable/addable/editable
 */
function isDisplayableType(objectType, schemas, tree) {
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
  return errorObjectToProps(auditDoc);
}
