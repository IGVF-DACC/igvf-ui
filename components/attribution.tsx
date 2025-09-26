// node_modules
// components
import Collections from "./collections";
import { DataItemLabel, DataItemValue } from "./data-area";
import Link from "./link-no-prefetch";
import SeparatedList from "./separated-list";
// lib
import { type AttributionData } from "../lib/attribution";
import { UC } from "../lib/constants";

/**
 * Displays the attribution properties of an item for display in the summary panel.
 * @param attribution - Attributions object containing the lab, award, and contact PI information.
 */
export default function Attribution({
  attribution = null,
}: {
  attribution: AttributionData | null;
}) {
  // Get an array of keys within the attribution object that have a truthy value.
  const attributionsWithValues = attribution
    ? Object.keys(attribution).filter((key) => attribution[key])
    : [];

  // Make sure the attribution keys have more than the required `type` to render anything.
  if (attributionsWithValues.length > 1) {
    return (
      <>
        <DataItemLabel>Attribution</DataItemLabel>
        <DataItemValue className="flex flex-wrap gap-1">
          {attribution.lab && (
            <Link href={attribution.lab["@id"]}>{attribution.lab.title}</Link>
          )}
          {(attribution.award || attribution.contactPi) && (
            <div>
              {"("}
              <SeparatedList
                separator={`${UC.nbsp}${UC.mdash}${UC.nbsp}`}
                className="inline-flex"
              >
                {attribution.award && (
                  <Link href={attribution.award["@id"]}>
                    {attribution.award.name}
                  </Link>
                )}
                {attribution.contactPi && (
                  <Link href={attribution.contactPi["@id"]}>
                    {attribution.contactPi.title}
                  </Link>
                )}
              </SeparatedList>
              {")"}
            </div>
          )}
        </DataItemValue>
        {attribution.collections?.length > 0 && (
          <>
            <DataItemLabel>Collections</DataItemLabel>
            <DataItemValue>
              <Collections
                collections={attribution.collections}
                itemType={attribution.type}
              />
            </DataItemValue>
          </>
        )}
      </>
    );
  }
}
