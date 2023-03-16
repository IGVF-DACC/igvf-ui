// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "./data-area";

/**
 * Displays the attribution properties of an item in its own data panel, typically from a data
 * object with a defined schema.
 */
export default function Attribution({ award = null, lab = null, collections = null }) {
  if (award || lab || collections) {
    return (
      <>
        <DataAreaTitle>Attribution</DataAreaTitle>
        <DataPanel>
          <DataArea>
            {award && (
              <>
                <DataItemLabel>Award</DataItemLabel>
                <DataItemValue>
                  <Link href={award["@id"]}>{award.name}</Link>
                </DataItemValue>
              </>
            )}
            {lab && (
              <>
                <DataItemLabel>Lab</DataItemLabel>
                <DataItemValue>
                  <Link href={lab["@id"]}>{lab.title}</Link>
                </DataItemValue>
              </>
            )}
            {collections?.length > 0 && (
              <>
                <DataItemLabel>Collections</DataItemLabel>
                <DataItemValue>{collections.join(", ")}</DataItemValue>
              </>
            )}
          </DataArea>
        </DataPanel>
      </>
    );
  }
  return null;
}

Attribution.propTypes = {
  // Award applied to the displayed object
  award: PropTypes.object,
  // Lab that submitted the displayed object
  lab: PropTypes.object,
  // Collections associated with the displayed object
  collections: PropTypes.arrayOf(PropTypes.string),
};
