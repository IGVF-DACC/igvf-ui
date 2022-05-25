// node_modules
import Link from "next/link"
import PropTypes from "prop-types"
// components
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "./data-area"

/**
 * Displays the attribution properties of an item in its own data panel, typically a data object
 * with a defined schema.
 */
const Attribution = ({ award, lab }) => {
  return (
    <>
      <DataAreaTitle>Attribution</DataAreaTitle>
      <DataPanel>
        <DataArea>
          <DataItemLabel>Award</DataItemLabel>
          <DataItemValue>
            <Link href={award["@id"]}>
              <a>{award.name}</a>
            </Link>
          </DataItemValue>
          <DataItemLabel>Lab</DataItemLabel>
          <DataItemValue>
            <Link href={lab["@id"]}>
              <a>{lab.title}</a>
            </Link>
          </DataItemValue>
        </DataArea>
      </DataPanel>
    </>
  )
}

Attribution.propTypes = {
  // Award applied to this technical sample
  award: PropTypes.shape({
    "@id": PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  // Lab that submitted this technical sample
  lab: PropTypes.shape({
    "@id": PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
}

export default Attribution
