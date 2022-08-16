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
const Attribution = ({ award = null, lab = null }) => {
  if (award || lab) {
    return (
      <>
        <DataAreaTitle>Attribution</DataAreaTitle>
        <DataPanel>
          <DataArea>
            {award && (
              <>
                <DataItemLabel>Award</DataItemLabel>
                <DataItemValue>
                  <Link href={award["@id"]}>
                    <a>{award.name}</a>
                  </Link>
                </DataItemValue>
              </>
            )}
            {lab && (
              <>
                <DataItemLabel>Lab</DataItemLabel>
                <DataItemValue>
                  <Link href={lab["@id"]}>
                    <a>{lab.title}</a>
                  </Link>
                </DataItemValue>
              </>
            )}
          </DataArea>
        </DataPanel>
      </>
    );
  }
  return null;
};

Attribution.propTypes = {
  // Award applied to the displayed object
  award: PropTypes.object,
  // Lab that submitted the displayed object
  lab: PropTypes.object,
};

export default Attribution;
