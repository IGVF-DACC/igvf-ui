// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import Collections from "./collections";
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "./data-area";
import SeparatedList from "./separated-list";

/**
 * Displays the attribution properties of an item in its own data panel, typically from a data
 * object with a defined schema.
 */
export default function Attribution({ attribution = null }) {
  if (attribution && Object.keys(attribution).length > 0) {
    return (
      <>
        <DataAreaTitle>Attribution</DataAreaTitle>
        <DataPanel>
          <Collections
            collections={attribution.collections}
            itemType={attribution.type}
          />
          <DataArea>
            {attribution.award && (
              <>
                <DataItemLabel>Award</DataItemLabel>
                <DataItemValue>
                  <Link href={attribution.award["@id"]}>
                    {attribution.award.name}
                  </Link>
                </DataItemValue>
              </>
            )}
            {attribution.pis && (
              <>
                <DataItemLabel>Principal Investigator(s)</DataItemLabel>
                <DataItemValue>
                  <SeparatedList isCollapsible>
                    {attribution.pis.map((pi) => (
                      <Link href={pi["@id"]} key={pi["@id"]}>
                        {pi.title}
                      </Link>
                    ))}
                  </SeparatedList>
                </DataItemValue>
              </>
            )}
            {attribution.contactPi && (
              <>
                <DataItemLabel>Contact P.I.</DataItemLabel>
                <DataItemValue>
                  <Link href={attribution.contactPi["@id"]}>
                    {attribution.contactPi.title}
                  </Link>
                </DataItemValue>
              </>
            )}
            {attribution.lab && (
              <>
                <DataItemLabel>Lab</DataItemLabel>
                <DataItemValue>
                  <Link href={attribution.lab["@id"]}>
                    {attribution.lab.title}
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
}

Attribution.propTypes = {
  // attribution object needed for attribution panel
  attribution: PropTypes.object,
};
