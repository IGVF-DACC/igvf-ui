// node_modules
import PropTypes from "prop-types"
// components
import {
  Collection,
  CollectionItem,
  CollectionItemName,
} from "../../components/collection"
import PagePreamble from "../../components/page-preamble"
// libs
import { getCollection } from "../../libs/request"

const LabList = ({ labs }) => {
  return (
    <>
      <PagePreamble />
      <Collection>
        {labs.map((lab) => (
          <CollectionItem key={lab.uuid} href={lab["@id"]}>
            <CollectionItemName>{lab.title}</CollectionItemName>
            <div>{lab.institute_label}</div>
          </CollectionItem>
        ))}
      </Collection>
    </>
  )
}

LabList.propTypes = {
  // Labs to display in the list
  labs: PropTypes.array.isRequired,
}

export default LabList

export const getServerSideProps = async () => {
  const labs = await getCollection("lab")
  return {
    props: {
      labs: labs["@graph"],
      pageContext: { title: labs.title },
    },
  }
}
