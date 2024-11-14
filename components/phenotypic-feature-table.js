// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import { DataAreaTitle } from "./data-area";
import LinkedIdAndStatus from "./linked-id-and-status";
import SortableGrid from "./sortable-grid";
// lib
import { formatDate } from "../lib/dates";

const phenotypicFeaturesColumns = [
  {
    id: "phenotypic_feature_id",
    title: "Feature Name",
    display: ({ source }) => {
      const featureTerm = source.feature;
      return (
        <LinkedIdAndStatus item={source}>
          {featureTerm.term_name}
        </LinkedIdAndStatus>
      );
    },
    sorter: (item) => item.feature.term_name.toLowerCase(),
  },
  {
    id: "feature",
    title: "Feature ID",
    display: ({ source }) => {
      const termId = source.feature.term_id;
      return <Link href={source.feature["@id"]}>{termId}</Link>;
    },
    sorter: (item) => item.feature.term_id,
  },
  {
    id: "quantity",
    title: "Quantity",
    display: ({ source }) => {
      if (source.quantity) {
        return (
          <>
            {source.quantity} {source.quantity_units}
            {source.quantity === 1 ? "" : "s"}
          </>
        );
      }
      return null;
    },
    sorter: (item) => {
      const quantity = item.quantity || 0;
      const quantityUnits = item.quantity_units || "";
      const result = quantitySortingCode(quantity, quantityUnits);
      return result;
    },
  },
  {
    id: "observation_date",
    title: "Observation Date",
    display: ({ source }) => formatDate(source.observation_date),
  },
];

/**
 * Unit-type sorting codes for different types of quantity units. This gets used as the primary
 * sorting key while a normalized value of the quantity gets used as the secondary sorting key.
 * These two keys get concatenated into a single string for sorting. All magnitudes of mass units
 * get sorted before all magnitudes of concentration units, and so on.
 */
const CODE_MASS = "200";
const CODE_CONCENTRATION = "400";
const CODE_AMOUNT = "600";
const CODE_LENGTH = "800";
const CODE_UNKNOWN = "999";

/**
 * Map of quantity units to unit-type sorting codes. Update this if the phenotypic feature schema
 * changes the options for the `quantity_units` property.
 */
const quantityCodes = {
  // Mass units
  nanogram: CODE_MASS,
  microgram: CODE_MASS,
  milligram: CODE_MASS,
  gram: CODE_MASS,
  kilogram: CODE_MASS,
  // Concentration units
  "milli-International Unit per milliliter": CODE_CONCENTRATION,
  "picogram per milliliter": CODE_CONCENTRATION,
  "nanogram per milliliter": CODE_CONCENTRATION,
  "milligram per deciliter": CODE_CONCENTRATION,
  // Amount units
  micromole: CODE_AMOUNT,
  // Length units
  meter: CODE_LENGTH,
};

/**
 * The `quantity_units` property of a phenotypic feature object can represent a variety of unit
 * types. This function returns a quantity sorting code for the given quantity and units that you
 * can use to sort a column of phenotypic feature quantities in a table. The quantity sorting code
 * comprises a unit-type sorting code and a normalized unitless quantity, zero-padded to 14
 * characters. Pass this code to a sorting function to sort these mixes of types, magnitudes and
 * values. This seems specific to the phenotypic feature table, so I define it here instead of in
 * the lib directory. This function can move to the lib directory if we ever need to share it.
 * @param {number} quantity From phenotypic feature object `quantity` property
 * @param {string} quantityUnits From phenotypic feature object `quantity_units` property
 * @returns {string} Sorting code for the given quantity and units
 */
function quantitySortingCode(quantity, quantityUnits) {
  const unitTypeCode = quantityCodes[quantityUnits] || CODE_UNKNOWN;

  let convertedQuantity;
  if (unitTypeCode === CODE_LENGTH) {
    convertedQuantity = quantity;
  } else if (unitTypeCode === CODE_AMOUNT) {
    convertedQuantity = quantity;
  } else if (unitTypeCode === CODE_MASS) {
    // Convert all mass units to nanograms.
    if (quantityUnits === "nanogram") {
      convertedQuantity = quantity;
    } else if (quantityUnits === "microgram") {
      convertedQuantity = quantity * 1000;
    } else if (quantityUnits === "milligram") {
      convertedQuantity = quantity * 1_000_000;
    } else if (quantityUnits === "gram") {
      convertedQuantity = quantity * 1_000_000_000;
    } else if (quantityUnits === "kilogram") {
      convertedQuantity = quantity * 1_000_000_000_000;
    }
  } else if (unitTypeCode === CODE_CONCENTRATION) {
    // Convert all concentration units to picograms per milliliter.
    if (quantityUnits === "milli-International Unit per milliliter") {
      convertedQuantity = quantity * 1_000_000_000;
    } else if (quantityUnits === "picogram per milliliter") {
      convertedQuantity = quantity;
    } else if (quantityUnits === "nanogram per milliliter") {
      convertedQuantity = quantity * 1_000;
    } else if (quantityUnits === "milligram per deciliter") {
      convertedQuantity = quantity * 10_000_000;
    }
  } else {
    // Unknown unit type; might happen if the schema defines new quantity units.
    convertedQuantity = quantity;
  }

  // The unit-type sorting code acts as the primary sort key, and the normalized quantity acts as
  // the secondary sort key. These combine to generate the quantity sorting code.
  const normalizedQuantity = convertedQuantity.toString().padStart(20, "0");
  return `${unitTypeCode}-${normalizedQuantity}`;
}

/**
 * Display a sortable table of the given treatments.
 */
export default function PhenotypicFeatureTable({
  phenotypicFeatures,
  title = "Phenotypic Features",
  panelId = "phenotypic-features",
}) {
  return (
    <>
      <DataAreaTitle id={panelId}>{title}</DataAreaTitle>
      <div className="overflow-hidden">
        <SortableGrid
          data={phenotypicFeatures}
          columns={phenotypicFeaturesColumns}
          pager={{}}
          keyProp="@id"
        />
      </div>
    </>
  );
}

PhenotypicFeatureTable.propTypes = {
  // Phenotypic Features to display
  phenotypicFeatures: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Title of the table if not "Phenotypic Features"
  title: PropTypes.string,
  // ID of the panel for the section directory
  panelId: PropTypes.string,
};
