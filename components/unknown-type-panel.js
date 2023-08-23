// node_modules
import _ from "lodash";
import PropTypes from "prop-types";
import { Fragment, useContext } from "react";
// components
import Attribution from "./attribution";
import { findCommonDataRenderer } from "./common-data-items";
import { DataArea, DataItemLabel, DataItemValue, DataPanel } from "./data-area";
import SessionContext from "./session-context";
import UnspecifiedProperty from "./unspecified-property";

/** @type {string[]} Properties to never display */
const PROPERTIES_TO_OMIT = [
  "@context",
  "@id",
  "@type",
  "actions",
  "award",
  "audit",
  "collections",
  "contact_pi",
  "lab",
  "pis",
  "schema_version",
  "status",
  "uuid",
];

/**
 * Displays a formatted page to represent an object that doesn't yet have a custom page defined.
 * It attempts to use the same formatting as other objects sharing the same parent type, and also
 * displays the remaining properties as best it can given the limited knowledge of the item.
 */
export default function UnknownTypePanel({ item, attribution = null }) {
  // Get the schema corresponding to the given item. It might not have loaded yet.
  const { profiles } = useContext(SessionContext);
  const profile = profiles?.[item["@type"][0]];

  // Get the common data renderer for the parent type of the given item so that the properties it
  // shares with other objects with the same parent type get rendered the same way.
  const CommonDataRenderer = findCommonDataRenderer(item);

  // Ask the common data renderer for the properties it displays so that we can omit them from the
  // generic properties. `commonProperties` plus `genericProperties` equals all the properties of
  // the item, minus some properties we never display.
  const commonProperties = CommonDataRenderer.commonProperties || [];
  const genericProperties = Object.keys(item).filter(
    (property) =>
      !commonProperties.includes(property) &&
      !PROPERTIES_TO_OMIT.includes(property)
  );

  return (
    <>
      <DataPanel>
        <DataArea>
          <CommonDataRenderer item={item}>
            {_.sortBy(genericProperties).map((property) => {
              const label = profile?.properties[property]?.title || property;
              return (
                <Fragment key={property}>
                  <DataItemLabel>{label}</DataItemLabel>
                  <DataItemValue>
                    <UnspecifiedProperty property={item[property]} />
                  </DataItemValue>
                </Fragment>
              );
            })}
          </CommonDataRenderer>
        </DataArea>
      </DataPanel>
      <Attribution attribution={attribution} />
    </>
  );
}

UnknownTypePanel.propTypes = {
  // Object that doesn't have a custom page defined
  item: PropTypes.object.isRequired,
  // Attribution object for the unknown item
  attribution: PropTypes.object,
};
