// node_modules
import PropTypes from "prop-types"
import { useContext } from "react"
// components
import SessionContext from "./session-context"
// libs
import { resetAccessKey, deleteAccessKey } from "../libs/access-keys"

/**
 * Displays a single access key and its associated controls.
 */
const AccessKeyItem = ({ accessKey, onResetClick, onDeleteClick }) => {
  return (
    <div>
      {accessKey.access_key_id}
      <button onClick={onResetClick}>Reset</button>
      <button onClick={onDeleteClick}>Delete</button>
    </div>
  )
}

AccessKeyItem.propTypes = {
  // Array of access keys from the session user object
  accessKey: PropTypes.shape({ access_key_id: PropTypes.string }).isRequired,
  // Callback to reset the access key
  onResetClick: PropTypes.func.isRequired,
  // Callback to delete the access key
  onDeleteClick: PropTypes.func.isRequired,
}

/**
 * Displays a list of access keys and their associated controls.
 */
const AccessKeyList = ({ accessKeys }) => {
  const { session } = useContext(SessionContext)

  const onResetClick = (accessKeyId) => {
    resetAccessKey(accessKeyId, session)
  }

  const onDeleteClick = (accessKeyId) => {
    deleteAccessKey(accessKeyId, session)
  }

  return (
    <div>
      {accessKeys.map((accessKey) => {
        return (
          <AccessKeyItem
            key={accessKey.uuid}
            accessKey={accessKey}
            onResetClick={() => onResetClick(accessKey.access_key_id)}
            onDeleteClick={() => onDeleteClick(accessKey.access_key_id)}
          />
        )
      })}
    </div>
  )
}

AccessKeyList.propTypes = {
  // Array of access keys from user object
  accessKeys: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default AccessKeyList
